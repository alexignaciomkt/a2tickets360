import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Copy, Wallet, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

const PromoterDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [promoterInfo, setPromoterInfo] = useState<any>(null);
  const [affiliations, setAffiliations] = useState<any[]>([]);
  
  useEffect(() => {
    if (user?.id) fetchPromoterData();
  }, [user]);

  const fetchPromoterData = async () => {
    setLoading(true);
    
    // 1. Fetch promoter profile
    const { data: pData } = await supabase
      .from('promoters')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    
    if (pData) {
      setPromoterInfo(pData);
      
      // 2. Fetch affiliations
      const { data: affData } = await supabase
        .from('promoter_affiliations')
        .select('*, events(id, title, banner_url)')
        .eq('promoter_id', pData.id);
        
      if (affData) setAffiliations(affData);
    }
    setLoading(false);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Link de venda copiado!' });
  };

  if (loading) {
    return (
      <DashboardLayout userType="promoter">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="font-black uppercase tracking-widest text-zinc-400">Carregando Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="promoter">
      <div className="space-y-8 animate-in fade-in duration-500">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Visão Geral</h1>
            <p className="text-zinc-400">Seus KPIs e eventos afiliados.</p>
          </div>
        </div>

        {/* KPIs (Saques / Balance) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 p-8 rounded-3xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Wallet className="w-24 h-24 text-indigo-500" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 z-10">Saldo Disponível</h3>
              <p className="text-4xl font-black text-white z-10">R$ 0,00</p>
              <p className="text-xs text-zinc-500 mt-2 z-10">*(Integração financeira em breve)*</p>
           </div>
           
           <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Total de Vendas</h3>
              <p className="text-4xl font-black text-white">0</p>
              <p className="text-xs text-zinc-500 mt-2">Ingressos vendidos com seus links</p>
           </div>

           <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Eventos Afiliados</h3>
              <p className="text-4xl font-black text-white">{affiliations.length}</p>
              <p className="text-xs text-zinc-500 mt-2">Eventos na sua carteira</p>
           </div>
        </div>

        {/* Meus Eventos List */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white mb-6">Meus Eventos (Links de Venda)</h2>
          
          {affiliations.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
               <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
               <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Nenhum evento afiliado</h2>
               <p className="text-zinc-400 mb-6">Encontre eventos na vitrine e comece a faturar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {affiliations.map(aff => (
                <motion.div key={aff.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:border-indigo-500/30 transition-colors">
                  <div className="h-32 bg-zinc-800 relative">
                     <img src={aff.events?.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} alt="Event" className="w-full h-full object-cover opacity-50" />
                     <div className="absolute top-4 right-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         aff.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                         aff.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                         'bg-red-500/20 text-red-400 border-red-500/30'
                       }`}>
                         {aff.status === 'approved' ? 'Aprovado' : aff.status === 'pending' ? 'Em Análise' : 'Recusado'}
                       </span>
                     </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-4">{aff.events?.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Sua Comissão</p>
                        <p className="text-xl font-black text-indigo-400">{aff.commission_rate}%</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Desconto Cliente</p>
                         <p className="text-xl font-black text-emerald-400">0%</p>
                      </div>
                    </div>

                    {aff.status === 'approved' && aff.coupon_code && (
                      <div className="mt-auto">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Seu Link de Venda</p>
                        <div className="flex gap-2">
                           <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 flex-1 overflow-hidden">
                              <p className="text-xs text-zinc-300 truncate">{window.location.origin}/e/{aff.events?.id}?ref={aff.coupon_code}</p>
                           </div>
                           <button 
                             onClick={() => copyCoupon(`${window.location.origin}/e/${aff.events?.id}?ref=${aff.coupon_code}`)}
                             className="w-12 shrink-0 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 rounded-xl flex items-center justify-center transition-colors border border-indigo-500/30"
                           >
                             <Copy className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PromoterDashboard;
