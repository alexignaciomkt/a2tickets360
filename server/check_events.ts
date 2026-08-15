import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function check() {
  const events = await sql`SELECT id, title, created_at, event_type FROM events ORDER BY created_at DESC LIMIT 5`;
  console.log(events);
  process.exit(0);
}

check().catch(console.error);
