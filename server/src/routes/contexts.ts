import { Hono, Context } from 'hono';
import { db } from '../db/index.js';
import { eq, sql } from 'drizzle-orm';
import { platformMasters, organizers, employees } from '../db/schema.js';
import { authMiddleware } from '../middlewares/auth.js';

const contextsRoutes = new Hono();

contextsRoutes.use('/*', authMiddleware);

contextsRoutes.get('/', async (c: Context) => {
    try {
        const user = c.get('jwtPayload');
        if (!user || !user.id) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const contexts = [];
        const userId = user.id;

        // 1. MASTER
        const masterRecords = await db
            .select()
            .from(platformMasters)
            .where(eq(platformMasters.userId, userId));
            
        if (masterRecords.length > 0 && masterRecords[0].status === 'active') {
            contexts.push({ type: 'master' });
        }

        // 2. ORGANIZER
        const organizerRecords = await db
            .select()
            .from(organizers)
            .where(eq(organizers.userId, userId));
            
        if (organizerRecords.length > 0) {
            contexts.push({
                type: 'organizer',
                organizerId: organizerRecords[0].userId // auth.users.id
            });
        }

        // 3. EMPLOYEE
        const employeeRecords = await db
            .select()
            .from(employees)
            .where(eq(employees.userId, userId));
            
        employeeRecords.forEach(emp => {
            if (emp.status === 'active') {
                contexts.push({
                    type: 'employee',
                    organizerId: emp.organizerId,
                    employeeId: emp.id,
                    accessScope: emp.accessScope
                });
            }
        });

        // 4. PERSONAL MODULES (Promoter & Staff)
        let isPromoter = false;
        let isStaff = false;
        let staffPendingInvites = 0;

        // Check Promoter
        const promoterResult = await db.execute(sql`
            SELECT id FROM promoters WHERE user_id = ${userId} AND is_active = true LIMIT 1
        `);
        if (promoterResult.length > 0) {
            isPromoter = true;
        }

        // Check Staff
        const staffResult = await db.execute(sql`
            SELECT status FROM event_staff WHERE user_id = ${userId}
        `);
        
        staffResult.forEach((row: any) => {
            if (['PENDING_PROFILE', 'PENDING_ACCEPTANCE', 'ACTIVE', 'COMPLETED'].includes(row.status)) {
                isStaff = true;
            }
            if (['PENDING_ACCEPTANCE'].includes(row.status)) {
                staffPendingInvites++;
            }
        });

        return c.json({
            success: true,
            personalModules: {
                tickets: true,
                promoter: isPromoter,
                staff: isStaff
            },
            staffPendingInvites,
            contexts
        });
    } catch (error: any) {
        console.error('❌ Erro na API de contextos:', error);
        return c.json({ error: error.message }, 500);
    }
});

export default contextsRoutes;
