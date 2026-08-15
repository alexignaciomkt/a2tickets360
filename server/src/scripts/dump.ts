import { db } from '../db/index';
import { events } from '../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';

async function run() {
    const ev = await db.select().from(events).where(eq(events.id, '495b08f1-e2ec-4c04-8167-09b74cf88e58'));
    fs.writeFileSync('dump.json', JSON.stringify(ev, null, 2));
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
