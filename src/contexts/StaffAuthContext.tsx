
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StaffAuth } from '@/interfaces/staff';
import { staffService } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';

interface StaffAuthContextType {
  staffAuth: StaffAuth | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  const [staffAuth, setStaffAuth] = useState<StaffAuth | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedAuth = localStorage.getItem('sanjapass_staff_auth');
    if (savedAuth) {
      setStaffAuth(JSON.parse(savedAuth));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const auth = await staffService.staffLogin(email, password);
      
      if (auth) {
        setStaffAuth(auth);
        localStorage.setItem('sanjapass_staff_auth', JSON.stringify(auth));
        
        toast({
          title: 'Login realizado com sucesso',
          description: `Bem-vindo(a), ${auth.staffName}!`,
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
    setStaffAuth(null);
    localStorage.removeItem('sanjapass_staff_auth');
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  return (
    <StaffAuthContext.Provider value={{ staffAuth, login, logout, isAuthenticated: !!staffAuth }}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};
