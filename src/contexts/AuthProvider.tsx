import React, { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { UserRole, ProfileStatus } from '@/lib/supabase-config';
import { User, RegisterData } from '@/types/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const profilePromiseRef = useRef<Promise<User | null> | null>(null);
  // Flag to prevent SIGNED_OUT event from clearing user during registration
  const registrationInProgressRef = useRef(false);

  const fetchUserProfile = useCallback(async (userId: string, userEmail: string): Promise<User | null> => {
    if (profilePromiseRef.current) {
      return profilePromiseRef.current;
    }
    
    const fetchAction = async (): Promise<User | null> => {
      const maxRetries = 3;
      let attempt = 0;

      const dbAction = async (): Promise<User | null> => {
        while (attempt < maxRetries) {
          try {
            console.log(`🔍 [AuthProvider] Buscando perfil (Tentativa ${attempt + 1}):`, userId);

            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', userId)
              .single();

            if (!profileError && profile) {
              let combinedData = { ...profile };

              if (profile.role === 'organizer') {
                const { data: details } = await supabase
                  .from('organizer_details')
                  .select('*')
                  .eq('user_id', userId)
                  .single();
                
                if (details) {
                  combinedData = { ...combinedData, ...details };
                }
              }

              return {
                id: userId,
                name: combinedData.name,
                email: combinedData.email || userEmail,
                role: combinedData.role as UserRole,
                status: (combinedData.status || 'approved') as ProfileStatus,
                profileComplete: combinedData.profile_complete || false,
                photoUrl: combinedData.logo_url || combinedData.photo_url || '',
                cpf: combinedData.cpf,
                phone: combinedData.phone,
                city: combinedData.city,
                state: combinedData.state,
                address: combinedData.address,
                birthDate: combinedData.birth_date,
                profileDocId: profile.id,
                slug: combinedData.slug,
                companyName: combinedData.company_name,
                createdAt: combinedData.created_at
              };
            }

            // Se for novo cadastro, o trigger pode demorar alguns ms
            console.warn(`⚠️ [AuthProvider] Perfil não encontrado. Tentando novamente em 800ms...`);
            attempt++;
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          } catch (err) {
            console.error('❌ [AuthProvider] Erro interno:', err);
            attempt++;
          }
        }
        return null;
      };

      try {
        // Timeout de 15 segundos para dar tempo dos retries
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Tempo limite de conexão excedido')), 15000)
        );
        return await Promise.race([dbAction(), timeoutPromise]);
      } catch (raceError: any) {
        console.error('🕒 [AuthProvider] Timeout:', raceError.message);
        return null;
      } finally {
        profilePromiseRef.current = null;
      }
    };

    profilePromiseRef.current = fetchAction();
    return profilePromiseRef.current;
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // First try localStorage for instant restore
        const savedUser = localStorage.getItem('A2Tickets_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch { /* ignore parse errors */ }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id, session.user.email!);
          if (profile) {
            setUser(profile);
            localStorage.setItem('A2Tickets_user', JSON.stringify(profile));
          }
        } else if (!savedUser) {
          // No session and no saved user
          setUser(null);
        }
      } catch (error) {
        console.error('Erro na sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 [AuthProvider] Evento:', event, 'RegistroEmAndamento:', registrationInProgressRef.current);
      
      // Block SIGNED_OUT during registration to prevent premature redirect
      if (registrationInProgressRef.current && event === 'SIGNED_OUT') {
        console.warn('🛡️ [AuthProvider] SIGNED_OUT bloqueado — registro em andamento.');
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
        const profile = await fetchUserProfile(session.user.id, session.user.email!);
        if (profile) {
          console.log('✅ [AuthProvider] Perfil Carregado:', profile.role);
          setUser(profile);
          localStorage.setItem('A2Tickets_user', JSON.stringify(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        console.warn('⚠️ [AuthProvider] Supabase disparou SIGNED_OUT.');
        const savedUser = localStorage.getItem('A2Tickets_user');
        if (!savedUser) {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('📡 [AuthProvider] Login iniciado:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        let profile = await fetchUserProfile(data.user.id, data.user.email!);
        
        // ── Camada 2: Forçar upsert e tentar de novo ──────────────────────
        if (!profile) {
          console.warn('⚠️ [AuthProvider] Perfil não encontrado — forçando upsert...');
          await supabase.from('profiles').upsert({
            user_id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Novo Usuário',
            role: data.user.user_metadata?.role || 'customer',
            status: 'approved',
            profile_complete: false
          }, { onConflict: 'user_id' });
          await new Promise(r => setTimeout(r, 600));
          profile = await fetchUserProfile(data.user.id, data.user.email!);
        }

        // Auto-corrigir customers presos em 'pending'
        if (profile && profile.role === 'customer' && profile.status === 'pending') {
          console.warn('⚠️ [AuthProvider] Customer pending — corrigindo para approved...');
          await supabase.from('profiles').update({ status: 'approved' }).eq('user_id', data.user.id);
          profile = { ...profile, status: 'approved' as any };
        }

        // ── Camada 3: Fallback de emergência (nunca bloquear o usuário) ────
        if (!profile) {
          console.warn('⚠️ [AuthProvider] Usando fallback de emergência — construindo perfil dos metadados auth.');
          const metaRole = (data.user.user_metadata?.role || 'customer') as UserRole;
          profile = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
            email: data.user.email!,
            role: metaRole,
            status: 'approved' as ProfileStatus,
            profileComplete: false,
            photoUrl: '',
            profileDocId: data.user.id,
          };
        }

        if (profile.status === 'suspended') {
          await supabase.auth.signOut();
          throw new Error('Sua conta está suspensa.');
        }

        setUser(profile);
        localStorage.setItem('A2Tickets_user', JSON.stringify(profile));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('❌ [AuthProvider] Erro no login:', error.message);
      toast({
        variant: 'destructive',
        title: 'Erro no login',
        description: error.message,
      });
      return false;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Activate guard to prevent SIGNED_OUT from clearing state during registration
      registrationInProgressRef.current = true;
      console.log('🚀 [AuthProvider] Registro iniciado para:', data.email);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { 
          data: { 
            name: data.name,
            role: data.role
          } 
        }
      });
      if (authError) throw authError;

      if (authData.user) {
        // Persistir dados para o onboarding capturar (Safety Net)
        localStorage.setItem('A2Tickets_PendingRegistration', JSON.stringify({
          companyName: (data as any).companyName || data.name,
          slug: (data as any).slug,
          phone: (data as any).phone,
          cnpj: (data as any).cnpj,
          role: data.role
        }));

        // 1. Garantir profile no banco (fallback para trigger)
        try {
          const extData = data as any;
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            user_id: authData.user.id,
            name: data.name,
            email: data.email,
            role: data.role,
            cpf: data.cpf,
            phone: data.phone,
            city: extData.city || null,
            state: extData.state || null,
            address: extData.address || null,
            birth_date: extData.birthDate || null,
            status: 'approved',
            profile_complete: true
          }, { onConflict: 'user_id' });
          console.log('✅ [AuthProvider] Profile upsert realizado com sucesso.');
        } catch (e) {
          console.warn('Fallback do profile ignorado/falhou', e);
        }

        // 1.5 Garantir organizer_details com slug, company_name e phone
        // Sem isso, a FanPage (getProducerBySlug) nunca encontra o produtor
        const extData = data as any;
        if (data.role === 'organizer' && (extData.slug || extData.companyName || extData.phone)) {
          try {
            const detailsPayload: any = { user_id: authData.user.id };
            if (extData.slug) detailsPayload.slug = extData.slug;
            if (extData.companyName) detailsPayload.company_name = extData.companyName;
            if (extData.phone) detailsPayload.phone = extData.phone;
            if (extData.cnpj) {
              const cleaned = extData.cnpj.replace(/\D/g, '');
              if (cleaned.length === 11) {
                detailsPayload.cpf = extData.cnpj;
              } else {
                detailsPayload.cnpj = extData.cnpj;
              }
            }

            await supabase.from('organizer_details').upsert(
              detailsPayload,
              { onConflict: 'user_id' }
            );
            console.log('✅ [AuthProvider] organizer_details upsert realizado — slug:', extData.slug);
          } catch (e) {
            console.warn('Fallback do organizer_details ignorado/falhou', e);
          }
        }

        // 2. Forçar login explícito (signUp com PKCE/email confirmation não dá sessão válida)
        try {
          console.log('🔐 [AuthProvider] Forçando signInWithPassword pós-registro...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (signInError) {
            console.warn('⚠️ [AuthProvider] signIn pós-registro falhou:', signInError.message);
            // Fallback: construct user from what we have
          } else {
            console.log('✅ [AuthProvider] Sessão real obtida via signIn:', !!signInData.session);
          }
        } catch (e) {
          console.warn('⚠️ [AuthProvider] Login pós-registro falhou silenciosamente:', e);
        }

        // 3. Definir usuário de forma OTIMISTA para evitar lentidão e redirecionamento (Padrão Elite)
        // Isso resolve o problema do "Sincronizando..." eterno e do redirect para o login
        const optimisticUser: User = {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: 'approved',
          profileComplete: false,
          photoUrl: '',
          slug: (data as any).slug,
          companyName: (data as any).companyName || data.name,
          city: (data as any).city,
          state: (data as any).state,
        };

        console.log('⚡ [AuthProvider] Definindo usuário otimista...');
        setUser(optimisticUser);
        localStorage.setItem('A2Tickets_user', JSON.stringify(optimisticUser));

        // 4. Buscar perfil real em segundo plano para enriquecer os dados (sem bloquear o retorno)
        fetchUserProfile(authData.user.id, data.email).then(profile => {
          if (profile) {
            console.log('✅ [AuthProvider] Perfil real sincronizado em background.');
            setUser(profile);
            localStorage.setItem('A2Tickets_user', JSON.stringify(profile));
          }
        }).catch(err => console.warn('⚠️ [AuthProvider] Falha na sincronização silenciosa do perfil:', err));

        return { success: true };
      }
      return { success: false, error: 'Erro ao criar conta.' };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      // Release the guard after a delay to let any pending SIGNED_OUT events pass
      setTimeout(() => {
        registrationInProgressRef.current = false;
        console.log('🔓 [AuthProvider] Guard de registro liberada.');
      }, 3000);
    }
  };

  const logout = async (silent = false) => {
    try {
      console.log('🚪 [AuthProvider] Iniciando logout...');
      
      // 1. Limpa o LocalStorage IMEDIATAMENTE antes de qualquer chamada async
      localStorage.removeItem('A2Tickets_user');
      
      // 2. Limpa o estado local
      setUser(null);
      
      // 3. Tenta deslogar do Supabase (ignora erros se a sessão já estiver morta)
      await supabase.auth.signOut().catch(() => null);
      
      // 4. Força um reload total da página para limpar memória do cliente Supabase e redirecionar para a index
      window.location.href = '/';
      
    } catch (error) {
      console.error('Erro no logout:', error);
      // Fallback de emergência
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id, session.user.email!);
      setUser(profile);
    }
  };

  const sendPasswordRecovery = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return !error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refreshUser,
        sendPasswordRecovery,
      }}
    >
      <div data-auth-ready={user ? 'true' : undefined} style={{ display: 'contents' }}>
        {children}
      </div>
    </AuthContext.Provider>
  );
}
