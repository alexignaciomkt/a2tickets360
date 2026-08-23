import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        // Parse hash for errors
        const hash = window.location.hash;
        if (hash.includes('error=')) {
            const params = new URLSearchParams(hash.substring(1));
            const error = params.get('error');
            const errorCode = params.get('error_code');
            
            if (errorCode === 'otp_expired' || error === 'access_denied') {
                setErrorState('Este link expirou ou já foi utilizado.');
            } else {
                setErrorState('Ocorreu um erro ao processar o link de recuperação.');
            }
            setCheckingSession(false);
            return;
        }

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setErrorState('Este link expirou ou já foi utilizado.');
            }
            setCheckingSession(false);
        };
        
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            toast({ title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
            return;
        }
        
        if (password !== confirmPassword) {
            toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast({
                title: 'Senha atualizada com sucesso!',
                description: 'Sua senha foi alterada. Você pode fazer login agora.',
            });

            // Deslogar para forçar novo login e limpar sessão temporária
            await supabase.auth.signOut();
            navigate('/login');
            
        } catch (error: any) {
            console.error('Erro ao redefinir senha:', error);
            toast({
                title: 'Erro ao redefinir senha',
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
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (errorState) {
        return (
            <AuthShell
                eyebrow="Redefinição de Senha"
                title="Link Inválido"
                subtitle={errorState}
                footer={
                    <div className="space-y-3">
                        <Button 
                            onClick={() => navigate('/login')} 
                            className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Solicitar novo link
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => navigate('/login')} 
                            className="w-full border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white uppercase font-bold text-xs h-14 rounded-xl transition-all"
                        >
                            Voltar ao login
                        </Button>
                    </div>
                }
            >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            eyebrow="Segurança"
            title="Redefinir Senha"
            subtitle="Crie uma nova senha para sua conta."
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
                        <input
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
                        Confirmar Nova Senha
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
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
                    <Button 
                        type="submit" 
                        className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center border-0"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Redefinir Senha'}
                    </Button>
                </div>
            </form>
        </AuthShell>
    );
}
