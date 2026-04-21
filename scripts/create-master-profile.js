
import { Client, Databases, ID } from "node-appwrite";
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
const MASTER_USER_ID = "69ad9052002a8a2f9890";

async function createMasterProfile() {
    console.log("🛠️ Tentando criar perfil Master em user_profiles...");
    try {
        const doc = await databases.createDocument(DB_ID, COLL_ID, ID.unique(), {
            userId: MASTER_USER_ID,
            role: "master",
            status: "approved",
            companyName: "A2 Marketing e Business Intelligence",
            profileComplete: true,
            emailVerified: true,
            isActive: true,
            lastStep: 10
        });
        console.log("✅ Perfil Master criado com sucesso!", doc.$id);
    } catch (e) {
        console.error("❌ Erro ao criar perfil:", e.message);
    }
}

createMasterProfile();
