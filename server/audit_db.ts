import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function runAudit() {
  console.log("=== 1. IDENTIFICAR MASTER POR UUID ===");
  const email = 'admin@a2tickets360.com.br';
  const masterAuth = await sql`SELECT id, email FROM auth.users WHERE email = ${email}`;
  
  if (masterAuth.length > 0) {
    const masterId = masterAuth[0].id;
    console.log(`Auth ID: ${masterId}`);
    
    const masterProfile = await sql`SELECT id, user_id FROM profiles WHERE user_id = ${masterId}`;
    console.log(`Profile:`, masterProfile);
    
    const masterPlatform = await sql`SELECT user_id, status FROM platform_masters WHERE user_id = ${masterId}`;
    console.log(`Platform Master:`, masterPlatform);
  } else {
    console.log(`Master not found in auth.users`);
  }

  console.log("\n=== 2. AUDITAR FOREIGN KEYS ===");
  const fks = await sql`
    SELECT
      tc.table_name AS origem,
      kcu.column_name AS coluna,
      ccu.table_name AS destino,
      rc.delete_rule AS on_delete
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `;
  console.log(JSON.stringify(fks, null, 2));

  console.log("\n=== 3. INVENTÁRIO DO BANCO E 4. CONTAGENS ===");
  const tables = await sql`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  `;
  
  const counts: Record<string, number> = {};
  for (const t of tables) {
    const res = await sql.unsafe(`SELECT count(*) as c FROM "${t.tablename}"`);
    counts[t.tablename] = parseInt(res[0].c, 10);
  }
  console.log(JSON.stringify(counts, null, 2));

  console.log("\n=== 5. AUTH USERS ===");
  const allUsers = await sql`SELECT id, email FROM auth.users ORDER BY created_at`;
  const userList = allUsers.map(u => ({
    id: u.id,
    email: u.email,
    action: u.email === email ? 'KEEP' : 'DELETE'
  }));
  console.log(JSON.stringify(userList, null, 2));

  process.exit(0);
}

runAudit().catch(console.error);
