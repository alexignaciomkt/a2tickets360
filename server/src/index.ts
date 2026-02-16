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
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'a2tickets360@gmail.com',
        pass: 'stux gjzd umcp ezrb'
    }
});

const app = new Hono();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// SEED: Garantir que o Organizador de Teste existe
async function seedOrganizer() {
    const testId = '6d123456-789a-4bc3-d2e1-09876543210f';
    const exists = await db.query.organizers.findFirst({
        where: eq(organizersTable.id, testId)
    });

    if (!exists) {
        await db.insert(organizersTable).values({
            id: testId,
            name: 'A2 Produções Elite',
            email: 'contato@a2tickets360.com.br',
            passwordHash: '123456', // Mock p/ teste
            emailVerified: true
        });
        console.log('✅ Organizador de teste criado');
    }
}
seedOrganizer();

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

// --- Gestão de Eventos (CRUD Real) ---

// 1. Criar Evento
app.post('/api/events', async (c: Context) => {
    const data = await c.req.json();
    try {
        const [newEvent] = await db.insert(events).values({
            ...data,
            locationName: data.location?.name,
            locationAddress: data.location?.address,
            capacity: Number(data.capacity) || 0,
            status: data.status || 'draft'
        }).returning();
        return c.json(newEvent);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 2. Listar Eventos por Organizador
app.get('/api/events/organizer/:organizerId', async (c: Context) => {
    const organizerId = c.req.param('organizerId');
    const result = await db.query.events.findMany({
        where: eq(events.organizerId, organizerId),
        with: {
            tickets: true
        }
    } as any);
    return c.json(result);
});

// 3. Detalhes de um Evento
app.get('/api/events/:id', async (c: Context) => {
    const id = c.req.param('id');
    const result = await db.query.events.findFirst({
        where: eq(events.id, id),
        with: {
            tickets: true
        }
    } as any);

    if (!result) return c.json({ error: 'Evento não encontrado' }, 404);
    return c.json(result);
});

// 4. Criar Categoria de Ingresso
app.post('/api/events/:id/tickets', async (c: Context) => {
    const eventId = c.req.param('id');
    const data = await c.req.json();
    try {
        const [newTicket] = await db.insert(tickets).values({
            ...data,
            eventId,
            price: data.price.toString(),
            remaining: data.quantity
        }).returning();
        return c.json(newTicket);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// --- Candidatos / Marketplace ---

// 1. Cadastro Público de Candidato com Confirmação por e-mail
app.post('/api/candidates', async (c: Context) => {
    const data = await c.req.json();
    const token = uuidv4();

    try {
        const [newCandidate] = await db.insert(candidates).values({
            ...data,
            passwordHash: data.password, // TODO: Hash real
            emailVerified: false,
            verificationToken: token
        }).returning();

        // Enviar e-mail de confirmação
        const verificationUrl = `http://46.224.101.23:5173/auth/verify?token=${token}&type=candidate`;

        await transporter.sendMail({
            from: '"A2 Tickets 360" <a2tickets360@gmail.com>',
            to: data.email,
            subject: 'Confirme seu e-mail - A2 Tickets 360',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: white; padding: 40px; border-radius: 20px;">
                    <h1 style="color: #6366f1;">Bem-vindo ao Marketplace Staff!</h1>
                    <p>Para ativar seu perfil e começar a receber propostas, confirme seu e-mail clicando no botão abaixo:</p>
                    <a href="${verificationUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">CONFIRMAR E-MAIL</a>
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">Se você não realizou este cadastro, ignore este e-mail.</p>
                </div>
            `
        });

        return c.json({ status: 'success', message: 'E-mail de verificação enviado!' });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 2. Endpoint de Verificação de E-mail
app.get('/api/auth/verify', async (c: Context) => {
    const token = c.req.query('token');
    const type = c.req.query('type');

    try {
        if (type === 'candidate') {
            const user = await db.query.candidates.findFirst({
                where: eq(candidates.verificationToken, token as string)
            });

            if (!user) return c.json({ error: 'Token inválido' }, 400);

            await db.update(candidates)
                .set({ emailVerified: true, verificationToken: null })
                .where(eq(candidates.id, user.id));
        } else {
            const user = await db.query.organizers.findFirst({
                where: eq(organizersTable.verificationToken, token as string)
            });

            if (!user) return c.json({ error: 'Token inválido' }, 400);

            await db.update(organizersTable)
                .set({ emailVerified: true, verificationToken: null })
                .where(eq(organizersTable.id, user.id));
        }

        return c.json({ status: 'success', message: 'E-mail confirmado com sucesso!' });
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
