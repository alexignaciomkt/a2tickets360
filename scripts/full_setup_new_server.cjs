/**
 * FULL SETUP SCRIPT - a2tickets360 New Server
 * CommonJS - No ESM imports needed
 * 
 * Creates the FULL Appwrite schema via REST API:
 * - Uses existing API Key (no login required)
 * - Creates database, collections, attributes, indexes, and buckets
 * 
 * Idempotent: safe to run multiple times (skips what already exists)
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

const BASE_URL = 'https://database.a2tickets360.com.br';
const ENDPOINT = `${BASE_URL}/v1`;
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';

// API Key already created in the Appwrite console
const API_KEY = '294fd8a1a0da59c01b0d5ba0c4a00ec3556595a865e3946482291b10753b60e1e8af89c5fd9bc8c7555a19af4305a392b2e8b997d4bdded151bb5594f94b1b148cd19ebf69fb445df272b9a103991205203e3d54bc67d9ca817248dca5ae627e8d975de833d9052199f94b95db5b1f842d45f65e4f87fcb0cd42142ebf4acf1c';

// ─── HTTP CLIENT ──────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function httpRequest(method, url, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const bodyStr = body ? JSON.stringify(body) : null;

        const options = {
            hostname: parsed.hostname,
            port: parsed.port || 443,
            path: parsed.pathname + parsed.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            rejectUnauthorized: false,
        };

        if (bodyStr) {
            options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }

        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const text = Buffer.concat(chunks).toString();
                let json;
                try { json = JSON.parse(text); } catch (e) { json = { message: text }; }
                resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: json });
            });
        });

        req.on('error', (e) => {
            console.error('\n  ❌ Network error:', e.code, e.message);
            reject(e);
        });

        req.setTimeout(20000, () => {
            req.destroy();
            reject(new Error('Request timeout after 20s'));
        });

        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

function getHeaders() {
    return {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
    };
}

async function apiRequest(method, path, body = null) {
    const url = `${ENDPOINT}${path}`;
    return httpRequest(method, url, body, getHeaders());
}

async function safeRequest(method, path, body = null) {
    try {
        const { ok, status, data } = await apiRequest(method, path, body);
        if (status === 409) {
            process.stdout.write(' [já existe]\n');
            return { alreadyExists: true };
        }
        if (!ok) {
            process.stdout.write(` [erro ${status}: ${data?.message}]\n`);
            return null;
        }
        process.stdout.write(' ✅\n');
        return data;
    } catch (err) {
        process.stdout.write(` [falha: ${err.message}]\n`);
        return null;
    }
}

// ─── PHASE 1: VERIFICAR CONEXÃO ─────────────────────────────────────────────

async function verifyConnection() {
    console.log('\n🔐 Fase 1: Verificando conexão e API Key...');
    const { ok, status, data } = await apiRequest('GET', '/databases');
    
    if (ok) {
        const dbs = data.databases || [];
        console.log(`  ✅ API Key válida! ${dbs.length} database(s) encontrado(s).`);
        dbs.forEach(db => console.log(`     - ${db.$id} (${db.name})`));
        return;
    }
    
    throw new Error(`API Key inválida ou sem permissão (${status}): ${data?.message}`);
}

// ─── PHASE 2: DATABASE ─────────────────────────────────────────────────────

async function createDatabase() {
    console.log('\n🗄️  Fase 2: Criando Database...');
    process.stdout.write(`  + ${DATABASE_ID}...`);
    const res = await safeRequest('POST', '/databases', {
        databaseId: DATABASE_ID,
        name: 'A2Tickets360-DB'
    });
    return res;
}

// ─── HELPERS DE COLLECTION ─────────────────────────────────────────────────

async function createCollection(id, name, permissions) {
    console.log(`\n📁 Coleção: ${name} (${id})`);
    process.stdout.write(`  Criando coleção...`);
    const res = await safeRequest('POST', `/databases/${DATABASE_ID}/collections`, {
        collectionId: id,
        name,
        permissions: permissions || [
            'read("any")', 'create("users")', 'update("users")', 'delete("users")'
        ],
        documentSecurity: false
    });

    return res;
}

async function attr(collectionId, type, body) {
    process.stdout.write(`    + ${body.key} (${type})...`);
    const res = await safeRequest(
        'POST',
        `/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${type}`,
        body
    );
    await sleep(200); // Appwrite needs time between attribute creations
    return res;
}

async function addIndex(collectionId, key, type, attributes) {
    process.stdout.write(`    📇 index: ${key}...`);
    const res = await safeRequest('POST',
        `/databases/${DATABASE_ID}/collections/${collectionId}/indexes`,
        { key, type, attributes }
    );
    await sleep(300);
    return res;
}

// ─── COLEÇÕES ─────────────────────────────────────────────────────────────

// 1. User Profiles (organizadores, staff, etc.)
async function setupUserProfiles() {
    await createCollection('user_profiles', 'User Profiles');
    await sleep(500);

    const strings = [
        { key: 'userId',           size: 255,  required: false },
        { key: 'role',             size: 255,  required: false },
        { key: 'status',           size: 255,  required: false, default: 'pending' },
        { key: 'name',             size: 500,  required: false },
        { key: 'phone',            size: 255,  required: false },
        { key: 'cpf',              size: 255,  required: false },
        { key: 'rg',               size: 255,  required: false },
        { key: 'birthDate',        size: 255,  required: false },
        { key: 'address',          size: 1000, required: false },
        { key: 'city',             size: 255,  required: false },
        { key: 'state',            size: 255,  required: false },
        { key: 'postalCode',       size: 255,  required: false },
        { key: 'companyName',      size: 500,  required: false },
        { key: 'cnpj',             size: 255,  required: false },
        { key: 'companyAddress',   size: 1000, required: false },
        { key: 'bio',              size: 5000, required: false },
        { key: 'slug',             size: 255,  required: false },
        { key: 'category',         size: 255,  required: false },
        { key: 'bannerUrl',        size: 2000, required: false },
        { key: 'logoUrl',          size: 2000, required: false },
        { key: 'photoUrl',         size: 2000, required: false },
        { key: 'documentFrontUrl', size: 2000, required: false },
        { key: 'documentBackUrl',  size: 2000, required: false },
        { key: 'instagramUrl',     size: 1000, required: false },
        { key: 'facebookUrl',      size: 1000, required: false },
        { key: 'whatsappNumber',   size: 255,  required: false },
        { key: 'websiteUrl',       size: 1000, required: false },
        { key: 'asaasId',          size: 255,  required: false },
        { key: 'asaasApiKey',      size: 1000, required: false },
        { key: 'walletId',         size: 255,  required: false },
        { key: 'verificationToken',size: 255,  required: false },
    ];
    for (const a of strings) await attr('user_profiles', 'string', a);

    const booleans = [
        { key: 'profileComplete', required: false, default: false },
        { key: 'emailVerified',   required: false, default: false },
        { key: 'isActive',        required: false, default: true },
    ];
    for (const a of booleans) await attr('user_profiles', 'boolean', a);

    await attr('user_profiles', 'integer', { key: 'lastStep', required: false, default: 1 });

    await sleep(1000);
    await addIndex('user_profiles', 'idx_userId', 'key',    ['userId']);
    await addIndex('user_profiles', 'idx_role',   'key',    ['role']);
    await addIndex('user_profiles', 'idx_slug',   'unique', ['slug']);
}

// 2. Events
async function setupEvents() {
    await createCollection('events', 'Events');
    await sleep(500);

    const strings = [
        { key: 'organizerId',        size: 255,   required: false },
        { key: 'title',              size: 500,   required: false },
        { key: 'description',        size: 15000, required: false },
        { key: 'category',           size: 255,   required: false },
        { key: 'eventType',          size: 255,   required: false, default: 'paid' },
        { key: 'date',               size: 255,   required: false },
        { key: 'time',               size: 255,   required: false },
        { key: 'endDate',            size: 255,   required: false },
        { key: 'endTime',            size: 255,   required: false },
        { key: 'duration',           size: 255,   required: false },
        { key: 'status',             size: 255,   required: false, default: 'draft' },
        { key: 'imageUrl',           size: 2000,  required: false },
        { key: 'floorPlanUrl',       size: 2000,  required: false },
        { key: 'locationName',       size: 500,   required: false },
        { key: 'locationAddress',    size: 1000,  required: false },
        { key: 'locationCity',       size: 255,   required: false },
        { key: 'locationState',      size: 255,   required: false },
        { key: 'locationPostalCode', size: 255,   required: false },
        { key: 'featuredPaymentStatus', size: 255, required: false, default: 'none' },
    ];
    for (const a of strings) await attr('events', 'string', a);

    await attr('events', 'integer', { key: 'capacity',      required: false, default: 0 });
    await attr('events', 'boolean', { key: 'isFeatured',    required: false, default: false });
    await attr('events', 'datetime', { key: 'featuredUntil', required: false });

    await sleep(1000);
    await addIndex('events', 'idx_organizerId', 'key', ['organizerId']);
    await addIndex('events', 'idx_status',      'key', ['status']);
    await addIndex('events', 'idx_category',    'key', ['category']);
    await addIndex('events', 'idx_date',        'key', ['date']);
}

// 3. Tickets (Lotes de ingressos)
async function setupTickets() {
    await createCollection('tickets', 'Tickets', [
        'read("any")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'eventId',     size: 255, required: false },
        { key: 'name',        size: 500, required: false },
        { key: 'description', size: 2000, required: false },
        { key: 'price',       size: 255, required: false }, // stored as string decimal
        { key: 'batch',       size: 255, required: false },
        { key: 'category',    size: 255, required: false, default: 'standard' },
    ];
    for (const a of strings) await attr('tickets', 'string', a);

    await attr('tickets', 'integer', { key: 'quantity',  required: false, default: 0 });
    await attr('tickets', 'integer', { key: 'remaining', required: false, default: 0 });
    await attr('tickets', 'boolean', { key: 'isActive',  required: false, default: true });

    await sleep(1000);
    await addIndex('tickets', 'idx_eventId', 'key', ['eventId']);
}

// 4. Sales (Vendas/Transações)
async function setupSales() {
    await createCollection('sales', 'Sales', [
        'read("users")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'eventId',       size: 255, required: false },
        { key: 'ticketId',      size: 255, required: false },
        { key: 'buyerName',     size: 500, required: false },
        { key: 'buyerEmail',    size: 500, required: false },
        { key: 'buyerPhone',    size: 255, required: false },
        { key: 'totalPrice',    size: 255, required: false },
        { key: 'paymentStatus', size: 255, required: false, default: 'pending' },
        { key: 'paymentMethod', size: 255, required: false },
        { key: 'asaasPaymentId',size: 255, required: false },
        { key: 'qrCodeData',    size: 2000,required: false },
    ];
    for (const a of strings) await attr('sales', 'string', a);

    await attr('sales', 'integer', { key: 'quantity', required: false, default: 1 });

    await sleep(1000);
    await addIndex('sales', 'idx_eventId',    'key',    ['eventId']);
    await addIndex('sales', 'idx_buyerEmail', 'key',    ['buyerEmail']);
    await addIndex('sales', 'idx_qrCode',     'unique', ['qrCodeData']);
    await addIndex('sales', 'idx_asaasId',    'key',    ['asaasPaymentId']);
}

// 5. Staff (Equipe dos organizadores)
async function setupStaff() {
    await createCollection('staff', 'Staff', [
        'read("users")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'organizerId',    size: 255, required: false },
        { key: 'eventId',        size: 255, required: false },
        { key: 'name',           size: 500, required: false },
        { key: 'email',          size: 500, required: false },
        { key: 'passwordHash',   size: 1000,required: false },
        { key: 'photoUrl',       size: 2000,required: false },
        { key: 'roleId',         size: 255, required: false },
        { key: 'eventFunction',  size: 255, required: false },
    ];
    for (const a of strings) await attr('staff', 'string', a);

    await attr('staff', 'boolean',  { key: 'isActive',  required: false, default: true });
    await attr('staff', 'datetime', { key: 'lastLogin', required: false });

    await sleep(1000);
    await addIndex('staff', 'idx_organizerId', 'key',    ['organizerId']);
    await addIndex('staff', 'idx_email',       'unique', ['email']);
}

// 6. Checkins (Validação de ingressos)
async function setupCheckins() {
    await createCollection('checkins', 'Checkins', [
        'read("users")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'saleId',   size: 255, required: false },
        { key: 'staffId',  size: 255, required: false },
        { key: 'eventId',  size: 255, required: false },
    ];
    for (const a of strings) await attr('checkins', 'string', a);
    await attr('checkins', 'datetime', { key: 'checkInTime', required: false });

    await sleep(1000);
    await addIndex('checkins', 'idx_eventId', 'key', ['eventId']);
    await addIndex('checkins', 'idx_saleId',  'key', ['saleId']);
}

// 7. Suppliers (Fornecedores)
async function setupSuppliers() {
    await createCollection('suppliers', 'Suppliers');
    await sleep(500);

    const strings = [
        { key: 'organizerId',  size: 255, required: false },
        { key: 'name',         size: 500, required: false },
        { key: 'email',        size: 500, required: false },
        { key: 'phone',        size: 255, required: false },
        { key: 'category',     size: 255, required: false },
        { key: 'document',     size: 255, required: false },
        { key: 'address',      size: 1000,required: false },
        { key: 'contactName',  size: 500, required: false },
        { key: 'contactPhone', size: 255, required: false },
        { key: 'status',       size: 255, required: false, default: 'active' },
    ];
    for (const a of strings) await attr('suppliers', 'string', a);

    await sleep(1000);
    await addIndex('suppliers', 'idx_organizerId', 'key', ['organizerId']);
}

// 8. Sponsors (Patrocinadores)
async function setupSponsors() {
    await createCollection('sponsors', 'Sponsors');
    await sleep(500);

    const strings = [
        { key: 'eventId',      size: 255,  required: false },
        { key: 'organizerId',  size: 255,  required: false },
        { key: 'companyName',  size: 500,  required: false },
        { key: 'contactName',  size: 500,  required: false },
        { key: 'contactEmail', size: 500,  required: false },
        { key: 'contactPhone', size: 255,  required: false },
        { key: 'document',     size: 255,  required: false },
        { key: 'totalValue',   size: 255,  required: false },
        { key: 'status',       size: 255,  required: false, default: 'prospecting' },
        { key: 'contractUrl',  size: 2000, required: false },
        { key: 'notes',        size: 5000, required: false },
        { key: 'typeName',     size: 255,  required: false },
    ];
    for (const a of strings) await attr('sponsors', 'string', a);

    await attr('sponsors', 'integer', { key: 'installments', required: false, default: 1 });

    await sleep(1000);
    await addIndex('sponsors', 'idx_eventId', 'key', ['eventId']);
}

// 9. Stands (Estandes)
async function setupStands() {
    await createCollection('stands', 'Stands');
    await sleep(500);

    const strings = [
        { key: 'eventId',          size: 255, required: false },
        { key: 'organizerId',      size: 255, required: false },
        { key: 'categoryName',     size: 255, required: false },
        { key: 'categorySize',     size: 255, required: false },
        { key: 'categoryPrice',    size: 255, required: false },
        { key: 'identifier',       size: 255, required: false },
        { key: 'exhibitorName',    size: 500, required: false },
        { key: 'exhibitorEmail',   size: 500, required: false },
        { key: 'exhibitorPhone',   size: 255, required: false },
        { key: 'exhibitorDocument',size: 255, required: false },
        { key: 'status',           size: 255, required: false, default: 'available' },
        { key: 'notes',            size: 2000,required: false },
    ];
    for (const a of strings) await attr('stands', 'string', a);

    await sleep(1000);
    await addIndex('stands', 'idx_eventId', 'key', ['eventId']);
    await addIndex('stands', 'idx_status',  'key', ['status']);
}

// 10. Visitors (Visitantes registrados)
async function setupVisitors() {
    await createCollection('visitors', 'Visitors', [
        'read("any")', 'create("any")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'eventId',    size: 255,  required: false },
        { key: 'name',       size: 500,  required: false },
        { key: 'email',      size: 500,  required: false },
        { key: 'phone',      size: 255,  required: false },
        { key: 'document',   size: 255,  required: false },
        { key: 'company',    size: 500,  required: false },
        { key: 'role',       size: 255,  required: false },
        { key: 'qrCodeData', size: 2000, required: false },
        { key: 'status',     size: 255,  required: false, default: 'registered' },
    ];
    for (const a of strings) await attr('visitors', 'string', a);

    await attr('visitors', 'datetime', { key: 'checkedInAt', required: false });

    await sleep(1000);
    await addIndex('visitors', 'idx_eventId', 'key',    ['eventId']);
    await addIndex('visitors', 'idx_email',   'key',    ['email']);
    await addIndex('visitors', 'idx_qrCode',  'unique', ['qrCodeData']);
}

// 11. Legal Pages (Termos, Privacidade)
async function setupLegalPages() {
    await createCollection('legal_pages', 'Legal Pages', [
        'read("any")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'slug',    size: 255,   required: false },
        { key: 'title',   size: 500,   required: false },
        { key: 'content', size: 100000,required: false },
    ];
    for (const a of strings) await attr('legal_pages', 'string', a);

    await sleep(1000);
    await addIndex('legal_pages', 'idx_slug', 'unique', ['slug']);
}

// 12. Organizer Posts (Feed do organizador)
async function setupOrganizerPosts() {
    await createCollection('organizer_posts', 'Organizer Posts', [
        'read("any")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'organizerId', size: 255,  required: false },
        { key: 'imageUrl',    size: 2000, required: false },
        { key: 'caption',     size: 5000, required: false },
    ];
    for (const a of strings) await attr('organizer_posts', 'string', a);

    await sleep(1000);
    await addIndex('organizer_posts', 'idx_organizerId', 'key', ['organizerId']);
}

// 13. Admins
async function setupAdmins() {
    await createCollection('admins', 'Admins', [
        'read("users")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'name',         size: 500,  required: false },
        { key: 'email',        size: 500,  required: false },
        { key: 'passwordHash', size: 1000, required: false },
        { key: 'role',         size: 255,  required: false, default: 'admin' },
    ];
    for (const a of strings) await attr('admins', 'string', a);

    await sleep(1000);
    await addIndex('admins', 'idx_email', 'unique', ['email']);
}

// 14. Event Categories
async function setupEventCategories() {
    await createCollection('event_categories', 'Event Categories', [
        'read("any")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    await sleep(500);

    const strings = [
        { key: 'name', size: 255, required: false },
        { key: 'icon', size: 255, required: false },
    ];
    for (const a of strings) await attr('event_categories', 'string', a);

    await sleep(1000);
    await addIndex('event_categories', 'idx_name', 'unique', ['name']);
}

// ─── STORAGE BUCKETS ─────────────────────────────────────────────────────────

async function setupBuckets() {
    console.log('\n🪣  Fase 5: Criando Storage Buckets...');
    const buckets = [
        {
            bucketId: 'media', name: 'Media',
            permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
            fileSecurity: true, enabled: true, maximumFileSize: 30000000,
            allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4'],
            encryption: false, antivirus: false
        },
        {
            bucketId: 'tickets-qr', name: 'Tickets QR',
            permissions: ['read("users")', 'create("users")', 'update("users")'],
            fileSecurity: true, enabled: true, maximumFileSize: 5000000,
            allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
            encryption: false, antivirus: false
        },
        {
            bucketId: 'documents', name: 'Documents',
            permissions: ['read("users")', 'create("users")', 'update("users")'],
            fileSecurity: true, enabled: true, maximumFileSize: 10000000,
            allowedFileExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
            encryption: false, antivirus: false
        }
    ];

    for (const bucket of buckets) {
        process.stdout.write(`  + ${bucket.name} (${bucket.bucketId})...`);
        await safeRequest('POST', '/storage/buckets', bucket);
    }
}

// ─── GERAR .env ──────────────────────────────────────────────────────────────

function generateEnvFile() {
    console.log('\n📝 Fase 6: Gerando arquivo .env.appwrite...');
    const fs = require('fs');
    const content = `# ──────────────────────────────────────────────────────
# a2tickets360 - Appwrite Environment Variables
# Generated automatically - ${new Date().toISOString()}
# ──────────────────────────────────────────────────────

VITE_APPWRITE_ENDPOINT=https://database.a2tickets360.com.br/v1
VITE_APPWRITE_PROJECT_ID=${PROJECT_ID}
VITE_APPWRITE_DATABASE_ID=${DATABASE_ID}

# Storage Buckets
VITE_APPWRITE_BUCKET_MEDIA=media
VITE_APPWRITE_BUCKET_TICKETS_QR=tickets-qr
VITE_APPWRITE_BUCKET_DOCUMENTS=documents

# Collections
VITE_COLLECTION_ADMINS=admins
VITE_COLLECTION_USER_PROFILES=user_profiles
VITE_COLLECTION_EVENTS=events
VITE_COLLECTION_TICKETS=tickets
VITE_COLLECTION_SALES=sales
VITE_COLLECTION_STAFF=staff
VITE_COLLECTION_CHECKINS=checkins
VITE_COLLECTION_SUPPLIERS=suppliers
VITE_COLLECTION_SPONSORS=sponsors
VITE_COLLECTION_STANDS=stands
VITE_COLLECTION_VISITORS=visitors
VITE_COLLECTION_LEGAL_PAGES=legal_pages
VITE_COLLECTION_ORGANIZER_POSTS=organizer_posts
VITE_COLLECTION_EVENT_CATEGORIES=event_categories

# API Key (server-side ONLY - never expose to frontend!)
APPWRITE_API_KEY=${API_KEY}
`;
    fs.writeFileSync('.env.appwrite', content);
    console.log('  ✅ .env.appwrite criado!');
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀 ==============================================');
    console.log('    a2tickets360 - Full Appwrite Setup Script  ');
    console.log('    Servidor: database.a2tickets360.com.br     ');
    console.log('================================================\n');

    try {
        await verifyConnection();
        await createDatabase();

        console.log('\n📊 Fase 3-4: Criando Coleções e Atributos...');
        await setupAdmins();
        await setupUserProfiles();
        await setupEventCategories();
        await setupEvents();
        await setupTickets();
        await setupSales();
        await setupStaff();
        await setupCheckins();
        await setupSuppliers();
        await setupSponsors();
        await setupStands();
        await setupVisitors();
        await setupLegalPages();
        await setupOrganizerPosts();

        await setupBuckets();
        generateEnvFile();

        console.log('\n\n✅ ==============================================');
        console.log('    SETUP CONCLUÍDO COM SUCESSO! 🎉           ');
        console.log('================================================');
        console.log('\n📄 Próximos passos:');
        console.log('  1. Copie .env.appwrite para o .env do frontend');
        console.log('  2. Atualize o endpoint no src/lib/appwrite-config.ts');
        console.log('  3. Rode npm run dev para testar\n');

    } catch (err) {
        console.error('\n\n❌ ERRO FATAL:', err.message);
        console.error('\n💡 Dica: Verifique se o Appwrite está acessível em:');
        console.error(`   ${BASE_URL}`);
        process.exit(1);
    }
}

main();
