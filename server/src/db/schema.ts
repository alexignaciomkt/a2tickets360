import { pgTable, text, timestamp, serial, integer, boolean, decimal, jsonb, uuid, index, AnyPgColumn, unique, primaryKey, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Platform Masters (Contexto Global)
export const platformMasters = pgTable('platform_masters', {
    userId: uuid('user_id').primaryKey(), // FK to auth.users.id
    status: text('status').default('active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Perfis de UsuÃ¡rios (ExtensÃ£o Universal do auth.users)
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').unique().notNull(), // FK to auth.users.id
    name: text('name').notNull(),
    email: text('email').notNull(),
    role: text('role').default('customer'),
    status: text('status').default('pending'),
    profileComplete: boolean('profile_complete').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Organizadores (Donos dos Eventos / Tenants)
export const organizers = pgTable('organizer_details', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').unique().notNull(), // FK to auth.users.id (Tenant ID Real)
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
    watermarkUrl: text('watermark_url'),
    watermarkObjectKey: text('watermark_object_key'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// FuncionÃ¡rios (Employees) - VÃ­nculo Pessoa -> Produtora
export const employees = pgTable('employees', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(), // FK to auth.users.id (ou profiles.user_id)
    organizerId: uuid('organizer_id').notNull(), // FK to organizer_details.user_id / auth.users.id
    credentialPhotoUrl: text('credential_photo_url'),
    status: text('status', { enum: ['active', 'suspended', 'pending'] }).notNull().default('active'),
    accessScope: text('access_scope', { enum: ['ALL_EVENTS', 'SELECTED_EVENTS'] }).notNull().default('ALL_EVENTS'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    unqMembership: unique('unq_employee_membership').on(t.userId, t.organizerId)
}));

// Acesso EspecÃ­fico a Eventos (para SELECTED_EVENTS)
export const employeeEventAccess = pgTable('employee_event_access', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
    eventId: uuid('event_id').notNull(), // Referencia events.id
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    unqAccess: unique('unq_employee_event_access').on(t.employeeId, t.eventId)
}));

// =============================================================================
// RBAC (ROLES & PERMISSIONS)
// =============================================================================

// CatÃ¡logo Global de Roles
export const roles = pgTable('roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    systemKey: text('system_key').unique().notNull(), // Ex: 'CHECKIN_OPERATOR'
    displayName: text('display_name').notNull(), // Ex: 'Operador de Check-in'
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// CatÃ¡logo Global de PermissÃµes
export const permissions = pgTable('permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    systemKey: text('system_key').unique().notNull(), // Ex: 'checkin.scan'
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
});

// PermissÃµes PadrÃ£o das Roles
export const rolePermissions = pgTable('role_permissions', {
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] })
}));

// AtribuiÃ§Ã£o de Roles aos FuncionÃ¡rios
export const employeeRoles = pgTable('employee_roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    unqEmployeeRole: unique('unq_employee_role').on(t.employeeId, t.roleId)
}));

// ExceÃ§Ãµes de PermissÃ£o por FuncionÃ¡rio (Overrides)
export const employeePermissionOverrides = pgTable('employee_permission_overrides', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
    permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
    overrideType: text('override_type', { enum: ['GRANT', 'DENY'] }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    unqEmployeePermission: unique('unq_employee_permission').on(t.employeeId, t.permissionId)
}));

// =============================================================================
// STAFF PROFILE & EVENT STAFF (FASE 4)
// =============================================================================

// RG Profissional do Staff
export const staffProfiles = pgTable('staff_profiles', {
    userId: uuid('user_id').primaryKey(), // Referencia auth.users(id)
    fullName: text('full_name').notNull(),
    document: text('document'), // CPF/RG (Opcional nesta versÃ£o)
    phone: text('phone'),
    bio: text('bio'),
    avatarUrl: text('avatar_url'), // Selfie persistente do credenciamento
    isPublic: boolean('is_public').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// FunÃ§Ãµes Operacionais CustomizÃ¡veis
export const staffFunctions = pgTable('staff_functions', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').notNull(), // Referencia auth.users(id) da realidade atual
    name: text('name').notNull(),
    description: text('description'),
    defaultSystemRoleId: uuid('default_system_role_id').references(() => roles.id, { onDelete: 'set null' }), // SugestÃ£o
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// VÃ­nculo Event Staff e Convites
export const eventStaff = pgTable('event_staff', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').notNull(), // Identidade
    organizerId: uuid('organizer_id').notNull(), // Contexto Cross-Tenant
    staffFunctionId: uuid('staff_function_id').references(() => staffFunctions.id, { onDelete: 'set null' }),
    status: text('status', { enum: ['PENDING_PROFILE', 'PENDING_ACCEPTANCE', 'ACTIVE', 'DECLINED', 'CANCELLED', 'COMPLETED'] }).notNull().default('PENDING_PROFILE'),
    shiftStart: timestamp('shift_start'),
    shiftEnd: timestamp('shift_end'),
    invitedBy: uuid('invited_by'), // Quem convidou
    invitedAt: timestamp('invited_at').defaultNow(),
    acceptedAt: timestamp('accepted_at'),
    declinedAt: timestamp('declined_at'),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    unqEventStaff: unique('unq_event_staff').on(t.eventId, t.userId)
}));

// AtribuiÃ§Ã£o de Roles para Event Staff
export const eventStaffRoles = pgTable('event_staff_roles', {
    eventStaffId: uuid('event_staff_id').references(() => eventStaff.id, { onDelete: 'cascade' }).notNull(),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    pk: primaryKey({ columns: [t.eventStaffId, t.roleId] })
}));

// Overrides de PermissÃ£o para Event Staff
export const eventStaffPermissionOverrides = pgTable('event_staff_permission_overrides', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventStaffId: uuid('event_staff_id').references(() => eventStaff.id, { onDelete: 'cascade' }).notNull(),
    permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
    overrideType: text('override_type', { enum: ['GRANT', 'DENY'] }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    unqEventStaffPermission: unique('unq_event_staff_permission').on(t.eventStaffId, t.permissionId)
}));

// =============================================================================
// CREDENCIAIS, SELFIE E PRESENÃ‡A (FASE 5)
// =============================================================================

// Credencial TemporÃ¡ria de Staff
export const staffCredentials = pgTable('staff_credentials', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventStaffId: uuid('event_staff_id').references(() => eventStaff.id, { onDelete: 'cascade' }).notNull(),
    credentialToken: text('credential_token').unique().notNull(), // Secure random token
    status: text('status', { enum: ['ACTIVE', 'REVOKED'] }).default('ACTIVE').notNull(),
    issuedAt: timestamp('issued_at').defaultNow(),
    revokedAt: timestamp('revoked_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Credencial Permanente de Employee
export const employeeCredentials = pgTable('employee_credentials', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
    credentialToken: text('credential_token').unique().notNull(),
    status: text('status', { enum: ['ACTIVE', 'REVOKED'] }).default('ACTIVE').notNull(),
    issuedAt: timestamp('issued_at').defaultNow(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Registro Operacional de PresenÃ§a (Attendance)
export const staffAttendance = pgTable('staff_attendance', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventStaffId: uuid('event_staff_id').references(() => eventStaff.id, { onDelete: 'cascade' }),
    employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    checkedInAt: timestamp('checked_in_at').defaultNow().notNull(),
    checkedInBy: uuid('checked_in_by').references(() => platformMasters.userId), // Quem conferiu e confirmou (auth.users)
    credentialId: text('credential_id').notNull(), // Pode ser staff_credentials.id ou employee_credentials.id
    createdAt: timestamp('created_at').defaultNow(),
});


// Categorias de Eventos (Banco Global Colaborativo)
export const eventCategories = pgTable('event_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(),
    code: text('code').unique(), // CÃ³digo tÃ©cnico estÃ¡tico (ex: SPORT_TRUCO)
    icon: text('icon'), // Nome do Ã­cone Lucide (ex: 'Briefcase')
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

// Vendas e TransaÃ§Ãµes
export const sales = pgTable('sales', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    customerId: uuid('customer_id'),
    buyerInfo: jsonb('buyer_info'),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'refunded', 'cancelled'] }).default('pending'),
    paymentMethod: text('payment_method'), // PIX, CREDIT_CARD, BOLETO
    asaasId: text('asaas_id'),
    asaasPaymentId: text('asaas_payment_id'), // ID da cobranÃ§a no Asaas
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

// Logs de Check-in (Auditoria Fase 6)
export const ticketCheckinLogs = pgTable('ticket_checkin_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    purchasedTicketId: uuid('purchased_ticket_id').references(() => purchasedTickets.id).notNull(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    operatorId: uuid('operator_id').notNull(), // Quem operou (User ID)
    action: text('action', { enum: ['CHECK_IN', 'UNDO'] }).notNull(),
    reason: text('reason'), // Opcional para CHECK_IN, obrigatÃ³rio para UNDO
    deviceInfo: jsonb('device_info'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// ESPORTE â€” InscriÃ§Ãµes Esportivas (REGISTRATION e REPECHAGE)
// =============================================================================

// Unidade competitiva: 1 registro = 1 dupla / 1 indivÃ­duo / 1 time
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
    // Para REPECHAGE: aponta para a inscriÃ§Ã£o original
    originalRegistrationId: uuid('original_registration_id').references((): AnyPgColumn => sportRegistrations.id),
    // Contagem de repescagens pagas ligadas a esta inscriÃ§Ã£o (incrementado idempotentemente)
    repechageCount: integer('repechage_count').notNull().default(0),
    status: text('status').notNull().default('pending'), // pending | paid | cancelled | refunded
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    eventIdx: index('idx_sr_event_id').on(t.eventId),
    originalIdx: index('idx_sr_original').on(t.originalRegistrationId),
    statusIdx: index('idx_sr_status').on(t.status),
}));

// Jogadores de cada inscriÃ§Ã£o esportiva
export const sportRegistrationPlayers = pgTable('sport_registration_players', {
    id: uuid('id').primaryKey().defaultRandom(),
    registrationId: uuid('registration_id').references(() => sportRegistrations.id, { onDelete: 'cascade' }).notNull(),
    playerOrder: integer('player_order').notNull(), // 1, 2, ...
    name: text('name').notNull(),
    cpf: text('cpf').notNull(), // somente dÃ­gitos, normalizado server-side
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

// Check-ins (ValidaÃ§Ã£o de Ingressos)
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
    name: text('name').unique().notNull(), // Nome Ãºnico (ex: 'Papel Toalha', 'SonorizaÃ§Ã£o')
    icon: text('icon'), // Nome do Ã­cone da Lucide (opcional)
    createdAt: timestamp('created_at').defaultNow(),
});

// Fornecedores
export const suppliers = pgTable('suppliers', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    categoryId: uuid('category_id').references(() => supplierCategories.id), // ReferÃªncia Ã  categoria global
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    category: text('category'), // Mantido para compatibilidade ou texto livre secundÃ¡rio
    document: text('document'), // CNPJ/CPF
    address: text('address'), // EndereÃ§o completo
    contactName: text('contact_name'), // Nome do responsÃ¡vel/contato
    contactPhone: text('contact_phone'), // Telefone do responsÃ¡vel
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

// CotaÃ§Ãµes (OrÃ§amentos)
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

// Respostas de CotaÃ§Ãµes
export const quoteResponses = pgTable('quote_responses', {
    id: uuid('id').primaryKey().defaultRandom(),
    quoteId: uuid('quote_id').references(() => quotes.id).notNull(),
    supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
    value: decimal('value', { precision: 10, scale: 2 }),
    fileUrl: text('file_url'), // PDF do orÃ§amento
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

// --- NOVAS TABELAS PARA FEIRAS E PATROCÃNIO ---

// Tipos de PatrocÃ­nio (Por Organizador)
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

// Parcelas de PatrocÃ­nio
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

// Contrapartidas de PatrocÃ­nio
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

// Visitantes (Credenciamento PÃºblico)
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

// LogÃ­stica de Expositores (Carga/Descarga)
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
    // Dados manuais se nÃ£o for via QR Code
    name: text('name'),
    email: text('email'),
    phone: text('phone'),
    company: text('company'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Logs de Chat e InteraÃ§Ã£o com IA (SupportBot)
export const aiChatLogs = pgTable('ai_chat_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'), // ReferÃªncia opcional ao usuÃ¡rio logado
    sessionToken: text('session_token'),
    message: text('message').notNull(),
    response: text('response'),
    context: text('context'), // 'organizer', 'visitor', 'exhibitor'
    createdAt: timestamp('created_at').defaultNow(),
});

// Fila de SincronizaÃ§Ã£o Offline (Para auditoria no servidor)
export const syncQueue = pgTable('sync_queue', {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceDeviceId: text('device_id'),
    payload: jsonb('payload').notNull(),
    status: text('status', { enum: ['pending', 'processed', 'failed'] }).default('pending'),
    error: text('error'),
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// PÃ¡ginas Legais (Privacidade, Termos, etc)
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
    price: decimal('price', { precision: 10, scale: 2 }), // Sobrescreve o preÃ§o base se preenchido
    stock: integer('stock').default(0),
    isActive: boolean('is_active').default(true),
});

// Pedidos de Produtos
export const productOrders = pgTable('product_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    buyerId: uuid('buyer_id'), // ID do usuÃ¡rio se logado
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

// Posts de Redes Sociais / PortfÃ³lio do Organizador
export const organizerPosts = pgTable('organizer_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id).notNull(),
    caption: text('caption'),
    imageUrl: text('image_url').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// --- RelaÃ§Ãµes (Drizzle Relations API) ---

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
// ESPORTE â€” RelaÃ§Ãµes
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

// =============================================================================
// ÁLBUNS DA PRODUTORA
// =============================================================================

export const producerAlbumStatusEnum = pgEnum('producer_album_status', ['DRAFT', 'PUBLISHED', 'HIDDEN']);

export const producerAlbums = pgTable('producer_albums', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id').references(() => organizers.id, { onDelete: 'cascade' }).notNull(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 100 }).notNull(),
    description: varchar('description', { length: 150 }),
    coverPhotoId: uuid('cover_photo_id').references((): AnyPgColumn => producerAlbumPhotos.id, { onDelete: 'set null' }),
    status: producerAlbumStatusEnum('status').default('DRAFT').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    eventDate: timestamp('event_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    organizerStatusSortIdx: index('idx_producer_albums_org_stat_sort').on(table.organizerId, table.status, table.sortOrder),
    eventIdx: index('idx_producer_albums_event').on(table.eventId),
}));

export const producerAlbumPhotos = pgTable('producer_album_photos', {
    id: uuid('id').primaryKey().defaultRandom(),
    albumId: uuid('album_id').references(() => producerAlbums.id, { onDelete: 'cascade' }).notNull(),
    imageUrl: text('image_url').notNull(),
    objectKey: text('object_key').notNull(),
    caption: varchar('caption', { length: 150 }),
    sortOrder: integer('sort_order').default(0).notNull(),
    producerWatermarkUrl: text('producer_watermark_url'),
    producerWatermarkObjectKey: text('producer_watermark_object_key'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    albumSortIdx: index('idx_producer_photos_album_sort').on(table.albumId, table.sortOrder),
    objectKeyUnq: unique('unq_producer_photos_object_key').on(table.objectKey),
}));

export const producerAlbumsRelations = relations(producerAlbums, ({ one, many }) => ({
    organizer: one(organizers, {
        fields: [producerAlbums.organizerId],
        references: [organizers.id],
    }),
    event: one(events, {
        fields: [producerAlbums.eventId],
        references: [events.id],
    }),
    coverPhoto: one(producerAlbumPhotos, {
        fields: [producerAlbums.coverPhotoId],
        references: [producerAlbumPhotos.id],
    }),
    photos: many(producerAlbumPhotos),
}));

export const producerAlbumPhotosRelations = relations(producerAlbumPhotos, ({ one }) => ({
    album: one(producerAlbums, {
        fields: [producerAlbumPhotos.albumId],
        references: [producerAlbums.id],
    }),
}));



