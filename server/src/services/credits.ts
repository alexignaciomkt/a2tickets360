import { db } from '../db';
import * as schema from '../db/schema';
import { eq, and, isNull, lt, gt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { addDays, addHours, isBefore } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

export interface FeaturedCycleParams {
    featuredAt: Date;
    eventStartDateTime: string; // YYYY-MM-DDTHH:mm:ss
    timezone: string;
}

export const getFeaturedCycleWindow = (params: FeaturedCycleParams) => {
    const { featuredAt, eventStartDateTime, timezone } = params;

    if (!timezone) {
        throw new Error('Fuso horário (timezone) inválido ou ausente.');
    }
    
    // Validar se o timezone é reconhecido pela IANA antes de passar para date-fns-tz
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch (e) {
        throw new Error(`Timezone inválido: ${timezone}`);
    }
    
    if (!eventStartDateTime || !eventStartDateTime.includes('T')) {
        throw new Error('Data de início do evento (start_date) inválida ou incompleta.');
    }

    let eventStartInstant: Date;

    try {
        eventStartInstant = fromZonedTime(eventStartDateTime, timezone);
    } catch (e: any) {
        throw new Error(`Erro ao converter fuso horário: ${e.message}`);
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
        
        // 2. Verificar se já existe crédito reservado para este evento
        const reservedCredits = await tx.execute(sql`SELECT id FROM organizer_service_credits WHERE reserved_event_id = ${eventId} AND status = 'RESERVED' LIMIT 1`);
        if (reservedCredits.length > 0) throw new Error('O evento já possui um crédito reservado.');

        // 3. Selecionar crédito AVAILABLE
        const availableCredits = await tx.execute(sql`SELECT id FROM organizer_service_credits WHERE organizer_id = ${organizerRecordId} AND status = 'AVAILABLE' ORDER BY created_at ASC LIMIT 1 FOR UPDATE`);
        if (availableCredits.length === 0) throw new Error('Nenhum crédito de destaque disponível.');

        const creditToReserve = availableCredits[0] as typeof schema.organizerServiceCredits.$inferSelect;

        // 4. Reservar
        await tx.execute(sql`
            UPDATE organizer_service_credits 
            SET status = 'RESERVED', reserved_event_id = ${eventId}, reserved_at = NOW(), updated_at = NOW() 
            WHERE id = ${creditToReserve.id}
        `);

        // 5. Inserir ledger
        await tx.execute(sql`
            INSERT INTO service_credit_ledger (id, credit_id, action, event_id, actor_user_id)
            VALUES (gen_random_uuid(), ${creditToReserve.id}, 'RESERVED', ${eventId}, ${actorUserId})
        `);

        return { success: true, creditId: creditToReserve.id };
    });
};

export const releaseFeaturedCredit = async (eventId: string, organizerRecordId: string, organizerUserId: string, actorUserId: string | null) => {
    return await db.transaction(async (tx) => {
        // 1. Lock evento FOR UPDATE para consistência de fluxo
        const events = await tx.execute(sql`SELECT * FROM events WHERE id = ${eventId} AND organizer_id = ${organizerUserId} FOR UPDATE`);
        if (events.length === 0) throw new Error('Evento não encontrado ou não pertence a esta produtora.');

        // 2. Selecionar crédito RESERVED e dar LOCK
        const reservedCredits = await tx.execute(sql`SELECT id FROM organizer_service_credits WHERE reserved_event_id = ${eventId} AND status = 'RESERVED' FOR UPDATE`);
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

        if (event.status !== 'published' && event.status !== 'active') {
            throw new Error('O evento precisa estar publicado para ativar o destaque.');
        }

        // 2. Verificar ciclo ativo
        const activeCycles = await tx.execute(sql`SELECT id FROM event_featured_cycles WHERE event_id = ${eventId} AND featured_until > NOW() LIMIT 1`);
        if (activeCycles.length > 0) throw new Error('O evento já possui um ciclo de destaque ativo.');

        // 3. Selecionar crédito RESERVED e dar LOCK
        const reservedCredits = await tx.execute(sql`SELECT * FROM organizer_service_credits WHERE reserved_event_id = ${eventId} AND status = 'RESERVED' FOR UPDATE`);
        if (reservedCredits.length === 0) throw new Error('Nenhum crédito reservado encontrado para este evento.');

        const creditToConsume = reservedCredits[0] as any;

        // 4. Timezone e Datas
        const eventStartDate = event.start_date;
        const eventTimezone = event.timezone;

        if (!eventTimezone) {
            throw new Error('Evento não possui fuso horário (timezone) definido. Operação abortada.');
        }

        if (!eventStartDate) {
            throw new Error('Data do evento inválida ou ausente.');
        }

        let eventStartDateTime = '';
        if (eventStartDate instanceof Date) {
            eventStartDateTime = eventStartDate.toISOString().split('.')[0];
        } else if (typeof eventStartDate === 'string') {
            const baseStr = eventStartDate.split('+')[0].split('.')[0].split('Z')[0];
            eventStartDateTime = baseStr.replace(' ', 'T');
        }

        const now = new Date();

        const window = getFeaturedCycleWindow({
            featuredAt: now,
            eventStartDateTime,
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

export const activateFeaturedCredit = async (eventId: string, organizerRecordId: string, organizerUserId: string, actorUserId: string | null) => {
    return await db.transaction(async (tx) => {
        // 1. Lock evento FOR UPDATE e verificar regras
        const events = await tx.execute(sql`SELECT * FROM events WHERE id = ${eventId} AND organizer_id = ${organizerUserId} FOR UPDATE`);
        if (events.length === 0) throw new Error('Evento não encontrado ou não pertence a esta produtora.');
        
        const event = events[0] as any;

        // 2. ADICIONAR VALIDAÇÃO DE EVENTO PUBLICADO E TEMPORAL
        if (event.status !== 'published' && event.status !== 'active') {
            throw new Error('O evento precisa estar publicado para ativar o destaque.');
        }

        // Validação Temporal
        const nowTemporal = new Date();
        const startTemporal = event.start_date ? new Date(event.start_date) : null;
        let endTemporal = event.end_date ? new Date(event.end_date) : null;
        
        if (startTemporal) {
            if (!endTemporal) {
                endTemporal = new Date(startTemporal.getTime() + 6 * 60 * 60 * 1000); // +6 horas
            }
            if (nowTemporal > endTemporal) {
                const err = new Error('Eventos encerrados não podem ser destacados.');
                (err as any).status = 400;
                throw err;
            }
        }

        // 3. Verificar se já existe ciclo ativo
        const activeCycles = await tx.execute(sql`SELECT id FROM event_featured_cycles WHERE event_id = ${eventId} AND featured_until > NOW() LIMIT 1`);
        if (activeCycles.length > 0) return { success: true, message: 'O evento já possui um ciclo de destaque ativo.' }; // Idempotente

        // 4. Timezone e Datas
        const eventStartDate = event.start_date; // string from db
        const eventTimezone = event.timezone;

        if (!eventTimezone) throw new Error('Evento não possui fuso horário (timezone) definido. Operação abortada.');
        if (!eventStartDate) throw new Error('Data do evento inválida ou ausente.');

        let eventStartDateTime = '';
        if (eventStartDate instanceof Date) {
            // Se o driver já transformou em Date, converte pra ISO e pega até segundos
            eventStartDateTime = eventStartDate.toISOString().split('.')[0];
        } else if (typeof eventStartDate === 'string') {
            // Formatar de '2026-08-22 10:00:00+00' ou similar para '2026-08-22T10:00:00'
            const baseStr = eventStartDate.split('+')[0].split('.')[0].split('Z')[0];
            eventStartDateTime = baseStr.replace(' ', 'T');
        }

        const now = new Date();
        const window = getFeaturedCycleWindow({
            featuredAt: now,
            eventStartDateTime,
            timezone: eventTimezone
        });

        if (isBefore(window.eventEndLimit, now)) {
            throw new Error('Não é possível consumir crédito para um evento que já terminou (mais de 12 horas após o início).');
        }

        const { featuredUntil, plannedEndReason } = window;

        // 5. Tentar encontrar crédito RESERVED para este evento
        const reservedCredits = await tx.execute(sql`SELECT * FROM organizer_service_credits WHERE reserved_event_id = ${eventId} AND status = 'RESERVED' FOR UPDATE`);
        let creditToConsume = reservedCredits.length > 0 ? reservedCredits[0] : null;

        // 6. Se não tem RESERVED, tentar pegar um AVAILABLE
        if (!creditToConsume) {
            const availableCredits = await tx.execute(sql`SELECT * FROM organizer_service_credits WHERE organizer_id = ${organizerRecordId} AND status = 'AVAILABLE' ORDER BY created_at ASC LIMIT 1 FOR UPDATE`);
            if (availableCredits.length === 0) {
                throw new Error('Nenhum Crédito de Destaque disponível.');
            }
            creditToConsume = availableCredits[0];
            
            // Ledger para a reserva implícita
            await tx.execute(sql`
                INSERT INTO service_credit_ledger (id, credit_id, action, event_id, actor_user_id)
                VALUES (gen_random_uuid(), ${creditToConsume.id}, 'RESERVED', ${eventId}, ${actorUserId})
            `);
        }

        // 7. Mudar crédito para CONSUMED
        await tx.execute(sql`
            UPDATE organizer_service_credits 
            SET status = 'CONSUMED', reserved_event_id = NULL, reserved_at = NULL, consumed_event_id = ${eventId}, consumed_at = NOW(), updated_at = NOW() 
            WHERE id = ${creditToConsume.id}
        `);

        // 8. Criar event_featured_cycles
        await tx.execute(sql`
            INSERT INTO event_featured_cycles (id, event_id, credit_id, featured_at, featured_until, planned_end_reason)
            VALUES (gen_random_uuid(), ${eventId}, ${creditToConsume.id}, ${now.toISOString()}, ${featuredUntil.toISOString()}, ${plannedEndReason})
        `);

        // 9. Atualizar events cache
        await tx.execute(sql`
            UPDATE events 
            SET is_featured = true, featured_at = ${now.toISOString()}, featured_until = ${featuredUntil.toISOString()}, updated_at = NOW()
            WHERE id = ${eventId}
        `);

        // 10. Inserir ledger do consumo
        await tx.execute(sql`
            INSERT INTO service_credit_ledger (id, credit_id, action, event_id, actor_user_id)
            VALUES (gen_random_uuid(), ${creditToConsume.id}, 'CONSUMED', ${eventId}, ${actorUserId})
        `);

        return { success: true, featuredUntil, plannedEndReason, creditId: creditToConsume.id };
    });
};
