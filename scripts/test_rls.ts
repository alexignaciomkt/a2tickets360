import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://osfnqpehvhznrecljjjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI'
);

async function run() {
  console.log('--- Verificando Políticas de RLS ---');
  
  // Note: We need to query pg_policies which is in pg_catalog, but usually denied to anon/service_role via standard API.
  // We'll try a trick: check if we can actually perform the operations.
  
  const testUserId = 'e89be702-6fae-4950-9e30-984f3362eff3'; // teste6 user_id

  console.log('Testando UPDATE em profiles para teste6...');
  const { error: pError } = await supabase
    .from('profiles')
    .update({ profile_complete: false }) // no-op update to test
    .eq('user_id', testUserId);
  
  if (pError) console.error('Erro UPDATE Profiles:', pError.message);
  else console.log('Sucesso UPDATE Profiles!');

  console.log('\nTestando INSERT em organizer_details para teste6...');
  const { error: dError } = await supabase
    .from('organizer_details')
    .insert({ user_id: testUserId, company_name: 'Teste Diagnostico' });
    
  if (dError) console.error('Erro INSERT Details:', dError.message);
  else console.log('Sucesso INSERT Details!');
  
  console.log('\nTestando SELECT em webhook_configs...');
  const { data: hooks, error: hError } = await supabase
    .from('webhook_configs')
    .select('*');
    
  if (hError) console.error('Erro SELECT Webhooks:', hError.message);
  else console.log('Sucesso SELECT Webhooks! Encontrados:', hooks.length);
}

run();
