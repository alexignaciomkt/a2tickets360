
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osfnqpehvhznrecljjjf.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function checkOrganizerDocs() {
  console.log('🔍 [DIAGNOSTIC] Verificando documentos de produtores pendentes...');
  
  const { data: profiles, error: pErr } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, email, status')
    .eq('role', 'organizer')
    .eq('status', 'pending');

  if (pErr) {
    console.error('Erro ao buscar perfis:', pErr);
    return;
  }

  console.log(`Encontrados ${profiles.length} produtores pendentes.`);

  for (const profile of profiles) {
    const { data: details, error: dErr } = await supabaseAdmin
      .from('organizer_details')
      .select('*')
      .eq('user_id', profile.user_id)
      .single();

    if (dErr) {
      console.log(`❌ [${profile.email}] Sem detalhes na tabela organizer_details.`);
    } else {
      console.log(`✅ [${profile.email}] Detalhes encontrados:`);
      console.log(`   - Documento Frente: ${details.document_front_url || 'NULO'}`);
      console.log(`   - Documento Verso: ${details.document_back_url || 'NULO'}`);
      console.log(`   - Logo: ${details.logo_url || 'NULO'}`);
      
      // Check if columns exist but are just empty strings
      if (details.document_front_url === "") console.log("   ⚠️ AVISO: document_front_url está como string VAZIA.");
    }
  }
}

checkOrganizerDocs().catch(console.error);
