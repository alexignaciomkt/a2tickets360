import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function check() {
  const banners = await sql`SELECT * FROM hero_banners`;
  console.log("=== HERO BANNERS ===");
  console.log(JSON.stringify(banners, null, 2));

  const functions = await sql`SELECT id, name, organizer_id FROM staff_functions`;
  console.log("=== STAFF FUNCTIONS ===");
  console.log(JSON.stringify(functions, null, 2));

  process.exit(0);
}

check().catch(console.error);
