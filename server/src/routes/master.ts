import { Hono } from 'hono';
import { db } from '../db';
import { profiles, sales, events, purchasedTickets, sportRegistrations, organizers as organizersTable } from '../db/schema';
import { profiles, sales, events, purchasedTickets, sportRegistrations } from '../db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { authMiddleware } from '../middlewares/auth';

const router = new Hono();

router.use('/*', authMiddleware);

// Middleware to assert master role canonically
router.use('/*', async (c, next) => {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.id) {
        return c.json({ error: 'Não autenticado' }, 401);
    }

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, payload.id)
    });

    if (!profile || profile.role !== 'master') {
        return c.json({ error: 'Acesso negado: Requer privilégios Master' }, 403);
    }

    await next();
});

router.get('/dashboard/stats', async (c) => {
    try {
        const [
            usersCountResult,
            organizersCountResult,
            eventsCountResult,
            salesPaidCountResult,
            financialTotals
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.role, 'customer')),
            db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.role, 'organizer')),
            db.select({ count: sql<number>`count(*)` }).from(events),
            db.select({ count: sql<number>`count(*)` }).from(sales).where(eq(sales.paymentStatus, 'paid')),
            db.select({
                gross: sql<number>`COALESCE(SUM(${sales.grossAmount}), 0)`,
                producer: sql<number>`COALESCE(SUM(${sales.producerAmount}), 0)`,
                fee: sql<number>`COALESCE(SUM(${sales.platformFeeAmount}), 0)`,
                gmv: sql<number>`COALESCE(SUM(${sales.buyerTotal}), 0)`
            }).from(sales).where(eq(sales.paymentStatus, 'paid'))
        ]);

        return c.json({
            customersCount: Number(usersCountResult[0].count),
            organizersCount: Number(organizersCountResult[0].count),
            eventsCount: Number(eventsCountResult[0].count),
            transactionsCount: Number(salesPaidCountResult[0].count),
            grossAmount: Number(financialTotals[0].gross),
            producerAmount: Number(financialTotals[0].producer),
            platformFeeAmount: Number(financialTotals[0].fee),
            gmv: Number(financialTotals[0].gmv)
        });
    } catch (e: any) {
        console.error('Master Dashboard Stats Error:', e);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

router.get('/financial/summary', async (c) => {
    try {
        const [
            financialTotals,
            salesPaidCountResult
        ] = await Promise.all([
            db.select({
                gross: sql<number>`COALESCE(SUM(${sales.grossAmount}), 0)`,
                producer: sql<number>`COALESCE(SUM(${sales.producerAmount}), 0)`,
                fee: sql<number>`COALESCE(SUM(${sales.platformFeeAmount}), 0)`,
                commercial: sql<number>`COALESCE(SUM(${sales.commercialAmount}), 0)`,
                gmv: sql<number>`COALESCE(SUM(${sales.buyerTotal}), 0)`
            }).from(sales).where(eq(sales.paymentStatus, 'paid')),
            db.select({ count: sql<number>`count(*)` }).from(sales).where(eq(sales.paymentStatus, 'paid'))
        ]);

        // Payment breakdown
        const paymentMethods = await db.select({
            method: sales.paymentMethod,
            count: sql<number>`count(*)`
        }).from(sales).where(eq(sales.paymentStatus, 'paid')).groupBy(sales.paymentMethod);
        
        const paymentMethodBreakdown = paymentMethods.map(p => ({
            method: p.method,
            count: Number(p.count)
        }));

        // Recent transactions
        const recentTransactions = await db.select({
            id: sales.id,
            eventId: sales.eventId,
            buyerId: sales.customerId,
            grossAmount: sales.grossAmount,
            platformFeeAmount: sales.platformFeeAmount,
            buyerTotal: sales.buyerTotal,
            paymentMethod: sales.paymentMethod,
            paymentStatus: sales.paymentStatus,
            createdAt: sales.createdAt
        }).from(sales).where(eq(sales.paymentStatus, 'paid')).orderBy(sql`${sales.createdAt} DESC`).limit(10);

        return c.json({
            transactionsCount: Number(salesPaidCountResult[0].count),
            grossAmount: Number(financialTotals[0].gross),
            producerAmount: Number(financialTotals[0].producer),
            platformFeeAmount: Number(financialTotals[0].fee),
            commercialAmount: Number(financialTotals[0].commercial),
            gmv: Number(financialTotals[0].gmv),
            paymentMethodBreakdown,
            recentTransactions
        });
    } catch (e: any) {
        console.error('Master Financial Summary Error:', e);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

router.get('/financial/transactions', async (c) => {
    try {
        const queryParams = c.req.query();
        let query = db.select({
            id: sales.id,
            eventId: sales.eventId,
            buyerId: sales.customerId,
            amount: sales.grossAmount,
            netAmount: sales.producerAmount,
            fee: sql<number>`0`, // not explicitly stored for buyer fee here? We use platformFeeAmount
            platformFee: sales.platformFeeAmount,
            status: sales.paymentStatus,
            paymentMethod: sales.paymentMethod,
            date: sales.createdAt,
            eventName: events.title,
            userName: profiles.name,
            organizerId: events.organizerId
        }).from(sales)
        .leftJoin(events, eq(sales.eventId, events.id))
        .leftJoin(profiles, eq(sales.customerId, profiles.userId));

        // Note: As per instructions, "A tabela deve listar Sales reais... Esperado: pelo menos as 2 Sales da Copa Bruxa."
        if (queryParams.status && queryParams.status !== 'all') {
             query = query.where(eq(sales.paymentStatus, queryParams.status));
        }

        const tx = await query.orderBy(sql`${sales.createdAt} DESC`);

        // Map to match frontend Transaction interface
        const mappedTx = tx.map(t => ({
            id: t.id,
            eventId: t.eventId,
            eventName: t.eventName || 'Evento',
            organizerId: t.organizerId || 'Unknown',
            organizerName: 'Organizador', // Could join organizer_details if needed, but keeping it simple
            userId: t.buyerId || 'Unknown',
            userName: t.userName || 'Comprador',
            amount: Number(t.amount),
            status: t.status,
            paymentMethod: t.paymentMethod,
            fee: Number(t.fee),
            platformFee: Number(t.platformFee),
            netAmount: Number(t.netAmount),
            date: t.date ? t.date.toISOString() : new Date().toISOString()
        }));

        return c.json(mappedTx);
    } catch (e: any) {
        console.error('Master Financial Transactions Error:', e);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

router.get('/financial/payouts', async (c) => {
    try {
        // As per instruction 14: "Se não existe conciliação de repasses, mostrar empty state real. Não fabricar ledger."
        // We will just return an empty array for now since there are no real payouts.
        return c.json([]);
    } catch (e: any) {
        console.error('Master Financial Payouts Error:', e);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

router.get('/events', async (c) => {
    try {
        const queryParams = c.req.query();
        
        // Manual JOIN to fix auth vs document ID mismatch
        // events.organizerId stores auth.users.id
        // organizersTable.userId stores auth.users.id
        const rawEvents = await db.select({
            event: events,
            organizer: organizersTable
        }).from(events).leftJoin(organizersTable, eq(events.organizerId, organizersTable.userId));

        let mappedEvents = rawEvents.map(row => ({
            ...row.event,
            organizer: row.organizer
        }));
        
        // Sort by desc createdAt
        mappedEvents.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        if (queryParams.status) {
            mappedEvents = mappedEvents.filter(e => e.status === queryParams.status);
        }
        return c.json(mappedEvents);
    } catch (e: any) {
        console.error('Master Events Error:', e);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// Event Actions
router.put('/events/:id/approve', async (c) => {
    const id = c.req.param('id');
    try {
        const event = await db.query.events.findFirst({ where: eq(events.id, id) });
        if (!event) return c.json({ error: 'Evento não encontrado' }, 404);

        if (event.status === 'published') {
            return c.json({ message: 'Evento já aprovado', event, alreadyPublished: true });
        }

        if (!['draft', 'pending'].includes(event.status as string)) {
            return c.json({ error: `Evento com status '${event.status}' não pode ser aprovado.` }, 400);
        }

        const [updated] = await db.update(events)
            .set({ status: 'published', updatedAt: new Date() })
            .where(eq(events.id, id))
            .returning();

        return c.json({ message: 'Evento aprovado com sucesso', event: updated });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

router.put('/events/:id/reject', async (c) => {
    const id = c.req.param('id');
    try {
        const event = await db.query.events.findFirst({ where: eq(events.id, id) });
        if (!event) return c.json({ error: 'Evento não encontrado' }, 404);

        const [updated] = await db.update(events)
            .set({ status: 'draft', updatedAt: new Date() })
            .where(eq(events.id, id))
            .returning();

        return c.json({ message: 'Evento rejeitado', event: updated });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// Organizers
router.get('/organizers', async (c) => {
    try {
        const organizersList = await db.select({
            id: organizersTable.id,
            userId: organizersTable.userId,
            companyName: organizersTable.companyName,
            slug: organizersTable.slug,
            category: organizersTable.category,
            logoUrl: organizersTable.logoUrl,
            createdAt: organizersTable.createdAt,
            status: profiles.status,
            profileComplete: profiles.profileComplete,
            email: profiles.email
        }).from(organizersTable)
        .leftJoin(profiles, eq(organizersTable.userId, profiles.userId))
        .orderBy(desc(organizersTable.createdAt));

        const gmvResult = await db.select({
            organizerId: events.organizerId,
            gmv: sql<number>`COALESCE(SUM(${sales.buyerTotal}), 0)`
        }).from(sales)
        .innerJoin(events, eq(sales.eventId, events.id))
        .where(eq(sales.paymentStatus, 'paid'))
        .groupBy(events.organizerId);

        const gmvMap = Object.fromEntries(gmvResult.map(r => [r.organizerId, Number(r.gmv)]));
        const mappedOrganizers = organizersList.map(org => ({ ...org, gmv: gmvMap[org.userId] || 0 }));
        
        return c.json(mappedOrganizers);
    } catch (error: any) {
        console.error('Get organizers error:', error);
        return c.json({ error: error.message }, 400);
    }
});

router.post('/organizers/:id/approve', async (c) => {
    const id = c.req.param('id');
    try {
        const [updated] = await db.update(organizersTable)
            .set({ status: 'approved', profileComplete: true, updatedAt: new Date() })
            .where(eq(organizersTable.id, id))
            .returning();
        if (!updated) return c.json({ error: 'Not found' }, 404);
        return c.json({ message: 'Organizador aprovado', organizer: updated });
    } catch (error: any) { return c.json({ error: error.message }, 400); }
});

router.post('/organizers/:id/reject', async (c) => {
    const id = c.req.param('id');
    try {
        const [updated] = await db.update(organizersTable)
            .set({ status: 'rejected', updatedAt: new Date() })
            .where(eq(organizersTable.id, id))
            .returning();
        if (!updated) return c.json({ error: 'Not found' }, 404);
        return c.json({ message: 'Organizador rejeitado', organizer: updated });
    } catch (error: any) { return c.json({ error: error.message }, 400); }
});

router.post('/organizers/:id/suspend', async (c) => {
    const id = c.req.param('id');
    try {
        const [updated] = await db.update(organizersTable)
            .set({ status: 'suspended', isActive: false, updatedAt: new Date() })
            .where(eq(organizersTable.id, id))
            .returning();
        if (!updated) return c.json({ error: 'Not found' }, 404);
        return c.json({ message: 'Organizador suspenso', organizer: updated });
    } catch (error: any) { return c.json({ error: error.message }, 400); }
});

router.post('/organizers/:id/reactivate', async (c) => {
    const id = c.req.param('id');
    try {
        const [updated] = await db.update(organizersTable)
            .set({ status: 'approved', isActive: true, updatedAt: new Date() })
            .where(eq(organizersTable.id, id))
            .returning();
        if (!updated) return c.json({ error: 'Not found' }, 404);
        return c.json({ message: 'Organizador reativado', organizer: updated });
    } catch (error: any) { return c.json({ error: error.message }, 400); }
});

router.delete('/organizers/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const [updated] = await db.update(organizersTable)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(organizersTable.id, id))
            .returning();
        if (!updated) return c.json({ error: 'Not found' }, 404);
        return c.json({ message: 'Organizador inativado', organizer: updated });
    } catch (error: any) { return c.json({ error: error.message }, 400); }
});

export default router;
