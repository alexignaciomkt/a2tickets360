import { api } from '@/services/api';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { users } from '@/data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'organizer' | 'admin' | 'staff' | 'master';
  profileComplete: boolean;
  photoUrl: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('A2Tickets_user');
    const savedToken = localStorage.getItem('A2Tickets_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.post<any>('/api/login', { email, password });

      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        profileComplete: !!data.user.profile_complete,
        photoUrl: data.user.photo_url || '',
      };

      setUser(userData);
      setToken(data.token);

      localStorage.setItem('A2Tickets_user', JSON.stringify(userData));
      localStorage.setItem('A2Tickets_token', data.token);

      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo(a) de volta, ${userData.name}!`,
      });

      return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error.message || 'Email ou senha incorretos.',
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('A2Tickets_user');
    localStorage.removeItem('A2Tickets_token');
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
