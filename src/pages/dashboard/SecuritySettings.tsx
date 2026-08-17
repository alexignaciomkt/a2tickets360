import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const SecuritySettings = () => {
  const { toast } = useToast();
  const { user, sendPasswordRecovery } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast({ title: 'Erro', description: 'Informe sua senha atual.', variant: 'destructive' });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({ title: 'Erro', description: 'A nova senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erro', description: 'A confirmação de senha não confere.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Tentativa oficial de atualização com current_password
      // Obs: O Supabase exige que a opção 'Secure password change' esteja ativa no Auth Settings para validar a senha atual rigorosamente.
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        // @ts-ignore - Supabase type definitions might not strictly expose this in all IDE configurations, but it is supported
        current_password: currentPassword
      });

      if (error) {
        if (error.message.includes('New password should be different from the old password')) {
          throw new Error('A nova senha não pode ser igual à senha atual.');
        }
        if (error.status === 400 || error.message.includes('password')) {
          throw new Error('Senha atual incorreta ou política de senha não atendida.');
        }
        throw error;
      }

      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi alterada com sucesso. Sessão mantida ativa.',
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err);
      toast({
        variant: 'destructive',
        title: 'Falha na alteração',
        description: err.message || 'Verifique sua senha atual e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    if (!user?.email) return;
    setRecoveryLoading(true);
    try {
      const success = await sendPasswordRecovery(user.email);
      if (success) {
        toast({
          title: 'E-mail enviado!',
          description: 'Enviamos as instruções para redefinir sua senha no seu e-mail principal.',
        });
      } else {
        throw new Error('Falha no envio.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar e-mail',
        description: 'Não foi possível disparar o e-mail de recuperação.',
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <DashboardLayout userType={user?.role === 'organizer' ? 'organizer' : 'customer'}>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-16 font-sans">
        
        {/* Header Section */}
        <div className="space-y-1.5">
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Segurança da Conta</h1>
           <p className="font-medium text-slate-500">
             Gerencie suas credenciais e informações de acesso à A2Tickets360.
           </p>
        </div>

        {/* E-mail de Acesso */}
        <Card className="rounded-[2rem] border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-gray-50 bg-slate-50/50">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-600" /> E-mail de Acesso
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Endereço de E-mail</Label>
              <Input 
                value={user?.email || ''}
                disabled
                className="h-14 rounded-2xl border-gray-200 bg-slate-100 text-sm font-semibold focus:ring-0 transition-all px-6 text-slate-500 cursor-not-allowed max-w-md" 
              />
              <p className="text-xs font-medium text-slate-400 mt-2">Este é o e-mail utilizado para acessar sua conta.</p>
            </div>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card className="rounded-[2rem] border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-gray-50 bg-slate-50/50">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-amber-500" /> Alterar Senha
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Senha Atual</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input 
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-14 rounded-2xl border-gray-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-indigo-600/10 transition-all pl-12 pr-12" 
                    placeholder="Sua senha atual"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Nova Senha</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input 
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-14 rounded-2xl border-gray-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-indigo-600/10 transition-all pl-12 pr-12" 
                    placeholder="Nova senha (min. 6 caracteres)"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Confirmar Nova Senha</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-14 rounded-2xl border-gray-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-indigo-600/10 transition-all pl-12 pr-12" 
                    placeholder="Repita sua nova senha"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest px-8 shadow-md transition-all w-full sm:w-auto mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : 'Atualizar Senha'}
              </Button>
            </form>

            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-sm font-bold text-slate-800">Esqueceu sua senha?</h3>
                  <p className="text-xs font-medium text-slate-500">Enviaremos um link seguro para você redefinir a senha do seu acesso principal.</p>
               </div>
               <Button 
                 variant="outline"
                 onClick={handleRecovery}
                 disabled={recoveryLoading}
                 className="h-12 rounded-xl border-gray-200 text-slate-700 text-xs font-black uppercase tracking-widest px-6 shadow-sm hover:bg-slate-50 shrink-0 w-full sm:w-auto"
               >
                 {recoveryLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Redefinir por E-mail'}
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* 
          TODO: Evolução Futura - 2FA / Dispositivos
          <Card>
            MFA / Sessões
            Depende de ativação do Supabase (supabase.auth.mfa) no projeto.
          </Card>
        */}
      </div>
    </DashboardLayout>
  );
};

export default SecuritySettings;
