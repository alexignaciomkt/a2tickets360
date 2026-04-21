import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osfnqpehvhznrecljjjf.supabase.co';
const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI';

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  const email = 'admin@a2tickets360.com.br';
  const newPassword = 'A2Master@2026!';

  console.log(`🔐 Resetando senha para: ${email}...`);

  // 1. Encontrar o usuário pelo email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Erro ao listar usuários:', listError.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error('❌ Usuário não encontrado no Auth do Supabase.');
    return;
  }

  // 2. Atualizar a senha
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (error) {
    console.error('❌ Erro ao atualizar senha:', error.message);
  } else {
    console.log('✅ SENHA ATUALIZADA COM SUCESSO!');
    console.log('Nova senha:', newPassword);
  }
}

resetPassword();
