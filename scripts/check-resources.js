
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

async function checkResources() {
    try {
        console.log("Listing databases...");
        const dbs = await databases.list();
        console.log("Databases:", JSON.stringify(dbs.databases.map(d => ({ id: d.$id, name: d.name })), null, 2));

        for (const db of dbs.databases) {
            console.log(`\nCollections in ${db.$id}:`);
            const colls = await databases.listCollections(db.$id);
            console.log(JSON.stringify(colls.collections.map(c => ({ id: c.$id, name: c.name })), null, 2));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkResources();
