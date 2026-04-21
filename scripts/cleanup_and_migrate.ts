import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://osfnqpehvhznrecljjjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI'
);

async function run() {
  console.log('=== 1. Buscando usuários não-master ===');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, user_id, email, role')
    .neq('role', 'master');

  console.log('Usuários para deletar:', profiles?.map(p => p.email));

  if (!profiles || profiles.length === 0) {
    console.log('Nenhum usuário para deletar!');
  } else {
    for (const profile of profiles) {
      console.log(`\nDeletando ${profile.email}...`);

      // Delete organizer_details first
      await supabase.from('organizer_details').delete().eq('user_id', profile.user_id);
      // Delete events
      await supabase.from('events').delete().eq('organizer_id', profile.user_id);
      // Delete profile
      await supabase.from('profiles').delete().eq('id', profile.id);
      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(profile.user_id);
      if (error) console.error('Erro ao deletar auth user:', error.message);
      else console.log(`✅ ${profile.email} removido.`);
    }
  }

  console.log('\n=== 2. Adicionando colunas faltantes em organizer_details ===');
  // We'll add these via direct SQL using rpc if available, or report what's needed
  const columnsToAdd = [
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS cpf TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS rg TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS birth_date TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS postal_code TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS document_front_url TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS document_back_url TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS asaas_key TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS instagram_url TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS facebook_url TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS whatsapp_number TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS website_url TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS company_address TEXT`,
    `ALTER TABLE public.organizer_details ADD COLUMN IF NOT EXISTS last_step INTEGER DEFAULT 1`,
  ];

  console.log('\nCOLE ESSE SQL NO SEU SUPABASE SQL EDITOR:\n');
  console.log(columnsToAdd.join(';\n') + ';');

  console.log('\n=== Limpeza concluída! ===');
}

run();
