import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function check() {
  const tix = await sql`SELECT id, name, event_id FROM tickets`;
  console.log(`TOTAL TICKETS IN DB: ${tix.length}`);
  if (tix.length > 0) {
    console.log(tix.slice(0, 10));
  }
  process.exit(0);
}

check().catch(console.error);
