
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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
    }
  }
}

checkOrganizerDocs().catch(console.error);
