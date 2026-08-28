import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Copy, Wallet, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

const PromoterHistory = () => {
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

  const workedEvents = affiliations.filter(aff => aff.endDate && new Date(aff.endDate) < new Date());

  if (loading) {
    return (
      <DashboardLayout userType="promoter">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="font-black uppercase tracking-widest text-zinc-400">Carregando Histórico...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="promoter">
      <div className="space-y-8 animate-in fade-in duration-500">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">Eventos Trabalhados</h1>
            <p className="text-zinc-500">Histórico de eventos que já foram encerrados.</p>
          </div>
          <a href="/promoter" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl text-sm font-medium transition-colors border border-slate-300">
            Voltar para Visão Geral
          </a>
        </div>

        {/* Historico List */}
        <div>
          {workedEvents.length === 0 ? (
            <div className="text-center py-20 bg-slate-100 border border-slate-300 rounded-3xl">
               <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-4 grayscale" />
               <h2 className="text-xl font-black uppercase tracking-tight text-slate-950 mb-2">Nenhum evento trabalhado</h2>
               <p className="text-slate-500">O histórico de eventos encerrados aparecerá aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workedEvents.map(aff => (
                <motion.div key={aff.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 border border-slate-300 rounded-3xl overflow-hidden flex flex-col shadow-sm grayscale hover:grayscale-0 transition-all duration-500 opacity-90">
                  <div className="h-32 bg-slate-200 relative">
                     <img src={aff.bannerUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} alt="Event" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                     <div className="absolute top-4 right-4">
                       <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-200 text-slate-600 border border-slate-300">
                         Encerrado
                       </span>
                     </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white mb-4">
                      {aff.title || 'Barões do Truco 2026'}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Comissão Contratada</p>
                        <p className="text-xl font-black text-slate-700 dark:text-slate-300">{Number(aff.commissionRate || 0)}%</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Desconto Aplicado</p>
                         <p className="text-xl font-black text-slate-700 dark:text-slate-300">{Number(aff.discountRate || 0)}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 border-t border-slate-200 dark:border-white/5 pt-4">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Vendas Totais</p>
                         <p className="text-lg font-bold text-slate-950 dark:text-white">{Number(aff.salesCount || aff.sales || 0)}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">Credenciais</p>
                         <p className="text-lg font-bold text-slate-950 dark:text-white">{Number(aff.credentialsCount || aff.credentials || 0)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-2 border-t border-slate-200 dark:border-white/5 pt-4">
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
                    </div>
                       <div className="col-span-2 mt-4 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400 mb-1">Recebido</p>
                         <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.commissionReceived || 0)}
                         </p>
                       </div>
                       <div className="mt-2 bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-800 dark:text-indigo-400 mb-1">A Receber</p>
                         <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.commissionReceivable || 0)}
                         </p>
                       </div>
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

export default PromoterHistory;
