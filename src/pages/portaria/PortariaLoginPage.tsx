import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function PortariaLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'forgot'>('login');
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            // The Auth context handles the redirect globally via PortariaGuard
            window.location.href = '/app';
        } catch (err: any) {
            toast({ title: "Erro ao fazer login", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({ title: "Informe o email", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://portaria.a2tickets360.com.br/redefinir-senha'
            });
            if (error) throw error;
            toast({ title: "Email enviado", description: "Verifique sua caixa de entrada para redefinir a senha." });
            setMode('login');
        } catch (err: any) {
            toast({ title: "Erro ao recuperar senha", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md border-border/10 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader className="text-center pb-8 pt-0">
                    <img src="/logo_512x512.png" alt="A2 Tickets" className="w-64 h-auto object-contain mx-auto -mt-6 -mb-14 drop-shadow-xl" />
                    <CardTitle className="text-xl font-black tracking-tight text-white mb-1 relative z-10">PORTARIA</CardTitle>
                    <CardDescription className="text-zinc-400 text-sm font-medium uppercase tracking-widest">
                        Sistema de Controle de Acesso
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="text-center mb-6">
                                <p className="text-sm text-zinc-400 font-medium">Entre com seu acesso A2Tickets360</p>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    type="email"
                                    placeholder="E-mail cadastrado"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-800/50 border-zinc-700 h-14 text-base focus:border-white/50 focus:ring-white/20"
                                    required
                                />
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-zinc-800/50 border-zinc-700 h-14 text-base pr-12 focus:border-white/50 focus:ring-white/20"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-14 text-lg font-bold bg-white hover:bg-zinc-200 text-zinc-950 transition-colors" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleRecovery} className="space-y-5">
                            <div className="text-center mb-6">
                                <p className="text-sm text-zinc-400 font-medium">Enviaremos um link de acesso</p>
                            </div>
                            <Input
                                type="email"
                                placeholder="Seu email cadastrado"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-800/50 border-zinc-700 h-14 text-base focus:border-white/50 focus:ring-white/20"
                                required
                            />
                            <Button type="submit" className="w-full h-14 text-lg font-bold bg-white hover:bg-zinc-200 text-zinc-950 transition-colors" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar link'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-6 justify-center pt-2">
                    <Button variant="link" className="text-zinc-400 hover:text-white text-sm transition-colors" onClick={() => setMode(mode === 'login' ? 'forgot' : 'login')}>
                        {mode === 'login' ? 'Esqueci minha senha' : 'Voltar para o login'}
                    </Button>
                    <p className="text-xs text-zinc-600 text-center w-full font-medium">
                        Acesso exclusivo para equipe autorizada
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
