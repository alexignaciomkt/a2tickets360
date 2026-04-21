import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://osfnqpehvhznrecljjjf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI'); 

async function testGet() {
    let query = supabase
        .from('profiles')
        .select(`
            *,
            details:organizer_details(*)
        `)
        .eq('role', 'organizer');

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if(error) {
        console.error("ERRO!", error);
        return;
    }
    
    const mapped = data.map(d => ({
            id: d.id,
            userId: d.user_id,
            name: d.details?.[0]?.company_name || d.name || 'Produtor',
            email: d.email,
            companyName: d.details?.[0]?.company_name || 'Empresa Não Definida',
            status: d.status,
            profileComplete: d.profile_complete || false,
    }));
    
    console.log("QTD ORGANIZADORES:", mapped.length);
    console.log("INCOMPLETOS:", mapped.filter(o => o.status === 'pending' && !o.profileComplete).length);
    console.log("DADOS DOS INCOMPLETOS:", mapped.filter(o => o.status === 'pending' && !o.profileComplete));
}
testGet();
