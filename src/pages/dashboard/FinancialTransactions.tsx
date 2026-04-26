import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Filter, Download, AlertTriangle, Check, XCircle, RotateCcw, Activity, DollarSign, Zap, Target, History, Clock, FileText, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { financialService } from '@/services/financialService';
import { Transaction } from '@/interfaces/financial';
import { Badge } from '@/components/ui/badge';

const statusBadgeStyles = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-600 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-600 border-rose-100",
  refunded: "bg-gray-50 text-slate-400 border-gray-100"
};

const StatusIcon = ({ status }: { status: string }) => {
  switch(status) {
    case 'pending':
      return <Clock className="h-3 w-3 mr-2" />;
    case 'confirmed':
      return <Check className="h-3 w-3 mr-2" />;
    case 'cancelled':
      return <XCircle className="h-3 w-3 mr-2" />;
    case 'refunded':
      return <RotateCcw className="h-3 w-3 mr-2" />;
    default:
      return null;
  }
};

const FinancialTransactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let filters = {};
        if (filterStatus !== 'all') {
          filters = { status: filterStatus };
        }
        const data = await financialService.getTransactions(filters);
        setTransactions(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        toast({
          title: 'Erro de Protocolo',
          description: 'Não foi possível carregar o fluxo de transações.',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [toast, filterStatus]);
  
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };
  
  const downloadTransactions = () => {
    toast({
      title: 'Extração de Dados',
      description: 'O arquivo CSV com as transações está sendo gerado.',
    });
  };
  
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  const handleInvoice = (invoiceUrl?: string) => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank');
    } else {
      toast({
        title: 'Registro Não Encontrado',
        description: 'Este pagamento não possui nota fiscal disponível no cluster.',
      });
    }
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`w-10 h-10 rounded-full text-[10px] font-black transition-all ${currentPage === i ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-gray-100 border border-gray-100'}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex justify-center items-center gap-4 mt-12 mb-8 px-10">
        <Button
          variant="outline"
          className="h-10 rounded-full px-6 text-[9px] font-black uppercase tracking-widest gap-2 disabled:opacity-30 border-gray-100 shadow-sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Anterior
        </Button>
        <div className="flex gap-2">
           {pages}
        </div>
        <Button
          variant="outline"
          className="h-10 rounded-full px-6 text-[9px] font-black uppercase tracking-widest gap-2 disabled:opacity-30 border-gray-100 shadow-sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próxima <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  };

  const QuickStat = ({ title, value, icon: Icon, color }: any) => (
    <Card className="rounded-[2rem] border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-700">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">{title}</p>
          <h3 className="text-xl font-black tracking-tighter text-slate-900 leading-none tabular-nums">{value}</h3>
        </div>
        <div className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-white/10 ${
          color === 'indigo' ? 'bg-slate-900 text-white shadow-lg' : 
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
          color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-12 animate-in fade-in duration-1000 pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
           <div className="space-y-1.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Fluxo de Transações Financeiras</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                Monitoramento em tempo real de ativos, conversões e fluxo de caixa do ecossistema.
              </p>
           </div>
           
           <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-gray-100/50 p-1.5 rounded-full border border-gray-100 shadow-inner">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'pending', label: 'Pendentes' },
                  { id: 'confirmed', label: 'Confirmados' },
                  { id: 'refunded', label: 'Reembolsados' }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => handleStatusFilter(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <Button variant="outline" className="h-11 rounded-full border-gray-100 text-[10px] font-black uppercase tracking-widest px-8 shadow-sm hover:bg-gray-50 transition-all">
                <Filter className="w-4 h-4 mr-3 text-slate-400" />
                Matriz de Filtros
              </Button>
              
              <Button onClick={downloadTransactions} className="h-11 rounded-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-10 shadow-2xl shadow-slate-100 hover:bg-black transition-all group">
                <Download className="w-4 h-4 mr-3 group-hover:translate-y-1 transition-transform" />
                Exportar CSV
              </Button>
           </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <QuickStat title="Total de Ativos Processados" value={transactions.length} icon={Activity} color="indigo" />
           <QuickStat title="Valor Bruto de Transação" value={`R$ ${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="emerald" />
           <QuickStat title="Lucro Líquido da Plataforma" value={`R$ ${transactions.reduce((sum, t) => sum + t.platformFee, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Zap} color="amber" />
        </div>
        
        <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
          <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20 px-12 py-8">
             <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Registro Master de Transações</CardTitle>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sincronização de Ledger ao Vivo</span>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="hover:bg-transparent border-none">
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">ID Transação</th>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Nó Temporal</th>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Fonte do Ativo</th>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Nó Autorizado</th>
                    <th className="px-12 py-8 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Fluxo Bruto</th>
                    <th className="px-12 py-8 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Taxa do Nó</th>
                    <th className="px-12 py-8 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Lucro Líquido</th>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-12 py-8 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Auditoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-12 py-24 text-center">
                        <div className="flex flex-col items-center gap-6">
                           <RefreshCw className="h-10 w-10 text-slate-200 animate-spin" />
                           <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Sincronizando registros do cluster...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-12 py-24 text-center">
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Zero transações localizadas na matriz.</p>
                      </td>
                    </tr>
                  ) : paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50/30 transition-all duration-500 group/item cursor-pointer border-b border-transparent hover:border-gray-100">
                      <td className="px-12 py-8">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{transaction.id.substring(0, 10).toUpperCase()}</span>
                      </td>
                      <td className="px-12 py-8">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {formatDate(transaction.date)}</div>
                      </td>
                      <td className="px-12 py-8">
                        <div className="space-y-1">
                           <div className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none truncate max-w-[200px]">{transaction.eventName}</div>
                           <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">{transaction.paymentMethod}</div>
                        </div>
                      </td>
                      <td className="px-12 py-8 text-[11px] font-black text-slate-900 uppercase tracking-tight">{transaction.userName}</td>
                      <td className="px-12 py-8 text-right">
                        <span className="text-[12px] font-black text-slate-900 tracking-tight tabular-nums">R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <span className="text-[11px] font-black text-rose-500 tracking-tight tabular-nums">-R$ {(transaction.fee + transaction.platformFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <span className="text-[12px] font-black text-emerald-500 tracking-tight tabular-nums">R$ {transaction.netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-12 py-8">
                        <Badge className={`text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${statusBadgeStyles[transaction.status as keyof typeof statusBadgeStyles]}`}>
                          <StatusIcon status={transaction.status} />
                          {transaction.status === 'pending' ? 'NÓ_PENDENTE' : 
                           transaction.status === 'confirmed' ? 'FLUXO_CONFIRMADO' : 
                           transaction.status === 'cancelled' ? 'ATIVO_CANCELADO' : 'REGISTRO_REEMBOLSADO'}
                        </Badge>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <Button 
                          variant="ghost"
                          className="h-10 w-10 rounded-full p-0 text-slate-200 hover:text-slate-900 hover:bg-gray-100 transition-all"
                          onClick={() => handleInvoice(transaction.invoiceUrl)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {renderPagination()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FinancialTransactions;
