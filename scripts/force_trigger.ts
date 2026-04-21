import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://osfnqpehvhznrecljjjf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI'); 

async function execute() { 
  const sql = `
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (id, user_id, name, email, role, status, profile_complete)
    VALUES (
      gen_random_uuid(),
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
      new.email,
      COALESCE(new.raw_user_meta_data->>'role', 'visitor'),
      CASE WHEN COALESCE(new.raw_user_meta_data->>'role', 'visitor') = 'organizer' THEN 'pending' ELSE 'approved' END,
      false
    );
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql }); 
  console.log('Trigger Atualizado!', 'Erro:', error); 
} 
execute();
