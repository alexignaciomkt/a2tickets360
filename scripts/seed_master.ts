import { createClient } from '@supabase/supabase-js';

// Usando as credenciais do seu arquivo
const supabaseUrl = 'https://osfnqpehvhznrecljjjf.supabase.co';
const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI';

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createMasterAdmin() {
  console.log('🚀 Criando Master Admin...');

  const masterEmail = 'admin@a2tickets360.com.br';
  const masterPassword = 'A2Tickets!2026';

  // 1. Criar o usuário no Auth (bypass email confirmation)
  const { data, error } = await supabase.auth.admin.createUser({
    email: masterEmail,
    password: masterPassword,
    email_confirm: true,
    user_metadata: { name: 'Master Admin' }
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Usuário já existe no Auth.');
    } else {
      console.error('❌ Erro ao criar usuário:', error.message);
      return;
    }
  }

  const userId = data.user?.id;

  if (userId) {
    // 2. Criar o perfil como 'master'
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        name: 'Master Admin',
        email: masterEmail,
        role: 'master',
        status: 'approved',
        profile_complete: true
      });

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message);
    } else {
      console.log('✅ Master Admin criado com sucesso no banco!');
    }
  }
}

createMasterAdmin();
