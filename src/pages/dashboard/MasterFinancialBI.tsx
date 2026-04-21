
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Ticket, Calendar, ArrowUpRight, ArrowDownRight,
  Loader2, Wallet, Briefcase, Activity
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { financialService } from '@/services/financialService';

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
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
       <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl bg-${color}-50 group-hover:scale-110 transition-transform duration-500`}>
             <Icon className={`w-8 h-8 text-${color}-600`} />
          </div>
          {trend && (
            <span className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{title}</p>
       <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
          {loading ? '...' : value}
       </h3>
       <p className="text-xs font-bold text-gray-500">{subValue}</p>
    </div>
  );

  const MiniStat = ({ title, value, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-50 flex items-center gap-4 hover:border-indigo-100 transition-colors">
       <div className="bg-gray-50 p-3 rounded-xl"><Icon className="w-5 h-5 text-gray-400" /></div>
       <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{title}</p>
          <p className="text-lg font-black text-gray-900">{loading ? '...' : value}</p>
       </div>
    </div>
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">BI Master <span className="text-primary">Live</span></h1>
              <p className="text-gray-500 font-medium">Performance financeira global em tempo real.</p>
           </div>
           <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sincronizado com Gateway</span>
           </div>
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <BigStat 
             title="Faturamento Bruto" 
             value={stats ? `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Volume total transacionado"
             icon={DollarSign}
             color="indigo"
             trend={12.5}
           />
           <BigStat 
             title="Comissões (10%)" 
             value={stats ? `R$ ${stats.platformRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Receita líquida Ticketera"
             icon={Wallet}
             color="green"
             trend={8.2}
           />
           <BigStat 
             title="Tickets Vendidos" 
             value={stats ? stats.transactionsCount.toLocaleString('pt-BR') : '0'}
             subValue="Total de ingressos emitidos"
             icon={Ticket}
             color="amber"
             trend={15.4}
           />
           <BigStat 
             title="Ticket Médio" 
             value={stats && stats.transactionsCount > 0 ? `R$ ${(stats.totalRevenue / stats.transactionsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
             subValue="Valor por transação"
             icon={Activity}
             color="purple"
             trend={-2.1}
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Detailed Metrics List */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                 <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-8 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" /> Distribuição de Receita
                 </h3>
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <MiniStat title="Pagamentos Pix" value="R$ 0,00" icon={Activity} />
                       <MiniStat title="Cartão Crédito" value="R$ 0,00" icon={CreditCard} />
                       <MiniStat title="Repasses Pendentes" value={stats ? `R$ ${stats.pendingAmount.toLocaleString('pt-BR')}` : 'R$ 0,00'} icon={Clock} />
                       <MiniStat title="Estornos (Chargeback)" value="R$ 0,00" icon={AlertTriangle} />
                    </div>
                    
                    <div className="pt-8 border-t border-gray-50">
                       <div className="flex justify-between items-end mb-4">
                          <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Saúde Financeira da Plataforma</p>
                          <p className="text-3xl font-black text-indigo-600">98.5%</p>
                       </div>
                       <div className="w-full bg-gray-50 h-4 rounded-full overflow-hidden border border-gray-100">
                          <div className="bg-gradient-to-r from-indigo-500 to-primary h-full w-[98.5%]" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Secondary Cards */}
           <div className="space-y-6">
              <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700">
                    <TrendingUp className="w-32 h-32" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Meta Mensal (Vendas)</p>
                 <h3 className="text-4xl font-black mb-6">R$ 500k</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span>Progresso</span>
                       <span>24%</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                       <div className="bg-white h-full w-[24%]" />
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Próximos Repasses</p>
                 <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                         <div>
                            <p className="text-xs font-black text-gray-900">Produtor #{i}29</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Previsto: 24/04</p>
                         </div>
                         <p className="font-black text-gray-900 text-sm">R$ 1.250,00</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

// Internal icon aliasing
const Clock = ({ className }: any) => <Calendar className={className} />;
const AlertTriangle = ({ className }: any) => <Activity className={className} />;
const CreditCard = ({ className }: any) => <DollarSign className={className} />;

export default MasterFinancialBI;
