import { supabaseAdmin } from './src/lib/supabaseAdmin';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function executeWipe() {
  console.log("=== 1. VERIFICAÇÃO MASTER ===");
  const masterId = "e467d60f-9ce8-46bf-81ab-b0cdfa2d3925";
  
  const masterPlatform = await sql`SELECT status FROM platform_masters WHERE user_id = ${masterId}`;
  const masterUser = await sql`SELECT id FROM auth.users WHERE id = ${masterId}`;
  const masterProfile = await sql`SELECT id FROM profiles WHERE user_id = ${masterId}`;

  if (!masterPlatform.length || masterPlatform[0].status !== 'active') {
    throw new Error('ABORTANDO: Master platform verification failed (status is not active or not found).');
  }
  if (!masterUser.length || !masterProfile.length) {
    throw new Error('ABORTANDO: Master identity verification failed.');
  }
  console.log("Master Identity and Platform status verified.");

  console.log("=== 2. LIMPANDO TRANSACIONAIS ===");
  await sql`TRUNCATE TABLE events, products, promoters, staff_functions, webhook_logs CASCADE`;
  console.log("Transactional tables truncated.");

  console.log("=== 3. DELETANDO USERS ===");
  const usersToDelete = [
    "2909af63-7ea9-4ee0-a223-d41dfdd8ea8f",
    "62c65f62-d155-4f6d-a6c7-4530a8151c35",
    "c192249a-ca14-4292-ae73-54efb9ad3621",
    "8a358ea2-519b-43bd-858b-9fbf3ba63d59",
    "b97dd291-6a3f-4e6a-a610-2eff65915655",
    "d539f71b-45a6-490a-b5bd-66ad2bec7ba0"
  ];

  if (usersToDelete.includes(masterId)) {
    throw new Error('ABORTANDO: Master presente na lista de exclusão');
  }

  for (const uid of usersToDelete) {
    if (!supabaseAdmin) throw new Error("Supabase Admin não inicializado.");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) {
      throw new Error(`ABORTANDO: Falha ao deletar ${uid}: ${error.message}`);
    }
  }
  console.log("Users deleted.");

  console.log("=== 4. VERIFICAÇÃO FINAL COMPLETA ===");
  const tables = [
    'profiles', 'platform_masters', 'organizer_details', 'events', 'event_faqs', 
    'tickets', 'sales', 'purchased_tickets', 'staff_profiles', 'event_staff', 
    'event_staff_roles', 'staff_functions', 'employees', 'products', 'promoters',
    'roles', 'permissions', 'role_permissions', 'event_categories', 'hero_banners'
  ];

  const counts: Record<string, number> = {};
  const authCount = await sql`SELECT count(*) as c FROM auth.users`;
  counts['auth.users'] = parseInt(authCount[0].c, 10);

  for (const t of tables) {
    const res = await sql.unsafe(`SELECT count(*) as c FROM "${t}"`);
    counts[t] = parseInt(res[0].c, 10);
  }

  console.log("\nCounts pós-wipe:");
  for (const [key, val] of Object.entries(counts)) {
    console.log(`${key} = ${val}`);
  }

  const expectedZeros = [
    'organizer_details', 'events', 'event_faqs', 'tickets', 'sales', 'purchased_tickets',
    'staff_profiles', 'event_staff', 'event_staff_roles', 'staff_functions', 'employees', 'products', 'promoters'
  ];

  let falhou = false;
  for (const t of expectedZeros) {
    if (counts[t] !== 0) {
      console.error(`ERRO: ${t} era para ser 0 mas possui ${counts[t]} registros.`);
      falhou = true;
    }
  }

  if (counts['auth.users'] !== 1) { console.error(`ERRO: auth.users != 1`); falhou = true; }
  if (counts['profiles'] !== 1) { console.error(`ERRO: profiles != 1`); falhou = true; }
  if (counts['platform_masters'] !== 1) { console.error(`ERRO: platform_masters != 1`); falhou = true; }
  if (counts['roles'] !== 8) { console.error(`ERRO: roles != 8`); falhou = true; }
  if (counts['permissions'] !== 14) { console.error(`ERRO: permissions != 14`); falhou = true; }
  if (counts['role_permissions'] !== 27) { console.error(`ERRO: role_permissions != 27`); falhou = true; }
  if (counts['event_categories'] !== 10) { console.error(`ERRO: event_categories != 10`); falhou = true; }
  if (counts['hero_banners'] !== 5) { console.error(`ERRO: hero_banners != 5`); falhou = true; }

  const verifyMaster = await sql`SELECT id FROM auth.users WHERE id = ${masterId}`;
  if (!verifyMaster.length) {
    console.error(`ERRO: Master ${masterId} não encontrado após wipe.`);
    falhou = true;
  }
  const verifyPlatform = await sql`SELECT status FROM platform_masters WHERE user_id = ${masterId}`;
  if (!verifyPlatform.length || verifyPlatform[0].status !== 'active') {
    console.error(`ERRO: Master platform_masters status invalido.`);
    falhou = true;
  }

  if (falhou) {
    throw new Error('O RESET ESTÁ INCOMPLETO/FALHOU EM UMA OU MAIS CONTAGENS.');
  }

  console.log("=== RESET COMPLETO COM SUCESSO ===");
  process.exit(0);
}

executeWipe().catch((error) => {
  console.error(error);
  process.exit(1);
});
