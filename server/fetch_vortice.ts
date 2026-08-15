import { db } from './src/db/db';
import { events } from './src/db/schema';
import { like } from 'drizzle-orm';
import fs from 'fs';

async function run() {
    const ev = await db.select().from(events).where(like(events.title, '%Vórtice%'));
    fs.writeFileSync('vortice.json', JSON.stringify(ev, null, 2));
    process.exit(0);
}
run();
