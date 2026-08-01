import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, Users, TrendingUp, ShieldCheck, Ticket, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const PromoterLanding = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">

      {/* Hero Section */}
      <section className="relative pt-[20px] pb-20 md:pb-32 overflow-hidden border-b border-white/5">
        
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-promoters.png" 
            alt="Background" 
            className="w-full h-full object-cover opacity-80"
          />
          {/* O Efeito Glassmorphism na parte da frente */}
          <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-2xl" />
        </div>
        
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Esquerda: Texto */}
            <div className="text-left space-y-8 max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Programa de Afiliados A2 Tickets</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="font-black uppercase tracking-tight leading-none"
              >
                <span className="block text-2xl md:text-3xl lg:text-4xl text-white mb-2">Transforme sua</span>
                <span className="block text-5xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 pb-2">Influência</span>
                <span className="block text-2xl md:text-3xl lg:text-4xl text-white mt-1">em dinheiro.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-zinc-400 font-medium max-w-lg"
              >
                Conecte-se com os maiores eventos da sua região. Promova experiências incríveis para sua rede e receba comissões automáticas por cada venda realizada com o seu link.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4"
              >
                <Link 
                  to="/work-with-us?role=promoter" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  Começar a Vender <ArrowRight className="w-4 h-4" />
                </Link>
                <a 
                  href="#como-funciona" 
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all text-center"
                >
                  Entender o Programa
                </a>
              </motion.div>
            </div>

            {/* Direita: Imagem Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative w-full h-full min-h-[300px] md:min-h-[500px] flex items-center justify-center lg:justify-end"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
              <img 
                src="/hero-promoters.png" 
                alt="Promoter Banner" 
                className="w-full max-w-xl h-auto object-contain drop-shadow-2xl rounded-2xl border border-white/10 bg-black/20 p-2 backdrop-blur-sm"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 bg-black relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Como Funciona?</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Em apenas três passos você já está pronto para gerar renda extra com os eventos que você mais gosta.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <span className="text-indigo-400 font-black text-xl">1</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Crie seu Perfil</h3>
              <p className="text-sm text-zinc-400">Cadastre-se como promoter na A2 Tickets. Preencha seus dados, redes sociais e como você costuma divulgar eventos.</p>
            </div>

            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ticket className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <span className="text-emerald-400 font-black text-xl">2</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Escolha os Eventos</h3>
              <p className="text-sm text-zinc-400">Acesse a Vitrine e solicite afiliação nos eventos que fazem sentido para o seu público. Ao ser aprovado, você ganha um link exclusivo.</p>
            </div>

            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet className="w-24 h-24 text-purple-500" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                <span className="text-purple-400 font-black text-xl">3</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Divulgue e Ganhe</h3>
              <p className="text-sm text-zinc-400">Compartilhe seu link. Quem comprar por ele recebe desconto (se configurado) e sua comissão vai direto para o seu painel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-24 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Painel de Vendas<br/>Em Tempo Real</h2>
              <p className="text-zinc-400 text-lg">Acompanhe cada clique e conversão através de um dashboard intuitivo feito para você otimizar seus ganhos.</p>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-sm mb-1">Comissões Automáticas</h4>
                    <p className="text-zinc-400 text-sm">Todo ingresso vendido pelo seu link já credita a comissão no seu saldo.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-sm mb-1">Pagamentos Seguros</h4>
                    <p className="text-zinc-400 text-sm">Transfira seus ganhos para a sua conta bancária de forma rápida via PIX.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-sm mb-1">Ganhos Ilimitados</h4>
                    <p className="text-zinc-400 text-sm">Quanto mais você divulga, mais você ganha. Não há teto para suas comissões.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10 bg-zinc-900 p-8">
                {/* Mockup do Dashboard */}
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Seu Link</p>
                      <p className="text-sm font-black">a2tickets.com/e/fest?ref=PROM123</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Saldo Disponível</p>
                    <p className="text-2xl font-black">R$ 1.250,00</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-black/30 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <Ticket className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black">Venda Realizada</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Há {i*15} minutos</p>
                        </div>
                      </div>
                      <p className="font-black text-emerald-400">+ R$ 25,00</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6">Pronto para começar?</h2>
          <p className="text-indigo-200 text-lg md:text-xl font-medium mb-10">Crie sua conta agora e tenha acesso imediato a eventos exclusivos precisando de parceiros como você.</p>
          <Link 
            to="/login" 
            className="inline-block px-10 py-5 bg-white text-indigo-600 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-2xl"
          >
            Quero ser Promoter
          </Link>
        </div>
      </section>
      
      {/* Footer Simples */}
      <footer className="bg-zinc-950 py-12 border-t border-white/5 text-center text-zinc-600 text-sm">
        <p className="font-black uppercase tracking-widest text-[10px]">© 2026 A2 Tickets - Programa de Afiliados</p>
      </footer>
    </div>
    </MainLayout>
  );
};

export default PromoterLanding;
