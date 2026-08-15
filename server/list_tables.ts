import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function listTables() {
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  console.log(tables.map(t => t.tablename).join('\n'));
  process.exit(0);
}

listTables().catch(console.error);
