import { Hono, Context } from 'hono';
import { db } from '../db';
import * as schema from '../db/schema';
import { purchasedTickets, events, sales, ticketCheckinLogs } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { AuthorizationEngine } from '../services/authorizationEngine';

const router = new Hono();

/**
 * POST /api/checkin/tickets/validate
 * Valida um QR Code de ingresso (Check-in online atômico)
 */
router.post('/validate', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        if (!payload) return c.json({ error: 'Unauthorized' }, 401);
        const operatorId = payload.sub; // User ID do operador

        const body = await c.req.json();
        const { qrCode, eventId } = body;

        if (!qrCode || !eventId) {
            return c.json({ error: 'Missing qrCode or eventId' }, 400);
        }

        // 1. Encontrar o evento para verificar o organizerId e autorização
        const eventRows = await db.select().from(events).where(eq(events.id, eventId));
        if (eventRows.length === 0) {
            return c.json({ code: 'WRONG_EVENT', message: 'Evento não encontrado' }, 200);
        }
        const event = eventRows[0];

        // 2. Autorização (checkin.scan)
        const isAuthorized = await AuthorizationEngine.hasPermission({
            userId: operatorId,
            organizerId: event.organizerId,
            eventId: eventId,
            permissionKey: 'checkin.scan'
        });

        if (!isAuthorized) {
            return c.json({ error: 'Unauthorized to scan tickets' }, 403);
        }

        // 3. Procurar o Ingresso pelo QR Code exato
        const ptRows = await db
            .select({
                ticket: purchasedTickets,
                sale: sales
            })
            .from(purchasedTickets)
            .leftJoin(sales, eq(purchasedTickets.parentPurchaseId, sales.id))
            .where(eq(purchasedTickets.qrCodeData, qrCode));

        if (ptRows.length === 0) {
            return c.json({ code: 'INVALID_QR', message: 'Ingresso não encontrado ou QR inválido' }, 200);
        }

        const { ticket, sale } = ptRows[0];

        // 4. Validações de Negócio
        if (ticket.eventId !== eventId) {
            return c.json({ code: 'WRONG_EVENT', message: 'Ingresso pertence a outro evento' }, 200);
        }

        if (ticket.status !== 'active' && ticket.status !== 'available') {
            return c.json({ code: 'INACTIVE', message: `Ingresso inativo ou cancelado (Status: ${ticket.status})` }, 200);
        }

        // Se tiver sale associada e não for cortesia, deve estar pago
        if (sale && sale.paymentStatus !== 'paid' && !ticket.isCourtesy) {
            return c.json({ code: 'PAYMENT_INVALID', message: 'Pagamento não confirmado para este ingresso' }, 200);
        }

        // 5. Segunda Leitura / Já Utilizado
        if (ticket.validatedAt) {
            return c.json({ 
                code: 'ALREADY_USED', 
                message: 'Ingresso já utilizado', 
                validatedAt: ticket.validatedAt, 
                operatorId: ticket.validatedBy 
            }, 200);
        }

        // 6. Atualização Atômica (garante que apenas 1 request faça o check-in se concorrentes)
        const updateResult = await db.update(purchasedTickets)
            .set({ 
                validatedAt: new Date(), 
                validatedBy: operatorId 
            })
            .where(
                and(
                    eq(purchasedTickets.id, ticket.id),
                    isNull(purchasedTickets.validatedAt)
                )
            )
            .returning();

        // Se não atualizou nenhuma linha, significa que outra requisição já fez o checkin concorrente
        if (updateResult.length === 0) {
            // Buscamos novamente para retornar os dados de quem validou
            const current = await db.select().from(purchasedTickets).where(eq(purchasedTickets.id, ticket.id));
            return c.json({ 
                code: 'ALREADY_USED', 
                message: 'Ingresso já utilizado', 
                validatedAt: current[0]?.validatedAt, 
                operatorId: current[0]?.validatedBy 
            }, 200);
        }

        // 7. Registrar Auditoria (Log)
        await db.insert(ticketCheckinLogs).values({
            purchasedTicketId: ticket.id,
            eventId: eventId,
            operatorId: operatorId,
            action: 'CHECK_IN',
            deviceInfo: body.deviceInfo || null,
        });

        // 8. Sucesso
        return c.json({
            code: 'VALID',
            message: 'Acesso Liberado',
            ticket: {
                id: ticket.id,
                buyerName: sale?.buyerInfo ? (sale.buyerInfo as any).name : null,
                ticketId: ticket.ticketId,
                isCourtesy: ticket.isCourtesy
            }
        }, 200);

    } catch (error) {
        console.error('[CHECKIN VALIDATE] Erro:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * POST /api/checkin/tickets/undo
 * Desfaz um check-in. Restrito a owner.
 */
router.post('/undo', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        if (!payload) return c.json({ error: 'Unauthorized' }, 401);
        const adminId = payload.sub; // User ID

        const body = await c.req.json();
        const { qrCode, eventId, reason } = body;

        if (!qrCode || !eventId || !reason) {
            return c.json({ error: 'Missing qrCode, eventId or reason' }, 400);
        }

        // 1. Encontrar evento e autorização de owner
        const eventRows = await db.select().from(events).where(eq(events.id, eventId));
        if (eventRows.length === 0) {
            return c.json({ error: 'Event not found' }, 404);
        }
        
        // Nesta simplificação, o UNDO é estritamente Owner/Master.
        // O OrganizerOwner é quem tem event.organizerId === user (se user for organizador) 
        // ou se admin master for requerido. Vamos verificar se é o organizador dono.
        const event = eventRows[0];
        
        // TODO: Na A2Tickets360 o organizerId da table events aponta para o ID na organizers table
        // Preciso verificar o owner. Por ora, vamos assumir que o Admin deve ter permissões altas 
        // ou validar de forma simples, mas a instrução diz "Somente Owner legítimo da organização"
        
        // Fetch organizer details to match userId
        const { organizers } = schema;
        const orgs = await db.select().from(organizers).where(eq(organizers.id, event.organizerId));
        const isOwner = orgs.length > 0 && orgs[0].userId === adminId;

        if (!isOwner) {
            return c.json({ error: 'Somente o Owner da organização pode executar Undo.' }, 403);
        }

        // 2. Procurar ticket
        const ptRows = await db.select().from(purchasedTickets).where(eq(purchasedTickets.qrCodeData, qrCode));
        if (ptRows.length === 0) {
            return c.json({ error: 'Ticket not found' }, 404);
        }
        const ticket = ptRows[0];

        if (!ticket.validatedAt) {
            return c.json({ error: 'Ticket is not checked in' }, 400);
        }

        // 3. Undo Atômico
        await db.update(purchasedTickets)
            .set({ 
                validatedAt: null, 
                validatedBy: null 
            })
            .where(eq(purchasedTickets.id, ticket.id));

        // 4. Registrar Log do Undo
        await db.insert(ticketCheckinLogs).values({
            purchasedTicketId: ticket.id,
            eventId: eventId,
            operatorId: adminId,
            action: 'UNDO',
            reason: reason,
            deviceInfo: body.deviceInfo || null,
        });

        return c.json({ success: true, message: 'Check-in desfeito com sucesso' });
    } catch (error) {
        console.error('[CHECKIN UNDO] Erro:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export default router;
