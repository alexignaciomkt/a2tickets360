console.log("Check DB Trigger");
import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient('https://osfnqpehvhznrecljjjf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI'); 
async function check() { 
  const { data } = await supabase.rpc('execute_sql', { sql_query: "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_new_user';" }); 
  console.log(data); 
} 
check();
