import { pgTable, text, timestamp, serial, integer, boolean, decimal, jsonb, uuid } from 'drizzle-orm/pg-core';

// Eventos
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
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
    organizerId: text('organizer_id').notNull(),
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

// Vendas
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
    paymentMethod: text('payment_method'),
    qrCodeData: text('qr_code_data').unique().notNull(), // O código que será validado
    createdAt: timestamp('created_at').defaultNow(),
});

// Staff / Membros da Equipe
export const staff = pgTable('staff', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    roleId: text('role_id').notNull(), // referenciar StaffRole se necessário
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
