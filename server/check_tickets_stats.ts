import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function check() {
  const result = await sql`SELECT tablename, n_live_tup FROM pg_stat_user_tables WHERE tablename = 'tickets'`;
  console.log(result);
  process.exit(0);
}

check().catch(console.error);
