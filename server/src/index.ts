import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';
import {
    organizers as organizersTable,
    events,
    tickets,
    sales,
    checkins,
    staff,
    candidates,
    staffProposals,
    stands,
    standCategories,
    sponsorTypes,
    sponsors,
    sponsorInstallments,
    sponsorDeliverables,
    visitors,
    admins
} from './db/schema';
import { eq, and, or } from 'drizzle-orm';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { jwt, sign } from 'hono/jwt';

dotenv.config();

import { asaas } from './services/asaas';
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
            passwordHash: await Bun.password.hash('123456'),
            emailVerified: true
        });
        console.log('✅ Organizador de teste criado');
    }
}

// SEED: Garantir que o Master Admin existe
async function seedMasterAdmin() {
    const email = 'alexignaciomkt@gmail.com';
    const exists = await db.query.admins.findFirst({
        where: eq(admins.email, email)
    });

    if (!exists) {
        await db.insert(admins).values({
            name: 'Alex Ignacio',
            email: email,
            passwordHash: await Bun.password.hash('Ticketera010203#360'),
            role: 'master'
        });
        console.log('✅ Master Admin criado');
    }
}

seedOrganizer();
seedMasterAdmin();

app.use('*', cors());

// Middleware de Autenticação para Rotas Protegidas
const authMiddleware = jwt({
    secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
    alg: 'HS256',
});

app.get('/', (c: Context) => c.text('Ticketera API - High Performance Ready'));

// --- AUTENTICAÇÃO REAL ---

app.post('/api/login', async (c: Context) => {
    const { email, password } = await c.req.json();
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

    try {
        // 1. Tentar Login como Admin Master
        const adminUser = await db.query.admins.findFirst({
            where: eq(admins.email, email)
        });

        if (adminUser) {
            const isMatch = await Bun.password.verify(password, adminUser.passwordHash);
            if (isMatch) {
                const token = await sign({
                    id: adminUser.id,
                    email: adminUser.email,
                    role: adminUser.role,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24h
                }, secret);
                return c.json({ user: { ...adminUser, role: adminUser.role }, token });
            }
        }

        // 2. Tentar Login como Organizador
        const organizer = await db.query.organizers.findFirst({
            where: eq(organizersTable.email, email)
        });

        if (organizer) {
            const isMatch = await Bun.password.verify(password, organizer.passwordHash);
            if (isMatch) {
                const token = await sign({
                    id: organizer.id,
                    email: organizer.email,
                    role: 'organizer',
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
                }, secret);
                return c.json({ user: { ...organizer, role: 'organizer' }, token });
            }
        }

        // 3. Tentar Login como Staff
        const staffUser = await db.query.staff.findFirst({
            where: eq(staff.email, email)
        });

        if (staffUser) {
            const isMatch = await Bun.password.verify(password, staffUser.passwordHash);
            if (isMatch) {
                const token = await sign({
                    id: staffUser.id,
                    email: staffUser.email,
                    role: 'staff',
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
                }, secret);
                return c.json({ user: { ...staffUser, role: 'staff' }, token });
            }
        }

        return c.json({ error: 'E-mail ou senha incorretos' }, 401);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

// --- Rota de Cadastro de Organizador (Com Asaas e Verificação) ---
app.post('/api/organizers/register', async (c: Context) => {
    const { name, email, password, cpfCnpj, mobilePhone } = await c.req.json();
    const token = uuidv4();

    try {
        // 1. Criar Subconta no Asaas (Opcional no momento do registro, ou obrigatório?)
        // Por segurança, vamos criar apenas se os dados estiverem completos
        let asaasAccount = null;
        if (cpfCnpj && mobilePhone) {
            asaasAccount = await asaas.createSubAccount({ name, email, cpfCnpj, mobilePhone });
        }

        // 2. Hash da senha (Usando Bun.password se disponível, ou simples se mock)
        const passwordHash = await Bun.password.hash(password);

        // 3. Salvar no Banco
        const [newOrganizer] = await db.insert(organizersTable).values({
            name,
            email,
            passwordHash,
            asaasId: asaasAccount?.id,
            walletId: asaasAccount?.walletId,
            asaasApiKey: asaasAccount?.apiKey,
            emailVerified: false,
            verificationToken: token
        }).returning();

        // 4. Enviar e-mail de confirmação
        const verificationUrl = `http://46.224.101.23:5173/auth/verify?token=${token}&type=organizer`;

        await transporter.sendMail({
            from: '"A2 Tickets 360" <a2tickets360@gmail.com>',
            to: email,
            subject: 'Verifique sua conta de Organizador - A2 Tickets 360',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: white; padding: 40px; border-radius: 20px;">
                    <h1 style="color: #6366f1;">Bem-vindo, Produção Elite!</h1>
                    <p>Sua jornada na A2 Tickets 360 está prestes a começar. Confirme seu e-mail para ativar seu painel de organizador:</p>
                    <a href="${verificationUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">ATIVAR CONTA</a>
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">Se você não realizou este cadastro, ignore este e-mail.</p>
                </div>
            `
        });

        return c.json({ status: 'success', message: 'E-mail de verificação enviado!', organizerId: newOrganizer.id });
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

// --- Rota de Login (Staff e Organizador) ---
app.post('/api/auth/login', async (c: Context) => {
    const { email, password, role } = await c.req.json();

    try {
        if (role === 'organizer') {
            const organizer = await db.query.organizers.findFirst({
                where: eq(organizersTable.email, email),
            });

            if (!organizer || !organizer.emailVerified) {
                return c.json({ error: 'Credenciais inválidas ou e-mail não verificado' }, 401);
            }

            const isPasswordCorrect = await Bun.password.verify(password, organizer.passwordHash);
            if (!isPasswordCorrect) return c.json({ error: 'Credenciais inválidas' }, 401);

            const token = 'simulated_organizer_jwt'; // TODO: Sign real JWT
            return c.json({ token, user: { id: organizer.id, name: organizer.name, role: 'organizer' } });
        }

        const staffMember = await db.query.staff.findFirst({
            where: eq(staff.email, email),
        });

        if (!staffMember || staffMember.isActive === false) {
            return c.json({ error: 'Credenciais inválidas' }, 401);
        }

        // Simular verificação (Staff ainda usa mock no seed)
        if (password !== staffMember.passwordHash && staffMember.passwordHash !== '123456') {
            const isPasswordCorrect = await Bun.password.verify(password, staffMember.passwordHash);
            if (!isPasswordCorrect) return c.json({ error: 'Credenciais inválidas' }, 401);
        }

        return c.json({
            token: 'simulated_staff_token',
            user: { id: staffMember.id, name: staffMember.name, role: staffMember.roleId }
        });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
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

// --- ROTAS DE STANDS ---

// 1. Criar categoria de stand
app.post('/api/events/:eventId/stand-categories', async (c: Context) => {
    const eventId = c.req.param('eventId');
    const data = await c.req.json();
    try {
        const [newCategory] = await db.insert(standCategories).values({
            ...data,
            eventId,
            price: data.price.toString()
        }).returning();
        return c.json(newCategory);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 2. Listar categorias de stand
app.get('/api/events/:eventId/stand-categories', async (c: Context) => {
    const eventId = c.req.param('eventId');
    const categoriesList = await db.query.standCategories.findMany({
        where: eq(standCategories.eventId, eventId)
    });
    return c.json(categoriesList);
});

// 3. Criar stand
app.post('/api/events/:eventId/stands', async (c: Context) => {
    const eventId = c.req.param('eventId');
    const data = await c.req.json();
    try {
        const [newStand] = await db.insert(stands).values({
            ...data,
            eventId
        }).returning();
        return c.json(newStand);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 4. Listar stands do evento
app.get('/api/events/:eventId/stands', async (c: Context) => {
    const eventId = c.req.param('eventId');
    const standsList = await db.query.stands.findMany({
        where: eq(stands.eventId, eventId),
        with: {
            category: true,
            soldBy: true
        }
    });
    return c.json(standsList);
});

// 5. Atualizar stand (venda/reserva)
app.put('/api/stands/:id', async (c: Context) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    try {
        const [updatedStand] = await db.update(stands)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(stands.id, id))
            .returning();
        return c.json(updatedStand);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 6. Remover stand
app.delete('/api/stands/:id', async (c: Context) => {
    const id = c.req.param('id');
    try {
        await db.delete(stands).where(eq(stands.id, id));
        return c.json({ success: true });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 7. Salvar/Atualizar planta baixa do evento
app.post('/api/events/:eventId/floor-plan', async (c: Context) => {
    const eventId = c.req.param('eventId');
    const { floorPlanUrl } = await c.req.json();
    try {
        const [updatedEvent] = await db.update(events)
            .set({ floorPlanUrl, updatedAt: new Date() })
            .where(eq(events.id, eventId))
            .returning();
        return c.json(updatedEvent);
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

// --- MASTER ADMIN: Gestão de Organizadores ---

// 1. Listar todos os organizadores
app.get('/api/master/organizers', async (c: Context) => {
    try {
        const organizersList = await db.query.organizers.findMany({
            orderBy: (organizers, { desc }) => [desc(organizers.createdAt)]
        });
        return c.json(organizersList);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 2. Criar Organizador via Master (Direto)
app.post('/api/master/organizers', async (c: Context) => {
    const { name, email, password } = await c.req.json();
    try {
        const passwordHash = await Bun.password.hash(password);
        const [newOrganizer] = await db.insert(organizersTable).values({
            name,
            email,
            passwordHash,
            emailVerified: true // Master cria já verificado
        }).returning();
        return c.json(newOrganizer);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 3. Editar Organizador
app.put('/api/master/organizers/:id', async (c: Context) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    try {
        if (data.password) {
            data.passwordHash = await Bun.password.hash(data.password);
            delete data.password;
        }
        const [updated] = await db.update(organizersTable)
            .set(data)
            .where(eq(organizersTable.id, id))
            .returning();
        return c.json(updated);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});


// --- MÓDULO DE PATROCINADORES ---

// Listar Tipos de Patrocínio por Organizador
app.get('/api/organizers/:organizerId/sponsor-types', async (c: Context) => {
    const organizerId = c.req.param('organizerId');
    try {
        const types = await db.query.sponsorTypes.findMany({
            where: eq(sponsorTypes.organizerId, organizerId)
        });
        return c.json(types);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// Criar Tipo de Patrocínio para Organizador
app.post('/api/organizers/:organizerId/sponsor-types', async (c: Context) => {
    const organizerId = c.req.param('organizerId');
    const data = await c.req.json();
    try {
        const [newType] = await db.insert(sponsorTypes).values({
            ...data,
            organizerId,
            defaultValue: data.defaultValue?.toString()
        }).returning();
        return c.json(newType);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// Listar Patrocinadores de um Evento
app.get('/api/events/:eventId/sponsors', async (c: Context) => {
    const eventId = c.req.param('eventId');
    try {
        const eventSponsors = await db.query.sponsors.findMany({
            where: eq(sponsors.eventId, eventId),
            with: {
                type: true,
                soldBy: true,
                installments: true,
                deliverables: true
            }
        });
        return c.json(eventSponsors);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// Criar Patrocinador
app.post('/api/events/:eventId/sponsors', async (c: Context) => {
    const eventId = c.req.param('eventId');
    const data = await c.req.json();
    try {
        const [newSponsor] = await db.insert(sponsors).values({
            ...data,
            eventId,
            totalValue: data.totalValue.toString()
        }).returning();
        return c.json(newSponsor);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// Atualizar Patrocinador
app.put('/api/sponsors/:id', async (c: Context) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    try {
        const updateData = { ...data, updatedAt: new Date() };
        if (data.totalValue) updateData.totalValue = data.totalValue.toString();

        const [updated] = await db.update(sponsors)
            .set(updateData)
            .where(eq(sponsors.id, id))
            .returning();
        return c.json(updated);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// Parcelas
app.post('/api/sponsors/:id/installments', async (c: Context) => {
    const sponsorId = c.req.param('id');
    const installmentsData = await c.req.json(); // Array de parcelas
    try {
        const newInstallments = await db.insert(sponsorInstallments).values(
            installmentsData.map((inst: any) => ({
                ...inst,
                sponsorId,
                value: inst.value.toString(),
                dueDate: new Date(inst.dueDate)
            }))
        ).returning();
        return c.json(newInstallments);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

app.put('/api/sponsor-installments/:id', async (c: Context) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    try {
        const [updated] = await db.update(sponsorInstallments)
            .set({
                ...data,
                paidDate: data.status === 'paid' ? new Date() : null
            })
            .where(eq(sponsorInstallments.id, id))
            .returning();
        return c.json(updated);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// Contrapartidas
app.post('/api/sponsors/:id/deliverables', async (c: Context) => {
    const sponsorId = c.req.param('id');
    const data = await c.req.json();
    try {
        const [newDeliverable] = await db.insert(sponsorDeliverables).values({
            ...data,
            sponsorId
        }).returning();
        return c.json(newDeliverable);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

app.put('/api/sponsor-deliverables/:id', async (c: Context) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    try {
        const [updated] = await db.update(sponsorDeliverables)
            .set({
                ...data,
                completedAt: data.isCompleted ? new Date() : null
            })
            .where(eq(sponsorDeliverables.id, id))
            .returning();
        return c.json(updated);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// --- MÓDULO DE VISITANTES ---

// 1. Inscrição Pública de Visitante
app.post('/api/events/:eventId/visitors/register', async (c: Context) => {
    const eventId = c.req.param('eventId');
    const data = await c.req.json();
    const qrCodeData = `VIS-${uuidv4()}`;

    try {
        const [newVisitor] = await db.insert(visitors).values({
            ...data,
            eventId,
            qrCodeData,
            status: 'registered'
        }).returning();

        // TODO: Enviar email com o QR Code

        return c.json(newVisitor);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 2. Listar Visitantes do Evento
app.get('/api/events/:eventId/visitors', async (c: Context) => {
    const eventId = c.req.param('eventId');
    try {
        const visitorsList = await db.query.visitors.findMany({
            where: eq(visitors.eventId, eventId)
        });
        return c.json(visitorsList);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 3. Atualizar Visitante
app.put('/api/visitors/:id', async (c: Context) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    try {
        const [updated] = await db.update(visitors)
            .set(data)
            .where(eq(visitors.id, id))
            .returning();
        return c.json(updated);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 4. Validar QR Code de Visitante
app.get('/api/visitors/validate/:qrCode', async (c: Context) => {
    const qrCode = c.req.param('qrCode');
    try {
        const visitor = await db.query.visitors.findFirst({
            where: eq(visitors.qrCodeData, qrCode)
        });
        if (!visitor) {
            return c.json({ error: 'Visitante não encontrado' }, 404);
        }
        return c.json(visitor);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 5. Check-in do Visitante
app.post('/api/visitors/:id/checkin', async (c: Context) => {
    const id = c.req.param('id');
    try {
        const [visitor] = await db.update(visitors)
            .set({
                status: 'checked_in',
                checkedInAt: new Date()
            })
            .where(eq(visitors.id, id))
            .returning();
        return c.json(visitor);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

export default {
    port: 3000,
    fetch: app.fetch,
};
