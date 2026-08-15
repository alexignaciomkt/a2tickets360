import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Applying Phase 6 schema updates...");

    // 1. Add credential_photo_url to employees
    try {
        await db.execute(sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS credential_photo_url TEXT;`);
        console.log("Added credential_photo_url to employees");
    } catch(e) {
        console.error(e);
    }

    // 2. Create ticket_checkin_logs
    try {
        await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ticket_checkin_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            purchased_ticket_id UUID NOT NULL REFERENCES purchased_tickets(id),
            event_id UUID NOT NULL REFERENCES events(id),
            operator_id UUID NOT NULL,
            action TEXT NOT NULL,
            reason TEXT,
            device_info JSONB,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
        `);
        console.log("Created ticket_checkin_logs table");
    } catch(e) {
        console.error(e);
    }
    
    process.exit(0);
}
main();
