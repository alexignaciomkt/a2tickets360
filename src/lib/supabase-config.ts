export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://osfnqpehvhznrecljjjf.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
} as const;

export type UserRole = 'master' | 'organizer' | 'staff' | 'exhibitor' | 'customer' | 'promoter';
export type ProfileStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
