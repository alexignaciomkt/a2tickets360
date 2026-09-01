import { Hono } from 'hono';
import { db } from '../db';
import { 
    events, 
    tickets, 
    organizers, 
    staffApplications, 
    staffApplicationFunctions, 
    staffProfessionalFunctions, 
    profiles, 
    staffProfiles,
    eventStaff,
    staffProfileFunctions
} from '../db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
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

        // Validação estrita de Ingressos (Tickets)
        if (eventTickets && Array.isArray(eventTickets)) {
            for (const t of eventTickets) {
                const purpose = t.ticketPurpose;
                const regType = t.registrationType;
                const participants = t.participantsPerRegistration;

                if (purpose && !['ADMISSION', 'REGISTRATION', 'REPECHAGE'].includes(purpose)) {
                    return c.json({ error: `Finalidade de ingresso inválida: ${purpose}` }, 400);
                }
                if (regType && !['INDIVIDUAL', 'DOUBLE', 'TEAM'].includes(regType)) {
                    return c.json({ error: `Tipo de inscrição inválido: ${regType}` }, 400);
                }
                
                if (purpose === 'REGISTRATION') {
                    if (!regType || !participants) {
                        return c.json({ error: 'Ingressos de inscrição esportiva exigem registrationType e participantsPerRegistration.' }, 400);
                    }
                }
            }
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
            if (existingEvent.organizerId !== organizerDetails.id) {
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
                    organizerId: organizerDetails.id,
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
                        registrationType: t.registrationType,
                        participantsPerRegistration: t.participantsPerRegistration,
                        ticketPurpose: t.ticketPurpose
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

// Configurar regras do programa de promoters (organizador)
router.put('/:id/promoter-settings', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        if (payload.role !== 'organizer' && payload.role !== 'master') {
            return c.json({ error: 'Acesso negado.' }, 403);
        }

        const eventId = c.req.param('id');
        const body = await c.req.json();

        // Identificar organizer_details.id
        const organizerData = await db.query.organizers.findFirst({
            where: (org, { eq }) => eq(org.userId, payload.id)
        });
        
        if (!organizerData && payload.role !== 'master') {
            return c.json({ error: 'Produtor não encontrado.' }, 404);
        }
        
        const organizerRecordId = organizerData?.id;

        // Validar ownership do evento
        const evData = await db.query.events.findFirst({
            where: (e, { eq }) => eq(e.id, eventId)
        });

        if (!evData) return c.json({ error: 'Evento não encontrado.' }, 404);
        if (evData.organizerId !== organizerRecordId && payload.role !== 'master') {
            return c.json({ error: 'Acesso negado ao evento.' }, 403);
        }

        await db.update(events)
            .set({
                acceptsPromoters: body.accepts_promoters,
                promoterCommissionRate: body.promoter_commission_rate ? String(body.promoter_commission_rate) : null,
                promoterDiscountRate: body.promoter_discount_rate !== undefined ? String(body.promoter_discount_rate) : '0'
            })
            .where(eq(events.id, eventId));

        return c.json({ success: true });
    } catch (err: any) {
        console.error('[EVENT API] Erro ao salvar regras do promoter:', err);
        return c.json({ error: 'Erro interno ao salvar configurações.' }, 500);
    }
});

// Aprovar promoter
router.post('/:eventId/promoters/:id/approve', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        if (payload.role !== 'organizer' && payload.role !== 'master') {
            return c.json({ error: 'Acesso negado.' }, 403);
        }

        const eventId = c.req.param('eventId');
        const eventPromoterId = c.req.param('id');
        const body = await c.req.json();
        const { commissionRate = '10.00', discountRate = '0.00', settlementMode = 'MANUAL' } = body;

        // Validar ownership
        const orgEvent = await db.query.events.findFirst({
            where: (e, { eq, and }) => and(eq(e.id, eventId), eq(e.organizerId, payload.id))
        });
        
        if (!orgEvent && payload.role !== 'master') {
            return c.json({ error: 'Não autorizado.' }, 403);
        }

        const { eventPromoters } = await import('../db/schema');
        const { eq, and } = await import('drizzle-orm');

        const ep = await db.query.eventPromoters.findFirst({
            where: and(
                eq(eventPromoters.id, eventPromoterId),
                eq(eventPromoters.eventId, eventId),
                eq(eventPromoters.status, 'PENDING')
            )
        });

        if (!ep) {
            return c.json({ error: 'Afiliação não encontrada ou não pendente.' }, 404);
        }

        const couponCode = `PROM${Math.floor(Math.random() * 10000)}`;

        const updated = await db.update(eventPromoters).set({
            status: 'APPROVED',
            isActive: true,
            referralCode: couponCode,
            commissionRate: String(commissionRate),
            discountRate: String(discountRate),
            settlementMode: settlementMode
        }).where(eq(eventPromoters.id, eventPromoterId)).returning();

        return c.json(updated[0], 200);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Listar promoters do evento
router.get('/:eventId/promoters', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        const eventId = c.req.param('eventId');

        const { eventPromoters, promoters, sales, purchasedTickets } = await import('../db/schema');
        const { eq, and, inArray } = await import('drizzle-orm');

        const eps = await db.select({
            id: eventPromoters.id,
            eventId: eventPromoters.eventId,
            promoterId: eventPromoters.promoterId,
            commissionRate: eventPromoters.commissionRate,
            discountRate: eventPromoters.discountRate,
            referralCode: eventPromoters.referralCode,
            isActive: eventPromoters.isActive,
            status: eventPromoters.status,
            settlementMode: eventPromoters.settlementMode,
            createdAt: eventPromoters.createdAt,
            promoterName: promoters.name,
            promoterEmail: promoters.email,
        })
        .from(eventPromoters)
        .leftJoin(promoters, eq(eventPromoters.promoterId, promoters.id))
        .where(eq(eventPromoters.eventId, eventId));

        // Aggregate performance for each promoter
        let promoterPaidSales = 0;
        let promoterCredentials = 0;
        let promoterGrossRevenue = 0;
        let promoterCommissionGenerated = 0;
        let promoterCommissionPayable = 0;
        let promoterCommissionPaid = 0;

        const results = await Promise.all(eps.map(async (ep) => {
            const promoterSales = await db.query.sales.findMany({
                where: and(
                    eq(sales.promoterId, ep.promoterId!),
                    eq(sales.eventId, ep.eventId!),
                    eq(sales.paymentStatus, 'paid')
                )
            });

            let salesCount = promoterSales.length;
            let grossRevenue = 0;
            let commissionGenerated = 0;
            let commissionPayable = 0;
            let commissionPaid = 0;
            let credentialsCount = 0;

            if (salesCount > 0) {
                const saleIds = promoterSales.map(s => s.id);
                const purchased = await db.select().from(purchasedTickets).where(
                    and(
                        inArray(purchasedTickets.parentPurchaseId, saleIds),
                        inArray(purchasedTickets.status, ['active', 'used'])
                    )
                );
                credentialsCount = purchased.length;
            }

            promoterSales.forEach(s => {
                grossRevenue += Number(s.grossAmount || 0);
                const comm = Number(s.promoterCommissionAmount || 0);
                commissionGenerated += comm;
                
                if (s.payoutStatus === 'payable' || !s.payoutStatus) {
                    commissionPayable += comm;
                } else if (s.payoutStatus === 'paid' || s.payoutStatus === 'processed') {
                    commissionPaid += comm;
                }
            });

            // Add to global promoter KPIs
            promoterPaidSales += salesCount;
            promoterCredentials += credentialsCount;
            promoterGrossRevenue += grossRevenue;
            promoterCommissionGenerated += commissionGenerated;
            promoterCommissionPayable += commissionPayable;
            promoterCommissionPaid += commissionPaid;

            return {
                ...ep,
                performance: {
                    sales: salesCount,
                    credentials: credentialsCount,
                    grossRevenue,
                    commissionGenerated,
                    commissionPayable,
                    commissionPaid
                }
            };
        }));

        // Calculate totalEventPaidSales
        const { sql } = await import('drizzle-orm');
        const totalSalesQuery = await db.select({ count: sql`count(*)` }).from(sales).where(
            and(
                eq(sales.eventId, eventId),
                eq(sales.paymentStatus, 'paid')
            )
        );
        const totalEventPaidSales = Number(totalSalesQuery[0].count);
        
        const promoterSalesShare = totalEventPaidSales > 0 ? (promoterPaidSales / totalEventPaidSales) * 100 : 0;

        const summary = {
            totalEventPaidSales,
            promoterPaidSales,
            promoterCredentials,
            promoterGrossRevenue,
            promoterCommissionGenerated,
            promoterCommissionPayable,
            promoterCommissionPaid,
            promoterSalesShare
        };

        return c.json({ summary, promoters: results }, 200);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Rejeitar promoter
router.post('/:eventId/promoters/:id/reject', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        if (payload.role !== 'organizer' && payload.role !== 'master') {
            return c.json({ error: 'Acesso negado.' }, 403);
        }

        const eventId = c.req.param('eventId');
        const eventPromoterId = c.req.param('id');

        // Validar ownership
        const orgEvent = await db.query.events.findFirst({
            where: (e, { eq, and }) => and(eq(e.id, eventId), eq(e.organizerId, payload.id))
        });
        
        if (!orgEvent && payload.role !== 'master') {
            return c.json({ error: 'Não autorizado.' }, 403);
        }

        const { eventPromoters } = await import('../db/schema');
        const { eq, and } = await import('drizzle-orm');

        const ep = await db.query.eventPromoters.findFirst({
            where: and(
                eq(eventPromoters.id, eventPromoterId),
                eq(eventPromoters.eventId, eventId)
            )
        });

        if (!ep) {
            return c.json({ error: 'Afiliação não encontrada.' }, 404);
        }

        const updated = await db.update(eventPromoters).set({
            status: 'REJECTED',
            isActive: false
        }).where(eq(eventPromoters.id, eventPromoterId)).returning();

        return c.json(updated[0], 200);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ============================================================================
// STAFF APPLICATIONS (CANDIDATURAS)
// ============================================================================

/**
 * GET /api/events/:eventId/staff-applications
 * Lista as candidaturas recebidas para o evento (apenas pro produtor).
 */
router.get('/:eventId/staff-applications', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const { eventId } = c.req.param();

        console.log('[STAFF APPS] START', {
            eventId,
            hasJwt: !!payload,
            userId: payload?.id
        });

        // 1. Validar ownership
        const evt = await db.select().from(events).where(eq(events.id, eventId));
        if (evt.length === 0 || evt[0].organizerId !== organizerId) {
            return c.json({ error: 'Proibido' }, 403);
        }
        console.log('[STAFF APPS] OWNERSHIP OK');

        const apps = await db.select({
            applicationId: staffApplications.id,
            status: staffApplications.status,
            createdAt: staffApplications.createdAt,
            userId: staffApplications.userId,
            userName: profiles.name,
            userAvatarUrl: profiles.avatarUrl,
            userCity: profiles.city,
            userState: profiles.state,
            functionId: staffApplicationFunctions.professionalFunctionId,
            functionName: staffProfessionalFunctions.name,
            functionCategory: staffProfessionalFunctions.category,
            eventStaffStatus: eventStaff.status,
            eventStaffId: eventStaff.id,
            staffFunctionId: eventStaff.staffFunctionId,
            shiftStart: eventStaff.shiftStart,
            shiftEnd: eventStaff.shiftEnd
        })
        .from(staffApplications)
        .leftJoin(profiles, eq(staffApplications.userId, profiles.userId))
        .leftJoin(staffProfiles, eq(staffApplications.userId, staffProfiles.userId))
        .leftJoin(staffApplicationFunctions, eq(staffApplications.id, staffApplicationFunctions.staffApplicationId))
        .leftJoin(staffProfessionalFunctions, eq(staffApplicationFunctions.professionalFunctionId, staffProfessionalFunctions.id))
        .leftJoin(eventStaff, and(eq(staffApplications.userId, eventStaff.userId), eq(staffApplications.eventId, eventStaff.eventId)))
        .where(eq(staffApplications.eventId, eventId))
        .orderBy(staffApplications.createdAt);

        console.log('[STAFF APPS] QUERY ROWS', apps?.length);

        // Agrupar funções por applicationId
        const groupedApps = new Map();
        for (const row of apps) {
            if (!groupedApps.has(row.applicationId)) {
                groupedApps.set(row.applicationId, {
                    applicationId: row.applicationId,
                    status: row.status,
                    createdAt: row.createdAt,
                    eventStaffStatus: row.eventStaffStatus,
                    eventStaff: row.eventStaffId ? {
                        id: row.eventStaffId,
                        staffFunctionId: row.staffFunctionId,
                        shiftStart: row.shiftStart ? row.shiftStart.toISOString().replace('Z', '') : null,
                        shiftEnd: row.shiftEnd ? row.shiftEnd.toISOString().replace('Z', '') : null,
                    } : null,
                    user: {
                        userId: row.userId,
                        name: row.userName,
                        avatarUrl: row.userAvatarUrl,
                        city: row.userCity,
                        state: row.userState
                    },
                    functions: []
                });
            }
            if (row.functionId) {
                groupedApps.get(row.applicationId).functions.push({
                    id: row.functionId,
                    name: row.functionName,
                    category: row.functionCategory
                });
            }
        }

        console.log('[STAFF APPS] GROUPED', groupedApps.size);
        console.log('[STAFF APPS] RETURN 200');

        return c.json(Array.from(groupedApps.values()));
    } catch (e: any) {
        console.error('[STAFF APPS] ERROR', e);
        return c.json({ error: e.message }, 500);
    }
});

/**
 * GET /api/events/:eventId/staff-applications/:id/profile
 * Detalhes do candidato, incluindo PII (telefone)
 */
router.get('/:eventId/staff-applications/:id/profile', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const { eventId, id } = c.req.param();

        // 1. Validar ownership do evento
        const evt = await db.select().from(events).where(eq(events.id, eventId));
        if (evt.length === 0 || evt[0].organizerId !== organizerId) {
            return c.json({ error: 'Proibido' }, 403);
        }

        // 2. Validar que a application existe e é do evento
        const app = await db.select().from(staffApplications).where(and(eq(staffApplications.id, id), eq(staffApplications.eventId, eventId)));
        if (app.length === 0) return c.json({ error: 'Candidatura não encontrada' }, 404);

        const userId = app[0].userId;

        // 3. Buscar Perfil e PII
        const profile = await db.select().from(profiles).where(eq(profiles.userId, userId));
        const sProfile = await db.select().from(staffProfiles).where(eq(staffProfiles.userId, userId));

        // 4. Buscar funções globais e da candidatura
        const globalFuncs = await db.select({
            id: staffProfessionalFunctions.id,
            name: staffProfessionalFunctions.name
        }).from(staffProfileFunctions)
        .leftJoin(staffProfessionalFunctions, eq(staffProfileFunctions.professionalFunctionId, staffProfessionalFunctions.id))
        .where(eq(staffProfileFunctions.staffUserId, userId));

        const appFuncs = await db.select({
            id: staffProfessionalFunctions.id,
            name: staffProfessionalFunctions.name
        }).from(staffApplicationFunctions)
        .leftJoin(staffProfessionalFunctions, eq(staffApplicationFunctions.professionalFunctionId, staffProfessionalFunctions.id))
        .where(eq(staffApplicationFunctions.staffApplicationId, id));

        return c.json({
            applicationId: id,
            userId: userId,
            name: profile[0]?.name,
            avatarUrl: profile[0]?.avatarUrl,
            phone: sProfile[0]?.phone,
            bio: sProfile[0]?.bio,
            city: profile[0]?.city,
            state: profile[0]?.state,
            birthDate: profile[0]?.birthDate,
            professionalFunctions: globalFuncs,
            applicationFunctions: appFuncs
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * POST /api/events/:eventId/staff-applications/:id/reject
 * Rejeitar candidatura
 */
router.post('/:eventId/staff-applications/:id/reject', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const { eventId, id } = c.req.param();

        // 1. Validar ownership
        const evt = await db.select().from(events).where(eq(events.id, eventId));
        if (evt.length === 0 || evt[0].organizerId !== organizerId) {
            return c.json({ error: 'Proibido' }, 403);
        }

        const app = await db.select().from(staffApplications).where(and(eq(staffApplications.id, id), eq(staffApplications.eventId, eventId)));
        if (app.length === 0) return c.json({ error: 'Candidatura não encontrada' }, 404);
        if (app[0].status !== 'PENDING') return c.json({ error: 'Candidatura não está pendente' }, 400);

        await db.update(staffApplications).set({
            status: 'REJECTED',
            reviewedAt: new Date(),
            reviewedBy: organizerId
        }).where(eq(staffApplications.id, id));

        return c.json({ message: 'Candidatura recusada com sucesso.' });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * POST /api/events/:eventId/staff-applications/:id/approve
 * Aprovar candidatura e enviar convite
 */
router.post('/:eventId/staff-applications/:id/approve', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const { eventId, id } = c.req.param();
        const body = await c.req.json();
        const { staffFunctionId, shiftStart, shiftEnd } = body;

        if (!staffFunctionId) return c.json({ error: 'Função operacional é obrigatória.' }, 400);

        // 1. Validar ownership do evento
        const evt = await db.select().from(events).where(eq(events.id, eventId));
        if (evt.length === 0 || evt[0].organizerId !== organizerId) {
            return c.json({ error: 'Proibido' }, 403);
        }

        await db.transaction(async (tx) => {
            // Lock the application row
            const apps = await tx.select().from(staffApplications)
                .where(and(eq(staffApplications.id, id), eq(staffApplications.eventId, eventId)))
                .for('update');
                
            if (apps.length === 0) throw new Error('Candidatura não encontrada');
            const app = apps[0];
            
            if (app.status !== 'PENDING') throw new Error('Candidatura não está pendente');

            // Prevent duplicate event_staff for this user and event
            const existingAssignment = await tx.select().from(eventStaff)
                .where(and(eq(eventStaff.eventId, eventId), eq(eventStaff.userId, app.userId)));
            
            if (existingAssignment.length > 0) {
                throw new Error('Este Staff já possui um vínculo com este evento.');
            }

            // Processar data e hora local
            let finalStartDate = null;
            let finalEndDate = null;

            if (shiftDate && shiftStart && shiftEnd) {
                let startStr = `${shiftDate}T${shiftStart}:00`;
                let endStr = `${shiftDate}T${shiftEnd}:00`;

                if (shiftEnd < shiftStart) {
                    const [year, month, day] = shiftDate.split('-').map(Number);
                    const d = new Date(Date.UTC(year, month - 1, day));
                    d.setUTCDate(d.getUTCDate() + 1);
                    const nextDay = d.toISOString().split('T')[0];
                    endStr = `${nextDay}T${shiftEnd}:00`;
                }

                // Inserir os horários locais diretamente como string. 
                // O driver enviará para o Postgres como timestamp literal.
                finalStartDate = startStr;
                finalEndDate = endStr;
            }

            // Criar PENDING_ACCEPTANCE event_staff
            await tx.insert(eventStaff).values({
                eventId,
                userId: app.userId,
                organizerId,
                staffFunctionId,
                status: 'PENDING_ACCEPTANCE',
                shiftStart: finalStartDate ? new Date(finalStartDate + 'Z') : null,
                shiftEnd: finalEndDate ? new Date(finalEndDate + 'Z') : null,
                invitedBy: organizerId
            });

            // Update application
            await tx.update(staffApplications).set({
                status: 'APPROVED',
                reviewedAt: new Date(),
                reviewedBy: organizerId
            }).where(eq(staffApplications.id, id));
        });

        return c.json({ message: 'Candidatura aprovada. Convite pendente de aceite.' });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

/**
 * PATCH /api/organizer/events/:eventId/staff-applications/:id/proposal
 * Editar proposta pendente
 */
router.patch('/:eventId/staff-applications/:id/proposal', async (c) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const { eventId, id } = c.req.param();
        const body = await c.req.json();
        const { staffFunctionId, shiftDate, shiftStart, shiftEnd } = body;

        console.log('[PROPOSAL PATCH] START', {
            eventId,
            applicationId: id,
            organizerId
        });

        // 1. Validar ownership
        const evt = await db.select().from(events).where(eq(events.id, eventId));
        if (evt.length === 0 || evt[0].organizerId !== organizerId) {
            return c.json({ error: 'Proibido' }, 403);
        }

        // 2. Localizar candidatura
        const app = await db.select().from(staffApplications).where(and(eq(staffApplications.id, id), eq(staffApplications.eventId, eventId)));
        if (app.length === 0) return c.json({ error: 'Candidatura não encontrada' }, 404);
        
        console.log('[PROPOSAL PATCH] APPLICATION OK');

        await db.transaction(async (tx) => {
            // 3. Localizar event_staff para este usuário neste evento
            // com for update para evitar race condition
            const assignments = await tx.select().from(eventStaff)
                .where(and(eq(eventStaff.eventId, eventId), eq(eventStaff.userId, app[0].userId)))
                .for('update');

            if (assignments.length === 0) throw new Error('Vínculo não encontrado.');
            
            const assignment = assignments[0];
            
            console.log('[PROPOSAL PATCH] EVENT STAFF', {
                eventStaffId: assignment?.id,
                status: assignment?.status
            });

            // 4. Validar status PENDING_ACCEPTANCE
            if (assignment.status !== 'PENDING_ACCEPTANCE') {
                throw new Error('Esta proposta não pode mais ser editada porque já foi respondida.');
            }

            // 5. Preparar as datas locais
            let finalStartDate = null;
            let finalEndDate = null;

            if (shiftDate && shiftStart && shiftEnd) {
                let startStr = `${shiftDate}T${shiftStart}:00`;
                let endStr = `${shiftDate}T${shiftEnd}:00`;

                if (shiftEnd < shiftStart) {
                    const [year, month, day] = shiftDate.split('-').map(Number);
                    const d = new Date(Date.UTC(year, month - 1, day));
                    d.setUTCDate(d.getUTCDate() + 1);
                    const nextDay = d.toISOString().split('T')[0];
                    endStr = `${nextDay}T${shiftEnd}:00`;
                }

                finalStartDate = startStr;
                finalEndDate = endStr;
            }

            console.log('[PROPOSAL PATCH] DATES', {
                shiftDate,
                shiftStart,
                shiftEnd,
                finalStartDate,
                finalEndDate
            });

            const updatePayload = {
                staffFunctionId,
                shiftStart: finalStartDate ? new Date(finalStartDate + 'Z') : null,
                shiftEnd: finalEndDate ? new Date(finalEndDate + 'Z') : null,
                updatedAt: new Date()
            };

            console.log('[PROPOSAL PATCH] BEFORE UPDATE', { 
                payload: {
                    ...updatePayload,
                    shiftStartType: updatePayload.shiftStart ? updatePayload.shiftStart.constructor.name : null,
                    shiftStartIsNaN: updatePayload.shiftStart ? isNaN(updatePayload.shiftStart.getTime()) : null
                }
            });

            // 6. Atualizar SOMENTE a proposta
            await tx.update(eventStaff).set(updatePayload).where(and(eq(eventStaff.id, assignment.id), eq(eventStaff.status, 'PENDING_ACCEPTANCE')));
            
            console.log('[PROPOSAL PATCH] UPDATE OK');
        });

        return c.json({ message: 'Proposta atualizada com sucesso.' });
    } catch (e: any) {
        console.error('[PROPOSAL PATCH] ERROR', {
            name: e?.name,
            message: e?.message,
            code: e?.code,
            detail: e?.detail,
            constraint: e?.constraint,
            stack: e?.stack
        });
        if (e.message === 'Esta proposta não pode mais ser editada porque já foi respondida.') {
            return c.json({ error: e.message }, 409);
        }
        return c.json({ error: e.message }, 500);
    }
});

/**
 * PATCH /api/organizer/events/:eventId/access-operation
 * Permite ao produtor abrir ou fechar a operação de acesso do evento
 */
router.patch('/:eventId/access-operation', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        if (!payload) return c.json({ error: 'Unauthorized' }, 401);
        
        const organizerId = payload.id; // User is the organizer
        const eventId = c.req.param('eventId');
        const body = await c.req.json();
        const { operationStatus } = body;

        if (operationStatus !== 'open' && operationStatus !== 'closed') {
            return c.json({ error: 'Invalid operationStatus. Must be open or closed.' }, 400);
        }

        // Validate Ownership
        const eventRows = await db.select().from(events).where(eq(events.id, eventId));
        if (eventRows.length === 0) {
            return c.json({ error: 'Event not found' }, 404);
        }
        
        const event = eventRows[0];
        // TODO: In a more complex RBAC, check if user has permission to manage event settings
        // For V1, we strictly enforce ownership
        if (event.organizerId !== organizerId) {
            return c.json({ error: 'Forbidden. You do not own this event.' }, 403);
        }

        await db.update(events).set({ 
            operationStatus,
            updatedAt: new Date()
        }).where(eq(events.id, eventId));

        return c.json({ message: 'Status operacional atualizado com sucesso.', operationStatus });
    } catch (err: any) {
        console.error('[ACCESS OPERATION PATCH]', err);
        return c.json({ error: err.message }, 500);
    }
});

export default router;
