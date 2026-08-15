import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/ui/logo';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-medium">Validando seu convite...</p>
                </div>
            </div>
        );
    }

    if (sessionError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans w-full overflow-hidden">
                <div className="max-w-lg w-full text-center space-y-8 relative z-10">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 flex flex-col items-center">
                        <div className="w-full flex justify-center mb-6 mt-4">
                            <div className="scale-[1.4] origin-center">
                                <Logo variant="large" showText={true} />
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Este convite expirou ou já foi utilizado.</h2>
                            <p className="text-sm text-slate-400 font-medium">Solicite ao responsável pelo evento um novo acesso.</p>
                        </div>
                        <Button 
                            onClick={() => navigate('/login', { replace: true })}
                            variant="outline"
                            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white uppercase font-bold text-xs"
                        >
                            Voltar ao Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans w-full overflow-hidden">
            <div className="w-full max-w-lg relative z-10 mt-8">
                <div className="bg-slate-900 py-12 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-800">
                    
                    <div className="w-full flex justify-center mb-10 mt-4">
                        <div className="scale-[1.75] origin-center">
                            <Logo variant="large" showText={true} />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            Crie sua Senha
                        </h2>
                        <p className="mt-2 text-sm text-slate-400 font-medium">
                            Defina sua senha de acesso à A2Tickets360.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                                Nova Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 h-14 bg-slate-950 border-slate-800 text-white rounded-2xl focus:ring-primary focus:border-primary transition-all font-medium placeholder:text-slate-600"
                                    placeholder="No mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-12 pr-12 h-14 bg-slate-950 border-slate-800 text-white rounded-2xl focus:ring-primary focus:border-primary transition-all font-medium placeholder:text-slate-600"
                                    placeholder="Repita sua nova senha"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-primary/20 transition-all"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Criar Minha Senha'}
                            </Button>
                        </div>
                        
                        <p className="text-center text-xs text-slate-500 font-medium pt-2">
                            Você usará este acesso sempre que precisar entrar na plataforma.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
