import React from 'react';
import { Settings, Save } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const PromoterSettings = () => {
  return (
    <DashboardLayout userType="promoter">
      <div className="space-y-6 animate-in fade-in duration-500">
         <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
               <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Configurações do Perfil</h1>
               <p className="text-zinc-400 text-sm">Atualize seus dados pessoais, chave PIX e redes sociais.</p>
            </div>
         </div>

         <div className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-3xl">
           <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-3">Chave PIX (Para Saques)</label>
                 <input 
                   type="text" 
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500"
                   placeholder="E-mail, CPF, Celular ou Aleatória"
                 />
              </div>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <Save className="w-4 h-4" /> Salvar Configurações
              </button>
           </form>
         </div>
      </div>
    </DashboardLayout>
  );
};

export default PromoterSettings;
