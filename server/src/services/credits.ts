import { db } from '../db';
import * as schema from '../db/schema';
import { eq, and, isNull, lt, gt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { addDays, addHours, isBefore } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

export interface FeaturedCycleParams {
    featuredAt: Date;
    eventStartDate: string; // YYYY-MM-DD
    eventStartTime: string; // HH:mm
    timezone: string;
}

export const getFeaturedCycleWindow = (params: FeaturedCycleParams) => {
    const { featuredAt, eventStartDate, eventStartTime, timezone } = params;

    if (!eventStartTime) {
        throw new Error('O horário de início do evento (time) é obrigatório para calcular o limite de destaque.');
    }

    const dateTimeString = `${eventStartDate}T${eventStartTime}:00`;
    let eventStartInstant: Date;

    try {
        eventStartInstant = fromZonedTime(dateTimeString, timezone);
    } catch (e: any) {
        throw new Error(`Timezone inválido: ${timezone}. Erro: ${e.message}`);
    }

    const eventEndLimit = addHours(eventStartInstant, 12);
    const cycleLimit = addDays(featuredAt, 30);

    const featuredUntil = isBefore(cycleLimit, eventEndLimit) ? cycleLimit : eventEndLimit;
    const plannedEndReason = isBefore(cycleLimit, eventEndLimit) ? 'CYCLE_EXPIRED' : 'EVENT_ENDED';

    return {
        eventStartInstant,
        eventEndLimit,
        cycleLimit,
        featuredUntil,
        plannedEndReason
    };
};

export const reserveFeaturedCredit = async (eventId: string, organizerRecordId: string, organizerUserId: string, actorUserId: string | null) => {
    return await db.transaction(async (tx) => {
        // 1. Lock evento FOR UPDATE e verificar regras
        const events = await tx.execute(sql`SELECT * FROM events WHERE id = ${eventId} AND organizer_id = ${organizerUserId} FOR UPDATE`);
        if (events.length === 0) throw new Error('Evento não encontrado ou não pertence a esta produtora.');
        
        const event = events[0] as typeof schema.events.$inferSelect;
        
        // Verifica se evento já terminou (simplificado)
        // Isso pode requerer formatação de data, mas para a reserva a regra diz "evento não terminou"
        // Deixaremos a checagem temporal rígida para o momento do consumo, ou uma checagem básica aqui.

        // 2. Verificar se já existe crédito reservado para este evento
        const reservedCredits = await tx.execute(sql`SELECT id FROM organizer_service_credits WHERE reserved_event_id = ${eventId} AND status = 'RESERVED' LIMIT 1`);
        if (reservedCredits.length > 0) throw new Error('O evento já possui um crédito reservado.');

        // 3. Verificar ciclo ativo
        const activeCycles = await tx.execute(sql`SELECT id FROM event_featured_cycles WHERE event_id = ${eventId} AND featured_until > NOW() LIMIT 1`);
        if (activeCycles.length > 0) throw new Error('O evento já possui um ciclo de destaque ativo.');

        // 4. Buscar crédito AVAILABLE da produtora (FIFO) e dar LOCK
        const availableCredits = await tx.execute(sql`SELECT * FROM organizer_service_credits WHERE organizer_id = ${organizerRecordId} AND status = 'AVAILABLE' ORDER BY created_at ASC LIMIT 1 FOR UPDATE`);
        if (availableCredits.length === 0) throw new Error('Não há créditos disponíveis.');

        const creditToReserve = availableCredits[0] as typeof schema.organizerServiceCredits.$inferSelect;

        // 5. Atualizar para RESERVED
        await tx.execute(sql`
            UPDATE organizer_service_credits 
            SET status = 'RESERVED', reserved_event_id = ${eventId}, reserved_at = NOW(), updated_at = NOW() 
            WHERE id = ${creditToReserve.id}
        `);

        // 6. Inserir ledger
        await tx.execute(sql`
            INSERT INTO service_credit_ledger (id, credit_id, action, event_id, actor_user_id)
            VALUES (gen_random_uuid(), ${creditToReserve.id}, 'RESERVED', ${eventId}, ${actorUserId})
        `);

        return { success: true, creditId: creditToReserve.id };
    });
};

export const releaseFeaturedCredit = async (eventId: string, organizerRecordId: string, organizerUserId: string, actorUserId: string | null) => {
    return await db.transaction(async (tx) => {
        // 1. Lock evento FOR UPDATE
        const events = await tx.execute(sql`SELECT id FROM events WHERE id = ${eventId} AND organizer_id = ${organizerUserId} FOR UPDATE`);
        if (events.length === 0) throw new Error('Evento não encontrado ou não pertence a esta produtora.');

        // 2. Buscar crédito RESERVED para este evento e dar LOCK
        const reservedCredits = await tx.execute(sql`SELECT * FROM organizer_service_credits WHERE reserved_event_id = ${eventId} AND status = 'RESERVED' FOR UPDATE`);
        if (reservedCredits.length === 0) throw new Error('Nenhum crédito reservado encontrado para este evento.');

        const creditToRelease = reservedCredits[0] as typeof schema.organizerServiceCredits.$inferSelect;

        // 3. Voltar para AVAILABLE
        await tx.execute(sql`
            UPDATE organizer_service_credits 
            SET status = 'AVAILABLE', reserved_event_id = NULL, reserved_at = NULL, updated_at = NOW() 
            WHERE id = ${creditToRelease.id}
        `);

        // 4. Inserir ledger
        await tx.execute(sql`
            INSERT INTO service_credit_ledger (id, credit_id, action, event_id, actor_user_id)
            VALUES (gen_random_uuid(), ${creditToRelease.id}, 'RELEASED', ${eventId}, ${actorUserId})
        `);

        return { success: true, creditId: creditToRelease.id };
    });
};

export const consumeFeaturedCredit = async (eventId: string, organizerRecordId: string, organizerUserId: string, actorUserId: string | null) => {
    return await db.transaction(async (tx) => {
        // 1. Lock evento FOR UPDATE
        const events = await tx.execute(sql`SELECT * FROM events WHERE id = ${eventId} AND organizer_id = ${organizerUserId} FOR UPDATE`);
        if (events.length === 0) throw new Error('Evento não encontrado ou não pertence a esta produtora.');
        
        const event = events[0] as any;

        // 2. Verificar ciclo ativo
        const activeCycles = await tx.execute(sql`SELECT id FROM event_featured_cycles WHERE event_id = ${eventId} AND featured_until > NOW() LIMIT 1`);
        if (activeCycles.length > 0) throw new Error('O evento já possui um ciclo de destaque ativo.');

        // 3. Selecionar crédito RESERVED e dar LOCK
        const reservedCredits = await tx.execute(sql`SELECT * FROM organizer_service_credits WHERE reserved_event_id = ${eventId} AND status = 'RESERVED' FOR UPDATE`);
        if (reservedCredits.length === 0) throw new Error('Nenhum crédito reservado encontrado para este evento.');

        const creditToConsume = reservedCredits[0] as typeof schema.organizerServiceCredits.$inferSelect;

        // 4. Timezone e Datas
        let eventStartDate = event.start_date; // string YYYY-MM-DD or Date
        const eventTime = event.time; // string HH:mm
        const eventTimezone = event.timezone; // Timezone canônico

        if (!eventTimezone) {
            throw new Error('Evento não possui fuso horário (timezone) definido. Operação abortada.');
        }

        if (!eventStartDate) {
            throw new Error('Data do evento inválida ou ausente.');
        }

        if (eventStartDate instanceof Date) {
            eventStartDate = eventStartDate.toISOString().split('T')[0];
        } else if (typeof eventStartDate === 'string') {
            eventStartDate = eventStartDate.split('T')[0].split(' ')[0]; // Handle both '2026-08-19T00:00:00Z' and '2026-08-19 00:00:00+00'
        }

        const now = new Date();

        const window = getFeaturedCycleWindow({
            featuredAt: now,
            eventStartDate,
            eventStartTime: eventTime,
            timezone: eventTimezone
        });

        if (isBefore(window.eventEndLimit, now)) {
            throw new Error('Não é possível consumir crédito para um evento que já terminou (mais de 12 horas após o início).');
        }

        const { featuredUntil, plannedEndReason } = window;

        // 5. Mudar crédito para CONSUMED
        await tx.execute(sql`
            UPDATE organizer_service_credits 
            SET status = 'CONSUMED', reserved_event_id = NULL, reserved_at = NULL, consumed_event_id = ${eventId}, consumed_at = NOW(), updated_at = NOW() 
            WHERE id = ${creditToConsume.id}
        `);

        // 6. Criar event_featured_cycles
        await tx.execute(sql`
            INSERT INTO event_featured_cycles (id, event_id, credit_id, featured_at, featured_until, planned_end_reason)
            VALUES (gen_random_uuid(), ${eventId}, ${creditToConsume.id}, ${now.toISOString()}, ${featuredUntil.toISOString()}, ${plannedEndReason})
        `);

        // 7. Atualizar events cache
        await tx.execute(sql`
            UPDATE events 
            SET is_featured = true, featured_at = ${now.toISOString()}, featured_until = ${featuredUntil.toISOString()}, updated_at = NOW()
            WHERE id = ${eventId}
        `);

        // 8. Inserir ledger
        await tx.execute(sql`
            INSERT INTO service_credit_ledger (id, credit_id, action, event_id, actor_user_id)
            VALUES (gen_random_uuid(), ${creditToConsume.id}, 'CONSUMED', ${eventId}, ${actorUserId})
        `);

        return { success: true, featuredUntil, plannedEndReason };
    });
};
