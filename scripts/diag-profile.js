
import { Client, Databases, Query } from "node-appwrite";
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

async function diag() {
    console.log("🔍 Diagnosticando Perfil Master...");
    try {
        const userId = "69ad9052002a8a2f9890"; // ID que vimos no check-users.js
        const docs = await databases.listDocuments(DB_ID, COLL_ID, [
            Query.equal("userId", userId)
        ]);

        if (docs.total > 0) {
            console.log("✅ Perfil encontrado na coleção user_profiles!");
            console.log(JSON.stringify(docs.documents[0], null, 2));
        } else {
            console.log("❌ NENHUM PERFIL encontrado para o userId " + userId);
        }
    } catch (e) {
        console.error("❌ Erro ao buscar perfil:", e.message);
    }
}

diag();
