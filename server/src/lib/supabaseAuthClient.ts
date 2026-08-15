import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://osfnqpehvhznrecljjjf.supabase.co';
// Usa variável de ambiente ou fallback para desenvolvimento local
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjY5MzYsImV4cCI6MjA5MTQ0MjkzNn0.e5dGTLIwTErEACfDTAAn2aDagkm08Q0cd0n6ESXDStw';

// Client focado estritamente no fluxo público de Auth (Anon/Publishable Key)
// Não deve ser usado para operações administrativas como inviteUserByEmail ou getUserById.
export const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
