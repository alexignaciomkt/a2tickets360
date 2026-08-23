import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import AuthShell from '@/components/auth/AuthShell';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkVerification = async () => {
            try {
                // No Supabase, o link de confirmação geralmente traz o usuário de volta 
                // já com a sessão ativa ou com um access_token fragmentado
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setStatus('success');
                } else {
                    // Se não houver sessão, o link pode ter expirado ou o usuário já confirmou
                    setStatus('error');
                    setMessage('Não foi possível confirmar sua sessão automática. Tente fazer login.');
                }
            } catch (error: any) {
                console.error('❌ Erro na verificação:', error);
                setStatus('error');
                setMessage(error.message || 'Falha ao verificar e-mail. O link pode ter expirado.');
            }
        };

        checkVerification();
    }, [searchParams]);

    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div className="flex flex-col items-center py-10">
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Verificando...</h2>
                    <p className="text-zinc-400">Aguarde um instante enquanto validamos seu e-mail.</p>
                </div>
            );
        }

        if (status === 'success') {
            return (
                <div className="flex flex-col items-center py-10">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">E-mail Confirmado!</h2>
                    <p className="text-zinc-400 mb-10 leading-relaxed text-center text-sm">
                        Seu cadastro foi validado com sucesso. Agora você já pode acessar sua conta e aproveitar todos os recursos.
                    </p>
                    <Button
                        className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                        onClick={() => navigate('/login')}
                    >
                        Ir para o Painel
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center py-10">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Ops! Algo deu errado</h2>
                <p className="text-zinc-400 mb-10 text-center text-sm">
                    {message}
                </p>
                <Link to="/login" className="text-indigo-400 font-bold uppercase tracking-widest text-xs hover:text-indigo-300 transition-colors">
                    Tentar fazer login
                </Link>
            </div>
        );
    };

    return (
        <AuthShell
            eyebrow="Verificação"
            title="Confirmação de E-mail"
            subtitle="Validando o seu acesso ao sistema."
        >
            {renderContent()}
        </AuthShell>
    );
};

export default VerifyEmailPage;
