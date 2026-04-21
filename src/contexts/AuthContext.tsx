import { createContext, useContext } from 'react';
import { User, RegisterData } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: (silent?: boolean) => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  sendPasswordRecovery: (email: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
