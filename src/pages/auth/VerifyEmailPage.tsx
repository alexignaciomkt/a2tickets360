import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    const token = searchParams.get('token');
    const type = searchParams.get('type') as 'candidate' | 'organizer';

    useEffect(() => {
        const verify = async () => {
            if (!token || !type) {
                setStatus('error');
                setMessage('Link de verificação inválido ou expirado.');
                return;
            }

            try {
                const response: any = await authService.verifyEmail(token, type);
                if (response.status === 'success') {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(response.error || 'Erro ao verificar e-mail.');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'Falha na comunicação com o servidor.');
            }
        };

        verify();
    }, [token, type]);

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
            <div className="mb-12">
                <Logo variant="default" className="text-white" />
            </div>

            <div className="w-full max-w-md bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl text-center shadow-2xl">
                {status === 'loading' && (
                    <div className="flex flex-col items-center py-10">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2 italic uppercase tracking-tighter">Verificando...</h2>
                        <p className="text-gray-400">Aguarde um instante enquanto validamos seu e-mail.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center py-10">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">E-mail Confirmado!</h2>
                        <p className="text-gray-400 mb-10 leading-relaxed">
                            Seu cadastro foi validado com sucesso. Agora você já pode acessar sua conta e aproveitar todos os recursos do A2 Tickets 360.
                        </p>
                        <Button
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-2"
                            onClick={() => navigate(type === 'candidate' ? '/staff/portal' : '/organizer/dashboard')}
                        >
                            Ir para o Painel
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center py-10">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tighter">Ops! Algo deu errado</h2>
                        <p className="text-gray-400 mb-10">
                            {message}
                        </p>
                        <Link to="/" className="text-primary font-bold hover:underline py-2">
                            Voltar para a página inicial
                        </Link>
                    </div>
                )}
            </div>

            <p className="mt-8 text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">
                A2 Tickets 360 &copy; 2026 - Gestão de Elite
            </p>
        </div>
    );
};

export default VerifyEmailPage;
