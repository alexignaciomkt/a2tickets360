
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseEvent(eventId) {
    console.log(`🔍 Iniciando diagnóstico para o evento: ${eventId}`);

    // 1. Verificar o Evento
    const { data: event, error: evErr } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (evErr) {
        console.error('❌ Erro ao buscar evento:', evErr.message);
        return;
    }

    console.log('✅ Dados do Evento:');
    console.log(`   - Título: ${event.title}`);
    console.log(`   - Status: ${event.status}`);
    console.log(`   - Organizer ID: ${event.organizer_id}`);
    console.log(`   - Created At: ${event.created_at}`);

    // 2. Verificar o Produtor (Profile)
    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', event.organizer_id)
        .single();

    if (profErr) {
        console.error('❌ Erro ao buscar perfil do produtor:', profErr.message);
    } else {
        console.log('✅ Dados do Perfil:');
        console.log(`   - Nome: ${profile.name}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - Status: ${profile.status}`);
        console.log(`   - User ID: ${profile.user_id}`);
    }

    // 3. Verificar Organizer Details
    const { data: details, error: detErr } = await supabase
        .from('organizer_details')
        .select('*')
        .eq('user_id', event.organizer_id)
        .single();

    if (detErr) {
        console.error('❌ Erro ao buscar detalhes do organizador:', detErr.message);
    } else {
        console.log('✅ Dados de Detalhes:');
        console.log(`   - Empresa: ${details.company_name}`);
        console.log(`   - Slug: ${details.slug}`);
    }

    // 4. Testar a lógica do getPendingEvents
    console.log('\n🧪 Testando filtro do Master Admin (status = pending):');
    const { data: pendingEvents } = await supabase
        .from('events')
        .select('id, title, status')
        .eq('status', 'pending');
    
    const found = pendingEvents?.find(e => e.id === eventId);
    if (found) {
        console.log('✅ Sucesso: O evento FOI encontrado pelo filtro de pendentes.');
    } else {
        console.log('❌ Falha: O evento NÃO foi encontrado pelo filtro (provavelmente status diferente de pending).');
    }
}

diagnoseEvent('eafe83c0-462e-4e5b-b548-15d5673c40da');
