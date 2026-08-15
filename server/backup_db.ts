import postgres from 'postgres';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string);

async function runBackup() {
  console.log("Iniciando backup completo em JSON...");
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  
  const backupData: any = {};
  for (const t of tables) {
    const data = await sql.unsafe(`SELECT * FROM "${t.tablename}"`);
    backupData[t.tablename] = data;
  }
  
  // Also backup auth.users
  const users = await sql`SELECT * FROM auth.users`;
  backupData['auth_users'] = users;

  const backupPath = 'C:\\Users\\Sanja works\\a2tickets360_pre_reset_20260815.json';
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`Backup JSON criado em: ${backupPath}`);
  
  const stats = fs.statSync(backupPath);
  console.log(`Tamanho do arquivo: ${stats.size} bytes`);
  
  process.exit(0);
}

runBackup().catch(err => {
  console.error("ERRO NO BACKUP:", err);
  process.exit(1);
});
