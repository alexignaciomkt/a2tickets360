import React from 'react';
import { Share2, Lock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const PromoterMarketing = () => {
  return (
    <DashboardLayout userType="promoter">
      <div className="space-y-6 animate-in fade-in duration-500">
         <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Share2 className="w-40 h-40" />
            </div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center z-10">
              <Share2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="z-10">
               <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Central de Marketing</h1>
               <p className="text-zinc-400 text-sm">Ferramentas de disparo para WhatsApp e postagem automática.</p>
            </div>
         </div>

         <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
           <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4 relative z-10" />
           <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2 relative z-10">Em Breve (Versão 2.0)</h2>
           <p className="text-zinc-400 max-w-md mx-auto relative z-10">
             Nesta aba você terá acesso a ferramentas exclusivas para fazer disparos no WhatsApp para o seu mailing e agendar postagens nas suas redes sociais automaticamente!
           </p>
         </div>
      </div>
    </DashboardLayout>
  );
};

export default PromoterMarketing;
