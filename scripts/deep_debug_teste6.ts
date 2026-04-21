import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://osfnqpehvhznrecljjjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI'
);

async function run() {
  console.log('--- Buscando Perfil teste6@teste.com ---');
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'teste6@teste.com')
    .single();

  if (!profile) {
    console.error('Perfil não encontrado!');
    return;
  }
  console.log('Profile:', profile);

  console.log('\n--- Buscando Detalhes (organizer_details) ---');
  const { data: details } = await supabase
    .from('organizer_details')
    .select('*')
    .eq('user_id', profile.user_id)
    .single();

  console.log('Details:', details || 'NENHUM DETALHE ENCONTRADO');
  
  console.log('\n--- Buscando Configurações de Webhook ---');
  const { data: hooks } = await supabase
    .from('webhook_configs')
    .select('*');
  console.log('Webhook Configs:', hooks);
}

run();
