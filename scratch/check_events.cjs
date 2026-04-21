
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osfnqpehvhznrecljjjf.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function checkEvents() {
  console.log('🔍 [DIAGNOSTIC] Verificando eventos no banco...');
  
  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('id, title, status, slug, organizer_id');

  if (error) {
    console.error('Erro ao buscar eventos:', error);
    return;
  }

  console.log(`Encontrados ${events.length} eventos no total.`);

  events.forEach(e => {
    console.log(`- [${e.status}] ${e.title}`);
    console.log(`  ID: ${e.id}`);
    console.log(`  Slug: ${e.slug || 'N/A'}`);
    console.log(`  Organizer ID: ${e.organizer_id}`);
    console.log('  ---');
  });
}

checkEvents().catch(console.error);
