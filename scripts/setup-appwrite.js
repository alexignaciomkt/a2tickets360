
import { Client, Databases, ID, Permission, Role } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: 'mcp-appwrite/.env' });

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT!)
    .setProject(APPWRITE_PROJECT_ID!)
    .setKey(APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "a2_tickets_360";

async function setup() {
    try {
        console.log("Creating database...");
        try {
            await databases.create(DB_ID, "A2 Tickets 360 Main Database");
        } catch (e) {
            console.log("Database might already exist, continuing...");
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
            } catch (e) {
                console.log(`Collection ${coll.id} already exists or error, continuing...`);
            }
        }

        // Example Attribute creation for 'events'
        console.log("Creating attributes for 'events'...");
        try {
            await databases.createStringAttribute(DB_ID, "events", "title", 255, true);
            await databases.createStringAttribute(DB_ID, "events", "description", 5000, false);
            await databases.createStringAttribute(DB_ID, "events", "date", 64, true);
            await databases.createStringAttribute(DB_ID, "events", "location", 255, false);
            await databases.createStringAttribute(DB_ID, "events", "organizerId", 64, true);
            await databases.createStringAttribute(DB_ID, "events", "imageUrl", 255, false);
        } catch (e) { console.log("Some attributes might exist in 'events'"); }

        // Attributes for 'visitors'
        console.log("Creating attributes for 'visitors'...");
        try {
            await databases.createStringAttribute(DB_ID, "visitors", "name", 255, true);
            await databases.createStringAttribute(DB_ID, "visitors", "email", 255, true);
            await databases.createStringAttribute(DB_ID, "visitors", "phone", 32, false);
            await databases.createStringAttribute(DB_ID, "visitors", "document", 32, false);
            await databases.createStringAttribute(DB_ID, "visitors", "company", 255, false);
            await databases.createStringAttribute(DB_ID, "visitors", "qrCodeData", 255, true);
        } catch (e) { console.log("Some attributes might exist in 'visitors'"); }

        // Attributes for 'exhibitor_leads'
        console.log("Creating attributes for 'exhibitor_leads'...");
        try {
            await databases.createStringAttribute(DB_ID, "exhibitor_leads", "name", 255, false);
            await databases.createStringAttribute(DB_ID, "exhibitor_leads", "email", 255, false);
            await databases.createStringAttribute(DB_ID, "exhibitor_leads", "phone", 32, false);
            await databases.createStringAttribute(DB_ID, "exhibitor_leads", "company", 255, false);
            await databases.createStringAttribute(DB_ID, "exhibitor_leads", "notes", 1000, false);
            await databases.createStringAttribute(DB_ID, "exhibitor_leads", "visitorId", 64, false);
            await databases.createStringAttribute(DB_ID, "exhibitor_leads", "standId", 64, true);
        } catch (e) { console.log("Some attributes might exist in 'exhibitor_leads'"); }

        console.log("Setup complete!");
    } catch (error) {
        console.error("Setup failed:", error);
    }
}

setup();
