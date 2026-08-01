import { db } from './src/db/index';
import { sql } from 'drizzle-orm';
async function run() {
    const res = await db.execute(sql.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'organizer_details'"));
    console.log(res);
    process.exit(0);
}
run();
