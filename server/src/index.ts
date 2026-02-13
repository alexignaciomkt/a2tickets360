import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';
import { sales, checkins, staff, events, tickets } from './db/schema';
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

// --- Consultar Staff do Evento ---
app.get('/api/staff/:eventId', authMiddleware, async (c: Context) => {
    const eventId = c.req.param('eventId');
    const staffList = await db.query.staff.findMany({
        where: eq(staff.eventId, eventId),
    });
    return c.json(staffList);
});

// --- Histórico de Check-ins ---
app.get('/api/checkin/history/:eventId', authMiddleware, async (c: Context) => {
    const eventId = c.req.param('eventId');
    const history = await db.query.checkins.findMany({
        where: eq(checkins.eventId, eventId),
        with: {
            staff: true,
            sale: true,
        },
        orderBy: (checkins, { desc }) => [desc(checkins.checkInTime)],
    });
    return c.json(history);
});

// --- Validação de QR Code (O Coração do Sistema) ---
app.post('/api/checkin/validate', authMiddleware, async (c: Context) => {
    const { qrCodeData } = await c.req.json();
    const payload = c.get('jwtPayload'); // Obtido do middleware
    const eventId = payload.eventId;

    try {
        // 1. Verificar Cache no Redis (Performance Máxima)
        const cachedStatus = await redis.get(`ticket:${qrCodeData}`);

        if (cachedStatus === 'USED') {
            return c.json({ status: 'used', message: 'Ingresso já utilizado!' }, 200);
        }

        // 2. Consulta ao Banco (Somente se necessário ou para escrita)
        const saleRecord = await db.query.sales.findFirst({
            where: and(
                eq(sales.qrCodeData, qrCodeData),
                eq(sales.eventId, eventId)
            ),
        });

        if (!saleRecord) {
            return c.json({ status: 'invalid', message: 'Ingresso não encontrado.' }, 200);
        }

        if (saleRecord.paymentStatus !== 'paid') {
            return c.json({ status: 'invalid', message: 'Pagamento não confirmado.' }, 200);
        }

        // 3. Verificar se já existe check-in no banco (Double Check)
        const existingCheckin = await db.query.checkins.findFirst({
            where: eq(checkins.saleId, saleRecord.id),
        });

        if (existingCheckin) {
            // Atualizar Redis se estiver inconsistente
            await redis.set(`ticket:${qrCodeData}`, 'USED');
            return c.json({ status: 'used', message: 'Ingresso já utilizado!' }, 200);
        }

        // 4. Registrar Entrada (Transação em Eventos Massivos)
        await db.insert(checkins).values({
            saleId: saleRecord.id,
            staffId: payload.staffId,
            eventId: eventId,
        });

        // 5. Invalidar no Redis Imediatamente
        await redis.set(`ticket:${qrCodeData}`, 'USED');

        return c.json({
            status: 'valid',
            attendee: saleRecord.buyerName,
            ticketType: 'Ingresso Confirmado' // Pode expandir aqui
        });

    } catch (error) {
        console.error('Erro na validação:', error);
        return c.json({ error: 'Erro interno no servidor' }, 500);
    }
});

export default {
    port: 3000,
    fetch: app.fetch,
};
