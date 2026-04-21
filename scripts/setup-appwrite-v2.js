
import { Client, Databases, ID } from "node-appwrite";
import fs from 'fs';

// Manually parse the .env file
const envContent = fs.readFileSync('mcp-appwrite/.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim();
    }
});

const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = "a2_tickets_360";

async function setup() {
    try {
        console.log("Creating database...");
        try {
            await databases.create(DB_ID, "A2 Tickets 360 Main Database");
            console.log("Database created: " + DB_ID);
        } catch (e) {
            console.log("Database already exists or error.");
        }

        const collections = [
            { id: "events", name: "Events" },
            { id: "tickets", name: "Tickets" },
            { id: "visitors", name: "Visitors" },
            { id: "exhibitor_staff", name: "Exhibitor Staff" },
            { id: "exhibitor_leads", name: "Exhibitor Leads" },
            { id: "exhibitor_logistics", name: "Exhibitor Logistics" },
            { id: "ai_chat_logs", name: "AI Chat Logs" }
        ];

        for (const coll of collections) {
            console.log(`Creating collection ${coll.name}...`);
            try {
                await databases.createCollection(DB_ID, coll.id, coll.name);
                console.log(`Collection ${coll.id} created.`);
            } catch (e) {
                console.log(`Collection ${coll.id} already exists or error.`);
            }
        }

        console.log("Creating basic attributes for 'events'...");
        try {
            await databases.createStringAttribute(DB_ID, "events", "title", 255, true);
            await databases.createStringAttribute(DB_ID, "events", "date", 64, true);
            await databases.createStringAttribute(DB_ID, "events", "organizerId", 64, true);
            console.log("Events attributes created.");
        } catch (e) { }

        console.log("Setup finished successfully!");
    } catch (error) {
        console.error("Setup failed:", error);
    }
}

setup();
