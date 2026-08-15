export const SUPABASE_CONFIG = {
  url: 'https://osfnqpehvhznrecljjjf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjY5MzYsImV4cCI6MjA5MTQ0MjkzNn0.e5dGTLIwTErEACfDTAAn2aDagkm08Q0cd0n6ESXDStw',
  serviceRole: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI'
} as const;

export type UserRole = 'master' | 'organizer' | 'staff' | 'exhibitor' | 'customer' | 'promoter';
export type ProfileStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
