async function testLogin() {
  const email = 'admin@a2tickets360.com.br';
  const password = 'A2Master@2026!';

  console.log(`🧪 Testando login para: ${email}...`);

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login realizado com sucesso!');
      console.log('🎫 Token:', data.token ? 'Recebido (JWT)' : 'Não recebido');
      console.log('👤 Usuário:', JSON.stringify(data.user, null, 2));
    } else {
      console.error('❌ Falha no login:', data.error || response.statusText);
    }
  } catch (error: any) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testLogin();
