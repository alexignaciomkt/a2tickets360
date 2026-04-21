/**
 * FULL SETUP SCRIPT - a2tickets360 New Server
 * CommonJS - No ESM imports needed
 * 
 * Cria TODO o schema do Appwrite via API REST:
 * - Autentica como admin do console
 * - Cria API Key com todos os escopos
 * - Cria database, coleções, atributos, índices e buckets
 * 
 * Idempotente: seguro rodar múltiplas vezes (pula o que já existe)
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const https = require('https');

const BASE_URL = 'https://database.a2tickets360.com.br';
const ENDPOINT = `${BASE_URL}/v1`;
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';
const ADMIN_EMAIL = 'a2tickets360@gmail.com';
const ADMIN_PASSWORD = 'Tickets010203#2026';

let SESSION_COOKIE = '';
let API_KEY = '';

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
                // Capture session cookie
                const setCookie = res.headers['set-cookie'];
                if (setCookie) {
                    const cookieParts = setCookie.map(c => c.split(';')[0]);
                    SESSION_COOKIE = cookieParts.join('; ');
                }

                let json;
                try { json = JSON.parse(text); } catch (e) { json = { message: text }; }

                resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: json });
            });
        });

        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

function getHeaders(useApiKey = false) {
    const headers = { 'X-Appwrite-Project': PROJECT_ID };
    if (useApiKey && API_KEY) {
        headers['X-Appwrite-Key'] = API_KEY;
    } else if (SESSION_COOKIE) {
        headers['Cookie'] = SESSION_COOKIE;
        headers['X-Appwrite-Project'] = PROJECT_ID;
    }
    return headers;
}

async function apiRequest(method, path, body = null, useApiKey = false) {
    const url = `${ENDPOINT}${path}`;
    return httpRequest(method, url, body, getHeaders(useApiKey));
}

async function safeRequest(method, path, body = null, useApiKey = false) {
    const { ok, status, data } = await apiRequest(method, path, body, useApiKey);
    if (status === 409) {
        process.stdout.write(' [já existe]\n');
        return { alreadyExists: true };
    }
    if (!ok) {
        process.stdout.write(` [erro ${status}: ${data?.message}]\n`);
        return null;
    }
    return data;
}

// ─── PHASE 1: AUTENTICAÇÃO ─────────────────────────────────────────────────────

async function authenticate() {
    console.log('\n🔐 Fase 1: Autenticando no console...');
    
    // Appwrite console login endpoint
    const { ok, status, data } = await httpRequest('POST', `${ENDPOINT}/account/sessions/email`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    }, { 'X-Appwrite-Project': PROJECT_ID });

    if (ok) {
        console.log(`  ✅ Logado como: ${data.userId || ADMIN_EMAIL}`);
        return;
    }
    
    // Try console-specific auth
    console.log(`  ⚠️  Account auth: ${status} - ${data?.message}`);
    console.log('  🔄 Tentando autenticação de console...');
    
    const { ok: ok2, status: s2, data: d2 } = await httpRequest('POST', `${BASE_URL}/console/account/sessions/email`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    }, { 'X-Appwrite-Project': 'console' });

    if (ok2) {
        console.log(`  ✅ Console auth OK`);
        return;
    }
    
    throw new Error(`Auth falhou (${s2}): ${d2?.message}`);
}

async function createApiKey() {
    console.log('\n🔑 Criando API Key com todos os escopos...');
    const allScopes = [
        'sessions.write', 'users.read', 'users.write',
        'teams.read', 'teams.write',
        'databases.read', 'databases.write',
        'collections.read', 'collections.write',
        'attributes.read', 'attributes.write',
        'indexes.read', 'indexes.write',
        'documents.read', 'documents.write',
        'files.read', 'files.write',
        'buckets.read', 'buckets.write',
        'functions.read', 'functions.write',
        'execution.read', 'execution.write',
        'locale.read', 'avatars.read', 'health.read',
        'rules.read', 'rules.write',
        'webhooks.read', 'webhooks.write',
        'platforms.read', 'platforms.write',
        'keys.read', 'keys.write',
        'emails.read', 'emails.write',
        'migrations.read', 'migrations.write',
    ];

    // Try with session cookie
    const keyName = `backend-key-${Date.now()}`;
    const { ok, status, data } = await apiRequest('POST', `/projects/${PROJECT_ID}/keys`, {
        name: keyName,
        scopes: allScopes,
        expire: null
    });

    if (ok && data.secret) {
        API_KEY = data.secret;
        console.log(`  ✅ API Key criada: ${API_KEY.substring(0, 30)}...`);
        return;
    }

    throw new Error(`Não foi possível criar API key (${status}): ${data?.message}\n  → Crie manualmente no console e informe aqui.`);
}

// ─── PHASE 2: DATABASE ─────────────────────────────────────────────────────────

async function createDatabase() {
    console.log('\n🗄️  Fase 2: Criando Database...');
    process.stdout.write(`  + ${DATABASE_ID}... `);
    const res = await safeRequest('POST', '/databases', {
        databaseId: DATABASE_ID,
        name: 'A2Tickets360-Db'
    }, true);
    if (res && !res.alreadyExists) console.log('✅');
}

// ─── HELPERS DE COLLECTION ─────────────────────────────────────────────────────

async function createCollection(id, name, permissions) {
    console.log(`\n📁 Coleção: ${name} (${id})`);
    process.stdout.write(`  Criando... `);
    const res = await safeRequest('POST', `/databases/${DATABASE_ID}/collections`, {
        collectionId: id,
        name,
        permissions: permissions || [
            'read("any")', 'create("users")', 'update("users")', 'delete("users")'
        ],
        documentSecurity: false
    }, true);
    if (res && !res.alreadyExists) console.log('✅');
}

async function attr(collectionId, type, body) {
    process.stdout.write(`    + ${body.key} (${type})... `);
    const res = await safeRequest(
        'POST',
        `/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${type}`,
        body,
        true
    );
    if (res && !res.alreadyExists) console.log('✅');
    await sleep(150);
}

async function index(collectionId, key, type, attributes) {
    process.stdout.write(`    📇 index ${key}... `);
    const res = await safeRequest('POST',
        `/databases/${DATABASE_ID}/collections/${collectionId}/indexes`,
        { key, type, attributes },
        true
    );
    if (res && !res.alreadyExists) console.log('✅');
}

// ─── COLEÇÕES E ATRIBUTOS ──────────────────────────────────────────────────────

async function setupUserProfiles() {
    await createCollection('user_profiles', 'User Profiles');

    const strings = [
        { key: 'userId',          size: 255,   required: false },
        { key: 'role',            size: 255,   required: false },
        { key: 'status',          size: 255,   required: false, default: 'pending' },
        { key: 'name',            size: 255,   required: false },
        { key: 'phone',           size: 255,   required: false },
        { key: 'companyName',     size: 255,   required: false },
        { key: 'cnpj',            size: 255,   required: false },
        { key: 'cpf',             size: 255,   required: false },
        { key: 'city',            size: 255,   required: false },
        { key: 'state',           size: 255,   required: false },
        { key: 'postalCode',      size: 255,   required: false },
        { key: 'slug',            size: 255,   required: false },
        { key: 'category',        size: 255,   required: false },
        { key: 'bannerUrl',       size: 2000,  required: false },
        { key: 'logoUrl',         size: 2000,  required: false },
        { key: 'photoUrl',        size: 2000,  required: false },
        { key: 'documentFrontUrl',size: 2000,  required: false },
        { key: 'documentBackUrl', size: 2000,  required: false },
        { key: 'instagramUrl',    size: 1000,  required: false },
        { key: 'whatsappNumber',  size: 255,   required: false },
        { key: 'websiteUrl',      size: 1000,  required: false },
        { key: 'companyAddress',  size: 1000,  required: false },
        { key: 'bio',             size: 5000,  required: false },
        { key: 'asaasApiKey',     size: 1000,  required: false },
    ];
    for (const a of strings) await attr('user_profiles', 'string', a);

    const booleans = [
        { key: 'profileComplete', required: false, default: false },
        { key: 'emailVerified',   required: false, default: false },
        { key: 'isActive',        required: false, default: true },
    ];
    for (const a of booleans) await attr('user_profiles', 'boolean', a);
    await attr('user_profiles', 'integer', { key: 'lastStep', required: false, default: 1 });

    await index('user_profiles', 'idx_userId', 'key',    ['userId']);
    await index('user_profiles', 'idx_role',   'key',    ['role']);
    await index('user_profiles', 'idx_slug',   'unique', ['slug']);
}

async function setupEvents() {
    await createCollection('events', 'Events');

    const strings = [
        { key: 'title',                size: 500,   required: false },
        { key: 'description',          size: 15000, required: false },
        { key: 'date',                 size: 255,   required: false },
        { key: 'endDate',              size: 255,   required: false },
        { key: 'category',             size: 255,   required: false },
        { key: 'status',               size: 255,   required: false, default: 'draft' },
        { key: 'organizerId',          size: 255,   required: false },
        { key: 'bannerUrl',            size: 2000,  required: false },
        { key: 'location',             size: 1000,  required: false },
        { key: 'address',              size: 1000,  required: false },
        { key: 'city',                 size: 255,   required: false },
        { key: 'state',                size: 255,   required: false },
        { key: 'registrationDeadline', size: 255,   required: false },
        { key: 'tags',                 size: 1000,  required: false },
        { key: 'slug',                 size: 255,   required: false },
    ];
    for (const a of strings) await attr('events', 'string', a);

    await attr('events', 'float',   { key: 'ticketPrice',    required: false });
    await attr('events', 'integer', { key: 'ticketQuantity', required: false });
    await attr('events', 'integer', { key: 'ticketsSold',    required: false, default: 0 });
    await attr('events', 'boolean', { key: 'isPublished',    required: false, default: false });
    await attr('events', 'boolean', { key: 'isFree',         required: false, default: false });

    await index('events', 'idx_organizerId', 'key', ['organizerId']);
    await index('events', 'idx_status',      'key', ['status']);
    await index('events', 'idx_category',    'key', ['category']);
}

async function setupTickets() {
    await createCollection('tickets', 'Tickets', [
        'read("users")', 'create("users")', 'update("users")', 'delete("users")'
    ]);

    const strings = [
        { key: 'userId',       size: 255,  required: false },
        { key: 'eventId',      size: 255,  required: false },
        { key: 'ticketCode',   size: 255,  required: false },
        { key: 'status',       size: 255,  required: false, default: 'active' },
        { key: 'photoId',      size: 255,  required: false },
        { key: 'cpf',          size: 255,  required: false },
        { key: 'qrCodeData',   size: 2000, required: false },
        { key: 'purchaseDate', size: 255,  required: false },
        { key: 'checkedInAt',  size: 255,  required: false },
        { key: 'buyerName',    size: 255,  required: false },
        { key: 'buyerEmail',   size: 255,  required: false },
    ];
    for (const a of strings) await attr('tickets', 'string', a);
    await attr('tickets', 'boolean', { key: 'checkedIn', required: false, default: false });

    await index('tickets', 'idx_userId',    'key',    ['userId']);
    await index('tickets', 'idx_eventId',   'key',    ['eventId']);
    await index('tickets', 'idx_ticketCode','unique', ['ticketCode']);
}

async function setupCheckins() {
    await createCollection('checkins', 'Checkins', [
        'read("users")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    const strings = [
        { key: 'ticketId',  size: 255, required: false },
        { key: 'eventId',   size: 255, required: false },
        { key: 'userId',    size: 255, required: false },
        { key: 'staffId',   size: 255, required: false },
        { key: 'checkedAt', size: 255, required: false },
        { key: 'method',    size: 255, required: false, default: 'qr_code' },
    ];
    for (const a of strings) await attr('checkins', 'string', a);
    await index('checkins', 'idx_eventId', 'key', ['eventId']);
}

async function setupSales() {
    await createCollection('sales', 'Sales', [
        'read("users")', 'create("users")', 'update("users")', 'delete("users")'
    ]);
    const strings = [
        { key: 'eventId',       size: 255, required: false },
        { key: 'ticketId',      size: 255, required: false },
        { key: 'buyerId',       size: 255, required: false },
        { key: 'organizerId',   size: 255, required: false },
        { key: 'paymentMethod', size: 255, required: false },
        { key: 'paymentStatus', size: 255, required: false, default: 'pending' },
        { key: 'transactionId', size: 255, required: false },
        { key: 'saleDate',      size: 255, required: false },
        { key: 'asaasPaymentId',size: 255, required: false },
    ];
    for (const a of strings) await attr('sales', 'string', a);
    await attr('sales', 'float', { key: 'amount', required: false });
    await index('sales', 'idx_organizerId', 'key', ['organizerId']);
    await index('sales', 'idx_eventId',     'key', ['eventId']);
}

// ─── STORAGE BUCKETS ──────────────────────────────────────────────────────────

async function setupBuckets() {
    console.log('\n🪣  Fase 5: Criando Storage Buckets...');
    const buckets = [
        {
            bucketId: 'media', name: 'Media',
            permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
            fileSecurity: true, enabled: true, maximumFileSize: 30000000,
            allowedFileExtensions: ['jpg','jpeg','png','gif','webp','pdf','mp4'],
            encryption: false, antivirus: false
        },
        {
            bucketId: 'tickets-qr', name: 'Tickets QR',
            permissions: ['read("users")', 'create("users")', 'update("users")'],
            fileSecurity: true, enabled: true, maximumFileSize: 5000000,
            allowedFileExtensions: ['jpg','jpeg','png','webp'],
            encryption: false, antivirus: false
        },
        {
            bucketId: 'documents', name: 'Documents',
            permissions: ['read("users")', 'create("users")', 'update("users")'],
            fileSecurity: true, enabled: true, maximumFileSize: 10000000,
            allowedFileExtensions: ['jpg','jpeg','png','pdf'],
            encryption: false, antivirus: false
        }
    ];

    for (const bucket of buckets) {
        process.stdout.write(`  + ${bucket.name} (${bucket.bucketId})... `);
        const res = await safeRequest('POST', '/storage/buckets', bucket, true);
        if (res && !res.alreadyExists) console.log('✅');
    }
}

// ─── GERAR .env ───────────────────────────────────────────────────────────────

function generateEnvFile() {
    console.log('\n📝 Fase 6: Gerando arquivo .env.new-server...');
    const fs = require('fs');
    const content = `# ──────────────────────────────────────────────────────
# a2tickets360 - Environment Variables (New Server)
# Gerado automaticamente - ${new Date().toISOString()}
# ──────────────────────────────────────────────────────

VITE_APPWRITE_ENDPOINT=https://database.a2tickets360.com.br/v1
VITE_APPWRITE_PROJECT_ID=${PROJECT_ID}
VITE_APPWRITE_DATABASE_ID=${DATABASE_ID}

# Storage Buckets
VITE_APPWRITE_BUCKET_MEDIA=media
VITE_APPWRITE_BUCKET_TICKETS_QR=tickets-qr
VITE_APPWRITE_BUCKET_DOCUMENTS=documents

# Collections
VITE_COLLECTION_USER_PROFILES=user_profiles
VITE_COLLECTION_EVENTS=events
VITE_COLLECTION_TICKETS=tickets
VITE_COLLECTION_CHECKINS=checkins
VITE_COLLECTION_SALES=sales

# API Key (server-side only, nunca no frontend!)
APPWRITE_API_KEY=${API_KEY}
`;
    fs.writeFileSync('.env.new-server', content);
    console.log('  ✅ .env.new-server criado!');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀 ==============================================');
    console.log('    a2tickets360 - Full Appwrite Setup Script  ');
    console.log('    Servidor: database.a2tickets360.com.br     ');
    console.log('================================================\n');

    try {
        await authenticate();
        await createApiKey();
        await createDatabase();

        console.log('\n📊 Fase 3-4: Criando Coleções e Atributos...');
        await setupUserProfiles();
        await setupEvents();
        await setupTickets();
        await setupCheckins();
        await setupSales();

        await setupBuckets();
        generateEnvFile();

        console.log('\n\n✅ ==============================================');
        console.log('    SETUP CONCLUÍDO COM SUCESSO! 🎉           ');
        console.log('================================================');
        console.log('\n📄 Próximos passos:');
        console.log('  1. Copie o conteúdo de .env.new-server para seu .env');
        console.log('  2. Atualize o endpoint no src/lib/appwrite-config.ts');
        console.log('  3. Teste o sistema com npm run dev\n');

    } catch (err) {
        console.error('\n\n❌ ERRO FATAL:', err.message);
        console.error('\n💡 Dica: Verifique se o Appwrite está acessível em:');
        console.error(`   ${BASE_URL}`);
        process.exit(1);
    }
}

main();
