import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Megaphone, MapPin, Target, Users, Instagram, Briefcase, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';

const PromoterOnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    region: '',
    experience: '',
    channels: [] as string[],
    audienceSize: '',
    pastEvents: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    linkedin: '',
    kwai: '',
    x_twitter: '',
    pinterest: '',
    telegram: '',
  });

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase.from('promoters').upsert({
        user_id: user.id,
        name: user.name,
        email: user.email,
        is_active: true,
        profile_data: {
          region: formData.region,
          experience: formData.experience,
          channels: formData.channels,
          audience_size: formData.audienceSize,
          past_events: formData.pastEvents,
          social_links: {
            instagram: formData.instagram,
            facebook: formData.facebook,
            tiktok: formData.tiktok,
            linkedin: formData.linkedin,
            kwai: formData.kwai,
            x_twitter: formData.x_twitter,
            pinterest: formData.pinterest,
            telegram: formData.telegram,
          },
        }
      }, { onConflict: 'user_id' });

      if (error) throw error;

      // Also update the user's main profile to mark onboarding as complete
      await supabase.from('profiles').update({
        profile_complete: true,
      }).eq('id', user.id);

      setStep(4); // Success step
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Houve um erro ao salvar seu perfil. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white relative flex flex-col items-center py-20 px-4 font-sans">
        
        {/* Background Effects */}
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-indigo-600 mix-blend-screen" />
          <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-purple-600 mix-blend-screen" />
        </div>

        <div className="relative z-10 w-full max-w-2xl mt-12">
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
              <Megaphone className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
              Perfil do <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Promoter</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Precisamos de algumas informações para os organizadores conhecerem o seu potencial.
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            {/* Progress Bar */}
            {step < 4 && (
              <div className="w-full bg-white/5 h-2 rounded-full mb-10 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                  <MapPin className="text-indigo-400" /> Atuação e Redes
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-3">Qual é a sua principal região de atuação? (Cidade/Estado)</label>
                    <input 
                      type="text" 
                      value={formData.region}
                      onChange={e => setFormData({...formData, region: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Ex: São Paulo - SP"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Instagram</label>
                      <input 
                        type="text" 
                        value={formData.instagram}
                        onChange={e => setFormData({...formData, instagram: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="@seuperfil"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">TikTok</label>
                      <input 
                        type="text" 
                        value={formData.tiktok}
                        onChange={e => setFormData({...formData, tiktok: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="@seuperfil"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Facebook</label>
                      <input 
                        type="text" 
                        value={formData.facebook}
                        onChange={e => setFormData({...formData, facebook: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Link do seu perfil/página"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Kwai</label>
                      <input 
                        type="text" 
                        value={formData.kwai}
                        onChange={e => setFormData({...formData, kwai: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="@seuperfil"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Twitter / X</label>
                      <input 
                        type="text" 
                        value={formData.x_twitter}
                        onChange={e => setFormData({...formData, x_twitter: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="@seuperfil"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Telegram</label>
                      <input 
                        type="text" 
                        value={formData.telegram}
                        onChange={e => setFormData({...formData, telegram: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Seu @ ou link do canal"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">LinkedIn</label>
                      <input 
                        type="text" 
                        value={formData.linkedin}
                        onChange={e => setFormData({...formData, linkedin: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Link do perfil"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Pinterest</label>
                      <input 
                        type="text" 
                        value={formData.pinterest}
                        onChange={e => setFormData({...formData, pinterest: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Link do perfil"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!formData.region || !formData.instagram}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Próximo Passo
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                  <Briefcase className="text-indigo-400" /> Experiência
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4">Você já tem experiência divulgando eventos?</label>
                    <div className="space-y-3">
                      {[
                        'Sim, sou Promoter profissional',
                        'Sim, divulgo para ganhar um extra',
                        'Não, quero começar agora'
                      ].map(option => (
                        <div 
                          key={option}
                          onClick={() => setFormData({...formData, experience: option})}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            formData.experience === option 
                              ? 'border-indigo-500 bg-indigo-500/10' 
                              : 'border-white/10 bg-black/40 hover:bg-white/5'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4">Quais eventos você já divulgou recentemente? (Opcional)</label>
                    <textarea 
                      value={formData.pastEvents}
                      onChange={e => setFormData({...formData, pastEvents: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
                      placeholder="Liste alguns eventos de sucesso..."
                    />
                  </div>
                </div>

                <div className="mt-10 flex justify-between">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-full text-white font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    disabled={!formData.experience}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Próximo Passo
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                  <Target className="text-indigo-400" /> Canais e Alcance
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4">Quais são os seus principais canais de divulgação?</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Instagram (Stories/Feed)',
                        'TikTok',
                        'Grupos de WhatsApp/Telegram',
                        'Boca a boca (Faculdade, etc)',
                        'Twitter / X',
                        'Outros'
                      ].map(option => (
                        <div 
                          key={option}
                          onClick={() => handleChannelToggle(option)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            formData.channels.includes(option)
                              ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                              : 'border-white/10 bg-black/40 text-zinc-400 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.channels.includes(option) ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600'}`}>
                              {formData.channels.includes(option) && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-medium">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4">Qual é a sua média de público/alcance?</label>
                    <div className="space-y-3">
                      {[
                        'Até 500 pessoas',
                        '500 a 2.000 pessoas',
                        '2.000 a 10.000 pessoas',
                        'Mais de 10.000 pessoas'
                      ].map(option => (
                        <div 
                          key={option}
                          onClick={() => setFormData({...formData, audienceSize: option})}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            formData.audienceSize === option 
                              ? 'border-indigo-500 bg-indigo-500/10' 
                              : 'border-white/10 bg-black/40 hover:bg-white/5'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-between">
                  <button 
                    onClick={() => setStep(2)}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-full text-white font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handleComplete}
                    disabled={formData.channels.length === 0 || !formData.audienceSize || isSubmitting}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center"
                  >
                    {isSubmitting ? 'Finalizando...' : 'Finalizar Perfil'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Perfil Concluído!</h2>
                <p className="text-zinc-400 mb-10 max-w-md mx-auto">
                  Você já está aprovado e pronto para começar. Acesse seu painel para encontrar eventos e gerar seus links de vendas!
                </p>
                <button 
                  onClick={() => navigate('/promoter')}
                  className="px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-full font-black uppercase tracking-widest text-sm transition-colors"
                >
                  Ir para meu Painel
                </button>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PromoterOnboardingPage;
