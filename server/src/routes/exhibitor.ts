
import { Hono } from 'hono';
import { db } from '../db';
import { exhibitorStaff, exhibitorLogistics, exhibitorLeads, stands } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, checkRole } from '../middlewares/auth';

const router = new Hono();

// Todos as rotas de expositor são protegidas
router.use('/*', authMiddleware);
router.use('/*', checkRole(['exhibitor', 'organizer', 'master']));

// Listar equipe do stand
router.get('/staff/:standId', async (c) => {
    const standId = c.req.param('standId');
    const staff = await db.query.exhibitorStaff.findMany({
        where: eq(exhibitorStaff.standId, standId)
    });
    return c.json(staff);
});

// Registrar Lead (Captura de QR Code ou Manual)
router.post('/leads', async (c) => {
    const body = await c.req.json();
    const { standId, visitorId, name, email, phone, company, notes, capturedByStaffId } = body;

    const [newLead] = await db.insert(exhibitorLeads).values({
        standId,
        visitorId,
        capturedByStaffId,
        name,
        email,
        phone,
        company,
        notes
    }).returning();

    return c.json(newLead);
});

// Agendar Logística (Carga/Descarga)
router.post('/logistics', async (c) => {
    const body = await c.req.json();
    const { standId, type, scheduledAt, description } = body;

    const [newLogistics] = await db.insert(exhibitorLogistics).values({
        standId,
        type,
        scheduledAt: new Date(scheduledAt),
        description
    }).returning();

    return c.json(newLogistics);
});

export default router;
