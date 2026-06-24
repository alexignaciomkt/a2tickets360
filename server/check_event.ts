import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from './src/db/schema';

const DATABASE_URL = 'postgresql://postgres.osfnqpehvhznrecljjjf:Ticketera010203%232026@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';
const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

async function check() {
    try {
        const event = await db.query.events.findFirst({
            where: eq(schema.events.id, 'ac76d70e-3c5a-4a6a-a39b-c9b9223eb95a')
        });
        console.log("Event:", event);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
