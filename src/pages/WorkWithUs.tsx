import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Link as LinkIcon, UserPlus, CheckCircle2, AlertCircle, Megaphone, Users, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import Logo from '@/components/ui/logo';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const WorkWithUs = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as 'promoter' | 'staff') || 'promoter';

  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      setStatus('error');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    
    try {
      const { success, error } = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      });

      if (!success) {
        throw new Error(error || 'Erro ao criar conta');
      }
      
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: formData.role });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setErrorMessage(error.message || 'Erro ao criar conta. Tente novamente.');
      setStatus('error');
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white relative flex flex-col items-center justify-center py-20 px-4 font-sans">
        
        {/* Background Effects */}
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
          <img src="/background site.png" alt="Custom Background" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px]" />
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-20 bg-indigo-600 mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-15 bg-purple-600 mix-blend-screen" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-3xl"
        >
          <div className="text-center mb-12 space-y-6">
            <div className="flex justify-center mb-10 md:mb-16 mt-4 md:mt-8">
              <Logo variant="default" className="brightness-200 scale-[2.5] md:scale-[4]" />
            </div>
            <h1 className="flex flex-row flex-wrap items-center justify-center font-black uppercase gap-3">
              <span className="text-xl md:text-3xl lg:text-4xl text-white tracking-tight leading-none">Trabalhe</span>
              <span className="text-xl md:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 tracking-tight leading-none">Conosco</span>
            </h1>
            <p className="text-zinc-400 font-medium max-w-lg mx-auto text-base md:text-lg mt-6">
              Faça parte dos maiores eventos. Escolha atuar nos bastidores como <strong className="text-white">Staff</strong> ou fature espalhando a palavra como <strong className="text-indigo-400">Promoter</strong>.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl">
            {status === 'success' ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6 py-10"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Conta Criada!</h2>
                  <p className="text-zinc-400">Sua conta foi criada com sucesso. Clique no botão abaixo para concluir o seu perfil e acessar o painel.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => navigate(`/onboarding/${formData.role}`)}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Continuar para o Onboarding
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Role Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'promoter'})}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                      formData.role === 'promoter' 
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Megaphone className={`w-10 h-10 mb-3 ${formData.role === 'promoter' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    <span className={`font-black uppercase tracking-widest text-sm ${formData.role === 'promoter' ? 'text-white' : 'text-zinc-400'}`}>Quero ser Promoter</span>
                    <span className="text-[10px] text-zinc-500 font-medium mt-2 text-center">Indique eventos e ganhe comissão por vendas.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'staff'})}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                      formData.role === 'staff' 
                        ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Users className={`w-10 h-10 mb-3 ${formData.role === 'staff' ? 'text-purple-400' : 'text-zinc-500'}`} />
                    <span className={`font-black uppercase tracking-widest text-sm ${formData.role === 'staff' ? 'text-white' : 'text-zinc-400'}`}>Quero ser Staff</span>
                    <span className="text-[10px] text-zinc-500 font-medium mt-2 text-center">Trabalhe na operação no dia do evento.</span>
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nome Completo</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="João da Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="joao@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">WhatsApp</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Senha</label>
                      <input 
                        required
                        type="password" 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Confirmar Senha</label>
                      <input 
                        required
                        type="password" 
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{errorMessage}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" /> Enviar Aplicação
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default WorkWithUs;
