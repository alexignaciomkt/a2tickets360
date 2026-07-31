import { db } from './src/db/index';
import { sql } from 'drizzle-orm';
async function run() {
    const res = await db.execute(sql.raw("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'purchased_tickets_parent_purchase_id_fkey'"));
    console.log(res);
    process.exit(0);
}
run();
