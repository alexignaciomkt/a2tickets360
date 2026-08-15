import { Hono, Context } from 'hono';
import { db } from '../db';
import { events, eventStaff, employees, employeeEventAccess, organizers, platformMasters } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { AuthorizationEngine } from '../services/authorizationEngine';
import { authMiddleware } from '../middlewares/auth';

const router = new Hono();
router.use('/*', authMiddleware);

/**
 * GET /api/portaria/current-operation
 * Retorna os eventos ativos em que o usuário tem permissão 'checkin.scan'.
 */
router.get('/current-operation', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        if (!payload) return c.json({ error: 'Unauthorized' }, 401);
        const userId = payload.sub;

        // 1. Encontrar todos os eventos potencialmente acessíveis
        // Para otimização, coletamos os IDs de eventos vinculados (Staff ou Employee).
        // Se for Master ou Owner, precisamos iterar sobre os eventos do respectivo escopo.
        
        let candidateEventIds = new Set<string>();
        let isMaster = false;
        
        const masters = await db.select().from(platformMasters).where(and(eq(platformMasters.userId, userId), eq(platformMasters.status, 'active')));
        if (masters.length > 0) isMaster = true;

        if (isMaster) {
            // Master tem acesso a todos os eventos não cancelados
            const all = await db.select({ id: events.id }).from(events).where(ne(events.status, 'cancelled'));
            all.forEach(e => candidateEventIds.add(e.id));
        } else {
            // Owner
            const ownerOrgs = await db.select({ id: organizers.id }).from(organizers).where(eq(organizers.userId, userId));
            for (const org of ownerOrgs) {
                const orgEvents = await db.select({ id: events.id }).from(events).where(and(eq(events.organizerId, org.id), ne(events.status, 'cancelled')));
                orgEvents.forEach(e => candidateEventIds.add(e.id));
            }

            // Employee
            const empRecords = await db.select().from(employees).where(and(eq(employees.userId, userId), eq(employees.status, 'active')));
            for (const emp of empRecords) {
                if (emp.accessScope === 'ALL_EVENTS') {
                    const orgEvents = await db.select({ id: events.id }).from(events).where(and(eq(events.organizerId, emp.organizerId), ne(events.status, 'cancelled')));
                    orgEvents.forEach(e => candidateEventIds.add(e.id));
                } else if (emp.accessScope === 'SELECTED_EVENTS') {
                    const access = await db.select({ eventId: employeeEventAccess.eventId }).from(employeeEventAccess).where(eq(employeeEventAccess.employeeId, emp.id));
                    access.forEach(a => candidateEventIds.add(a.eventId));
                }
            }

            // Event Staff
            const staffRecords = await db.select({ eventId: eventStaff.eventId }).from(eventStaff).where(and(eq(eventStaff.userId, userId), eq(eventStaff.status, 'ACTIVE')));
            staffRecords.forEach(s => candidateEventIds.add(s.eventId));
        }

        if (candidateEventIds.size === 0) {
            return c.json({ operations: [] });
        }

        // 2. Buscar detalhes dos eventos candidatos
        // Evitar too many parameters if Set is huge, but usually it's small.
        // Convert to array
        const candidateArray = Array.from(candidateEventIds);
        
        const operations = [];
        
        // Em um sistema massivo usaríamos chunking, mas aqui iteramos com o hasPermission
        for (const eventId of candidateArray) {
            const ev = await db.select().from(events).where(eq(events.id, eventId));
            if (ev.length === 0) continue;
            const eventInfo = ev[0];

            // Verifica se tem 'checkin.scan' para este evento específico
            const hasPerm = await AuthorizationEngine.hasPermission({
                userId,
                organizerId: eventInfo.organizerId,
                eventId: eventInfo.id,
                permissionKey: 'checkin.scan'
            });

            if (hasPerm) {
                operations.push({
                    id: eventInfo.id,
                    title: eventInfo.title,
                    slug: eventInfo.slug,
                    date: eventInfo.startDate,
                    bannerUrl: eventInfo.bannerUrl
                });
            }
        }

        return c.json({ operations });

    } catch (err: any) {
        console.error('[PORTARIA current-operation]', err);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export default router;
