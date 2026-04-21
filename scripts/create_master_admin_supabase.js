import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://osfnqpehvhznrecljjjf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupMasterAdmin() {
    const email = 'admin@a2tickets360.com.br';
    const password = 'A2Teste2024!';
    const name = 'Master Admin A2';

    console.log(`🚀 Criando Master Admin no Supabase: ${email}...`);

    try {
        // 1. Criar usuário no Auth (Admin)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        });

        if (authError) {
            if (authError.message.includes('already exists')) {
                console.log('ℹ️ Usuário já existe no Auth.');
                // Buscar ID
                const { data: users } = await supabaseAdmin.auth.admin.listUsers();
                const user = users.users.find(u => u.email === email);
                if (user) authData.user = user;
            } else {
                throw authError;
            }
        } else {
            console.log(`✅ Usuário criado no Auth (ID: ${authData.user.id})`);
        }

        // 2. Criar Perfil na tabela profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                user_id: authData.user.id,
                name: name,
                email: email,
                role: 'master',
                status: 'approved',
                profile_complete: true
            }, { onConflict: 'user_id' });

        if (profileError) throw profileError;

        console.log(`✅ Perfil Master configurado com sucesso!`);
        console.log('-------------------------------------------');
        console.log(`Login: ${email}`);
        console.log(`Senha: ${password}`);
        console.log('-------------------------------------------');

    } catch (error) {
        console.error('💥 Erro ao configurar Master:', error.message);
    }
}

setupMasterAdmin();
