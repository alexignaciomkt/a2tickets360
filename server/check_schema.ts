import postgres from 'postgres';
const client = postgres('postgresql://postgres.osfnqpehvhznrecljjjf:Ticketera010203%232026@aws-1-sa-east-1.pooler.supabase.com:6543/postgres');
client`SELECT column_name FROM information_schema.columns WHERE table_name = 'events'`.then(res => { 
  console.log(res.map(r => r.column_name)); 
  process.exit(0); 
}).catch(console.error);
