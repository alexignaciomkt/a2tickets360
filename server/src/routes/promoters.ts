import { Hono } from 'hono';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middlewares/auth';

type Context = any;

const router = new Hono();

// Apply
router.post('/events/:eventId/apply', authMiddleware, async (c: Context) => {
    try {
        const eventId = c.req.param('eventId');
        const user = c.get('user');

        const promoterResult = await db.query.promoters.findFirst({
            where: eq(schema.promoters.userId, user.id)
        });
        if (!promoterResult) {
            return c.json({ error: 'Perfil de promoter não encontrado.' }, 403);
        }

        const eventResult = await db.query.events.findFirst({
            where: eq(schema.events.id, eventId)
        });
        if (!eventResult) {
            return c.json({ error: 'Evento não encontrado.' }, 404);
        }

        const existing = await db.query.eventPromoters.findFirst({
            where: and(
                eq(schema.eventPromoters.eventId, eventId),
                eq(schema.eventPromoters.promoterId, promoterResult.id)
            )
        });

        if (existing) {
            return c.json(existing, 200);
        }

        const result = await db.insert(schema.eventPromoters).values({
            eventId,
            promoterId: promoterResult.id,
            status: 'PENDING',
            isActive: false,
            commissionRate: '0.00',
            discountRate: '0.00',
            settlementMode: 'MANUAL',
            referralCode: null
        }).returning();

        return c.json(result[0], 201);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Dashboard Metrics
router.get('/dashboard', authMiddleware, async (c: Context) => {
    try {
        const user = c.get('jwtPayload');
        if (!user || !user.id) {
            return c.json({ error: 'Usuário não autenticado.' }, 401);
        }
        console.log('[PROM DASH] 1 AUTH', user.id);

        const { inArray } = await import('drizzle-orm');

        // 1. Encontrar o promoter canônico
        const promoters = await db.select().from(schema.promoters).where(eq(schema.promoters.userId, user.id)).limit(1);
        const promoter = promoters[0];
        if (!promoter) {
            return c.json({ error: 'Promoter não encontrado.' }, 403);
        }
        console.log('[PROM DASH] 2 PROMOTER', promoter.id);

        // 2. Eventos afiliados (Usando query explícita para evitar falha no relations)
        const affiliations = await db.select({
            id: schema.eventPromoters.id,
            eventId: schema.eventPromoters.eventId,
            commissionRate: schema.eventPromoters.commissionRate,
            discountRate: schema.eventPromoters.discountRate,
            referralCode: schema.eventPromoters.referralCode,
            status: schema.eventPromoters.status,
            isActive: schema.eventPromoters.isActive,
            settlementMode: schema.eventPromoters.settlementMode,
            title: schema.events.title,
            bannerUrl: schema.events.bannerUrl,
            startDate: schema.events.startDate,
            endDate: schema.events.endDate
        })
        .from(schema.eventPromoters)
        .leftJoin(schema.events, eq(schema.eventPromoters.eventId, schema.events.id))
        .where(
            and(
                eq(schema.eventPromoters.promoterId, promoter.id),
                eq(schema.eventPromoters.status, 'APPROVED'),
                eq(schema.eventPromoters.isActive, true)
            )
        );
        console.log('[PROM DASH] 3 AFFILIATIONS', affiliations.length);

        // 3. Sales reais (pagas) associadas ao promoter
        const promoterSales = await db.select().from(schema.sales).where(
            and(
                eq(schema.sales.promoterId, promoter.id),
                eq(schema.sales.paymentStatus, 'paid')
            )
        );
        console.log('[PROM DASH] 4 SALES', promoterSales.length);

        // 4. Calcular métricas
        let totalSales = promoterSales.length;
        let grossRevenue = 0;
        let commissionGenerated = 0;
        let commissionReceivable = 0;
        let commissionReceived = 0;

        promoterSales.forEach(s => {
            grossRevenue += Number(s.grossAmount || 0);
            const comm = Number(s.promoterCommissionAmount || 0);
            commissionGenerated += comm;
            
            if (s.paymentStatus === 'paid' && s.promoterSettlementMode === 'MANUAL' && comm > 0 && s.payoutStatus !== 'processed' && s.payoutStatus !== 'paid') {
                commissionReceivable += comm;
            } else if (s.payoutStatus === 'paid' || s.payoutStatus === 'processed') {
                commissionReceived += comm;
            }
        });

        // 5. Contar credenciais
        let totalCredentials = 0;
        if (promoterSales.length > 0) {
            const saleIds = promoterSales.map(s => s.id);
            const purchased = await db.select().from(schema.purchasedTickets).where(
                and(
                    inArray(schema.purchasedTickets.parentPurchaseId, saleIds),
                    inArray(schema.purchasedTickets.status, ['active', 'used'])
                )
            );
            totalCredentials = purchased.length;
        }
        console.log('[PROM DASH] 5 CREDENTIALS', totalCredentials);

        // 6. Associar métricas aos eventos
        const affiliatedEvents = affiliations.map(aff => {
            // Filtrar as sales deste evento
            const eventSales = promoterSales.filter(s => s.eventId === aff.eventId);
            const evRevenue = eventSales.reduce((acc, s) => acc + Number(s.grossAmount || 0), 0);
            const evCommission = eventSales.reduce((acc, s) => acc + Number(s.promoterCommissionAmount || 0), 0);
            
            // Em vez de fazer uma query adicional por evento, usamos um proxy (total se 1 evento, senao rateia provisoriamente)
            const evCredentials = affiliations.length === 1 ? totalCredentials : eventSales.reduce((acc, s) => acc + (Number(s.quantity) || 1), 0);

            let evReceivable = 0;
            let evReceived = 0;
            eventSales.forEach(s => {
                const comm = Number(s.promoterCommissionAmount || 0);
                if (s.paymentStatus === 'paid' && s.promoterSettlementMode === 'MANUAL' && comm > 0 && s.payoutStatus !== 'processed' && s.payoutStatus !== 'paid') {
                    evReceivable += comm;
                } else if (s.payoutStatus === 'paid' || s.payoutStatus === 'processed') {
                    evReceived += comm;
                }
            });

            return {
                id: aff.id,
                eventId: aff.eventId,
                eventPromoterId: aff.id,
                title: aff.title,
                bannerUrl: aff.bannerUrl,
                startDate: aff.startDate,
                endDate: aff.endDate,
                commissionRate: aff.commissionRate,
                discountRate: aff.discountRate,
                referralCode: aff.referralCode,
                status: aff.status,
                isActive: aff.isActive,
                settlementMode: aff.settlementMode,
                salesCount: eventSales.length,
                sales: eventSales.length, // frontend might use this
                credentialsCount: evCredentials,
                credentials: evCredentials, // frontend might use this
                grossRevenue: evRevenue,
                commissionGenerated: evCommission,
                commissionReceivable: evReceivable,
                commissionReceived: evReceived
            };
        });

        const responseData = {
            totalSales,
            totalCredentials,
            grossRevenue,
            commissionGenerated,
            commissionReceivable,
            commissionReceived,
            affiliatedEventsCount: affiliations.length,
            affiliatedEvents
        };

        console.log('[PROM DASH] 6 RESPONSE', responseData);
        return c.json(responseData);

    } catch (e: any) {
        console.error('[PROM DASH] ERROR:', e);
        return c.json({ error: e.message }, 500);
    }
});

// Mailing
router.get('/mailing', authMiddleware, async (c: Context) => {
    try {
        const user = c.get('jwtPayload');
        if (!user || !user.id) {
            return c.json({ error: 'Usuário não autenticado.' }, 401);
        }

        const { inArray } = await import('drizzle-orm');

        // 1. Encontrar o promoter
        const promoters = await db.select().from(schema.promoters).where(eq(schema.promoters.userId, user.id)).limit(1);
        const promoter = promoters[0];
        if (!promoter) {
            return c.json({ error: 'Promoter não encontrado.' }, 403);
        }

        // 2. Fetch paid sales directly attributed to this promoter
        const mailingSales = await db.select({
            id: schema.sales.id,
            eventId: schema.sales.eventId,
            buyerInfo: schema.sales.buyerInfo,
            grossAmount: schema.sales.grossAmount,
            createdAt: schema.sales.createdAt,
            eventTitle: schema.events.title,
            eventStartDate: schema.events.startDate,
        })
        .from(schema.sales)
        .leftJoin(schema.events, eq(schema.sales.eventId, schema.events.id))
        .where(
            and(
                eq(schema.sales.promoterId, promoter.id),
                eq(schema.sales.paymentStatus, 'paid')
            )
        );

        if (mailingSales.length === 0) {
             return c.json({
                  summary: { uniqueCustomers: 0, totalPurchases: 0, totalRevenue: 0 },
                  customers: []
             });
        }

        // 3. Contar credenciais
        const saleIds = mailingSales.map(s => s.id);
        const purchased = await db.select().from(schema.purchasedTickets).where(
            and(
                inArray(schema.purchasedTickets.parentPurchaseId, saleIds),
                inArray(schema.purchasedTickets.status, ['active', 'used'])
            )
        );

        // Map purchased by sale
        const credsBySale: Record<string, number> = {};
        purchased.forEach(pt => {
            if (pt.parentPurchaseId) {
                credsBySale[pt.parentPurchaseId] = (credsBySale[pt.parentPurchaseId] || 0) + 1;
            }
        });

        // 4. Process Data
        let totalRevenue = 0;
        const uniqueEmails = new Set<string>();
        
        const customers = mailingSales.map(sale => {
            totalRevenue += Number(sale.grossAmount || 0);

            // Parse buyerInfo
            let parsedInfo: any = {};
            if (typeof sale.buyerInfo === 'string') {
                try {
                    parsedInfo = JSON.parse(sale.buyerInfo);
                } catch(e) {}
            } else if (typeof sale.buyerInfo === 'object' && sale.buyerInfo !== null) {
                parsedInfo = sale.buyerInfo;
            }

            const buyerEmail = parsedInfo.email || '';
            const normalizedEmail = buyerEmail.trim().toLowerCase();
            if (normalizedEmail) {
                uniqueEmails.add(normalizedEmail);
            }

            return {
                saleId: sale.id,
                buyerName: parsedInfo.name || '',
                buyerEmail: normalizedEmail,
                buyerPhone: parsedInfo.phone || null,
                buyerCity: parsedInfo.city || null,
                buyerState: parsedInfo.state || parsedInfo.uf || null,
                eventId: sale.eventId,
                eventTitle: sale.eventTitle || 'Evento Desconhecido',
                eventDate: sale.eventStartDate,
                purchaseDate: sale.createdAt,
                grossAmount: Number(sale.grossAmount || 0),
                credentialsCount: credsBySale[sale.id] || 1 // Fallback to 1 if not minted yet
            };
        });

        return c.json({
             summary: {
                  uniqueCustomers: uniqueEmails.size,
                  totalPurchases: mailingSales.length,
                  totalRevenue: totalRevenue
             },
             customers
        });

    } catch (e: any) {
        console.error('[PROM MAILING] ERROR:', e);
        return c.json({ error: e.message }, 500);
    }
});

export default router;
