import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './supabase-config';

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Singleton para o Front-end com trava de storage desativada para evitar deadlocks
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'a3tickets_sb_auth',
          flowType: 'implicit',
          // Bypass navigator.locks para evitar "Lock was released because another request stole it"
          // A assinatura correta é: lock(name, acquireTimeout, fn) => Promise
          lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
            return await fn();
          }
        }
      }
    );
  }
  return supabaseInstance;
})();

// Singleton para Administrativo
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.serviceRole,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return supabaseAdminInstance;
})();
