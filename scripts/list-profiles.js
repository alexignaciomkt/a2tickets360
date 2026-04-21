
import { Client, Databases } from "node-appwrite";
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

async function listDocs() {
    try {
        const docs = await databases.listDocuments(DB_ID, COLL_ID);
        console.log(`Total de documentos: ${docs.total}`);
        console.log(JSON.stringify(docs.documents, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

listDocs();
