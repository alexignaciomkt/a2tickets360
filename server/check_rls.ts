import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function check() {
  const policies = await sql`
    SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'tickets'
  `;
  console.log(policies);
  process.exit(0);
}

check().catch(console.error);
