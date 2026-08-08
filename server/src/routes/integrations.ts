import { Hono, Context } from 'hono';
import { db } from '../db';
import { events, organizers } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authMiddleware, checkRole } from '../middlewares/auth';
import { sportsIntegrationService } from '../services/sportsIntegrationService';
import { ticketCacheService } from '../services/ticketCacheService';
import crypto from 'crypto';

const router = new Hono();

// Unprotected Server-to-Server endpoint to consume login ticket
router.post('/sports/consume-login-ticket', async (c: Context) => {
    const authHeader = c.req.header('X-A2-API-KEY');
    const validKey = process.env.A2SPORTS_INTERNAL_API_KEY;

    if (!validKey || authHeader !== validKey) {
        return c.json({ error: 'UNAUTHORIZED' }, 401);
    }

    try {
        const body = await c.req.json();
        const { ticket } = body;
        if (!ticket) {
            return c.json({ error: 'Ticket é obrigatório.' }, 400);
        }

        const ticketData = await ticketCacheService.getAndDelete(ticket);
        if (!ticketData) {
            return c.json({ error: 'Ticket inválido, expirado ou já utilizado.' }, 400);
        }

        return c.json({
            tickets_user_id: ticketData.tickets_user_id,
            organizer_id: ticketData.organizer_id,
            organizer_email: ticketData.organizer_email,
            sports_championship_id: ticketData.sports_championship_id,
            external_tenant_id: ticketData.external_tenant_id
        }, 200);

    } catch (err: any) {
        console.error('[INTEGRATION-ROUTE] Erro ao consumir ticket:', err);
        return c.json({ error: 'INTERNAL_ERROR', message: err.message }, 500);
    }
});

// Debug middleware
router.use('/*', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    console.log('[DEBUG-JWT] Authorization Header:', authHeader);
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const { jwtVerify } = await import('jose');
            const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_change_me');
            const { payload } = await jwtVerify(token, secretKey);
            console.log('[DEBUG-JWT] Jose validation SUCCESS. Payload:', payload);
        } catch (err: any) {
            console.error('[DEBUG-JWT] Jose validation FAILED:', err.message);
        }
    }
    await next();
});

router.use('/*', authMiddleware);
router.use('/*', checkRole(['organizer', 'master', 'admin']));

router.post('/sports/provision-event', async (c: Context) => {
    try {
        const body = await c.req.json();
        const { event_id } = body;

        if (!event_id) {
            return c.json({ error: 'event_id é obrigatório.' }, 400);
        }

        const payload = c.get('jwtPayload');
        const userId = payload.id;
        const userRole = payload.role;

        // 1. Buscar evento
        const eventData = await db.query.events.findFirst({
            where: eq(events.id, event_id)
        });
 
        if (!eventData) {
            return c.json({ error: 'Evento não encontrado.' }, 404);
        }
 
        // Buscar organizador pelo userId (já que events.organizer_id armazena o user_id do Supabase)
        const organizerData = await db.query.organizers.findFirst({
            where: eq(organizers.userId, eventData.organizerId)
        });
 
        // 2. Autorização (organizer_id)
        if (userRole === 'organizer' && organizerData?.userId !== userId) {
            return c.json({ error: 'Você não tem permissão para integrar este evento.' }, 403);
        }

        // 3. Validar Categoria Esportiva
        if (eventData.categoryCode !== 'SPORT_TRUCO') {
            return c.json({ error: 'EVENT_NOT_SPORTS_ENABLED' }, 400);
        }

        // 3.5 Validar Evento Publicado
        if (eventData.status !== 'published') {
            return c.json({ error: 'O evento precisa estar aprovado e publicado para ser integrado.' }, 400);
        }

        // 4. Lock Atômico
        // Adquire a linha somente se estiver 'pending' ou 'failed'
        const lockResult = await db.execute(sql`
            UPDATE events
            SET sports_integration_status = 'provisioning',
                sports_integration_error_code = NULL,
                sports_integration_error = NULL
            WHERE id = ${event_id}
              AND sports_integration_status IN ('pending', 'failed')
            RETURNING id, sports_integration_status;
        `);

        // Se não conseguiu adquirir o lock:
        if (lockResult.length === 0) {
            // Verifica o status atual para responder corretamente
            const currentStatus = eventData.sportsIntegrationStatus;
            
            if (currentStatus === 'integrated') {
                return c.json({
                    message: 'Evento já integrado.',
                    championshipId: eventData.externalChampionshipId
                }, 200);
            }
            
            return c.json({ error: 'INTEGRATION_ALREADY_PROCESSING' }, 409);
        }

        // 5. Integração com A2Sports360
        const emailResult = await db.execute(sql`
            SELECT email FROM auth.users WHERE id = ${eventData.organizerId}::uuid
        `);
        const organizerEmail = (emailResult[0] as any)?.email || '';

        const result = await sportsIntegrationService.createChampionship(
            event_id,
            eventData,
            organizerData,
            organizerEmail,
            organizerData?.phone,
            organizerData?.cnpj || organizerData?.cpf
        );

        // 6. Atualizar Tabela Baseado no Resultado
        if (result.success) {
            await db.execute(sql`
                UPDATE events
                SET external_championship_id = ${result.championshipId},
                    sports_integration_status = 'integrated',
                    sports_integration_error_code = NULL,
                    sports_integration_error = NULL,
                    sports_last_sync_at = NOW()
                WHERE id = ${event_id};
            `);
            
            return c.json({
                message: 'Integração concluída com sucesso.',
                championshipId: result.championshipId
            }, 200);
        } else {
            await db.execute(sql`
                UPDATE events
                SET sports_integration_status = 'failed',
                    sports_integration_error_code = ${result.errorCode},
                    sports_integration_error = ${result.errorMessage},
                    sports_last_sync_at = NOW()
                WHERE id = ${event_id};
            `);
            
            return c.json({
                error: result.errorCode,
                message: result.errorMessage
            }, 500); // Podemos mapear para 4xx dependendo do errorCode se quisermos, mas como é proxy, 500 ou 400.
        }

    } catch (error: any) {
        console.error('[INTEGRATION-ROUTE] Erro interno:', error);
        return c.json({ error: 'INTERNAL_ERROR', message: 'Erro interno ao processar integração.' }, 500);
    }
});

// Protected endpoint to request SSO login URL
router.post('/sports/open', async (c: Context) => {
    try {
        const body = await c.req.json();
        const { event_id } = body;

        if (!event_id) {
            return c.json({ error: 'event_id é obrigatório.' }, 400);
        }

        const payload = c.get('jwtPayload');
        const userId = payload.id;
        const userRole = payload.role;

        // 1. Buscar evento
        const eventData = await db.query.events.findFirst({
            where: eq(events.id, event_id)
        });

        if (!eventData) {
            return c.json({ error: 'Evento não encontrado.' }, 404);
        }

        // Buscar organizador pelo userId
        const organizerData = await db.query.organizers.findFirst({
            where: eq(organizers.userId, eventData.organizerId)
        });

        // 2. Autorização (organizer_id)
        if (userRole === 'organizer' && organizerData?.userId !== userId) {
            return c.json({ error: 'Você não tem permissão para acessar este evento.' }, 403);
        }

        // 3. Validações de negócio
        if (eventData.status !== 'published') {
            return c.json({ error: 'O evento precisa estar publicado.' }, 400);
        }

        if (!eventData.externalChampionshipId) {
            return c.json({ error: 'O evento não possui integração ativa com a A2Sports360.' }, 400);
        }

        // Obter email do organizador
        const emailResult = await db.execute(sql`
            SELECT email FROM auth.users WHERE id = ${eventData.organizerId}::uuid
        `);
        const organizerEmail = (emailResult[0] as any)?.email || '';

        // 4. Gerar Login Ticket
        const ticket = crypto.randomBytes(32).toString('hex');
        
        await ticketCacheService.set(ticket, {
            tickets_user_id: userId,
            organizer_id: organizerData?.id || eventData.organizerId,
            tickets_event_id: event_id,
            sports_championship_id: eventData.externalChampionshipId,
            organizer_email: organizerEmail,
            external_tenant_id: eventData.organizerId,
            expires_at: 0
        }, 60); // 60 seconds TTL

        const browserUrl = process.env.A2SPORTS_BROWSER_URL || 'http://localhost:3000';
        const ssoUrl = `${browserUrl}/auth/sso?ticket=${ticket}`;

        return c.json({ ssoUrl }, 200);

    } catch (err: any) {
        console.error('[INTEGRATION-ROUTE] Erro ao abrir SSO:', err);
        return c.json({ error: 'INTERNAL_ERROR', message: err.message }, 500);
    }
});

export default router;
