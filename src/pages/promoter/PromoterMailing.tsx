import React from 'react';
import { Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const PromoterMailing = () => {
  return (
    <DashboardLayout userType="promoter">
      <div className="space-y-6 animate-in fade-in duration-500">
         <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
               <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Seu Mailing de Clientes</h1>
               <p className="text-zinc-400 text-sm">Pessoas que compraram ingressos através do seu link.</p>
            </div>
         </div>

         <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
           <p className="text-zinc-500">Nenhum cliente cadastrado no seu mailing ainda.</p>
           <p className="text-zinc-600 text-sm mt-2">*(Integração com vendas em breve)*</p>
         </div>
      </div>
    </DashboardLayout>
  );
};

export default PromoterMailing;
