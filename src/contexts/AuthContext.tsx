
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { users } from '@/data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'organizer' | 'admin';
  photoUrl: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  setUserByRole: (role: 'customer' | 'organizer' | 'admin' | 'master') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('A2 Tickets 360_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Auto login as admin for development
      const adminUser = users.find(u => u.email === 'admin@sanjapass.com');
      if (adminUser) {
        setUserByRole('master');
      }
    }
  }, []);

  const setUserByRole = (role: 'customer' | 'organizer' | 'admin' | 'master') => {
    let mockUser: User;

    switch (role) {
      case 'customer':
        mockUser = users.find(u => u.email === 'maria@example.com')!;
        break;
      case 'organizer':
        mockUser = users.find(u => u.email === 'ana@eventpro.com')!;
        break;
      case 'admin':
        mockUser = users.find(u => u.email === 'admin@A2 Tickets 360.com')!;
        break;
      case 'master':
        // Create a master admin user if it doesn't exist
        mockUser = {
          id: 'master-admin-id',
          name: 'A2 Tickets 360 Master Admin',
          email: 'master@A2 Tickets 360.com',
          role: 'admin', // We'll use admin role but extend privileges in UI
          photoUrl: 'https://i.pravatar.cc/300?u=master'
        };
        break;
    }

    setUser(mockUser);
    localStorage.setItem('A2 Tickets 360_user', JSON.stringify(mockUser));
    toast({
      title: 'Login automático',
      description: `Logado como ${mockUser.name} (${role})`,
    });
  };

  const login = async (email: string, password: string) => {
    try {
      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find user with matching email (password is not checked in this mock)
      const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          photoUrl: foundUser.photoUrl,
        };

        // Assuming a token would be received from an actual API, for now, we'll just store the user data
        // localStorage.setItem('A2 Tickets 360_token', 'mock_token_123'); // If a separate token is needed
        localStorage.setItem('A2 Tickets 360_user', JSON.stringify(userData));

        toast({
          title: 'Login realizado com sucesso',
          description: `Bem-vindo(a) de volta, ${userData.name}!`,
        });

        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao fazer login',
          description: 'Email ou senha incorretos.',
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: 'Ocorreu um erro ao processar sua solicitação.',
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // localStorage.removeItem('A2 Tickets 360_token'); // If a separate token was stored
    localStorage.removeItem('A2 Tickets 360_user');
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, setUserByRole }}>
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
