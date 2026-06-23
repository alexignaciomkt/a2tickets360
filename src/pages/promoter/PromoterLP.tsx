import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  TrendingUp, 
  Target, 
  Smartphone, 
  CircleDollarSign, 
  ArrowRight,
  CheckCircle2,
  Users
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const PromoterLP = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <MainLayout>
      <div className="bg-zinc-950 text-white min-h-screen font-sans selection:bg-indigo-500/30 overflow-hidden">
        
        {/* Ambient Backgrounds */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <img src="/background site.png" alt="Bg" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen" />
        </div>

        {/* HERO SECTION */}
        <section className="relative z-10 pt-32 pb-20 px-4 md:pt-40 md:pb-32 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Programa de Embaixadores A2</span>
          </motion.div>

          <motion.h1 
            {...fadeIn}
            className="flex flex-col items-center justify-center font-black uppercase max-w-5xl text-center"
          >
            <span className="text-2xl md:text-4xl text-zinc-300 tracking-widest mb-2">Transforme sua influência em</span>
            <span className="text-6xl md:text-8xl lg:text-[10rem] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 tracking-tight leading-none">Dinheiro Vivo</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-lg md:text-xl text-zinc-400 font-medium max-w-2xl"
          >
            Seja um Promoter Oficial, crie seu cupom exclusivo, divulgue as melhores festas e fature comissões sem limite de ganhos.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => navigate('/work-with-us?role=promoter')}
              className="px-8 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:scale-105 flex items-center justify-center gap-3"
            >
              Quero Começar Agora <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#como-funciona"
              className="px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center"
            >
              Entenda como funciona
            </a>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section id="como-funciona" className="relative z-10 py-24 px-4 bg-black/40 border-y border-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="flex flex-col items-center mb-4 font-black uppercase">
                <span className="text-xl md:text-3xl text-zinc-400 tracking-widest mb-2">A Lógica é</span>
                <span className="text-5xl md:text-7xl text-indigo-400 tracking-tight leading-none">Simples</span>
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto">Nós cuidamos de toda a tecnologia e da festa. Você só precisa conectar a galera.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Megaphone, title: "1. Divulgue", desc: "Use seu networking. Poste nos Stories, mande em grupos de WhatsApp e espalhe a palavra sobre os eventos parceiros." },
                { icon: Smartphone, title: "2. Seu Cupom", desc: "A galera acessa o link do evento e usa o seu CUPOM EXCLUSIVO. Eles ganham desconto e a venda é automaticamente vinculada a você." },
                { icon: CircleDollarSign, title: "3. Receba em Pix", desc: "Acompanhe tudo no seu painel em tempo real. Atingiu R$ 50 de saldo? É só apertar um botão e o dinheiro cai na sua conta." },
              ].map((step, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                  <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest mb-3">{step.title}</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE DASHBOARD & GOALS */}
        <section className="relative z-10 py-24 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Target className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Painel Inteligente</span>
              </div>
              <h2 className="flex flex-col items-start font-black uppercase mb-4">
                <span className="text-xl md:text-3xl text-zinc-400 tracking-widest mb-2">O Controle</span>
                <span className="text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight leading-[1.1]">Na Palma da Mão</span>
              </h2>
              <p className="text-zinc-400 text-lg">
                Você terá acesso a uma área logada exclusiva com métricas avançadas das suas vendas. Esqueça planilhas ou adivinhações.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Acompanhamento de vendas em Tempo Real.",
                  "Sistema de Meta Pessoal: Defina quantos ingressos quer vender e veja a barra de progresso encher.",
                  "Transparência total sobre suas comissões.",
                  "Solicitação de Saque rápida via Pix com apenas 1 clique."
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:w-1/2 relative w-full">
              {/* Mockup Dashboard Visual */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl shadow-purple-500/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-zinc-900/80 p-4 border-b border-white/5 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <div className="ml-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">a2tickets.com/promoter</div>
                </div>
                <div className="p-6 md:p-8 bg-zinc-950/80 backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight">Suas Vendas</h4>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Bem-vindo, Promoter</p>
                    </div>
                    <div className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-500/30">CUPOM: VIP10</div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest">Sua Meta Pessoal</span>
                        <span className="text-emerald-400 font-black">28 / 50 Ingressos</span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full w-[56%] relative">
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-3 font-medium text-center">Continue assim! Faltam apenas 22 ingressos para bater sua meta pessoal.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Saldo Disponível</p>
                        <p className="text-2xl font-black text-white mt-1">R$ 450,00</p>
                      </div>
                      <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        Sacar Pix
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] bg-purple-500/30 blur-[100px] rounded-full"></div>
            </div>
          </div>
        </section>

        {/* TIPS FOR SUCCESS */}
        <section className="relative z-10 py-24 px-4 bg-zinc-900/50 border-y border-white/5">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div>
              <h2 className="flex flex-col items-center mb-4 font-black uppercase">
                <span className="text-xl md:text-3xl text-zinc-400 tracking-widest mb-2">Dicas de</span>
                <span className="text-5xl md:text-7xl text-emerald-400 tracking-tight leading-none">Sucesso</span>
              </h2>
              <p className="text-zinc-400">Qualquer um pode ser promoter, mas os melhores faturam alto aplicando estratégias simples.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                <h4 className="text-lg font-black uppercase text-white mb-2">1. Use o Gatilho do Desconto</h4>
                <p className="text-zinc-400 text-sm">Todo mundo ama pagar menos. Divulgue seu cupom enfatizando que é um desconto exclusivo seu.</p>
              </div>
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                <h4 className="text-lg font-black uppercase text-white mb-2">2. Crie listas de transmissão</h4>
                <p className="text-zinc-400 text-sm">Não mande spam. Crie listas Vip no WhatsApp de amigos que você sabe que curtem os eventos.</p>
              </div>
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                <h4 className="text-lg font-black uppercase text-white mb-2">3. Instagram Estratégico</h4>
                <p className="text-zinc-400 text-sm">Coloque seu cupom na BIO e poste stories de contagem regressiva para os eventos.</p>
              </div>
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                <h4 className="text-lg font-black uppercase text-white mb-2">4. Acompanhe a Meta</h4>
                <p className="text-zinc-400 text-sm">Defina uma meta financeira mensal e ajuste sua barra de vendas para acompanhar seu progresso diário.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative z-10 py-32 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="flex flex-col items-center font-black uppercase">
              <span className="text-xl md:text-3xl text-zinc-400 tracking-widest mb-2 text-center">Pronto para fazer a festa e</span>
              <span className="text-6xl md:text-8xl lg:text-9xl text-indigo-400 tracking-tight leading-none">Lucrar?</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Cadastre-se agora. A aprovação é feita pelo organizador e em poucas horas você já pode ter seu cupom ativo.
            </p>
            
            <button 
              onClick={() => navigate('/work-with-us?role=promoter')}
              className="mt-8 px-10 py-6 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-sm transition-all hover:bg-zinc-200 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)] inline-flex items-center gap-3"
            >
              Me Inscrever como Promoter <Users className="w-5 h-5" />
            </button>
          </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default PromoterLP;
