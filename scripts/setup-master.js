
import { Client, Databases, Users, ID } from "node-appwrite";
import fs from 'fs';

const envContent = fs.readFileSync('mcp-appwrite/.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length) env[key.trim()] = value.join('=').trim();
});

const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);

const DB_ID = "a2_tickets_360";
const PROFILES_COLLECTION = "user_profiles";

async function setup() {
    console.log("🚀 Iniciando setup completo do A2 Tickets 360...\n");

    // 1. Criar coleção user_profiles
    console.log("📦 Criando coleção user_profiles...");
    try {
        await databases.createCollection(DB_ID, PROFILES_COLLECTION, "User Profiles", [
            // Qualquer usuário autenticado pode ler seu próprio perfil
            // Server-side (API key) tem acesso total
        ]);
        console.log("✅ Coleção user_profiles criada");
    } catch (e) {
        console.log("⚠️  user_profiles já existe ou erro, continuando...");
    }

    // 2. Criar atributos da coleção user_profiles
    console.log("\n📝 Criando atributos de user_profiles...");
    const stringAttrs = [
        { key: "userId", size: 64, required: true },
        { key: "role", size: 32, required: true },      // master, organizer, staff, exhibitor, customer
        { key: "status", size: 32, required: true },     // pending, approved, rejected, suspended
        { key: "companyName", size: 255, required: false },
        { key: "cnpj", size: 32, required: false },
        { key: "cpf", size: 32, required: false },
        { key: "phone", size: 32, required: false },
        { key: "city", size: 128, required: false },
        { key: "state", size: 64, required: false },
        { key: "address", size: 512, required: false },
        { key: "postalCode", size: 16, required: false },
        { key: "documentFrontUrl", size: 512, required: false },
        { key: "documentBackUrl", size: 512, required: false },
        { key: "logoUrl", size: 512, required: false },
        { key: "bannerUrl", size: 512, required: false },
        { key: "bio", size: 2000, required: false },
        { key: "slug", size: 128, required: false },
        { key: "category", size: 128, required: false },
        { key: "instagramUrl", size: 255, required: false },
        { key: "facebookUrl", size: 255, required: false },
        { key: "whatsappNumber", size: 32, required: false },
        { key: "websiteUrl", size: 255, required: false },
        { key: "approvedBy", size: 64, required: false },
        { key: "approvedAt", size: 64, required: false },
        { key: "asaasId", size: 128, required: false },
        { key: "asaasApiKey", size: 255, required: false },
        { key: "walletId", size: 128, required: false },
    ];

    for (const attr of stringAttrs) {
        try {
            await databases.createStringAttribute(DB_ID, PROFILES_COLLECTION, attr.key, attr.size, attr.required);
            console.log(`  ✅ ${attr.key} (string, ${attr.size})`);
        } catch (e) {
            console.log(`  ⚠️  ${attr.key} já existe`);
        }
    }

    // Boolean attributes
    const boolAttrs = [
        { key: "profileComplete", required: false, defaultValue: false },
        { key: "emailVerified", required: false, defaultValue: false },
        { key: "isActive", required: false, defaultValue: true },
    ];

    for (const attr of boolAttrs) {
        try {
            await databases.createBooleanAttribute(DB_ID, PROFILES_COLLECTION, attr.key, attr.required, attr.defaultValue);
            console.log(`  ✅ ${attr.key} (boolean)`);
        } catch (e) {
            console.log(`  ⚠️  ${attr.key} já existe`);
        }
    }

    // Integer attributes
    try {
        await databases.createIntegerAttribute(DB_ID, PROFILES_COLLECTION, "lastStep", false, 1, 10, 1);
        console.log("  ✅ lastStep (integer)");
    } catch (e) {
        console.log("  ⚠️  lastStep já existe");
    }

    // Wait for attributes to be available before creating indexes
    console.log("\n⏳ Aguardando atributos serem indexados (5s)...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Criar índices
    console.log("\n🔑 Criando índices...");
    try {
        await databases.createIndex(DB_ID, PROFILES_COLLECTION, "idx_userId", "unique", ["userId"]);
        console.log("  ✅ Índice único: userId");
    } catch (e) { console.log("  ⚠️  Índice userId já existe"); }

    try {
        await databases.createIndex(DB_ID, PROFILES_COLLECTION, "idx_role", "key", ["role"]);
        console.log("  ✅ Índice: role");
    } catch (e) { console.log("  ⚠️  Índice role já existe"); }

    try {
        await databases.createIndex(DB_ID, PROFILES_COLLECTION, "idx_status", "key", ["status"]);
        console.log("  ✅ Índice: status");
    } catch (e) { console.log("  ⚠️  Índice status já existe"); }

    try {
        await databases.createIndex(DB_ID, PROFILES_COLLECTION, "idx_slug", "unique", ["slug"]);
        console.log("  ✅ Índice único: slug");
    } catch (e) { console.log("  ⚠️  Índice slug já existe"); }

    // 4. Criar o usuário Master Admin
    console.log("\n👑 Criando Admin Master...");
    const MASTER_EMAIL = "admin@a2tickets360.com.br";
    const MASTER_PASSWORD = "A2Master@2026!";
    const MASTER_NAME = "A2 Admin Master";

    let masterUserId;
    try {
        const masterUser = await users.create(
            ID.unique(),
            MASTER_EMAIL,
            undefined, // phone
            MASTER_PASSWORD,
            MASTER_NAME
        );
        masterUserId = masterUser.$id;
        console.log(`  ✅ Usuário Master criado: ${masterUserId}`);

        // Verificar email automaticamente
        await users.updateEmailVerification(masterUserId, true);
        console.log("  ✅ Email verificado automaticamente");

        // Definir prefs com role
        await users.updatePrefs(masterUserId, { role: "master", profileComplete: true });
        console.log("  ✅ Prefs definidas (role: master)");

    } catch (e) {
        console.log("  ⚠️  Usuário Master já existe, buscando...");
        try {
            const usersList = await users.list();
            const existing = usersList.users.find(u => u.email === MASTER_EMAIL);
            if (existing) {
                masterUserId = existing.$id;
                console.log(`  ℹ️  Master existente: ${masterUserId}`);
            }
        } catch (e2) {
            console.error("  ❌ Erro ao buscar usuários:", e2);
        }
    }

    // 5. Criar perfil do Master na coleção user_profiles
    if (masterUserId) {
        console.log("\n📋 Criando perfil Master em user_profiles...");
        try {
            // Wait a bit more for indexes to be ready
            await new Promise(resolve => setTimeout(resolve, 2000));

            await databases.createDocument(DB_ID, PROFILES_COLLECTION, ID.unique(), {
                userId: masterUserId,
                role: "master",
                status: "approved",
                companyName: "A2 Marketing e Business Intelligence",
                profileComplete: true,
                emailVerified: true,
                isActive: true,
                lastStep: 10,
            });
            console.log("  ✅ Perfil Master criado com sucesso!");
        } catch (e) {
            console.log("  ⚠️  Perfil Master já existe ou atributos ainda indexando");
        }
    }

    // 6. Adicionar atributos extras às coleções existentes
    console.log("\n📦 Expandindo coleções existentes...");

    // Events - mais atributos
    const eventAttrs = [
        { key: "description", size: 5000 },
        { key: "time", size: 32 },
        { key: "endDate", size: 64 },
        { key: "endTime", size: 32 },
        { key: "locationName", size: 255 },
        { key: "locationAddress", size: 512 },
        { key: "locationCity", size: 128 },
        { key: "locationState", size: 64 },
        { key: "locationPostalCode", size: 16 },
        { key: "status", size: 32 },
        { key: "category", size: 128 },
        { key: "eventType", size: 16 },
        { key: "floorPlanUrl", size: 512 },
    ];

    for (const attr of eventAttrs) {
        try {
            await databases.createStringAttribute(DB_ID, "events", attr.key, attr.size, false);
            console.log(`  ✅ events.${attr.key}`);
        } catch (e) {
            console.log(`  ⚠️  events.${attr.key} já existe`);
        }
    }

    try {
        await databases.createIntegerAttribute(DB_ID, "events", "capacity", false, 0, 1000000, 0);
        console.log("  ✅ events.capacity (integer)");
    } catch (e) { console.log("  ⚠️  events.capacity já existe"); }

    try {
        await databases.createBooleanAttribute(DB_ID, "events", "isFeatured", false, false);
        console.log("  ✅ events.isFeatured (boolean)");
    } catch (e) { console.log("  ⚠️  events.isFeatured já existe"); }

    // Tickets collection attributes
    console.log("\n📦 Configurando coleção tickets...");
    const ticketAttrs = [
        { key: "eventId", size: 64, required: true },
        { key: "name", size: 255, required: true },
        { key: "description", size: 1000, required: false },
        { key: "batch", size: 64, required: false },
        { key: "category", size: 32, required: false },
    ];
    for (const attr of ticketAttrs) {
        try {
            await databases.createStringAttribute(DB_ID, "tickets", attr.key, attr.size, attr.required);
            console.log(`  ✅ tickets.${attr.key}`);
        } catch (e) { console.log(`  ⚠️  tickets.${attr.key} já existe`); }
    }

    try {
        await databases.createFloatAttribute(DB_ID, "tickets", "price", false, 0, 999999.99, 0);
        console.log("  ✅ tickets.price (float)");
    } catch (e) { console.log("  ⚠️  tickets.price já existe"); }

    try {
        await databases.createIntegerAttribute(DB_ID, "tickets", "quantity", true, 0, 1000000, 0);
        console.log("  ✅ tickets.quantity (integer)");
    } catch (e) { console.log("  ⚠️  tickets.quantity já existe"); }

    try {
        await databases.createIntegerAttribute(DB_ID, "tickets", "remaining", false, 0, 1000000, 0);
        console.log("  ✅ tickets.remaining (integer)");
    } catch (e) { console.log("  ⚠️  tickets.remaining já existe"); }

    try {
        await databases.createBooleanAttribute(DB_ID, "tickets", "isActive", false, true);
        console.log("  ✅ tickets.isActive (boolean)");
    } catch (e) { console.log("  ⚠️  tickets.isActive já existe"); }

    // Sales collection
    console.log("\n📦 Criando coleção sales...");
    try {
        await databases.createCollection(DB_ID, "sales", "Sales");
        console.log("  ✅ Coleção sales criada");
    } catch (e) { console.log("  ⚠️  sales já existe"); }

    const salesAttrs = [
        { key: "eventId", size: 64, required: true },
        { key: "ticketId", size: 64, required: true },
        { key: "buyerName", size: 255, required: true },
        { key: "buyerEmail", size: 255, required: true },
        { key: "buyerPhone", size: 32, required: false },
        { key: "paymentStatus", size: 32, required: false },
        { key: "paymentMethod", size: 32, required: false },
        { key: "asaasPaymentId", size: 128, required: false },
        { key: "qrCodeData", size: 512, required: true },
    ];
    for (const attr of salesAttrs) {
        try {
            await databases.createStringAttribute(DB_ID, "sales", attr.key, attr.size, attr.required);
            console.log(`  ✅ sales.${attr.key}`);
        } catch (e) { console.log(`  ⚠️  sales.${attr.key} já existe`); }
    }
    try {
        await databases.createIntegerAttribute(DB_ID, "sales", "quantity", true, 1, 100, 1);
        console.log("  ✅ sales.quantity (integer)");
    } catch (e) { console.log("  ⚠️  sales.quantity já existe"); }
    try {
        await databases.createFloatAttribute(DB_ID, "sales", "totalPrice", true, 0, 999999.99, 0);
        console.log("  ✅ sales.totalPrice (float)");
    } catch (e) { console.log("  ⚠️  sales.totalPrice já existe"); }

    // Checkins collection
    console.log("\n📦 Criando coleção checkins...");
    try {
        await databases.createCollection(DB_ID, "checkins", "Checkins");
        console.log("  ✅ Coleção checkins criada");
    } catch (e) { console.log("  ⚠️  checkins já existe"); }

    const checkinAttrs = [
        { key: "saleId", size: 64, required: true },
        { key: "staffId", size: 64, required: true },
        { key: "eventId", size: 64, required: true },
        { key: "checkInTime", size: 64, required: false },
        { key: "deviceId", size: 64, required: false },
    ];
    for (const attr of checkinAttrs) {
        try {
            await databases.createStringAttribute(DB_ID, "checkins", attr.key, attr.size, attr.required);
            console.log(`  ✅ checkins.${attr.key}`);
        } catch (e) { console.log(`  ⚠️  checkins.${attr.key} já existe`); }
    }

    console.log("\n\n🎉 ════════════════════════════════════════════");
    console.log("   SETUP COMPLETO DO A2 TICKETS 360º");
    console.log("   ════════════════════════════════════════════");
    console.log(`\n   👑 Login Master:`)
    console.log(`      Email: ${MASTER_EMAIL}`);
    console.log(`      Senha: ${MASTER_PASSWORD}`);
    console.log("\n   ⚠️  TROQUE A SENHA APÓS O PRIMEIRO LOGIN!");
    console.log("   ════════════════════════════════════════════\n");
}

setup().catch(console.error);
