
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osfnqpehvhznrecljjjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseEvent(eventId) {
    console.log(`🔍 DIAGNÓSTICO FINAL: ${eventId}\n`);

    try {
        const { data: event, error: evErr } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (evErr) {
            console.error('❌ ERRO AO BUSCAR EVENTO:', evErr.message);
            return;
        }

        console.log('✅ DADOS DO EVENTO:');
        console.log(`   - Título: ${event.title}`);
        console.log(`   - Status: [${event.status}]`);
        console.log(`   - Organizer ID: ${event.organizer_id}`);

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', event.organizer_id)
            .single();

        console.log('\n✅ DADOS DO PRODUTOR:');
        if (profile) {
            console.log(`   - Nome: ${profile.name}`);
            console.log(`   - Status Conta: [${profile.status}]`);
        } else {
            console.log('   ❌ Perfil não encontrado para o organizer_id fornecido!');
        }

        console.log('\n🧪 TESTE DE VISIBILIDADE MASTER:');
        const { data: pendingEvents } = await supabase
            .from('events')
            .select('id')
            .eq('status', 'pending');
        
        const isVisible = pendingEvents?.some(e => e.id === eventId);
        console.log(`   - Está na lista de pendentes? ${isVisible ? 'SIM' : 'NÃO'}`);

    } catch (err) {
        console.error('💥 Erro:', err);
    }
}

diagnoseEvent('eafe83c0-462e-4e5b-b548-15d5673c40da');
