import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../src/lib/supabase-config';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRole);

async function check() {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, event_id, status, qr_code_data, qr_code_url, created_at, profiles:user_id(full_name, document)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) console.error(error);
  console.log("Últimos 5 ingressos criados:");
  console.log(JSON.stringify(data, null, 2));
}

check();
