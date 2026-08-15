import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function check() {
  const users = await sql`SELECT id, email, role FROM auth.users`;
  console.log(users);
  
  const masters = await sql`SELECT * FROM platform_masters`;
  console.log("Masters:", masters);
  
  process.exit(0);
}

check().catch(console.error);
