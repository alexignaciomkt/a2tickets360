import { Hono } from 'hono';
import { db } from '../db';
import { events, tickets, organizers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middlewares/auth';
import { idempotencyService } from '../services/idempotencyService';

const router = new Hono();

router.use('/*', authMiddleware);

router.post('/', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        if (payload.role !== 'organizer' && payload.role !== 'master') {
            return c.json({ error: 'Acesso negado. Apenas organizadores podem criar eventos.' }, 403);
        }

        const userId = payload.id;
        const operationId = c.req.header('X-Idempotency-Key');
        if (!operationId) {
            return c.json({ error: 'X-Idempotency-Key ausente no cabeçalho.' }, 400);
        }

        const body = await c.req.json();
        const {
            title,
            slug,
            description,
            category,
            category_code,
            status,
            sports_integration_status,
            timezone,
            start_date,
            end_date,
            location_name,
            address,
            city,
            state,
            postal_code,
            capacity,
            event_type,
            banner_url,
            tickets: eventTickets
        } = body;

        if (!title || !timezone) {
            return c.json({ error: 'Campos obrigatórios ausentes.' }, 400);
        }

        // Validação de organizer_details (Identidade canônica)
        const organizerDetails = await db.query.organizers.findFirst({
            where: eq(organizers.userId, userId)
        });

        if (!organizerDetails) {
            return c.json({ error: 'Conta de organizador não encontrada ou inativa.' }, 403);
        }

        // Fase 1: Verifica fallback persistente do PostgreSQL
        const existingEvent = await db.query.events.findFirst({
            where: eq(events.id, operationId)
        });

        if (existingEvent) {
            if (existingEvent.organizerId !== userId) {
                return c.json({ error: 'Conflito de chave de operação e segurança.' }, 409);
            }
            // Sucesso idempotente
            await idempotencyService.setCompleted(userId, operationId, existingEvent.id);
            return c.json({ id: existingEvent.id, ...existingEvent });
        }

        // Fase 2: Lock via Redis
        const lockAcquired = await idempotencyService.acquireLock(userId, operationId);
        if (!lockAcquired) {
            const currentStatus = await idempotencyService.getStatus(userId, operationId);
            if (currentStatus?.status === 'COMPLETED') {
                return c.json({ id: currentStatus.eventId, message: 'Operação já concluída' }, 200);
            }
            if (currentStatus?.status === 'PROCESSING') {
                return c.json({ message: 'Operação em processamento', status: 'PROCESSING' }, 202);
            }
            // Se FAILED ou null, permite tentar de novo adquirindo o lock novamente (neste fluxo simplificado, pedimos para reenviar)
            return c.json({ error: 'Falha anterior. Tente novamente.' }, 400);
        }

        // Fase 3: Transaction do PostgreSQL
        try {
            const eventResult = await db.transaction(async (tx) => {
                const [newEvent] = await tx.insert(events).values({
                    id: operationId, // OPERATION ID = EVENT ID
                    organizerId: userId,
                    title,
                    slug,
                    description,
                    category,
                    categoryCode: category_code,
                    status,
                    sportsIntegrationStatus: sports_integration_status,
                    timezone,
                    startDate: start_date ? new Date(start_date) : null,
                    endDate: end_date ? new Date(end_date) : null,
                    locationName: location_name,
                    address,
                    city,
                    state,
                    postalCode: postal_code,
                    capacity,
                    eventType: event_type,
                    bannerUrl: banner_url
                }).returning();

                if (eventTickets && Array.isArray(eventTickets) && eventTickets.length > 0) {
                    const ticketsToInsert = eventTickets.map((t: any) => ({
                        eventId: newEvent.id,
                        name: t.name,
                        price: t.price,
                        quantity: t.quantity,
                        remaining: t.quantity,
                        category: t.category || 'standard',
                        registrationType: t.registration_type || 'INDIVIDUAL',
                        participantsPerRegistration: t.participants_per_registration || 1,
                        ticketPurpose: t.ticket_purpose || 'REGISTRATION'
                    }));
                    await tx.insert(tickets).values(ticketsToInsert);
                }

                return newEvent;
            });
            await idempotencyService.setCompleted(userId, operationId, eventResult.id);
            return c.json({ id: eventResult.id, ...eventResult }, 201);
            
        } catch (dbError: any) {
            // Em caso de unique_violation inesperado durante a transaction (race condition super extrema)
            if (dbError.code === '23505') { // Postgres unique violation
                const raceEvent = await db.query.events.findFirst({
                    where: eq(events.id, operationId)
                });
                if (raceEvent && raceEvent.organizerId === userId) {
                    await idempotencyService.setCompleted(userId, operationId, raceEvent.id);
                    return c.json({ id: raceEvent.id, ...raceEvent }, 200);
                }
            }
            throw dbError; // Bubble up para o catch block principal
        }

    } catch (error: any) {
        console.error('[EVENT API] ERROR at final catch', error);
        await idempotencyService.setFailed(c.get('jwtPayload').id, c.req.header('X-Idempotency-Key')!, error.message);
        const payload = c.get('jwtPayload');
        const operationId = c.req.header('X-Idempotency-Key');
        if (payload && operationId) {
            await idempotencyService.setFailed(payload.id, operationId, error.message || 'UNKNOWN');
        }
        return c.json({ error: 'Erro ao criar evento.', detail: error.message }, 500);
    }
});

router.get('/operations/:operationId', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        const userId = payload.id;
        const operationId = c.req.param('operationId');

        // Consulta Redis
        const status = await idempotencyService.getStatus(userId, operationId);
        
        if (status) {
            return c.json(status);
        }

        // Fallback persistente se Redis = NOT_FOUND
        const existingEvent = await db.query.events.findFirst({
            where: eq(events.id, operationId)
        });

        if (existingEvent) {
            if (existingEvent.organizerId === userId) {
                // Reconstruir o Redis para facilitar e garantir consistência rápida
                await idempotencyService.setCompleted(userId, operationId, existingEvent.id);
                return c.json({ status: 'COMPLETED', eventId: existingEvent.id });
            }
        }

        return c.json({ status: 'NOT_FOUND' });

    } catch (err: any) {
        console.error('[EVENTS_OPERATION] Error:', err);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export default router;
