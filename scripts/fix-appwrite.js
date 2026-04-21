
import { Client, Databases, Permission, Role } from "node-appwrite";
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

async function fix() {
    console.log("🔧 Corrigindo permissões das coleções no Appwrite...");

    const collections = [
        { id: "user_profiles", name: "User Profiles", permissions: [Permission.read(Role.users()), Permission.update(Role.users())] },
        { id: "events", name: "Events", permissions: [Permission.read(Role.any())] },
        { id: "tickets", name: "Tickets", permissions: [Permission.read(Role.any())] },
        { id: "sales", name: "Sales", permissions: [Permission.read(Role.users()), Permission.create(Role.users())] },
        { id: "checkins", name: "Checkins", permissions: [Permission.read(Role.users()), Permission.create(Role.users())] },
    ];

    for (const coll of collections) {
        try {
            console.log(`Updating ${coll.name} (${coll.id})...`);
            // First update document level permissions mode to 'collection' or 'document'
            // By default it's usually 'document' if created without permissions.
            // We'll set the collection level permissions.
            await databases.updateCollection(DB_ID, coll.id, coll.name, coll.permissions);
            console.log(`✅ ${coll.name} atualizada.`);
        } catch (e) {
            console.error(`❌ Erro em ${coll.id}:`, e.message);
        }
    }

    console.log("\n🚀 Permissões corrigidas!");
    console.log("\n⚠️ IMPORTANTE: Você precisa adicionar 'localhost' como Plataforma no seu console Appwrite.");
    console.log("Siga estes passos:");
    console.log("1. Acesse https://banco.euattendo.com.br/");
    console.log("2. Selecione o projeto '69ad87225fa699a67720'");
    console.log("3. Vá em 'Settings' (ou 'Overview')");
    console.log("4. Clique em 'Add Platform' -> 'Web App'");
    console.log("5. Coloque 'localhost' no campo Hostname e salve.");
}

fix();
