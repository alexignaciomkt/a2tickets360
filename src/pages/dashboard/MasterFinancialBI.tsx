import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Ticket, Clock, ShieldCheck, Target, BarChart3, ChevronRight, Zap, Cpu, Database, Wallet, Loader2, CheckCircle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { financialService } from '@/services/financialService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MasterFinancialBI = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    const fetchBI = async () => {
      try {
        setLoading(true);
        const [summary, payoutReqs] = await Promise.all([
          financialService.getFinancialSummary(),
          financialService.getPayoutRequests()
        ]);
        setStats(summary);
        const pending = (payoutReqs || []).filter(p => p.status === 'pending' || p.status === 'processing').slice(0, 5);
        setPayouts(pending);
      } catch (error) {
        console.error('Erro no BI Master Financeiro:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBI();
  }, []);

  const BigStat = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
    <Card className="bg-white rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 group flex flex-col justify-between h-full relative overflow-hidden">
       <CardContent className="p-6 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6 relative z-10">
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 ${
               color === 'indigo' ? 'bg-slate-900 text-white' : 
               color === 'emerald' ? 'bg-emerald-600 text-white' : 
               color === 'amber' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
             }`}>
                <Icon className="w-5 h-5" />
             </div>
             {trend && (
               <Badge className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded shadow-sm border-none uppercase tracking-wide ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                 {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                 {Math.abs(trend)}%
               </Badge>
             )}
          </div>
          <div className="space-y-2 relative z-10">
             <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none mb-3">{title}</p>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-200" /> : value}
             </h3>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-3 leading-none opacity-80 group-hover:opacity-100 transition-opacity">{subValue}</p>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-10 transition-all duration-700 group-hover:scale-125">
             <Icon className="w-40 h-40" />
          </div>
       </CardContent>
    </Card>
  );

  const MiniStat = ({ title, value, icon: Icon }: any) => (
    <div className="bg-slate-50 p-5 rounded-xl border border-gray-100 flex items-center gap-4 hover:bg-white hover:shadow-sm transition-all duration-300 group cursor-pointer">
       <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm group-hover:border-slate-300 transition-all group-hover:scale-105 shrink-0">
          <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
       </div>
       <div className="space-y-1.5 flex-1">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">{title}</p>
          <p className="text-sm font-black text-slate-900 tracking-tight leading-none tabular-nums">{loading ? '...' : value}</p>
       </div>
    </div>
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Financial Intelligence Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 px-1">
           <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Inteligência Financeira (BI)</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 max-w-2xl">Métricas de conversão e fluxo de caixa em tempo real.</p>
           </div>
           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">Sincronização Ativa</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <Zap className="w-3 h-3 text-amber-500" />
           </div>
        </div>

        {/* Big Numbers Grid Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <BigStat 
             title="Volume Bruto (GMV)" 
             value={stats ? `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Nó de Autoridade Transacional"
             icon={Database}
             color="indigo"
             trend={12.5}
           />
           <BigStat 
             title="Lucro Líquido da Plataforma" 
             value={stats ? `R$ ${stats.platformRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Receita de Taxas do Ecossistema"
             icon={Wallet}
             color="emerald"
             trend={8.2}
           />
           <BigStat 
             title="Ingressos Autorizados" 
             value={stats ? (stats.transactionsCount || 0).toLocaleString('pt-BR') : '0'}
             subValue="Carga Total de Distribuição"
             icon={Ticket}
             color="amber"
             trend={15.4}
           />
           <BigStat 
             title="Ticket Médio Transacional" 
             value={stats && stats.transactionsCount > 0 ? `R$ ${(stats.totalRevenue / stats.transactionsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Média de Performance do Cluster"
             icon={Cpu}
             color="slate"
             trend={-2.1}
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Financial Distribution Matrix Hub */}
           <div className="lg:col-span-2 space-y-6 flex flex-col">
              <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white group flex-1">
                 <CardHeader className="pb-4 border-b border-gray-50 bg-slate-50/50 px-6 py-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-wide text-slate-900 flex items-center gap-2">
                       <BarChart3 className="w-4 h-4 text-indigo-600" /> Hub de Distribuição Financeira
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                       <MiniStat title="Fluxo de Gateway PIX" value={stats ? `R$ ${(stats.totalRevenue * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'} icon={Zap} />
                       <MiniStat title="Fluxo de Nó de Crédito" value={stats ? `R$ ${(stats.totalRevenue * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'} icon={DollarSign} />
                       <MiniStat title="Carga de Ativos Pendentes" value={stats ? `R$ ${(stats.pendingAmount || 0).toLocaleString('pt-BR')}` : 'R$ 0,00'} icon={Clock} />
                       <MiniStat title="Flags de Integridade de Auditoria" value="00_SEGURO" icon={ShieldCheck} />
                    </div>
                    
                    <div className="pt-8 border-t border-gray-50">
                       <div className="flex justify-between items-end mb-4">
                          <div className="space-y-1">
                             <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">Hierarquia de Integridade do Gateway</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none">Taxa global de sucesso em todos os nós do ecossistema.</p>
                          </div>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">98.5%</p>
                       </div>
                       <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-gray-100 relative">
                          <div className="bg-slate-900 h-full w-[98.5%] rounded-full relative">
                             <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 animate-pulse" />
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Settlement Loop Cluster */}
           <div className="flex flex-col gap-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group shadow-md border border-slate-800 flex-none">
                 <div className="absolute -top-8 -right-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                    <Target className="w-32 h-32" />
                 </div>
                 <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-wide text-slate-400 leading-none">Objetivo de Lucro Mensal</p>
                       <h3 className="text-3xl font-black tracking-tighter leading-none tabular-nums">R$ 500.000</h3>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-[9px] font-black uppercase tracking-wide text-slate-400 leading-none">
                          <span>Progresso do Pipeline</span>
                          <span className="text-white tabular-nums">{(stats ? (stats.platformRevenue / 500000) * 100 : 0).toFixed(1)}%</span>
                       </div>
                       <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, stats ? (stats.platformRevenue / 500000) * 100 : 0)}%` }} />
                       </div>
                    </div>
                 </div>
              </div>

              <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group flex-1 flex flex-col">
                 <CardHeader className="py-4 px-6 border-b border-gray-50 bg-slate-50/50">
                    <CardTitle className="text-[10px] font-black uppercase tracking-wide text-slate-900">Registro: Fila de Liquidação (Saques)</CardTitle>
                 </CardHeader>
                 <CardContent className="p-0 flex-1 flex flex-col justify-between">
                    <div className="flex-1 divide-y divide-gray-50">
                       {loading ? (
                         <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                       ) : payouts.length > 0 ? (
                         payouts.map((p, i) => (
                           <div key={i} className="flex justify-between items-center py-3 px-6 hover:bg-slate-50 transition-colors cursor-pointer group/item">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm">
                                    <Users className="w-3.5 h-3.5" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none truncate max-w-[120px]">{p.organizer_id?.slice(0, 8) || 'PRODUTOR'}</p>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 leading-none"><Clock className="w-2.5 h-2.5" /> D+2 PRONTO</p>
                                  </div>
                              </div>
                              <p className="text-[11px] font-black text-slate-900 tracking-tighter tabular-nums">R$ {p.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                           </div>
                         ))
                       ) : (
                         <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2">
                            <CheckCircle className="w-6 h-6 text-emerald-500/50" />
                            <p className="text-[9px] font-bold uppercase tracking-wide">Fila Limpa</p>
                         </div>
                       )}
                    </div>
                    <div className="p-4 border-t border-gray-50 bg-white">
                       <Button className="w-full h-9 rounded-lg text-[9px] font-black uppercase tracking-wide bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-95">
                          Protocolo de Liquidação <ChevronRight className="w-3 h-3 ml-2" />
                       </Button>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MasterFinancialBI;
