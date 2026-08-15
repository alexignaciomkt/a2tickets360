import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import { AuthorizationEngine } from '../services/authorizationEngine';

const router = new Hono();

// Auth is required for permissions
router.use('/*', authMiddleware);

/**
 * GET /api/me/permissions
 * Retrieves effective permissions for the authenticated user within a specific context.
 * Query Params:
 * - organizerId (required)
 * - eventId (optional)
 */
router.get('/', async (c: Context) => {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.id) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = payload.id;
    const organizerId = c.req.query('organizerId');
    const eventId = c.req.query('eventId');

    if (!organizerId) {
        return c.json({ error: 'Missing organizerId query parameter' }, 400);
    }

    try {
        // Here we could return the entire catalog of available permissions 
        // by evaluating each one using AuthorizationEngine.
        // For performance, we could load the effective list of permissionKeys 
        // directly from the DB inside AuthorizationEngine.
        // Since AuthorizationEngine.hasPermission is boolean, 
        // a real implementation for frontend would return a list.
        
        // Let's implement a quick resolver to get all effective permissions:
        // Actually, we'll build a simple map of basic UI permissions:
        const checkList = [
            'staff.view', 'staff.manage', 'staff.invite', 'staff.assign',
            'checkin.open', 'checkin.scan', 'checkin.lookup', 'checkin.stats',
            'boxoffice.view', 'boxoffice.sell',
            'finance.view', 'finance.manage',
            'event.view', 'event.manage'
        ];

        const capabilities: Record<string, boolean> = {};

        for (const key of checkList) {
            capabilities[key] = await AuthorizationEngine.hasPermission({
                userId,
                organizerId,
                eventId,
                permissionKey: key
            });
        }

        return c.json({
            context: {
                organizerId,
                eventId
            },
            capabilities
        });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

export default router;
