
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Ticket, Calendar, ArrowUpRight, ArrowDownRight,
  Loader2, Wallet, Briefcase, Activity, CreditCard, Clock, AlertTriangle, ShieldCheck, Target, BarChart3, ChevronRight, Zap, Cpu, Database, FileText, CheckCircle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { financialService } from '@/services/financialService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MasterFinancialBI = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchBI = async () => {
      try {
        const summary = await financialService.getFinancialSummary();
        setStats(summary);
      } catch (error) {
        console.error('Erro no BI Master:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBI();
  }, []);

  const BigStat = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
    <Card className="bg-white rounded-[3.5rem] border-gray-100 shadow-sm hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1000 group flex flex-col justify-between h-full overflow-hidden relative border-2">
       <CardContent className="p-12 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-16 relative z-10">
             <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center border-4 border-white shadow-2xl transition-all duration-1000 group-hover:scale-110 group-hover:rotate-6 ${
               color === 'indigo' ? 'bg-slate-900 text-white' : 
               color === 'emerald' ? 'bg-emerald-600 text-white' : 
               color === 'amber' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
             }`}>
                <Icon className="w-8 h-8" />
             </div>
             {trend && (
               <Badge className={`flex items-center gap-3 text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.4em] border-none shadow-sm ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                 {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                 {Math.abs(trend)}%
               </Badge>
             )}
          </div>
          <div className="space-y-3 relative z-10">
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 leading-none mb-6">{title}</p>
             <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">
                {loading ? <Loader2 className="h-10 w-10 animate-spin text-slate-200" /> : value}
             </h3>
             <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-6 leading-none opacity-60 group-hover:opacity-100 transition-opacity">{subValue}</p>
          </div>
          <div className="absolute -right-16 -bottom-16 opacity-[0.03] group-hover:opacity-10 transition-all duration-1000 group-hover:scale-150 group-hover:-rotate-12">
             <Icon className="w-72 h-72" />
          </div>
       </CardContent>
    </Card>
  );

  const MiniStat = ({ title, value, icon: Icon }: any) => (
    <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border-2 border-gray-100 flex items-center gap-8 hover:bg-white hover:shadow-2xl transition-all duration-700 cursor-pointer group">
       <div className="w-16 h-16 bg-white rounded-[1.6rem] flex items-center justify-center border-4 border-white shadow-2xl group-hover:border-slate-900 transition-all group-hover:scale-110 group-hover:-rotate-3 shrink-0">
          <Icon className="w-7 h-7 text-slate-300 group-hover:text-slate-900 transition-colors" />
       </div>
       <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none mb-1">{title}</p>
          <p className="text-[18px] font-black text-slate-900 tracking-tight leading-none tabular-nums">{loading ? '...' : value}</p>
       </div>
    </div>
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
        
        {/* Financial Intelligence Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Inteligência Financeira (BI)</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">Métricas de conversão e fluxo de caixa da Ticketera em tempo real.</p>
           </div>
           <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-xs font-semibold text-slate-800">Sincronização Ativa</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <Zap className="w-4 h-4 text-amber-500" />
           </div>
        </div>

        {/* Big Numbers Grid Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
           <BigStat 
             title="Gross GMV Volume Flux" 
             value={stats ? `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Cluster Matrix Transactional Node Authority"
             icon={Database}
             color="indigo"
             trend={12.5}
           />
           <BigStat 
             title="Platform Net Yield Registry" 
             value={stats ? `R$ ${stats.platformRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Ecosystem Service Fee Revenue Load"
             icon={Wallet}
             color="emerald"
             trend={8.2}
           />
           <BigStat 
             title="Authorized Ticket Units" 
             value={stats ? stats.transactionsCount.toLocaleString('pt-BR') : '0'}
             subValue="Total Asset Distribution Pipeline Load"
             icon={Ticket}
             color="amber"
             trend={15.4}
           />
           <BigStat 
             title="Transactional Mean Value" 
             value={stats && stats.transactionsCount > 0 ? `R$ ${(stats.totalRevenue / stats.transactionsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Node Cluster Performance Avg Matrix"
             icon={Cpu}
             color="slate"
             trend={-2.1}
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
           {/* Financial Distribution Matrix Hub */}
           <div className="lg:col-span-2 space-y-12">
              <Card className="rounded-[4.5rem] border-gray-100 shadow-sm overflow-hidden bg-white group hover:shadow-[0_40px_100px_rgba(0,0,0,0.15)] transition-all duration-1500 border-2">
                 <CardHeader className="pb-8 border-b border-gray-50 bg-gray-50/20 px-16 py-14">
                    <CardTitle className="text-[13px] font-black uppercase tracking-[0.5em] text-slate-300 flex items-center gap-6">
                       <BarChart3 className="w-8 h-8 text-slate-900" /> Financial Distribution Hub
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-24">
                       <MiniStat title="Pix Gateway Protocol Node" value="R$ 0,00" icon={Zap} />
                       <MiniStat title="Card Processing Matrix Flux" value="R$ 0,00" icon={CreditCard} />
                       <MiniStat title="Unsettled Asset Load Hub" value={stats ? `R$ ${stats.pendingAmount.toLocaleString('pt-BR')}` : 'R$ 0,00'} icon={Clock} />
                       <MiniStat title="Audit Integrity Hierarchy Flags" value="00_SAFE" icon={ShieldCheck} />
                    </div>
                    
                    <div className="pt-16 border-t-2 border-gray-50">
                       <div className="flex justify-between items-end mb-10 px-4">
                          <div className="space-y-4">
                             <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight leading-none">Gateway Integrity Hierarchy</p>
                             <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global success node rate across all ecosystem matrix nodes.</p>
                          </div>
                          <p className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">98.5%</p>
                       </div>
                       <div className="w-full bg-gray-50 h-7 rounded-full overflow-hidden border-2 border-gray-100 shadow-inner relative p-1.5">
                          <div className="bg-slate-900 h-full w-[98.5%] rounded-full shadow-[0_0_40px_rgba(15,23,42,0.3)] transition-all duration-1500 relative">
                             <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 animate-pulse" />
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Financial Objectives & Settlement Loop Cluster */}
           <div className="space-y-16">
              <div className="bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden group shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-all duration-1500 hover:scale-[1.02] border-4 border-slate-800">
                 <div className="absolute -top-16 -right-16 p-16 opacity-5 transform group-hover:scale-150 transition-all duration-1500 group-hover:rotate-12">
                    <Target className="w-80 h-80" />
                 </div>
                 <div className="relative z-10 space-y-16">
                    <div className="space-y-4">
                       <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 leading-none mb-2">Monthly Yield Hierarchy Objective</p>
                       <h3 className="text-5xl md:text-6xl font-black tracking-tighter leading-none tabular-nums">R$ 500.000</h3>
                    </div>
                    <div className="space-y-8">
                       <div className="flex justify-between text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none px-2">
                          <span>Threshold Pipeline Progress</span>
                          <span className="text-white tabular-nums">24.8%</span>
                       </div>
                       <div className="w-full bg-white/5 h-6 rounded-full overflow-hidden border border-white/5 shadow-inner p-1.5">
                          <div className="bg-white h-full w-[24.8%] rounded-full shadow-[0_0_40px_rgba(255,255,255,0.8)] transition-all duration-1500" />
                       </div>
                    </div>
                    <Button variant="ghost" className="w-full h-20 rounded-full text-[12px] font-black uppercase tracking-[0.4em] text-white/40 border-4 border-white/10 hover:bg-white hover:text-slate-900 transition-all shadow-none mt-6 group/audit">
                       Deep Audit Strategy Module <ChevronRight className="w-5 h-5 ml-4 group-hover/audit:translate-x-3 transition-transform" />
                    </Button>
                 </div>
              </div>

              <Card className="rounded-[4rem] border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-1500 border-2">
                 <CardHeader className="pb-4 px-16 pt-16">
                    <CardTitle className="text-[13px] font-black uppercase tracking-[0.5em] text-slate-300">Registry: Settlement Loop Hub</CardTitle>
                 </CardHeader>
                 <CardContent className="px-16 pb-16">
                    <div className="space-y-12 mt-12">
                       {[1,2,3].map(i => (
                         <div key={i} className="flex justify-between items-center py-8 border-b-2 border-gray-50 last:border-0 group/item cursor-pointer hover:bg-gray-50/50 hover:px-10 -mx-10 rounded-[2.5rem] transition-all duration-1000">
                            <div className="flex items-center gap-8">
                               <div className="w-16 h-16 rounded-[1.6rem] bg-slate-900 flex items-center justify-center text-white shrink-0 group-hover/item:scale-110 group-hover:rotate-6 transition-transform shadow-2xl border-4 border-white">
                                  <Users className="w-7 h-7" />
                               </div>
                               <div className="space-y-2">
                                  <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight leading-none">PRODUCER_NODE_{i}29</p>
                                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-3 leading-none"><Clock className="w-4 h-4 opacity-40" /> 24/04 • SETTLEMENT_READY D+2</p>
                                </div>
                            </div>
                            <p className="text-[16px] font-black text-slate-900 tracking-tighter tabular-nums">R$ 1.250,00</p>
                         </div>
                       ))}
                    </div>
                    <Button className="w-full mt-16 h-20 rounded-full text-[13px] font-black uppercase tracking-[0.5em] bg-slate-900 text-white hover:bg-black shadow-[0_30px_80px_rgba(0,0,0,0.2)] transition-all hover:scale-110 group/loop active:scale-95 border-4 border-slate-800">
                       Execute Liquidation Protocol <ChevronRight className="w-6 h-6 ml-4 group-hover/loop:translate-x-5 transition-transform duration-700" />
                    </Button>
                 </CardContent>
              </Card>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MasterFinancialBI;
