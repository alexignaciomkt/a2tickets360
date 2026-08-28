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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const res = await fetch(`${apiUrl}/api/promoter/dashboard`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (!res.ok) throw new Error('Falha ao carregar dashboard do promoter');
      
      const data = await res.json();
      console.log('[PROM DASH FRONT] response', data);
      
      setPromoterInfo({
        totalSales: data.totalSales || 0,
        totalCredentials: data.totalCredentials || 0,
        grossRevenue: data.grossRevenue || 0,
        commissionGenerated: data.commissionGenerated || 0,
        commissionReceivable: data.commissionReceivable || 0,
        commissionReceived: data.commissionReceived || 0
      });
      setAffiliations(data.affiliatedEvents || []);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar os dados financeiros.', variant: 'destructive' });
    }
    setLoading(false);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Link de venda copiado!' });
  };

  const activeEvents = affiliations.filter(aff => !aff.endDate || new Date(aff.endDate) > new Date());
  const workedEventsCount = affiliations.length - activeEvents.length;

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
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Visão Geral</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Seus KPIs e eventos afiliados.</p>
          </div>
          {workedEventsCount > 0 && (
            <a href="/promoter/history" className="px-4 py-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors border border-slate-300 dark:border-white/10">
              Ver Histórico ({workedEventsCount})
            </a>
          )}
        </div>

        {/* KPIs (Saques / Balance) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gradient-to-b from-indigo-100 to-indigo-50 border border-indigo-200 p-8 rounded-3xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Wallet className="w-24 h-24 text-indigo-500" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-800 mb-2 z-10">A Receber</h3>
              <p className="text-4xl font-black text-indigo-950 z-10">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(promoterInfo?.commissionReceivable || 0)}
              </p>
              <p className="text-xs text-indigo-700 mt-2 z-10">Comissões processadas e aguardando repasse</p>
           </div>
           
           <div className="bg-slate-100 border border-slate-300 p-8 rounded-3xl flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Total de Vendas</h3>
              <p className="text-4xl font-black text-slate-950">{Number(promoterInfo?.totalSales || 0)}</p>
              <p className="text-xs text-slate-500 mt-2">Histórico total do promoter</p>
           </div>

           <div className="bg-slate-100 border border-slate-300 p-8 rounded-3xl flex flex-col relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Eventos Ativos</h3>
              <p className="text-4xl font-black text-slate-950">{activeEvents.length}</p>
              <p className="text-xs text-slate-500 mt-2">Eventos atuais na sua carteira</p>
           </div>
        </div>

        {/* Meus Eventos List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white">Eventos Ativos (Links de Venda)</h2>
            <a href="/promoter/history" className="text-sm font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-wider">
               Ver Trabalhados
            </a>
          </div>
          
          {activeEvents.length === 0 ? (
            <div className="text-center py-20 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-3xl">
               <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
               <h2 className="text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-2">Nenhum evento ativo</h2>
               <p className="text-slate-500 dark:text-slate-400 mb-6">Você não possui eventos futuros ou em andamento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map(aff => (
                <motion.div key={aff.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col hover:border-indigo-500/50 transition-colors shadow-sm">
                  <div className="h-32 bg-slate-200 dark:bg-slate-800 relative">
                     <img src={aff.bannerUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} alt="Event" className="w-full h-full object-cover opacity-90 dark:opacity-50" />
                     <div className="absolute top-4 right-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         aff.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' :
                         aff.status === 'PENDING' ? 'bg-orange-100 text-orange-800 border-orange-400 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30' :
                         'bg-red-100 text-red-800 border-red-400 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                       }`}>
                         {aff.status === 'APPROVED' ? 'Aprovado' : aff.status === 'PENDING' ? 'Em Análise' : 'Recusado'}
                       </span>
                     </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white mb-4">
                      {aff.title || 'Barões do Truco 2026'}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Sua Comissão</p>
                        <p className="text-xl font-black text-indigo-700 dark:text-indigo-400">{Number(aff.commissionRate || 0)}%</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Desconto Cliente</p>
                         <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{Number(aff.discountRate || 0)}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 border-t border-slate-200 dark:border-white/5 pt-4">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Vendas</p>
                         <p className="text-lg font-bold text-slate-950 dark:text-white">{Number(aff.salesCount || aff.sales || 0)}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Credenciais</p>
                         <p className="text-lg font-bold text-slate-950 dark:text-white">{Number(aff.credentialsCount || aff.credentials || 0)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 border-t border-slate-200 dark:border-white/5 pt-4">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Receita Gerada</p>
                         <p className="text-sm font-bold text-slate-950 dark:text-white">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.grossRevenue || 0)}
                         </p>
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Comissão Gerada</p>
                         <p className="text-sm font-bold text-slate-950 dark:text-white">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.commissionGenerated || 0)}
                         </p>
                       </div>
                       <div className="col-span-2 mt-2 bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-800 dark:text-indigo-400 mb-1">A Receber</p>
                         <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.commissionReceivable || 0)}
                         </p>
                       </div>
                    </div>

                    {aff.status === 'APPROVED' && aff.referralCode && (
                      <div className="mt-auto">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">Seu Link de Venda</p>
                        <div className="flex gap-2">
                           <div className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 flex-1 overflow-hidden">
                              <p className="text-xs text-slate-800 dark:text-slate-300 truncate">{window.location.origin}/e/{aff.eventId}?ref={aff.referralCode}</p>
                           </div>
                           <button 
                             onClick={() => copyCoupon(`${window.location.origin}/e/${aff.eventId}?ref=${aff.referralCode}`)}
                             className="w-12 shrink-0 bg-indigo-100 dark:bg-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/40 text-indigo-700 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-colors border border-indigo-300 dark:border-indigo-500/30"
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
