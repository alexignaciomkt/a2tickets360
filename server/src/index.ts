import dotenv from 'dotenv';
dotenv.config();

import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';
import * as schema from './db/schema';

const {
    admins, organizers: organizersTable, eventCategories, events, tickets, sales, staff,
    checkins, supplierCategories, suppliers, supplierContracts, quotes, quoteResponses,
    candidates, staffProposals, sponsorTypes, sponsors, sponsorInstallments, sponsorDeliverables,
    standCategories, stands, visitors, exhibitorStaff, exhibitorLogistics, exhibitorLeads,
    aiChatLogs, syncQueue, legalPages, productCategories, products, productVariants, productOrders,
    organizerPosts, sportRegistrations, sportRegistrationPlayers, purchasedTickets
} = schema;
import { eq, or, and, isNull, sql, inArray, lte, gte } from 'drizzle-orm';
import Redis from 'ioredis';
import { serveStatic } from '@hono/node-server/serve-static';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';

// Router Imports
import exhibitorRoutes from './routes/exhibitor';
import aiRoutes from './routes/ai';
import integrationRoutes from './routes/integrations';
import contextsRoutes from './routes/contexts';
import permissionsRoutes from './routes/permissions';
import staffRoutes from './routes/staff';
import credentialsRoutes from './routes/credentials';
import ticketCheckinRoutes from './routes/ticketCheckin';
import portariaRoutes from './routes/portaria';

import { logger } from 'hono/logger';

const app = new Hono();
app.use('*', logger());

import { AsaasService } from './services/asaas';
export const asaas = new AsaasService();

// Valor centralizado do destaque de evento na Home
const FEATURED_EVENT_PRICE = 49.90;

// Redis opcional para desenvolvimento (não trava se falhar)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redis: Redis | null = null;
try {
    redis = new Redis(REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1
    });
    redis.on('error', (err) => {
        // Silenciar erro de conexão do Redis
    });
} catch (e) {
    console.warn('[REDIS] Falha ao inicializar (Opcional)');
}

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true para 465, false para outras portas
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Global Middlewares
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
}));

// API Routes
app.route('/api/exhibitor', exhibitorRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/integrations', integrationRoutes);
app.route('/api/me/contexts', contextsRoutes);
app.route('/api/me/permissions', permissionsRoutes);
app.route('/api/staff', staffRoutes);
app.route('/api/credentials', credentialsRoutes);
app.route('/api/checkin/tickets', ticketCheckinRoutes);
app.route('/api/portaria', portariaRoutes);

app.get('/', (c: Context) => c.text('A2 Tickets 360º API - High Performance Ready'));

app.get('/api/health', (c: Context) => {
    return c.json({
        status: 'ok',
        version: '1.1.0',
        timestamp: new Date().toISOString()
    });
});

// =================================================================
// OG Meta Tags Route — Dynamic social previews for crawlers
// (WhatsApp, Facebook, Twitter, LinkedIn, Telegram, etc.)
// =================================================================
app.get('/og/events/:id', async (c: Context) => {
    const id = c.req.param('id');
    const SITE_URL = process.env.SITE_URL || 'https://a2tickets360.com.br';

    try {
        const result = await db.execute(sql`SELECT title, description, banner_url as "imageUrl", start_date as "date", time, location_name as "locationName", city as "locationCity", state as "locationState" FROM events WHERE id = ${id}`);
        const event = result.length > 0 ? result[0] : null;

        const title = event?.title || 'A2 Tickets 360º';
        const rawDesc = event?.description || 'Gestão completa de eventos e inteligência de mercado.';
        // Strip HTML tags and limit to 200 chars for OG description
        const description = rawDesc.replace(/<[^>]*>/g, '').substring(0, 200);
        const image = event?.imageUrl || `${SITE_URL}/logo_512x512.png`;
        const eventUrl = `${SITE_URL}/events/${id}`;

        // Build location string if available
        const locationParts = [event?.locationName, event?.locationCity, event?.locationState].filter(Boolean);
        const location = locationParts.length > 0 ? locationParts.join(' · ') : '';

        // Format date if available
        let dateFormatted = '';
        if (event?.date) {
            try {
                const d = new Date(event.date);
                dateFormatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                if (event.time) dateFormatted += ` às ${event.time}`;
            } catch { dateFormatted = event.date; }
        }

        // Build a richer description with date and location
        const richDesc = [description, dateFormatted, location].filter(Boolean).join(' | ');

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <title>${title} — A2 Tickets 360º</title>

    <!-- Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${richDesc}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${eventUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="A2 Tickets 360º" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${richDesc}" />
    <meta name="twitter:image" content="${image}" />

    <!-- Redirect humans to the real SPA page -->
    <meta http-equiv="refresh" content="0;url=${eventUrl}" />
    <link rel="canonical" href="${eventUrl}" />
</head>
<body>
    <p>Redirecionando para <a href="${eventUrl}">${title}</a>...</p>
</body>
</html>`;

        return c.html(html);
    } catch (error: any) {
        // Fallback — return default OG tags on error
        const fallbackHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <title>A2 Tickets 360º</title>
    <meta property="og:title" content="A2 Tickets 360º" />
    <meta property="og:description" content="Gestão completa de eventos e inteligência de mercado." />
    <meta property="og:image" content="${SITE_URL}/logo_512x512.png" />
    <meta property="og:url" content="${SITE_URL}/events/${id}" />
    <meta property="og:type" content="website" />
    <meta http-equiv="refresh" content="0;url=${SITE_URL}/events/${id}" />
</head>
<body><p>Redirecionando...</p></body>
</html>`;
        return c.html(fallbackHtml);
    }
});

// Storage Config
const UPLOADS_DIR = join(process.cwd(), 'uploads');
if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
}
// Servir arquivos estáticos corretamente
app.use('/uploads/*', serveStatic({ 
    root: './',
    getContentType: (path) => {
        if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
        if (path.endsWith('.png')) return 'image/png';
        return 'application/octet-stream';
    }
}));

// --- RESTO DO CÓDIGO (Será modularizado nos próximos dias) ---

// Endpoint de Upload
app.post('/api/upload', async (c: Context) => {
    try {
        console.log('[UPLOAD] Iniciando recebimento de arquivo...');
        const body = await c.req.parseBody();
        const file = body['file'] as any;

        if (!file || !(file instanceof File)) {
            console.error('[UPLOAD] Falha: Campo "file" ausente ou inválido');
            return c.json({ error: 'Nenhum arquivo válido enviado' }, 400);
        }

        console.log(`[UPLOAD] Recebido: ${file.name} (${file.size} bytes) - Tipo: ${file.type}`);

        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}.${extension}`;
        const filePath = join(UPLOADS_DIR, fileName);

        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        // Garantir que a URL da API não termina com /
        const apiUrl = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '');
        const url = `${apiUrl}/uploads/${fileName}`;

        console.log(`[UPLOAD] Sucesso! Arquivo salvo em: ${filePath} -> Disponível em: ${url}`);
        return c.json({ url });
    } catch (error: any) {
        console.error('[UPLOAD] Erro crítico no processo:', error);
        return c.json({ error: error.message }, 500);
    }
});



// --- Rota de Cadastro de Organizador (Com Asaas e Verificação) ---
app.post('/api/organizers/register', async (c: Context) => {
    const { name, email, password, cpfCnpj, mobilePhone, slug, bannerUrl } = await c.req.json();
    const token = uuidv4();

    try {
        // 0. Verificar se já existe um organizador com este e-mail
        const existing = await db.query.organizers.findFirst({
            where: eq(organizersTable.email, email)
        });
        if (existing) {
            return c.json({ error: 'Já existe um organizador cadastrado com este e-mail.' }, 409);
        }

        // 0.1 Verificar se o slug já existe
        if (slug) {
            const slugExisting = await db.query.organizers.findFirst({
                where: eq(organizersTable.slug, slug)
            });
            if (slugExisting) {
                return c.json({ error: 'Este link (slug) já está sendo usado por outro produtor.' }, 409);
            }
        }

        // 1. Criar Subconta no Asaas (Opcional/Resiliente)
        let asaasAccount = null;
        if (cpfCnpj && mobilePhone) {
            try {
                asaasAccount = await asaas.createSubAccount({ name, email, cpfCnpj, mobilePhone });
            } catch (asError) {
                console.warn('⚠️ Falha ao criar subconta Asaas (Local/Sandbox?):', asError);
            }
        }

        // 2. Hash da senha
        const passwordHash = await Bun.password.hash(password);

        // 3. Salvar no Banco
        const [newOrganizer] = await db.insert(organizersTable).values({
            name,
            email,
            passwordHash,
            phone: mobilePhone || null,
            cpf: cpfCnpj || null,
            slug: slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
            bannerUrl: bannerUrl || null,
            asaasId: asaasAccount?.id,
            walletId: asaasAccount?.walletId,
            asaasApiKey: asaasAccount?.apiKey,
            emailVerified: false,
            verificationToken: token,
            isActive: true,
            profileComplete: false
        }).returning();

        // 4. Enviar e-mail de confirmação (Resiliente)
        try {
            if (!transporter) {
                console.warn('⚠️ SMTP not configured. Skipping verification email.');
                throw new Error('SMTP disabled');
            }
            const appUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
            const verificationUrl = `${appUrl}/auth/verify?token=${token}&type=organizer`;
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"A2 Tickets 360º" <noreply@a2tickets360.com.br>',
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
        } catch (mailError) {
            console.warn('⚠️ Falha ao enviar e-mail (Local/SMTP?):', mailError);
        }

        return c.json({
            status: 'success',
            message: 'Cadastro realizado com sucesso!',
            organizerId: newOrganizer.id,
            warning: 'Asaas ou E-mail podem não ter sido processados em ambiente local.'
        });
    } catch (error: any) {
        console.error('❌ Erro no cadastro de organizador:', error);
        return c.json({ error: error.message || 'Erro interno ao criar organizador.' }, 400);
    }
});

// =============================================================================
// HELPER: Normalizar CPF (somente digitos)
// =============================================================================
function normalizeCpf(cpf: string): string {
    return (cpf || '').replace(/\D/g, '');
}

// =============================================================================
// POST /api/sports/check-eligibility
// Backend decide elegibilidade para REPECHAGE.
// Frontend apenas apresenta a decisao.
// =============================================================================
app.post('/api/sports/check-eligibility', async (c: Context) => {
    try {
        const { eventId, ticketId, cpf: rawCpf } = await c.req.json();
        if (!eventId || !ticketId || !rawCpf) {
            return c.json({ eligible: false, reason: 'Dados incompletos.' }, 400);
        }
        const cpf = normalizeCpf(rawCpf);
        if (cpf.length !== 11) {
            return c.json({ eligible: false, reason: 'CPF invalido.' });
        }

        // 1. Verificar que o ticket e do mesmo evento e e REPECHAGE
        const ticket = await db.query.tickets.findFirst({
            where: and(eq(tickets.id, ticketId), eq(tickets.eventId, eventId)),
            with: { event: true }
        });
        if (!ticket) {
            return c.json({ eligible: false, reason: 'Lote nao encontrado neste evento.' });
        }
        if (ticket.ticketPurpose !== 'REPECHAGE') {
            return c.json({ eligible: false, reason: 'Este lote nao e de repescagem.' });
        }

        // 2. Verificar janela temporal do evento
        const now = new Date();
        const eventData = ticket.event;
        if (eventData.startDate && now < new Date(eventData.startDate)) {
            return c.json({ eligible: false, reason: 'O periodo de repescagem deste evento ainda nao iniciou.' });
        }
        if (eventData.endDate && now > new Date(eventData.endDate)) {
            return c.json({ eligible: false, reason: 'O periodo de repescagem deste evento encerrou.' });
        }

        // 3. Buscar player pelo CPF no mesmo evento
        const playerResult = await db
            .select({
                registrationId: sportRegistrationPlayers.registrationId,
                playerOrder: sportRegistrationPlayers.playerOrder,
                playerName: sportRegistrationPlayers.name,
            })
            .from(sportRegistrationPlayers)
            .innerJoin(
                sportRegistrations,
                eq(sportRegistrationPlayers.registrationId, sportRegistrations.id)
            )
            .where(
                and(
                    eq(sportRegistrationPlayers.cpf, cpf),
                    eq(sportRegistrations.eventId, eventId),
                    eq(sportRegistrations.ticketPurpose, 'REGISTRATION'),
                    eq(sportRegistrations.status, 'paid')
                )
            )
            .limit(1);

        if (!playerResult.length) {
            return c.json({ eligible: false, reason: 'Nao encontramos uma inscricao paga neste evento para este CPF.' });
        }

        const originalRegistrationId = playerResult[0].registrationId;

        // 4. Carregar inscricao original com jogadores
        const originalReg = await db.query.sportRegistrations.findFirst({
            where: eq(sportRegistrations.id, originalRegistrationId),
            with: { players: true }
        });
        if (!originalReg || originalReg.status === 'cancelled' || originalReg.status === 'refunded') {
            return c.json({ eligible: false, reason: 'A inscricao original nao esta ativa.' });
        }

        // 5. Verificar limite de repescagens
        const eventSettings = eventData.settings as any || {};
        const maxRepechages = typeof eventSettings.max_repechages_per_registration === 'number'
            ? eventSettings.max_repechages_per_registration
            : 0; // default seguro: 0 se nao configurado

        // Contar repescagens pagas vinculadas a esta inscricao original
        const paidRepechages = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(sportRegistrations)
            .where(
                and(
                    eq(sportRegistrations.originalRegistrationId, originalRegistrationId),
                    eq(sportRegistrations.ticketPurpose, 'REPECHAGE'),
                    eq(sportRegistrations.status, 'paid')
                )
            );
        const usedRepechages = paidRepechages[0]?.count ?? 0;

        if (usedRepechages >= maxRepechages) {
            return c.json({
                eligible: false,
                reason: `Esta dupla ja utilizou o limite de repescagens permitido (${usedRepechages} de ${maxRepechages}).`
            });
        }

        // Elegivel!
        return c.json({
            eligible: true,
            originalRegistrationId,
            teamName: originalReg.teamName,
            players: originalReg.players.map(p => ({ order: p.playerOrder, name: p.name })),
            usedRepechages,
            maxRepechages,
        });
    } catch (error: any) {
        console.error('[ELIGIBILITY]', error);
        return c.json({ eligible: false, reason: 'Erro interno ao verificar elegibilidade.' }, 500);
    }
});

// =============================================================================
// POST /api/payments/checkout
// Criacao de Pagamento com Split.
// Para ticket_purpose REGISTRATION ou REPECHAGE, quantity forcada = 1.
// Fluxo: validar -> sale -> sport_registration (pending) -> Asaas
// =============================================================================
app.post('/api/payments/checkout', async (c: Context) => {
    const body = await c.req.json();
    const { ticketId, buyerId, buyerName, buyerEmail, buyerCpf, paymentMethod, sportData } = body;
    let { quantity } = body;

    try {
        const ticket = await db.query.tickets.findFirst({
            where: eq(schema.tickets.id, ticketId),
            with: { event: true }
        });
        if (!ticket) throw new Error('Ingresso nao encontrado');

        // Idempotency check: prevent duplicate clicks/requests generating multiple Asaas charges
        if (buyerCpf) {
            const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
            const recentPendingSale = await db
                .select({ id: schema.sales.id })
                .from(schema.sales)
                .where(
                    and(
                        eq(schema.sales.buyerCpf, normalizeCpf(buyerCpf)),
                        eq(schema.sales.paymentStatus, 'pending'),
                        isNotNull(schema.sales.asaasPaymentId),
                        gt(schema.sales.createdAt, fiveMinsAgo)
                    )
                )
                .limit(1);

            if (recentPendingSale.length > 0) {
                // To be precise on the exact ticket being double-clicked, we could join purchased_tickets,
                // but if a user just created a valid pending sale via Asaas 5 mins ago, they shouldn't be
                // slamming the checkout button again so fast anyway.
                const recentPurchases = await db
                    .select({ id: purchasedTickets.id })
                    .from(purchasedTickets)
                    .where(
                        and(
                            eq(purchasedTickets.parentPurchaseId, recentPendingSale[0].id),
                            eq(purchasedTickets.ticketId, ticketId)
                        )
                    )
                    .limit(1);

                if (recentPurchases.length > 0) {
                    throw new Error('Você já possui uma transação recente em andamento para este ingresso. Aguarde alguns minutos ou verifique seus ingressos pendentes.');
                }
            }
        }

        // Forcar quantity = 1 para produtos esportivos
        const isSportTicket = ticket.ticketPurpose === 'REGISTRATION' || ticket.ticketPurpose === 'REPECHAGE';
        if (isSportTicket) {
            quantity = 1;
        } else {
            quantity = Math.max(1, parseInt(quantity as any) || 1);
            
            // Validation for STANDARD tickets
            const eventSettings = ticket.event.settings as any || {};
            const maxTicketsPerCpf = Number(eventSettings.max_tickets_per_cpf || 1);
            
            // Enforce limit checking paid and valid pending tickets for this user
            const cpfStr = normalizeCpf(buyerCpf);
            const userPurchases = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(purchasedTickets)
                .leftJoin(schema.sales, eq(purchasedTickets.parentPurchaseId, schema.sales.id))
                .where(
                    and(
                        eq(purchasedTickets.eventId, ticket.eventId),
                        // Assuming buyerId is present, we can check by userId for logged in users:
                        eq(purchasedTickets.userId, buyerId || ''),
                        or(
                            eq(purchasedTickets.status, 'paid'),
                            eq(purchasedTickets.status, 'active'),
                            and(
                                eq(purchasedTickets.status, 'pending'),
                                isNotNull(schema.sales.asaasPaymentId)
                            )
                        )
                    )
                );
            const currentCount = userPurchases[0]?.count ?? 0;
            if (currentCount + quantity > maxTicketsPerCpf) {
                throw new Error(`Limite atingido. Você só pode comprar no máximo ${maxTicketsPerCpf} ingresso(s) por CPF para este evento.`);
            }
        }

        // Para REPECHAGE: validar elegibilidade server-side antes de qualquer cobranca
        let originalRegistrationId: string | null = null;
        if (ticket.ticketPurpose === 'REPECHAGE') {
            if (!sportData?.originalRegistrationId || !sportData?.cpf) {
                throw new Error('Dados de elegibilidade ausentes para repescagem.');
            }
            const cpf = normalizeCpf(sportData.cpf);
            const eventId = ticket.eventId;

            // Re-verificar elegibilidade (nao confiar no frontend)
            const now = new Date();
            const eventData = ticket.event;
            if (eventData.startDate && now < new Date(eventData.startDate)) {
                throw new Error('Periodo de repescagem ainda nao iniciou.');
            }
            if (eventData.endDate && now > new Date(eventData.endDate)) {
                throw new Error('Periodo de repescagem encerrado.');
            }

            const playerCheck = await db
                .select({ registrationId: sportRegistrationPlayers.registrationId })
                .from(sportRegistrationPlayers)
                .innerJoin(sportRegistrations, eq(sportRegistrationPlayers.registrationId, sportRegistrations.id))
                .where(
                    and(
                        eq(sportRegistrationPlayers.cpf, cpf),
                        eq(sportRegistrations.id, sportData.originalRegistrationId),
                        eq(sportRegistrations.eventId, eventId),
                        eq(sportRegistrations.ticketPurpose, 'REGISTRATION'),
                        eq(sportRegistrations.status, 'paid')
                    )
                )
                .limit(1);

            if (!playerCheck.length) {
                throw new Error('Inscricao original nao encontrada ou CPF nao pertence a esta dupla.');
            }

            const eventSettings = eventData.settings as any || {};
            const maxRepechages = typeof eventSettings.max_repechages_per_registration === 'number'
                ? eventSettings.max_repechages_per_registration
                : 0;

            const paidRepechages = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(sportRegistrations)
                .leftJoin(schema.sales, eq(sportRegistrations.saleId, schema.sales.id))
                .where(
                    and(
                        eq(sportRegistrations.originalRegistrationId, sportData.originalRegistrationId),
                        eq(sportRegistrations.ticketPurpose, 'REPECHAGE'),
                        or(
                            eq(sportRegistrations.status, 'paid'),
                            and(
                                eq(sportRegistrations.status, 'pending'),
                                isNotNull(schema.sales.asaasPaymentId)
                            )
                        )
                    )
                );
            const usedRepechages = paidRepechages[0]?.count ?? 0;

            if (usedRepechages >= maxRepechages) {
                throw new Error(`Limite de repescagens atingido (${usedRepechages}/${maxRepechages}).`);
            }

            originalRegistrationId = sportData.originalRegistrationId;
        }

        const organizer = await db.query.organizers.findFirst({
            where: eq(schema.organizers.userId, ticket.event.organizerId)
        });
        if (!organizer) throw new Error('Organizador nao encontrado.');

        const ticketPrice = Number(ticket.price);
        const subtotal = ticketPrice * quantity;

        // Calcular Taxas
        const organizerSettings = organizer.settings as any || {};
        const feePercentage = Number(organizerSettings.feePercentage || 10);
        const feeFixed = Number(organizerSettings.feeFixed || 0);

        const eventSettings = ticket.event.settings as any;
        const eventPassFeeToBuyer = eventSettings?.pass_fee_to_buyer;
        const passFeeToBuyer = eventPassFeeToBuyer !== undefined
            ? eventPassFeeToBuyer
            : (organizerSettings.passFeeToBuyer !== false);

        const feeAmount = (subtotal * (feePercentage / 100)) + feeFixed;
        const totalValue = passFeeToBuyer ? subtotal + feeAmount : subtotal;
        const producerNetValue = passFeeToBuyer ? subtotal : (subtotal - feeAmount);

        // 1. Criar Sale ANTES de chamar o Asaas
        const saleResult = await db.insert(schema.sales).values({
            eventId: ticket.eventId,
            buyerInfo: { name: buyerName, email: buyerEmail, cpf: normalizeCpf(buyerCpf) },
            totalAmount: totalValue.toString(),
            paymentStatus: 'pending',
            paymentMethod: paymentMethod
        }).returning({ id: schema.sales.id });
        const saleId = saleResult[0].id;

        // 2. Criar purchased_ticket pendente
        const qrCode = `TKT_${crypto.randomBytes(16).toString('hex')}`;
        const ptResult = await db.insert(purchasedTickets).values({
            eventId: ticket.eventId,
            userId: buyerId || ticket.event.organizerId,
            ticketId: ticket.id,
            parentPurchaseId: saleId,
            status: 'pending',
            qrCodeData: qrCode
        }).returning({ id: purchasedTickets.id });
        const purchasedTicketId = ptResult[0].id;

        // 3. Criar sport_registration pendente (se for ticket esportivo)
        let sportRegId: string | null = null;
        if (isSportTicket) {
            const srValues: any = {
                eventId: ticket.eventId,
                ticketId: ticket.id,
                saleId: saleId,
                purchasedTicketId: purchasedTicketId,
                teamName: sportData?.teamName || null,
                registrationType: ticket.registrationType || 'INDIVIDUAL',
                participantsPerRegistration: ticket.participantsPerRegistration || 1,
                ticketPurpose: ticket.ticketPurpose || 'REGISTRATION',
                originalRegistrationId: originalRegistrationId,
                status: 'pending',
            };

            const srResult = await db.insert(sportRegistrations).values(srValues).returning({ id: sportRegistrations.id });
            sportRegId = srResult[0].id;

            // Inserir jogadores somente para REGISTRATION
            if (ticket.ticketPurpose === 'REGISTRATION' && sportData?.players?.length) {
                const playerInserts = (sportData.players as any[]).map((p: any, idx: number) => ({
                    registrationId: sportRegId!,
                    playerOrder: idx + 1,
                    name: p.name?.trim() || '',
                    cpf: normalizeCpf(p.cpf),
                    phone: p.phone?.replace(/\D/g, '') || null,
                }));
                await db.insert(sportRegistrationPlayers).values(playerInserts);
            }
        }

        // 4. Criar cliente e pagamento no Asaas
        let asaasCustomer: any;
        let payment: any;
        try {
            asaasCustomer = await asaas.createCustomer({
                name: buyerName,
                email: buyerEmail,
                cpfCnpj: normalizeCpf(buyerCpf)
            });
            
            payment = await asaas.createPayment({
                customer: asaasCustomer.id,
                billingType: paymentMethod,
                value: totalValue,
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                description: `[A2 Tickets] ${ticket.ticketPurpose === 'REPECHAGE' ? 'Repescagem' : 'Inscricao'}: ${ticket.name}`,
                externalReference: `sale_${saleId}`,
                splitValue: producerNetValue,
                splitWalletId: organizerSettings.walletId
            });
        } catch (asaasErr: any) {
            console.error('[CHECKOUT] Asaas API error:', asaasErr.message);
            // ROLLBACK: Deletar registros locais pendentes órfãos
            if (sportRegId) {
                await db.delete(sportRegistrationPlayers).where(eq(sportRegistrationPlayers.registrationId, sportRegId));
                await db.delete(sportRegistrations).where(eq(sportRegistrations.id, sportRegId));
            }
            await db.delete(purchasedTickets).where(eq(purchasedTickets.id, purchasedTicketId));
            await db.delete(schema.sales).where(eq(schema.sales.id, saleId));

            throw new Error(`Erro ao comunicar com provedor de pagamento (Asaas): ${asaasErr.message}`);
        }

        // 5. Persistir asaasPaymentId na sale
        await db.update(schema.sales)
            .set({ asaasPaymentId: payment.id })
            .where(eq(schema.sales.id, saleId));

        let pixQrCode = null;
        if (paymentMethod === 'PIX') {
            try {
                pixQrCode = await asaas.getPixQrCode(payment.id);
            } catch (qrErr: any) {
                console.error('[CHECKOUT] Erro ao obter QR Code do PIX:', qrErr.message);
            }
        }

        return c.json({
            status: 'success',
            invoiceUrl: payment.invoiceUrl,
            paymentId: payment.id,
            saleId,
            sportRegistrationId: sportRegId,
            purchasedTicketId,
            pixQrCode
        });
    } catch (error: any) {
        console.error('[CHECKOUT]', error);
        return c.json({ error: error.message }, 400);
    }
});

// --- Promover Evento (Destaque na Home) — R$ 49,90 via PIX (Asaas Real) ---
app.post('/api/payments/promote-event', async (c: Context) => {
    const { eventId, organizerId, organizerName, organizerEmail, organizerCpfCnpj } = await c.req.json();

    try {
        const event = await db.query.events.findFirst({ where: eq(schema.events.id, eventId) });
        if (!event) throw new Error('Evento não encontrado');

        // 1. Criar ou Recuperar Cliente no Asaas (O próprio produtor)
        const customer = await asaas.createCustomer({ name: organizerName, email: organizerEmail, cpfCnpj: organizerCpfCnpj });

        // 2. Criar Pagamento de Promoção (Sem split, 100% para o Master)
        const payment = await asaas.createPromotionPayment({
            customer: customer.id,
            value: FEATURED_EVENT_PRICE,
            description: `[A2 Tickets] Destaque de Evento: ${event.title}`,
            externalReference: `promo_${eventId}_${Date.now()}`
        });

        // 3. Atualizar o Evento com o ID do Pagamento
        await db.update(schema.events)
            .set({ 
                featuredAsaasPaymentId: payment.id, 
                featuredPaymentStatus: 'pending' 
            })
            .where(eq(schema.events.id, eventId));

        return c.json({ status: 'success', invoiceUrl: payment.invoiceUrl, paymentId: payment.id });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// --- Webhook do Asaas --- IDEMPOTENTE ---
app.post('/api/webhooks/asaas', async (c: Context) => {
    // 1. Validar Token de Autenticacao do Asaas (Seguranca)
    const asaasToken = c.req.header('asaas-access-token');
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (expectedToken && asaasToken !== expectedToken) {
        console.warn('[WEBHOOK] Asaas bloqueado: Token invalido.');
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const data = await c.req.json();
    const { event, payment } = data;

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
        const asaasId = payment.id;

        // Tentar atualizar sale (Ingressos)
        const saleRecord = await db.query.sales.findFirst({
            where: eq(schema.sales.asaasPaymentId, asaasId)
        });

        if (saleRecord) {
            // Idempotencia: so processa se ainda estiver pending
            if (saleRecord.paymentStatus === 'pending') {
                await db.update(schema.sales)
                    .set({ paymentStatus: 'paid' })
                    .where(
                        and(
                            eq(schema.sales.asaasPaymentId, asaasId),
                            eq(schema.sales.paymentStatus, 'pending')
                        )
                    );

                // Ativar purchased_tickets ligados a esta sale
                await db.update(purchasedTickets)
                    .set({ status: 'active' })
                    .where(eq(purchasedTickets.parentPurchaseId, saleRecord.id));

                // Atualizar sport_registration se houver
                const sportReg = await db.query.sportRegistrations.findFirst({
                    where: and(
                        eq(sportRegistrations.saleId, saleRecord.id),
                        eq(sportRegistrations.status, 'pending')
                    )
                });

                if (sportReg) {
                    await db.update(sportRegistrations)
                        .set({ status: 'paid', updatedAt: new Date() })
                        .where(
                            and(
                                eq(sportRegistrations.id, sportReg.id),
                                eq(sportRegistrations.status, 'pending') // condicao de guarda
                            )
                        );

                    // Se for REPECHAGE: incrementar contador na inscricao original
                    // So incrementa se a transicao pending->paid ocorreu (garante idempotencia)
                    if (sportReg.ticketPurpose === 'REPECHAGE' && sportReg.originalRegistrationId) {
                        await db.update(sportRegistrations)
                            .set({ repechageCount: sql`${sportRegistrations.repechageCount} + 1` })
                            .where(eq(sportRegistrations.id, sportReg.originalRegistrationId));
                    }
                }

                if (redis) {
                    await redis.set(`sale:${saleRecord.id}`, 'PAID');
                }
                console.log(`[WEBHOOK] Sale ${saleRecord.id} confirmada. Sport reg atualizada.`);
            } else {
                console.log(`[WEBHOOK] Sale ${saleRecord.id} ja estava ${saleRecord.paymentStatus}. Ignorando (idempotente).`);
            }
            return c.json({ received: true, type: 'ticket' });
        }

        // Se nao for ingresso, verificar se e Promocao de Evento
        const eventRecord = await db.query.events.findFirst({
            where: eq(schema.events.featuredAsaasPaymentId, asaasId)
        });

        if (eventRecord) {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            await db.update(schema.events)
                .set({
                    isFeatured: true,
                    featuredPaymentStatus: 'paid',
                    featuredUntil: thirtyDaysFromNow
                })
                .where(eq(schema.events.id, eventRecord.id));
            return c.json({ received: true, type: 'event_promotion' });
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

// --- Categorias de Eventos (Banco Global) ---

app.get('/api/event-categories', async (c: Context) => {
    try {
        const categories = await db.query.eventCategories.findMany({
            orderBy: (cats: any, { asc }: any) => [asc(cats.name)]
        });
        return c.json(categories);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

app.post('/api/event-categories', async (c: Context) => {
    const { name, icon } = await c.req.json();
    try {
        // Verifica se já existe (case-insensitive)
        const existing = await db.query.eventCategories.findFirst({
            where: eq(eventCategories.name, name)
        });
        if (existing) return c.json(existing);

        const [newCategory] = await db.insert(eventCategories).values({
            name,
            icon: icon || 'Tag'
        }).returning();
        return c.json(newCategory);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// --- Gestão de Eventos (CRUD Real) ---

// Organizer Routes
// Singular alias for compatibility
app.get('/api/organizer/:id/profile', async (c) => {
    const id = c.req.param('id');
    try {
        const organizer = await db.query.organizers.findFirst({
            where: eq(organizersTable.id, id),
        });

        if (!organizer) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        const { passwordHash, ...profile } = organizer;
        return c.json(profile);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return c.json({ error: 'Erro interno do servidor' }, 500);
    }
});

app.get('/api/organizers/:id/profile', async (c) => {
    const id = c.req.param('id');
    try {
        const organizer = await db.query.organizers.findFirst({
            where: eq(organizersTable.id, id),
        });

        if (!organizer) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        const { passwordHash, ...profile } = organizer;
        return c.json(profile);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return c.json({ error: 'Erro interno do servidor' }, 500);
    }
});


// Put routes with singular aliases
app.put('/api/organizer/:id/profile', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    try {
        const updated = await db.update(organizersTable)
            .set({
                ...body,
                updatedAt: new Date(),
            })
            .where(eq(organizersTable.id, id))
            .returning();

        if (updated.length === 0) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        const { passwordHash, ...profile } = updated[0];
        return c.json(profile);
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return c.json({ error: 'Erro ao atualizar perfil' }, 500);
    }
});

app.put('/api/organizers/:id/profile', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    try {
        const updated = await db.update(organizersTable)
            .set({
                ...body,
                updatedAt: new Date(),
            })
            .where(eq(organizersTable.id, id))
            .returning();

        if (updated.length === 0) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        const { passwordHash, ...profile } = updated[0];
        return c.json(profile);
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return c.json({ error: 'Erro ao atualizar perfil' }, 500);
    }
});

app.put('/api/organizers/:id/complete-profile', async (c) => {
    const id = c.req.param('id');
    try {
        const updated = await db.update(organizersTable)
            .set({
                profileComplete: true,
                updatedAt: new Date(),
            })
            .where(eq(organizersTable.id, id))
            .returning();

        if (updated.length === 0) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        const { passwordHash, ...profile } = updated[0];
        return c.json(profile);
    } catch (error) {
        console.error('Erro ao concluir perfil:', error);
        return c.json({ error: 'Erro ao concluir perfil' }, 500);
    }
});

// Criar Subconta Asaas para o Organizador
app.post('/api/organizers/:id/asaas-account', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    try {
        const organizer = await db.query.organizers.findFirst({
            where: eq(organizersTable.id, id),
        });

        if (!organizer) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        if (organizer.asaasId) {
            return c.json({ error: 'Este organizador já possui uma subconta vinculada' }, 400);
        }

        // Criar Subconta na API Asaas
        const asaasAccount = await asaas.createSubAccount({
            name: body.companyName || organizer.name,
            email: organizer.email,
            cpfCnpj: body.cpfCnpj,
            mobilePhone: body.mobilePhone,
            phone: body.phone || body.mobilePhone,
            address: body.address,
            addressNumber: body.addressNumber || 'S/N',
            province: body.province,
            postalCode: body.postalCode,
            incomeValue: body.incomeValue || 5000,
        });

        // Salvar os IDs no banco
        const updated = await db.update(organizersTable)
            .set({
                cpf: body.cpfCnpj,
                phone: body.mobilePhone,
                address: body.address,
                postalCode: body.postalCode,
                asaasId: asaasAccount.id,
                walletId: asaasAccount.walletId,
                asaasApiKey: asaasAccount.apiKey,
                updatedAt: new Date(),
            })
            .where(eq(organizersTable.id, id))
            .returning();

        return c.json(updated[0]);
    } catch (error: any) {
        console.error('Erro ao criar subconta Asaas:', error);
        return c.json({ error: error.message || 'Erro ao criar subconta Asaas' }, 500);
    }
});

// --- Webhook Asaas ---
app.post('/api/webhooks/asaas', async (c) => {
    try {
        const payload = await c.req.json();
        
        console.log('[WEBHOOK ASAAS] Recebido:', payload.event, payload.payment?.id);

        if (payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PAYMENT_CONFIRMED') {
            const paymentId = payload.payment.id;
            
            // 1. Procurar a venda associada a este pagamento
            const sale = await db.query.sales.findFirst({
                where: eq(schema.sales.asaasPaymentId, paymentId)
            });

            if (sale && sale.paymentStatus !== 'paid') {
                // Atualizar Status da Venda
                await db.update(schema.sales)
                    .set({ paymentStatus: 'paid' })
                    .where(eq(schema.sales.id, sale.id));

                // 2. Procurar o User pelo email (ou criar user placeholder)
                let user = await db.query.users.findFirst({
                    where: eq(schema.users.email, sale.buyerEmail)
                });
                
                // 3. Gerar purchased_tickets com QR code criptograficamente seguro
                const realQrCode = sale.qrCodeData || `TKT_${crypto.randomBytes(16).toString('hex')}`;

                await db.insert(schema.purchasedTickets).values({
                    userId: user?.id || 'guest',
                    eventId: sale.eventId,
                    ticketId: sale.ticketId,
                    purchaseDate: new Date(),
                    status: 'active',
                    qrCodeData: realQrCode,
                    buyerName: sale.buyerName,
                    buyerEmail: sale.buyerEmail,
                });
                
                console.log(`[WEBHOOK ASAAS] Venda ${sale.id} confirmada e ingresso gerado!`);
            }
        }
        
        return c.json({ received: true });
    } catch (error) {
        console.error('[WEBHOOK ASAAS] Erro:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

app.get('/api/organizers/slug/:slug', async (c) => {
    const slug = c.req.param('slug');
    try {
        const organizer = await db.query.organizers.findFirst({
            where: eq(organizersTable.slug, slug),
        });

        if (!organizer) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        const { passwordHash, asaasApiKey, ...publicProfile } = organizer;
        return c.json(publicProfile);
    } catch (error) {
        console.error('Erro ao buscar perfil por slug:', error);
        return c.json({ error: 'Erro interno do servidor' }, 500);
    }
});


// 1. Criar Evento
app.post('/api/events', async (c: Context) => {
    const data = await c.req.json();
    try {
        // Check if organizer has a complete profile
        let finalStatus = data.status || 'draft';

        if (finalStatus === 'published' && data.organizerId) {
            const organizer = await db.query.organizers.findFirst({
                where: eq(organizersTable.id, data.organizerId)
            });
            // If profile is not complete, force status to 'pending' for admin review
            if (!organizer?.profileComplete) {
                finalStatus = 'pending';
                console.log(`[EVENTS] Produtor ${data.organizerId} com perfil incompleto. Evento forçado para 'pending'.`);
            }
        }

        const [newEvent] = await db.insert(events).values({
            organizerId: data.organizerId,
            title: data.title,
            description: data.description,
            category: data.category,
            eventType: data.eventType || 'paid',
            date: data.date,
            time: data.time,
            duration: data.duration,
            locationName: data.locationName || data.location?.name,
            locationAddress: data.locationAddress || data.location?.address,
            locationCity: data.locationCity,
            locationState: data.locationState,
            locationPostalCode: data.locationPostalCode,
            capacity: Number(data.capacity) || 0,
            status: finalStatus,
            imageUrl: data.imageUrl,
            isFeatured: false, // NEVER accept featured from frontend — only via Asaas webhook or Master toggle
            featuredPaymentStatus: data.featuredPaymentStatus || 'none',
        }).returning();
        return c.json({ ...newEvent, wantsHighlight: data.isFeatured || false, forcedToPending: finalStatus === 'pending' && data.status === 'published' });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

app.get('/api/public/featured-events', async (c: Context) => {
    try {
        const featured = await db.query.events.findMany({
            where: and(
                eq(events.isFeatured, true),
                eq(events.status, 'published')
            ),
            orderBy: (events, { desc }) => [desc(events.createdAt)]
        });
        return c.json(featured);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// --- Páginas Legais ---

app.get('/api/legal/:slug', async (c) => {
    const slug = c.req.param('slug');
    try {
        let page = await db.query.legalPages.findFirst({
            where: eq(legalPages.slug, slug),
        });

        // Seed inicial se não existir
        if (!page) {
            const title = slug === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso';
            const [newPage] = await db.insert(legalPages).values({
                slug,
                title,
                content: '# ' + title + '\n\nConteúdo em breve...',
            }).returning();
            page = newPage;
        }

        return c.json(page);
    } catch (error) {
        return c.json({ error: 'Erro ao buscar página legal' }, 500);
    }
});

app.put('/api/legal/:slug', async (c) => {
    const slug = c.req.param('slug');
    const { content, title } = await c.req.json();
    try {
        const updated = await db.update(legalPages)
            .set({
                content,
                title,
                updatedAt: new Date()
            })
            .where(eq(legalPages.slug, slug))
            .returning();

        if (updated.length === 0) {
            return c.json({ error: 'Página não encontrada' }, 404);
        }

        return c.json(updated[0]);
    } catch (error) {
        return c.json({ error: 'Erro ao atualizar página legal' }, 500);
    }
});
const getEventsByOrganizer = async (c: Context) => {
    const organizerId = c.req.param('organizerId');
    try {
        const results = await db.query.events.findMany({
            where: eq(events.organizerId, organizerId),
            with: {
                tickets: true
            }
        } as any);

        // Transform flat location fields into nested location object for the frontend
        const transformedResults = results.map((event: any) => ({
            ...event,
            bannerUrl: event.imageUrl, // Map imageUrl to bannerUrl
            location: {
                name: event.locationName,
                address: event.locationAddress,
                city: event.locationCity,
                state: event.locationState,
                postalCode: event.locationPostalCode,
                coordinates: { lat: 0, lng: 0 } // Default for now
            }
        }));

        return c.json(transformedResults);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
};

app.get('/api/events/organizer/:organizerId', getEventsByOrganizer);
app.get('/api/events/organizers/:organizerId', getEventsByOrganizer);


// 3. Detalhes de um Evento
app.get('/api/events/:id', async (c: Context) => {
    const id = c.req.param('id');
    const result = await db.query.events.findFirst({
        where: eq(events.id, id),
        with: {
            tickets: true,
            organizer: true
        }
    } as any);

    if (!result) return c.json({ error: 'Evento não encontrado' }, 404);

    // Transform location and image
    const transformed = {
        ...result,
        bannerUrl: (result as any).imageUrl, // Added bannerUrl for frontend compatibility
        location: {
            name: (result as any).locationName,
            address: (result as any).locationAddress,
            city: (result as any).locationCity,
            state: (result as any).locationState,
            postalCode: (result as any).locationPostalCode
        }
    };

    return c.json(transformed);
});

// 3.5 Listar todos os eventos públicos
app.get('/api/public/events', async (c: Context) => {
    try {
        const results = await db.query.events.findMany({
            where: or(eq(events.status, 'published'), eq(events.status, 'active')),
            with: {
                tickets: true,
                organizer: true
            },
            orderBy: (events: any, { desc }: any) => [desc(events.date)]
        } as any);

        const transformedResults = results.map((event: any) => ({
            ...event,
            bannerUrl: event.imageUrl,
            location: {
                name: event.locationName,
                address: event.locationAddress,
                city: event.locationCity,
                state: event.locationState,
                postalCode: event.locationPostalCode
            }
        }));

        return c.json(transformedResults);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

app.get('/api/public/featured-events', async (c: Context) => {
    try {
        const results = await db.query.events.findMany({
            where: and(
                or(eq(events.status, 'published'), eq(events.status, 'active')),
                eq(events.isFeatured, true)
            ),
            with: {
                tickets: true,
                organizer: true
            },
            orderBy: (events: any, { desc }: any) => [desc(events.date)]
        } as any);

        const transformedResults = results.map((event: any) => ({
            ...event,
            bannerUrl: event.imageUrl,
            location: {
                name: event.locationName,
                address: event.locationAddress,
                city: event.locationCity,
                state: event.locationState,
                postalCode: event.locationPostalCode
            }
        }));

        return c.json(transformedResults);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
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
            passwordHash: await Bun.password.hash(data.password),
            emailVerified: false,
            verificationToken: token
        }).returning();

        // Enviar e-mail de confirmação
        if (!transporter) {
            console.warn('⚠️ SMTP not configured. Skipping candidate verification email.');
            return c.json({ status: 'success', message: 'Cadastro realizado! SMTP desabilitado.' });
        }
        const appUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
        const verificationUrl = `${appUrl}/auth/verify?token=${token}&type=candidate`;

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"A2 Tickets 360º" <noreply@a2tickets360.com.br>',
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

// 1. Listar todos os organizadores (Apenas ativos)
app.get('/api/master/organizers', async (c: Context) => {
    try {
        const organizersList = await db.query.organizers.findMany({
            where: or(eq(organizersTable.isActive, true), isNull(organizersTable.isActive)),
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
            emailVerified: true, // Master cria já verificado
            isActive: true
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
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(organizersTable.id, id))
            .returning();
        return c.json(updated);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 4. Excluir Organizador (Soft Delete)
app.delete('/api/master/organizers/:id', async (c: Context) => {
    const id = c.req.param('id');
    try {
        const [updated] = await db.update(organizersTable)
            .set({
                isActive: false,
                updatedAt: new Date()
            })
            .where(eq(organizersTable.id, id))
            .returning();

        if (!updated) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        return c.json({ message: 'Organizador excluído com sucesso' });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 5. Listar eventos pendentes para aprovação (draft E pending)
app.get('/api/master/events/pending', async (c: Context) => {
    try {
        const pendingEvents = await db.query.events.findMany({
            where: or(eq(events.status, 'draft'), eq(events.status, 'pending')),
            with: {
                organizer: true
            },
            orderBy: (events, { desc }) => [desc(events.createdAt)]
        });
        return c.json(pendingEvents);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 6. Aprovar evento (aceita draft, pending → published)
app.put('/api/master/events/:id/approve', async (c: Context) => {
    const id = c.req.param('id');
    try {
        const event = await db.query.events.findFirst({ where: eq(events.id, id) });
        if (!event) return c.json({ error: 'Evento não encontrado' }, 404);

        if (!['draft', 'pending'].includes(event.status as string)) {
            return c.json({ error: `Evento com status '${event.status}' não pode ser aprovado.` }, 400);
        }

        const [updated] = await db.update(events)
            .set({
                status: 'published',
                updatedAt: new Date()
            })
            .where(eq(events.id, id))
            .returning();

        return c.json({ message: 'Evento aprovado com sucesso', event: updated });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 7. Aprovar Organizador Manualmente (Bypass Onboarding)
app.post('/api/master/organizers/:id/approve-manually', async (c: Context) => {
    const id = c.req.param('id');
    try {
        const [updated] = await db.update(organizersTable)
            .set({
                profileComplete: true,
                updatedAt: new Date()
            })
            .where(eq(organizersTable.id, id))
            .returning();

        if (!updated) {
            return c.json({ error: 'Organizador não encontrado' }, 404);
        }

        return c.json({ status: 'success', message: 'Cadastro aprovado manualmente!' });
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

// --- MÓDULO DE FEED DO ORGANIZADOR ---

// 1. Criar Post
app.post('/api/organizers/:id/posts', async (c: Context) => {
    const organizerId = c.req.param('id');
    const { imageUrl, caption } = await c.req.json();
    try {
        const [newPost] = await db.insert(organizerPosts).values({
            organizerId,
            imageUrl,
            caption
        }).returning();
        return c.json(newPost);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 2. Listar Posts do Organizador
app.get('/api/organizers/:id/posts', async (c: Context) => {
    const organizerId = c.req.param('id');
    try {
        const posts = await db.query.organizerPosts.findMany({
            where: eq(organizerPosts.organizerId, organizerId),
            orderBy: (posts, { desc }) => [desc(posts.createdAt)]
        });
        return c.json(posts);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// 3. Remover Post
app.delete('/api/organizers/:id/posts/:postId', async (c: Context) => {
    const organizerId = c.req.param('id');
    const postId = c.req.param('postId');
    try {
        const deleted = await db.delete(organizerPosts)
            .where(and(
                eq(organizerPosts.id, postId),
                eq(organizerPosts.organizerId, organizerId)
            ))
            .returning();

        if (deleted.length === 0) return c.json({ error: 'Post não encontrado' }, 404);
        return c.json({ success: true });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

// Helper: Validar Completude do Perfil
function isProfileActuallyComplete(org: any) {
    const requiredFields = [
        'name', 'email', 'phone', 'address', 'city', 'state', 'postalCode',
        'companyName', 'bio', 'logoUrl', 'bannerUrl'
    ];

    // Check basic fields
    for (const field of requiredFields) {
        if (!org[field]) return false;
    }

    // Check document (either CPF/RG or CNPJ)
    const hasCpf = !!(org.cpf && org.rg);
    const hasCnpj = !!org.cnpj;

    if (!hasCpf && !hasCnpj) return false;

    // Check documents uploaded
    if (!org.documentFrontUrl || !org.documentBackUrl) return false;

    return true;
}

// Rota para validar e atualizar status de completude
app.get('/api/master/events', async (c: Context) => {
    try {
        const allEvents = await db.query.events.findMany({
            with: {
                organizer: true,
                tickets: true
            },
            orderBy: (events, { desc }) => [desc(events.createdAt)]
        });
        return c.json(allEvents);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});


app.get('/api/master/stats', async (c: Context) => {
    try {
        const totalEvents = await db.select({ count: sql`count(*)` }).from(events);
        const totalOrganizers = await db.select({ count: sql`count(*)` }).from(organizersTable);
        const activeOrganizers = await db.select({ count: sql`count(*)` }).from(organizersTable).where(eq(organizersTable.isActive, true));
        const pendingOrganizers = await db.select({ count: sql`count(*)` }).from(organizersTable).where(eq(organizersTable.profileComplete, false));

        const totalVisitors = await db.select({ count: sql`count(*)` }).from(visitors);

        const pendingEvents = await db.select({ count: sql`count(*)` }).from(events).where(eq(events.status, 'draft'));

        // Total Revenue from paid sales
        const revenueResult = await db.select({ total: sql`sum(total_price)` }).from(sales).where(eq(sales.paymentStatus, 'paid'));
        const totalRevenue = Number(revenueResult[0]?.total || 0);
        const totalCommissions = totalRevenue * 0.10; // Assuming 10% flat commission for now

        // Events this month
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        const eventsThisMonth = await db.select({ count: sql`count(*)` })
            .from(events)
            .where(gte(events.date, firstDayOfMonth.toISOString().split('T')[0]));

        return c.json({
            totalEvents: Number(totalEvents[0].count),
            totalOrganizers: Number(totalOrganizers[0].count),
            activeOrganizers: Number(activeOrganizers[0].count),
            pendingOrganizers: Number(pendingOrganizers[0].count),
            totalUsers: Number(totalVisitors[0].count),
            pendingEvents: Number(pendingEvents[0].count),
            totalRevenue: totalRevenue,
            totalCommissions: totalCommissions,
            totalPayouts: 0,
            eventsThisMonth: Number(eventsThisMonth[0].count),
            alertsCount: Number(pendingEvents[0].count) + Number(pendingOrganizers[0].count),
            newOrganizersMonth: 0
        });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

app.get('/api/customer/tickets', async (c: Context) => {
    const email = c.req.query('email');
    if (!email) return c.json({ error: 'Email é obrigatório' }, 400);

    try {
        const tickets = await db.query.sales.findMany({
            where: eq(sales.buyerEmail, email),
            with: {
                event: true,
                ticket: true
            },
            orderBy: (sales, { desc }) => [desc(sales.createdAt)]
        });
        return c.json(tickets);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

app.get('/api/organizers/:id/stats', async (c: Context) => {
    const organizerId = c.req.param('id');
    try {
        // Count staff
        const staffCount = await db.select({ count: sql`count(*)` })
            .from(staff)
            .where(eq(staff.organizerId, organizerId));

        // Count visitors through events
        const visitorCount = await db.select({ count: sql`count(*)` })
            .from(visitors)
            .innerJoin(events, eq(visitors.eventId, events.id))
            .where(eq(events.organizerId, organizerId));

        // Get next event
        const nextEvent = await db.query.events.findFirst({
            where: and(
                eq(events.organizerId, organizerId),
                gte(events.date, new Date().toISOString().split('T')[0])
            ),
            orderBy: (events, { asc }) => [asc(events.date), asc(events.time)]
        });

        return c.json({
            staffCount: Number(staffCount[0].count),
            visitorCount: Number(visitorCount[0].count),
            nextEvent: nextEvent || null
        });
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

app.put('/api/master/events/:id/featured', async (c: Context) => {
    const id = c.req.param('id');
    const { isFeatured } = await c.req.json();
    try {
        const [updated] = await db.update(events)
            .set({
                isFeatured,
                featuredUntil: isFeatured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
                updatedAt: new Date()
            })
            .where(eq(events.id, id))
            .returning();

        if (!updated) {
            return c.json({ error: 'Evento não encontrado' }, 404);
        }

        return c.json(updated);
    } catch (error: any) {
        return c.json({ error: error.message }, 400);
    }
});

app.get('/api/purchased-tickets/:id/status', async (c: Context) => {
    try {
        const id = c.req.param('id');
        const pt = await db.query.purchasedTickets.findFirst({
            where: eq(schema.purchasedTickets.id, id),
            columns: { status: true }
        });
        if (!pt) return c.json({ error: 'Not found' }, 404);
        return c.json({ status: pt.status });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default {
    port: process.env.PORT || 3002,
    fetch: app.fetch,
};
