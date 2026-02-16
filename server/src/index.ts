import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';
import { sales, checkins, staff, events, tickets, candidates, staffProposals } from './db/schema';
import { eq, and } from 'drizzle-orm';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { jwt } from 'hono/jwt';

dotenv.config();

import { asaas } from './services/asaas';
import { organizers as organizersTable } from './db/schema';

const app = new Hono();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use('*', cors());

// Middleware de Autenticação para Rotas Protegidas
const authMiddleware = jwt({
    secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
    alg: 'HS256',
});

app.get('/', (c: Context) => c.text('Ticketera API - High Performance Ready'));

// --- Rota de Cadastro de Organizador (Com Asaas) ---
app.post('/api/organizers/register', async (c: Context) => {
    const { name, email, password, cpfCnpj, mobilePhone } = await c.req.json();

    try {
        // 1. Criar Subclonta no Asaas
        const asaasAccount = await asaas.createSubAccount({ name, email, cpfCnpj, mobilePhone });

        // 2. Salvar no Banco
        const [newOrganizer] = await db.insert(organizersTable).values({
            name,
            email,
            passwordHash: password, // TODO: Hash real
            asaasId: asaasAccount.id,
            walletId: asaasAccount.walletId,
            asaasApiKey: asaasAccount.apiKey
        }).returning();

        return c.json({ status: 'success', organizer: newOrganizer });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// --- Rota de Checkout (Criação de Pagamento com Split) ---
app.post('/api/payments/checkout', async (c: Context) => {
    const { ticketId, quantity, buyerName, buyerEmail, buyerCpf, paymentMethod } = await c.req.json();

    try {
        const ticket = await db.query.tickets.findFirst({ where: eq(tickets.id, ticketId) });
        if (!ticket) throw new Error('Ingresso não encontrado');

        const totalValue = Number(ticket.price) * quantity;

        // 1. Criar Cliente no Asaas
        const customer = await asaas.createCustomer({ name: buyerName, email: buyerEmail, cpfCnpj: buyerCpf });

        // 2. Criar Pagamento com Split (10%)
        const payment = await asaas.createPayment({
            customer: customer.id,
            billingType: paymentMethod,
            value: totalValue,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
            description: `Compra de ${quantity}x ${ticket.name}`,
            externalReference: `sale_${Date.now()}`,
            splitPercent: 10 // Sua comissão de 10%
        });

        // 3. Registrar Venda Pendente
        const qrCode = `QR_${Math.random().toString(36).substring(7).toUpperCase()}`;
        await db.insert(sales).values({
            eventId: ticket.eventId,
            ticketId: ticket.id,
            buyerName,
            buyerEmail,
            quantity,
            totalPrice: totalValue.toString(),
            asaasPaymentId: payment.id,
            paymentStatus: 'pending',
            qrCodeData: qrCode
        });

        return c.json({ status: 'success', invoiceUrl: payment.invoiceUrl, paymentId: payment.id });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// --- Webhook do Asaas ---
app.post('/api/webhooks/asaas', async (c: Context) => {
    const data = await c.req.json();
    const { event, payment } = data;

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
        const asaasId = payment.id;

        // Atualizar status no banco
        await db.update(sales)
            .set({ paymentStatus: 'paid' })
            .where(eq(sales.asaasPaymentId, asaasId));

        // Inserir no Redis para validação imediata no portão
        const saleRecord = await db.query.sales.findFirst({
            where: eq(sales.asaasPaymentId, asaasId)
        });

        if (saleRecord) {
            await redis.set(`ticket:${saleRecord.qrCodeData}`, 'PAID');
        }
    }

    return c.json({ received: true });
});

// --- Rota de Login (Staff) ---
app.post('/api/auth/login', async (c: Context) => {
    const { email, password } = await c.req.json();

    // Aqui faríamos a verificação real de hash de senha
    // Por enquanto, simulando busca no banco
    const staffMember = await db.query.staff.findFirst({
        where: eq(staff.email, email),
    });

    if (!staffMember || staffMember.isActive === false) {
        return c.json({ error: 'Credenciais inválidas' }, 401);
    }

    // Simular geração de token JWT
    const payload = {
        staffId: staffMember.id,
        eventId: staffMember.eventId,
        role: staffMember.roleId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
    };

    // Nota: Hono JWT simplificado para exemplo
    return c.json({
        token: 'simulated_jwt_token', // Em produção usaríamos jose ou hono jwt sign
        user: { name: staffMember.name, role: staffMember.roleId }
    });
});

// --- Candidatos / Marketplace ---

// 1. Cadastro Público de Candidato
app.post('/api/candidates', async (c: Context) => {
    const data = await c.req.json();
    try {
        const [newCandidate] = await db.insert(candidates).values({
            ...data,
            passwordHash: data.password, // TODO: Hash real
        }).returning();
        return c.json({ status: 'success', candidate: newCandidate });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 2. Recrutador busca talentos
app.get('/api/candidates/organizer/:organizerId', async (c: Context) => {
    const organizerId = c.req.param('organizerId');
    // Em um sistema real, poderíamos filtrar por proximidade ou categorias
    const talentPool = await db.query.candidates.findMany();
    return c.json(talentPool);
});

// 3. Recrutador envia proposta
app.post('/api/organizers/proposals', async (c: Context) => {
    const data = await c.req.json();
    try {
        const [proposal] = await db.insert(staffProposals).values({
            candidateId: data.candidateId,
            eventId: data.eventId,
            organizerId: data.organizerId,
            roleId: data.roleId,
            roleName: data.roleName,
            pay: data.pay,
            status: 'pending'
        }).returning();
        return c.json({ status: 'success', proposal });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 4. Worker visualiza seu portal (Propostas e Agenda)
app.get('/api/worker/portal/:candidateId', async (c: Context) => {
    const candidateId = c.req.param('candidateId');

    const workerProposals = await db.query.staffProposals.findMany({
        where: eq(staffProposals.candidateId, candidateId),
        with: {
            event: true
        }
    } as any);

    return c.json({ proposals: workerProposals });
});

// 5. Worker responde à proposta
app.post('/api/candidates/:id/proposals/:propId/respond', async (c: Context) => {
    const candidateId = c.req.param('id');
    const proposalId = c.req.param('propId');
    const { status } = await c.req.json();

    try {
        await db.update(staffProposals)
            .set({
                status,
                respondedAt: new Date()
            })
            .where(and(
                eq(staffProposals.id, proposalId),
                eq(staffProposals.candidateId, candidateId)
            ));

        // Se aceito, opcionalmente criar entrada na tabela 'staff' fixada no evento
        return c.json({ status: 'success' });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

export default {
    port: 3000,
    fetch: app.fetch,
};
