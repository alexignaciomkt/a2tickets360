import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  url: 'https://osfnqpehvhznrecljjjf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjY5MzYsImV4cCI6MjA5MTQ0MjkzNn0.e5dGTLIwTErEACfDTAAn2aDagkm08Q0cd0n6ESXDStw'
};

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

async function testSignUp() {
  console.log('Testing Supabase SignUp...');
  const email = `test_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: 'Test User' }
      }
    });
    
    if (error) {
      console.error('SignUp Error:', error.message);
      console.error('Error Details:', JSON.stringify(error, null, 2));
    } else {
      console.log('SignUp Successful! User ID:', data.user?.id);
    }
  } catch (err) {
    console.error('Unexpected error during signUp:', err);
  }
}

testSignUp();
