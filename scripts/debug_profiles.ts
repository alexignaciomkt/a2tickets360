import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://osfnqpehvhznrecljjjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI'
);

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, user_id, email, status, profile_complete, role')
    .neq('role', 'master');

  if (error) {
    console.error('Erro ao buscar perfis:', error);
    return;
  }

  console.log('--- Perfis encontrados (excluindo master) ---');
  console.table(profiles);
}

run();
