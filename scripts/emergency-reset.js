
import { Client, Databases, ID, Permission, Role } from "node-appwrite";
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
const DB_ID = "a2_tickets_360";
const COLL_ID = "user_profiles";

async function resetAndFix() {
    console.log("🔥 REINICIANDO COLEÇÃO USER_PROFILES...");

    try {
        await databases.deleteCollection(DB_ID, COLL_ID);
        console.log("✅ Coleção antiga deletada.");
    } catch (e) {
        console.log("ℹ️ Coleção não existia ou já foi deletada.");
    }

    // Aguardar deleção
    await new Promise(r => setTimeout(r, 2000));

    console.log("📦 Criando nova coleção user_profiles...");
    await databases.createCollection(DB_ID, COLL_ID, "User Profiles", [
        Permission.read(Role.users()),
        Permission.update(Role.users()),
    ]);

    const coreAttrs = [
        { key: "userId", size: 64, required: true },
        { key: "role", size: 32, required: true },
        { key: "status", size: 32, required: true },
        { key: "profileComplete", type: 'bool' }
    ];

    console.log("📝 Adicionando atributos CORE...");
    for (const attr of coreAttrs) {
        if (attr.type === 'bool') {
            await databases.createBooleanAttribute(DB_ID, COLL_ID, attr.key, false, false);
        } else {
            await databases.createStringAttribute(DB_ID, COLL_ID, attr.key, attr.size, attr.required);
        }
        console.log(`  ➕ ${attr.key}`);
    }

    console.log("\n⏳ Aguardando ativação automática (vários checks)...");

    let attempts = 0;
    while (attempts < 20) {
        const coll = await databases.getCollection(DB_ID, COLL_ID);
        const pending = coll.attributes.filter(a => a.status !== 'available');

        if (pending.length === 0) {
            console.log("✨ TODOS ATRIBUTOS DISPONÍVEIS!");
            break;
        }

        console.log(`  Aguardando... ${pending.length} atributos ainda em processamento.`);
        await new Promise(r => setTimeout(r, 3000));
        attempts++;
    }

    console.log("\n👑 Criando perfil Master...");
    const MASTER_USER_ID = "69ad9052002a8a2f9890";
    try {
        await databases.createDocument(DB_ID, COLL_ID, ID.unique(), {
            userId: MASTER_USER_ID,
            role: "master",
            status: "approved",
            profileComplete: true
        });
        console.log("✅ PERFIL MASTER CRIADO COM SUCESSO!");
        console.log("\n🚀 TENTE LOGAR AGORA: admin@a2tickets360.com.br / A2Master@2026!");
    } catch (e) {
        console.error("❌ Falha final:", e.message);
    }
}

resetAndFix();
