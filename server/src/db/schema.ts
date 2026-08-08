import { pgTable, text, timestamp, serial, integer, boolean, decimal, jsonb, uuid, index, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Administradores da Plataforma (Master)
export const admins = pgTable('admins', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['master', 'admin'] }).default('master'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Organizadores (Donos dos Eventos)
export const organizers = pgTable('organizer_details', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    companyName: text('company_name'),
    slug: text('slug').unique(),
    cnpj: text('cnpj'),
    cpf: text('cpf'),
    phone: text('phone'),
    bio: text('bio'),
    asaasKey: text('asaas_key'),
    logoUrl: text('logo_url'),
    bannerUrl: text('banner_url'),
    socialLinks: jsonb('social_links'),
    addressData: jsonb('address_data'),
    rg: text('rg'),
    birthDate: text('birth_date'),
    postalCode: text('postal_code'),
    documentFrontUrl: text('document_front_url'),
    documentBackUrl: text('document_back_url'),
    instagramUrl: text('instagram_url'),
    facebookUrl: text('facebook_url'),
    whatsappNumber: text('whatsapp_number'),
    websiteUrl: text('website_url'),
    companyAddress: text('company_address'),
    lastStep: integer('last_step').default(1),
    address: text('address'),
    city: text('city'),
    state: text('state'),
    category: text('category'),
    settings: jsonb('settings'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Categorias de Eventos (Banco Global Colaborativo)
export const eventCategories = pgTable('event_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(),
    code: text('code').unique(), // Código técnico estático (ex: SPORT_TRUCO)
    icon: text('icon'), // Nome do ícone Lucide (ex: 'Briefcase')
    createdAt: timestamp('created_at').defaultNow(),
});

// Eventos
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    title: text('title').notNull(),
    slug: text('slug'),
    description: text('description'),
    category: text('category'),
    categoryCode: text('category_code'),
    externalChampionshipId: text('external_championship_id'),
    sportsIntegrationStatus: text('sports_integration_status').notNull().default('not_applicable'),
    sportsIntegrationErrorCode: text('sports_integration_error_code'),
    sportsIntegrationError: text('sports_integration_error'),
    sportsLastSyncAt: timestamp('sports_last_sync_at', { withTimezone: true }),
    eventType: text('event_type').default('paid'),
    status: text('status').default('draft'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    time: text('time'),
    locationName: text('location_name'),
    address: text('address'),
    city: text('city'),
    state: text('state'),
    postalCode: text('postal_code'),
    capacity: integer('capacity'),
    bannerUrl: text('banner_url'),
    isFeatured: boolean('is_featured').default(false),
    featuredUntil: timestamp('featured_until'),
    featuredPaymentStatus: text('featured_payment_status').default('none'),
    featuredAsaasPaymentId: text('featured_asaas_payment_id'),
    ticketDesign: jsonb('ticket_design'),
    settings: jsonb('settings'),
    galleryUrls: jsonb('gallery_urls'),
    acceptsPromoters: boolean('accepts_promoters').default(false),
    promoterCommissionRate: decimal('promoter_commission_rate', { precision: 5, scale: 2 }),
    promoterDiscountRate: decimal('promoter_discount_rate', { precision: 5, scale: 2 }),
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
    category: text('category').default('standard'),
    isActive: boolean('is_active').default(true),
    capacityPerUnit: integer('capacity_per_unit'),
    maxPerCpf: integer('max_per_cpf'),
    registrationType: text('registration_type').default('INDIVIDUAL'),
    participantsPerRegistration: integer('participants_per_registration').default(1),
    ticketPurpose: text('ticket_purpose').default('REGISTRATION'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Vendas e Transações
export const sales = pgTable('sales', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    customerId: uuid('customer_id'),
    buyerInfo: jsonb('buyer_info'),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'refunded', 'cancelled'] }).default('pending'),
    paymentMethod: text('payment_method'), // PIX, CREDIT_CARD, BOLETO
    asaasId: text('asaas_id'),
    asaasPaymentId: text('asaas_payment_id'), // ID da cobrança no Asaas
    promoterId: uuid('promoter_id'),
    promoterCommissionAmount: decimal('promoter_commission_amount', { precision: 10, scale: 2 }),
    payoutStatus: text('payout_status'),
    payoutRequestId: uuid('payout_request_id'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Ingressos Comprados
export const purchasedTickets = pgTable('purchased_tickets', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    ticketId: uuid('ticket_id').references(() => tickets.id).notNull(),
    parentPurchaseId: uuid('parent_purchase_id').references(() => sales.id),
    status: text('status').default('pending'),
    photoUrl: text('photo_url'),
    qrCodeData: text('qr_code_data').unique(),
    idVerified: boolean('id_verified').default(false),
    isCourtesy: boolean('is_courtesy').default(false),
    promoterId: uuid('promoter_id'),
    couponId: uuid('coupon_id'),
    groupToken: text('group_token'),
    purchaseDate: timestamp('purchase_date').defaultNow(),
    validatedAt: timestamp('validated_at'),
    validatedBy: uuid('validated_by'),
    createdAt: timestamp('created_at').defaultNow(),
});

// =============================================================================
// ESPORTE — Inscrições Esportivas (REGISTRATION e REPECHAGE)
// =============================================================================

// Unidade competitiva: 1 registro = 1 dupla / 1 indivíduo / 1 time
export const sportRegistrations = pgTable('sport_registrations', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    ticketId: uuid('ticket_id').references(() => tickets.id).notNull(),
    saleId: uuid('sale_id').references(() => sales.id),
    purchasedTicketId: uuid('purchased_ticket_id').references(() => purchasedTickets.id),
    teamName: text('team_name'),
    registrationType: text('registration_type').notNull().default('INDIVIDUAL'), // INDIVIDUAL | DOUBLE | TEAM
    participantsPerRegistration: integer('participants_per_registration').notNull().default(1),
    ticketPurpose: text('ticket_purpose').notNull().default('REGISTRATION'), // REGISTRATION | REPECHAGE
    // Para REPECHAGE: aponta para a inscrição original
    originalRegistrationId: uuid('original_registration_id').references((): AnyPgColumn => sportRegistrations.id),
    // Contagem de repescagens pagas ligadas a esta inscrição (incrementado idempotentemente)
    repechageCount: integer('repechage_count').notNull().default(0),
    status: text('status').notNull().default('pending'), // pending | paid | cancelled | refunded
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    eventIdx: index('idx_sr_event_id').on(t.eventId),
    originalIdx: index('idx_sr_original').on(t.originalRegistrationId),
    statusIdx: index('idx_sr_status').on(t.status),
}));

// Jogadores de cada inscrição esportiva
export const sportRegistrationPlayers = pgTable('sport_registration_players', {
    id: uuid('id').primaryKey().defaultRandom(),
    registrationId: uuid('registration_id').references(() => sportRegistrations.id, { onDelete: 'cascade' }).notNull(),
    playerOrder: integer('player_order').notNull(), // 1, 2, ...
    name: text('name').notNull(),
    cpf: text('cpf').notNull(), // somente dígitos, normalizado server-side
    phone: text('phone'),
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    cpfIdx: index('idx_srp_cpf').on(t.cpf),
}));

// Staff / Membros da Equipe (Vinculados a Organizadores ou Eventos)
export const staff = pgTable('staff', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    eventId: uuid('event_id').references(() => events.id), // Pode ser staff geral ou fixo no evento
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    photoUrl: text('photo_url'),
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

// Categorias Globais de Fornecedores (Colaborativas)
export const supplierCategories = pgTable('supplier_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(), // Nome único (ex: 'Papel Toalha', 'Sonorização')
    icon: text('icon'), // Nome do ícone da Lucide (opcional)
    createdAt: timestamp('created_at').defaultNow(),
});

// Fornecedores
export const suppliers = pgTable('suppliers', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    categoryId: uuid('category_id').references(() => supplierCategories.id), // Referência à categoria global
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    category: text('category'), // Mantido para compatibilidade ou texto livre secundário
    document: text('document'), // CNPJ/CPF
    address: text('address'), // Endereço completo
    contactName: text('contact_name'), // Nome do responsável/contato
    contactPhone: text('contact_phone'), // Telefone do responsável
    status: text('status', { enum: ['active', 'inactive'] }).default('active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Contratos de Fornecedores
export const supplierContracts = pgTable('supplier_contracts', {
    id: uuid('id').primaryKey().defaultRandom(),
    supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    eventId: uuid('event_id').references(() => events.id),
    title: text('title').notNull(),
    fileUrl: text('file_url'),
    value: decimal('value', { precision: 10, scale: 2 }),
    status: text('status', { enum: ['pending', 'signed', 'expired', 'cancelled'] }).default('pending'),
    signedAt: timestamp('signed_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Cotações (Orçamentos)
export const quotes = pgTable('quotes', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    eventId: uuid('event_id').references(() => events.id),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['open', 'approved', 'rejected', 'closed'] }).default('open'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Respostas de Cotações
export const quoteResponses = pgTable('quote_responses', {
    id: uuid('id').primaryKey().defaultRandom(),
    quoteId: uuid('quote_id').references(() => quotes.id).notNull(),
    supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
    value: decimal('value', { precision: 10, scale: 2 }),
    fileUrl: text('file_url'), // PDF do orçamento
    notes: text('notes'),
    isAccepted: boolean('is_accepted').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// Candidatos / Profissionais Independentes (Marketplace)
export const candidates = pgTable('candidates', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    phone: text('phone'),
    photoUrl: text('photo_url'),
    biography: text('biography'),
    city: text('city'),
    state: text('state'),
    experience: text('experience'),
    rating: decimal('rating', { precision: 3, scale: 2 }).default('5.00'),
    certifications: jsonb('certifications').default([]),
    emailVerified: boolean('email_verified').default(false),
    verificationToken: text('verification_token'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Propostas de Trabalho (Invitations)
export const staffProposals = pgTable('staff_proposals', {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id').references(() => candidates.id).notNull(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    roleId: text('role_id').notNull(),
    roleName: text('role_name').notNull(),
    pay: text('pay').notNull(),
    status: text('status', { enum: ['pending', 'accepted', 'declined'] }).default('pending'),
    sentAt: timestamp('sent_at').defaultNow(),
    respondedAt: timestamp('responded_at'),
});

// --- NOVAS TABELAS PARA FEIRAS E PATROCÍNIO ---

// Tipos de Patrocínio (Por Organizador)
export const sponsorTypes = pgTable('sponsor_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    name: text('name').notNull(), // Ex: 'Cota Ouro', 'Cota Prata'
    description: text('description'),
    defaultValue: decimal('default_value', { precision: 10, scale: 2 }), // Valor sugerido
    createdAt: timestamp('created_at').defaultNow(),
});

// Patrocinadores
export const sponsors = pgTable('sponsors', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    sponsorTypeId: uuid('sponsor_type_id').references(() => sponsorTypes.id).notNull(),
    soldByStaffId: uuid('sold_by_staff_id').references(() => staff.id), // Vendedor
    companyName: text('company_name').notNull(),
    contactName: text('contact_name'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    document: text('document'), // CNPJ
    totalValue: decimal('total_value', { precision: 10, scale: 2 }).notNull(),
    installments: integer('installments').default(1),
    status: text('status', { enum: ['prospecting', 'negotiating', 'confirmed', 'delivered', 'cancelled'] }).default('prospecting'),
    contractUrl: text('contract_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Parcelas de Patrocínio
export const sponsorInstallments = pgTable('sponsor_installments', {
    id: uuid('id').primaryKey().defaultRandom(),
    sponsorId: uuid('sponsor_id').references(() => sponsors.id).notNull(),
    installmentNumber: integer('installment_number').notNull(),
    value: decimal('value', { precision: 10, scale: 2 }).notNull(),
    dueDate: timestamp('due_date').notNull(),
    paidDate: timestamp('paid_date'),
    status: text('status', { enum: ['pending', 'paid', 'overdue'] }).default('pending'),
    paymentMethod: text('payment_method'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Contrapartidas de Patrocínio
export const sponsorDeliverables = pgTable('sponsor_deliverables', {
    id: uuid('id').primaryKey().defaultRandom(),
    sponsorId: uuid('sponsor_id').references(() => sponsors.id).notNull(),
    description: text('description').notNull(),
    isCompleted: boolean('is_completed').default(false),
    completedAt: timestamp('completed_at'),
    evidenceUrl: text('evidence_url'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Categorias de Stands
export const standCategories = pgTable('stand_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    name: text('name').notNull(), // Ex: 'Ilha', 'Esquina'
    size: text('size'), // Ex: '3x3m'
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Stands
export const stands = pgTable('stands', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    categoryId: uuid('category_id').references(() => standCategories.id).notNull(),
    soldByStaffId: uuid('sold_by_staff_id').references(() => staff.id), // Vendedor
    identifier: text('identifier').notNull(), // Ex: 'A-01'
    exhibitorName: text('exhibitor_name'),
    exhibitorEmail: text('exhibitor_email'),
    exhibitorPhone: text('exhibitor_phone'),
    exhibitorDocument: text('exhibitor_document'),
    status: text('status', { enum: ['available', 'reserved', 'sold'] }).default('available'),
    reservedUntil: timestamp('reserved_until'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Visitantes (Credenciamento Público)
export const visitors = pgTable('visitors', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    document: text('document'), // CPF
    company: text('company'),
    role: text('role'),
    qrCodeData: text('qr_code_data').unique().notNull(),
    status: text('status', { enum: ['registered', 'confirmed', 'checked_in'] }).default('registered'),
    registeredAt: timestamp('registered_at').defaultNow(),
    checkedInAt: timestamp('checked_in_at'),
});

// --- NOVAS TABELAS PARA A2 TICKETS 360 (EXPOSITORES E IA) ---

// Equipe de Expositores (Contratados pelo Expositor que comprou o Stand)
export const exhibitorStaff = pgTable('exhibitor_staff', {
    id: uuid('id').primaryKey().defaultRandom(),
    standId: uuid('stand_id').references(() => stands.id).notNull(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['manager', 'staff'] }).default('staff'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// Logística de Expositores (Carga/Descarga)
export const exhibitorLogistics = pgTable('exhibitor_logistics', {
    id: uuid('id').primaryKey().defaultRandom(),
    standId: uuid('stand_id').references(() => stands.id).notNull(),
    type: text('type', { enum: ['load', 'unload'] }).notNull(),
    scheduledAt: timestamp('scheduled_at').notNull(),
    description: text('description'),
    status: text('status', { enum: ['pending', 'approved', 'rejected', 'completed'] }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Leads Capturados pelos Expositores
export const exhibitorLeads = pgTable('exhibitor_leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    standId: uuid('stand_id').references(() => stands.id).notNull(),
    capturedByStaffId: uuid('captured_by_staff_id').references(() => exhibitorStaff.id),
    visitorId: uuid('visitor_id').references(() => visitors.id),
    // Dados manuais se não for via QR Code
    name: text('name'),
    email: text('email'),
    phone: text('phone'),
    company: text('company'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Logs de Chat e Interação com IA (SupportBot)
export const aiChatLogs = pgTable('ai_chat_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'), // Referência opcional ao usuário logado
    sessionToken: text('session_token'),
    message: text('message').notNull(),
    response: text('response'),
    context: text('context'), // 'organizer', 'visitor', 'exhibitor'
    createdAt: timestamp('created_at').defaultNow(),
});

// Fila de Sincronização Offline (Para auditoria no servidor)
export const syncQueue = pgTable('sync_queue', {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceDeviceId: text('device_id'),
    payload: jsonb('payload').notNull(),
    status: text('status', { enum: ['pending', 'processed', 'failed'] }).default('pending'),
    error: text('error'),
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Páginas Legais (Privacidade, Termos, etc)
export const legalPages = pgTable('legal_pages', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique().notNull(), // 'privacy', 'terms'
    title: text('title').notNull(),
    content: text('content').notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// --- NOVAS TABELAS PARA ECOMMERCE DE PRODUTOS ---

// Categorias de Produtos
export const productCategories = pgTable('product_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Produtos
export const products = pgTable('products', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    categoryId: uuid('category_id').references(() => productCategories.id),
    name: text('name').notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
    imageUrl: text('image_url'), // Imagem principal
    images: jsonb('images').default([]), // Galeria
    status: text('status', { enum: ['active', 'inactive', 'draft'] }).default('active'),
    hasVariants: boolean('has_variants').default(false),
    deliveryOptions: jsonb('delivery_options').default({ pickup: true, shipping: false }),
    stockStrategy: text('stock_strategy', { enum: ['total', 'by_variant'] }).default('total'),
    totalStock: integer('total_stock').default(0),
    isFeatured: boolean('is_featured').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Variantes de Produtos (Tamanho/Cor/etc)
export const productVariants = pgTable('product_variants', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
    sku: text('sku'),
    name: text('name').notNull(), // Ex: 'Azul / P'
    attributes: jsonb('attributes').notNull(), // Ex: { color: 'Blue', size: 'P' }
    price: decimal('price', { precision: 10, scale: 2 }), // Sobrescreve o preço base se preenchido
    stock: integer('stock').default(0),
    isActive: boolean('is_active').default(true),
});

// Pedidos de Produtos
export const productOrders = pgTable('product_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    buyerId: uuid('buyer_id'), // ID do usuário se logado
    buyerName: text('buyer_name').notNull(),
    buyerEmail: text('buyer_email').notNull(),
    buyerPhone: text('buyer_phone'),
    totalValue: decimal('total_value', { precision: 10, scale: 2 }).notNull(),
    platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(), // 12%
    producerNet: decimal('producer_net', { precision: 10, scale: 2 }).notNull(), // 88%
    status: text('status', { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] }).default('pending'),
    paymentMethod: text('payment_method'),
    asaasPaymentId: text('asaas_payment_id'),
    shippingAddress: jsonb('shipping_address'),
    items: jsonb('items').notNull(), // Detalhes dos produtos comprados
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Posts de Redes Sociais / Portfólio do Organizador
export const organizerPosts = pgTable('organizer_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    caption: text('caption'),
    imageUrl: text('image_url').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// --- Relações (Drizzle Relations API) ---

export const organizersRelations = relations(organizers, ({ many }) => ({
    events: many(events),
    suppliers: many(suppliers),
    staff: many(staff),
    posts: many(organizerPosts),
    products: many(products),
    productOrders: many(productOrders),
}));

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
    organizer: one(organizers, {
        fields: [productCategories.organizerId],
        references: [organizers.id],
    }),
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    organizer: one(organizers, {
        fields: [products.organizerId],
        references: [organizers.id],
    }),
    category: one(productCategories, {
        fields: [products.categoryId],
        references: [productCategories.id],
    }),
    variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
    product: one(products, {
        fields: [productVariants.productId],
        references: [products.id],
    }),
}));

export const productOrdersRelations = relations(productOrders, ({ one }) => ({
    organizer: one(organizers, {
        fields: [productOrders.organizerId],
        references: [organizers.id],
    }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
    organizer: one(organizers, {
        fields: [events.organizerId],
        references: [organizers.id],
    }),
    tickets: many(tickets),
    sales: many(sales),
    proposals: many(staffProposals),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
    event: one(events, {
        fields: [tickets.eventId],
        references: [events.id],
    }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
    event: one(events, {
        fields: [sales.eventId],
        references: [events.id],
    }),
    checkins: many(checkins),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
    organizer: one(organizers, {
        fields: [staff.organizerId],
        references: [organizers.id],
    }),
    event: one(events, {
        fields: [staff.eventId],
        references: [events.id],
    }),
    checkins: many(checkins),
}));

export const checkinsRelations = relations(checkins, ({ one }) => ({
    sale: one(sales, {
        fields: [checkins.saleId],
        references: [sales.id],
    }),
    staff: one(staff, {
        fields: [checkins.staffId],
        references: [staff.id],
    }),
    event: one(events, {
        fields: [checkins.eventId],
        references: [events.id],
    }),
}));

export const candidatesRelations = relations(candidates, ({ many }) => ({
    proposals: many(staffProposals),
}));

export const staffProposalsRelations = relations(staffProposals, ({ one }) => ({
    candidate: one(candidates, {
        fields: [staffProposals.candidateId],
        references: [candidates.id],
    }),
    event: one(events, {
        fields: [staffProposals.eventId],
        references: [events.id],
    }),
    organizer: one(organizers, {
        fields: [staffProposals.organizerId],
        references: [organizers.id],
    }),
}));

export const sponsorTypesRelations = relations(sponsorTypes, ({ one, many }) => ({
    organizer: one(organizers, {
        fields: [sponsorTypes.organizerId],
        references: [organizers.id],
    }),
    sponsors: many(sponsors),
}));

export const sponsorsRelations = relations(sponsors, ({ one, many }) => ({
    event: one(events, {
        fields: [sponsors.eventId],
        references: [events.id],
    }),
    organizer: one(organizers, {
        fields: [sponsors.organizerId],
        references: [organizers.id],
    }),
    type: one(sponsorTypes, {
        fields: [sponsors.sponsorTypeId],
        references: [sponsorTypes.id],
    }),
    soldBy: one(staff, {
        fields: [sponsors.soldByStaffId],
        references: [staff.id],
    }),
    installments: many(sponsorInstallments),
    deliverables: many(sponsorDeliverables),
}));

export const sponsorInstallmentsRelations = relations(sponsorInstallments, ({ one }) => ({
    sponsor: one(sponsors, {
        fields: [sponsorInstallments.sponsorId],
        references: [sponsors.id],
    }),
}));

export const sponsorDeliverablesRelations = relations(sponsorDeliverables, ({ one }) => ({
    sponsor: one(sponsors, {
        fields: [sponsorDeliverables.sponsorId],
        references: [sponsors.id],
    }),
}));

export const standsRelations = relations(stands, ({ one, many }) => ({
    event: one(events, {
        fields: [stands.eventId],
        references: [events.id],
    }),
    organizer: one(organizers, {
        fields: [stands.organizerId],
        references: [organizers.id],
    }),
    category: one(standCategories, {
        fields: [stands.categoryId],
        references: [standCategories.id],
    }),
    soldBy: one(staff, {
        fields: [stands.soldByStaffId],
        references: [staff.id],
    }),
    exhibitorStaff: many(exhibitorStaff),
    logistics: many(exhibitorLogistics),
    leads: many(exhibitorLeads),
}));

export const exhibitorStaffRelations = relations(exhibitorStaff, ({ one, many }) => ({
    stand: one(stands, {
        fields: [exhibitorStaff.standId],
        references: [stands.id],
    }),
    leads: many(exhibitorLeads),
}));

export const exhibitorLogisticsRelations = relations(exhibitorLogistics, ({ one }) => ({
    stand: one(stands, {
        fields: [exhibitorLogistics.standId],
        references: [stands.id],
    }),
}));

export const exhibitorLeadsRelations = relations(exhibitorLeads, ({ one }) => ({
    stand: one(stands, {
        fields: [exhibitorLeads.standId],
        references: [stands.id],
    }),
    capturedBy: one(exhibitorStaff, {
        fields: [exhibitorLeads.capturedByStaffId],
        references: [exhibitorStaff.id],
    }),
    visitor: one(visitors, {
        fields: [exhibitorLeads.visitorId],
        references: [visitors.id],
    }),
}));

export const standCategoriesRelations = relations(standCategories, ({ one, many }) => ({
    event: one(events, {
        fields: [standCategories.eventId],
        references: [events.id],
    }),
    stands: many(stands),
}));

export const visitorsRelations = relations(visitors, ({ one, many }) => ({
    event: one(events, {
        fields: [visitors.eventId],
        references: [events.id],
    }),
    leads: many(exhibitorLeads),
}));

export const organizerPostsRelations = relations(organizerPosts, ({ one }) => ({
    organizer: one(organizers, {
        fields: [organizerPosts.organizerId],
        references: [organizers.id],
    }),
}));

// ============================================================================
// A2 COMMERCE ENGINE - PHASE 1
// ============================================================================

export const tenants = pgTable('tenants', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    document: text('document'),
    status: text('status').default('active'),
    settings: jsonb('settings'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const gateways = pgTable('gateways', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    provider: text('provider').notNull(),
    status: text('status').default('active'),
    configuration: jsonb('configuration'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const wallets = pgTable('wallets', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    ownerId: uuid('owner_id').notNull(),
    ownerType: text('owner_type').notNull(),
    gatewayId: uuid('gateway_id').references(() => gateways.id),
    gatewayWalletId: text('gateway_wallet_id'),
    gatewayAccountId: text('gateway_account_id'),
    label: text('label'),
    isDefault: boolean('is_default').default(true),
    isActive: boolean('is_active').default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const featureFlags = pgTable('feature_flags', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    key: text('key').unique().notNull(),
    enabled: boolean('enabled').default(false),
    rolloutPercentage: integer('rollout_percentage').default(100),
    description: text('description'),
    environment: text('environment').default('all'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    actorId: uuid('actor_id').notNull(),
    actorType: text('actor_type').notNull(),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    beforeSnapshot: jsonb('before_snapshot'),
    afterSnapshot: jsonb('after_snapshot'),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});

// A2 COMMERCE ENGINE - RELATIONS

export const tenantsRelations = relations(tenants, ({ many }) => ({
    wallets: many(wallets),
    featureFlags: many(featureFlags),
    auditLogs: many(auditLogs),
}));

export const gatewaysRelations = relations(gateways, ({ many }) => ({
    wallets: many(wallets),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
    tenant: one(tenants, {
        fields: [wallets.tenantId],
        references: [tenants.id],
    }),
    gateway: one(gateways, {
        fields: [wallets.gatewayId],
        references: [gateways.id],
    }),
}));

export const featureFlagsRelations = relations(featureFlags, ({ one }) => ({
    tenant: one(tenants, {
        fields: [featureFlags.tenantId],
        references: [tenants.id],
    }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    tenant: one(tenants, {
        fields: [auditLogs.tenantId],
        references: [tenants.id],
    }),
}));

// =============================================================================
// ESPORTE — Relações
// =============================================================================

export const sportRegistrationsRelations = relations(sportRegistrations, ({ one, many }) => ({
    event: one(events, {
        fields: [sportRegistrations.eventId],
        references: [events.id],
    }),
    ticket: one(tickets, {
        fields: [sportRegistrations.ticketId],
        references: [tickets.id],
    }),
    sale: one(sales, {
        fields: [sportRegistrations.saleId],
        references: [sales.id],
    }),
    purchasedTicket: one(purchasedTickets, {
        fields: [sportRegistrations.purchasedTicketId],
        references: [purchasedTickets.id],
    }),
    originalRegistration: one(sportRegistrations, {
        fields: [sportRegistrations.originalRegistrationId],
        references: [sportRegistrations.id],
        relationName: 'repechageOf',
    }),
    repechages: many(sportRegistrations, { relationName: 'repechageOf' }),
    players: many(sportRegistrationPlayers),
}));

export const sportRegistrationPlayersRelations = relations(sportRegistrationPlayers, ({ one }) => ({
    registration: one(sportRegistrations, {
        fields: [sportRegistrationPlayers.registrationId],
        references: [sportRegistrations.id],
    }),
}));
