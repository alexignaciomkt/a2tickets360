import { UserRole, ProfileStatus } from '@/lib/supabase-config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: ProfileStatus;
  profileComplete: boolean;
  photoUrl: string;
  cpf?: string;
  phone?: string;
  profileDocId?: string;
  slug?: string;
  companyName?: string;
  city?: string;
  state?: string;
  address?: string;
  birthDate?: string;
  createdAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  cnpj?: string;
  cpf?: string;
  city?: string;
  state?: string;
  slug?: string;
  bannerUrl?: string;
}
