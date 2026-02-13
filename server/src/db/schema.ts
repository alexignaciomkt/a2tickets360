import { pgTable, text, timestamp, serial, integer, boolean, decimal, jsonb, uuid } from 'drizzle-orm/pg-core';

// Organizadores (Donos dos Eventos)
export const organizers = pgTable('organizers', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    asaasId: text('asaas_id'), // ID da subconta no Asaas
    asaasApiKey: text('asaas_api_key'), // Opcional: Se quisermos permitir que ele use o próprio token em algum momento
    walletId: text('wallet_id'), // ID da carteira no Asaas
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Eventos
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    category: text('category'),
    date: text('date').notNull(), // Formato ISO ou YYYY-MM-DD
    time: text('time').notNull(),
    locationName: text('location_name'),
    locationAddress: text('location_address'),
    capacity: integer('capacity').notNull(),
    status: text('status', { enum: ['draft', 'published', 'active', 'completed', 'cancelled'] }).default('draft'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Ingressos
export const tickets = pgTable('tickets', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    remaining: integer('remaining').notNull(),
    batch: text('batch'), // Lote
    isActive: boolean('is_active').default(true),
    category: text('category', { enum: ['standard', 'vip', 'early-bird', 'student', 'group'] }).default('standard'),
});

// Vendas e Transações
export const sales = pgTable('sales', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    ticketId: uuid('ticket_id').references(() => tickets.id).notNull(),
    buyerName: text('buyer_name').notNull(),
    buyerEmail: text('buyer_email').notNull(),
    buyerPhone: text('buyer_phone'),
    quantity: integer('quantity').notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'refunded', 'cancelled'] }).default('pending'),
    paymentMethod: text('payment_method'), // PIX, CREDIT_CARD, BOLETO
    asaasPaymentId: text('asaas_payment_id'), // ID da cobrança no Asaas
    qrCodeData: text('qr_code_data').unique().notNull(), // O código que será validado
    createdAt: timestamp('created_at').defaultNow(),
});

// Staff / Membros da Equipe (Vinculados a Organizadores ou Eventos)
export const staff = pgTable('staff', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    eventId: uuid('event_id').references(() => events.id), // Pode ser staff geral ou fixo no evento
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    roleId: text('role_id').notNull(),
    eventFunction: text('event_function'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    lastLogin: timestamp('last_login'),
});

// Check-ins (Validação de Ingressos)
export const checkins = pgTable('checkins', {
    id: serial('id').primaryKey(),
    saleId: uuid('sale_id').references(() => sales.id).notNull(),
    staffId: uuid('staff_id').references(() => staff.id).notNull(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    checkInTime: timestamp('check_in_time').defaultNow(),
});
