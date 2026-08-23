import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/ui/logo';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthShell from '@/components/auth/AuthShell';

export default function SetupPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [sessionError, setSessionError] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Permite visualização no modo dev sem precisar de sessão
    const isDevPreview = import.meta.env.DEV && location.pathname === '/dev/setup-password-preview';

    useEffect(() => {
        if (isDevPreview) {
            setCheckingSession(false);
            return;
        }

        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (!session || error) {
                setSessionError(true);
                setCheckingSession(false);
                return;
            }
            if (session.user?.email) {
                setUserEmail(session.user.email);
            }
            setCheckingSession(false);
        };
        
        checkSession();
    }, [isDevPreview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            toast({ title: 'Erro', description: 'A senha precisa ter pelo menos 6 caracteres.', variant: 'destructive' });
            return;
        }
        
        if (password !== confirmPassword) {
            toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
            return;
        }

        setLoading(true);

        try {
            if (!isDevPreview) {
                const { error } = await supabase.auth.updateUser({
                    password: password
                });

                if (error) throw error;
            }

            toast({
                title: 'Sucesso',
                description: 'Sua senha foi criada com sucesso.',
            });

            if (!isDevPreview) {
                // signOut é MANDATÓRIO após criar a senha pelo convite
                await supabase.auth.signOut();
            }

            // Redireciona para o login forçando o usuário a usar a nova senha
            const redirectUrl = userEmail ? `/login?email=${encodeURIComponent(userEmail)}` : '/login';
            navigate(redirectUrl, { replace: true });
            
        } catch (error: any) {
            console.error('Erro ao definir senha:', error);
            toast({
                title: 'Erro ao definir senha',
                description: error.message || 'Ocorreu um erro inesperado.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Validando seu convite...</p>
                </div>
            </div>
        );
    }

    if (sessionError) {
        return (
            <AuthShell
                eyebrow="Acesso Expirado"
                title="Convite Inválido"
                subtitle="Este convite expirou ou já foi utilizado."
                footer={
                    <Button 
                        onClick={() => navigate('/login', { replace: true })}
                        variant="outline"
                        className="w-full border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white uppercase font-bold text-xs h-14 rounded-xl transition-all"
                    >
                        Voltar ao Login
                    </Button>
                }
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-sm text-zinc-400 font-medium">Solicite ao responsável pelo evento um novo acesso.</p>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            eyebrow="Primeiro Acesso"
            title="Crie sua Senha"
            subtitle="Defina sua senha de acesso à A2Tickets360."
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Nova Senha
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-zinc-500" />
                        </div>
                        <Input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl pl-12 pr-12 h-14 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                            placeholder="No mínimo 6 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-4 flex items-center"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-zinc-500 hover:text-zinc-300 transition-colors" />
                            ) : (
                                <Eye className="h-5 w-5 text-zinc-500 hover:text-zinc-300 transition-colors" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Confirmar Senha
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-zinc-500" />
                        </div>
                        <Input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl pl-12 pr-12 h-14 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                            placeholder="Repita sua nova senha"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center" 
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Minha Senha'}
                    </button>
                </div>
                
                <p className="text-center text-[9px] text-zinc-500 font-bold uppercase tracking-widest pt-2">
                    Você usará este acesso sempre que precisar entrar.
                </p>
            </form>
        </AuthShell>
    );
}
