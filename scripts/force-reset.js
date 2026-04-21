
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

async function forceReset() {
    console.log("🔥 LIMPANDO TUDO PARA O NOVO LOGIN...");

    try {
        await databases.deleteCollection(DB_ID, COLL_ID);
        console.log("✅ Comando de deleção enviado.");
    } catch (e) {
        console.log("ℹ️ Não havia coleção.");
    }

    console.log("⏳ Aguardando 10 segundos para a VPS processar a deleção...");
    await new Promise(r => setTimeout(r, 10000));

    console.log("📦 Criando coleção limpa...");
    try {
        await databases.createCollection(DB_ID, COLL_ID, "User Profiles", [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
        ]);
    } catch (e) {
        console.log("⚠️ Erro ao criar (talvez ainda exista?):", e.message);
        return;
    }

    console.log("📝 Adicionando campos básicos...");
    await databases.createStringAttribute(DB_ID, COLL_ID, "userId", 64, true);
    await databases.createStringAttribute(DB_ID, COLL_ID, "role", 32, true);
    await databases.createStringAttribute(DB_ID, COLL_ID, "status", 32, true);
    await databases.createBooleanAttribute(DB_ID, COLL_ID, "profileComplete", false, false);

    console.log("⏳ Aguardando ativação...");
    for (let i = 0; i < 30; i++) {
        const coll = await databases.getCollection(DB_ID, COLL_ID);
        const av = coll.attributes.filter(a => a.status === 'available');
        console.log(`  Atributos prontos: ${av.length}/4`);
        if (av.length >= 4) break;
        await new Promise(r => setTimeout(r, 5000));
    }

    const MASTER_USER_ID = "69ad9052002a8a2f9890";
    console.log("👑 Inserindo Master...");
    await databases.createDocument(DB_ID, COLL_ID, ID.unique(), {
        userId: MASTER_USER_ID,
        role: "master",
        status: "approved",
        profileComplete: true
    });

    console.log("✅ TUDO PRONTO! TENTE LOGAR AGORA.");
}

forceReset().catch(e => console.error("❌ ERRO FATAL:", e.message));
