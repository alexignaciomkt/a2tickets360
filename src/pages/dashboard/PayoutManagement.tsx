
import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Check, AlertTriangle, ArrowUpRight, Clock, ShieldCheck, User, XCircle, Loader2, ChevronRight, Hash, Zap, ShieldAlert, Database, Target, Cpu, Banknote } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { financialService } from '@/services/financialService';
import { PayoutRequest } from '@/interfaces/financial';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const PayoutManagement = () => {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true);
        const data = await financialService.getPayoutRequests();
        setPayouts(data);
      } catch (error) {
        console.error('Erro ao carregar solicitações de pagamento:', error);
        toast({
          title: 'Financial Matrix Error',
          description: 'Não foi possível sincronizar os repasses pendentes no kernel central.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayouts();
  }, [toast]);
  
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
  };
  
  const filteredPayouts = filterStatus === 'all' 
    ? payouts 
    : payouts.filter(payout => payout.status === filterStatus);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  const handleViewDetails = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setDialogOpen(true);
  };
  
  const handleStatusChange = (payoutId: string, newStatus: 'processing' | 'completed' | 'failed') => {
    const updatedPayouts = payouts.map(p => {
      if (p.id === payoutId) {
        return {
          ...p, 
          status: newStatus,
          processingDate: newStatus === 'processing' ? new Date().toISOString() : p.processingDate,
          completionDate: newStatus === 'completed' ? new Date().toISOString() : p.completionDate
        };
      }
      return p;
    });
    
    setPayouts(updatedPayouts);
    
    const statusMessages = {
      processing: 'Repasse movido para o processador logístico de liquidação.',
      completed: 'Liquidado com sucesso no ecossistema central de clearing.',
      failed: 'Falha crítica protocolar no processamento de liquidação.'
    };
    
    toast({
      title: 'Matrix Status Synchronized',
      description: statusMessages[newStatus],
    });
    
    setDialogOpen(false);
  };
  
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
        
        {/* Payout Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Repasses Financeiros</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Auditoria, aprovação e controle de saques solicitados pelos produtores.
              </p>
           </div>
           
           <div className="flex bg-white p-1 rounded-md border border-slate-200 shadow-sm">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'processing', label: 'Em Processamento' },
              { id: 'completed', label: 'Concluídos' }
            ].map((tab) => (
              <button 
                key={tab.id}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filterStatus === tab.id ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => handleStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
           </div>
        </div>
        
        {/* Financial Metrics Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { label: 'Total Operations Registry', value: payouts.length, icon: Hash, color: 'slate' },
            { label: 'Net Liquidation Matrix', value: `R$ ${payouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ArrowUpRight, color: 'emerald' },
            { label: 'Settlement Waitlist Hub', value: payouts.filter(p => p.status === 'pending').length, icon: Clock, color: 'amber' },
            { label: 'Cleared Master Nodes', value: payouts.filter(p => p.status === 'completed').length, icon: ShieldCheck, color: 'slate' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1000 border-2">
              <CardContent className="p-10 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 leading-none mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-black tracking-tighter text-slate-900 leading-none tabular-nums">{stat.value}</h3>
                </div>
                <div className={`w-14 h-14 rounded-[1.4rem] flex items-center justify-center border-4 border-white shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-6 ${
                  stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                  stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-slate-900 text-white'
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Settlement Ledger Registry */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-[4rem] overflow-hidden border-2 group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1000">
          <CardHeader className="pb-6 border-b border-gray-50 bg-gray-50/20 px-16 py-12">
            <div className="flex items-center justify-between">
               <CardTitle className="text-[12px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-5">
                  <Database className="w-6 h-6 text-slate-900" /> Transaction Registry Ledger
               </CardTitle>
               <div className="flex items-center gap-4 bg-white/50 px-6 py-2.5 rounded-full border border-gray-100">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Live Clearing Flux</span>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Hash / Node Registry</th>
                    <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Producer Authority Hub</th>
                    <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Temporal Cluster Node</th>
                    <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-right">Net Matrix Clearing</th>
                    <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Flux Status</th>
                    <th className="px-16 py-10 text-right text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Action Hub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-16 py-32 text-center">
                        <div className="flex flex-col items-center gap-8">
                           <Loader2 className="animate-spin h-12 w-12 text-slate-900" />
                           <span className="text-[11px] font-black uppercase text-slate-300 tracking-[0.4em]">Scanning Financial Kernel Flux...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-16 py-48 text-center">
                         <div className="w-32 h-32 rounded-[3.5rem] bg-gray-50 flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-2xl transition-transform hover:scale-110">
                            <Banknote className="w-12 h-12 text-slate-200" />
                         </div>
                         <p className="text-[12px] font-black uppercase text-slate-400 tracking-[0.3em]">Zero settlement requests in current Matrix waitlist.</p>
                      </td>
                    </tr>
                  ) : filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50/30 transition-all duration-700 group cursor-pointer border-b border-transparent hover:border-gray-100" onClick={() => handleViewDetails(payout)}>
                      <td className="px-16 py-10 text-[11px] font-mono text-slate-400 group-hover:text-slate-900 transition-colors tabular-nums uppercase">#{payout.id.slice(0, 12).toUpperCase()}</td>
                      <td className="px-16 py-10">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-[1.2rem] bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xl border-4 border-white group-hover:scale-110 group-hover:rotate-6 transition-transform">
                              <User className="w-5 h-5" />
                           </div>
                           <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight group-hover:text-slate-900 transition-colors">{payout.organizerName}</span>
                        </div>
                      </td>
                      <td className="px-16 py-10">
                        <div className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase tracking-tight leading-none tabular-nums">
                           <Calendar className="w-4 h-4 text-slate-300" />
                           {formatDate(payout.requestDate)}
                        </div>
                      </td>
                      <td className="px-16 py-10 text-right text-[15px] font-black text-slate-900 tabular-nums">
                        R$ {payout.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-16 py-10">
                        <Badge className={`text-[9px] font-black uppercase tracking-[0.2em] border-none px-5 py-2 rounded-full shadow-sm ${
                          payout.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          payout.status === 'processing' ? 'bg-indigo-50 text-indigo-600' :
                          payout.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {payout.status?.toUpperCase() || 'WAITING_LOG'}
                        </Badge>
                      </td>
                      <td className="px-16 py-10 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(payout)}
                          className="h-12 rounded-full text-slate-300 hover:text-slate-900 hover:bg-gray-100 font-black uppercase text-[10px] tracking-widest px-8 transition-all hover:scale-105"
                        >
                          Deep Audit <ChevronRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-none text-slate-900 rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,0.3)] p-0 overflow-hidden max-w-xl animate-in zoom-in-95 duration-700 border-4 border-slate-50">
          <div className="p-16 space-y-12">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-6">
                    <div className="p-4 bg-slate-900 rounded-[1.6rem] text-white shadow-2xl border-4 border-white"><Target className="w-8 h-8" /></div>
                    Liquidation Protocol
                  </DialogTitle>
                  <DialogDescription className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 leading-none">Verificação atômica de domicílio bancário e autorização de clearing global.</DialogDescription>
                </div>
                <Button variant="ghost" className="h-16 w-16 rounded-full p-0 text-slate-200 hover:text-slate-900 transition-all hover:scale-110 active:scale-90" onClick={() => setDialogOpen(false)}>
                   <XCircle className="w-10 h-10" />
                </Button>
              </div>
            </DialogHeader>
            
            {selectedPayout && (
              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-10 bg-slate-900 text-white p-12 rounded-[3.5rem] border-4 border-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute -right-12 -top-12 p-12 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-1000 group-hover:rotate-12"><Zap className="w-52 h-52" /></div>
                  <div className="space-y-3 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Net Matrix Clearing Volume</p>
                    <p className="text-4xl font-black text-emerald-400 tracking-tighter leading-none tabular-nums">R$ {selectedPayout.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Authorized Kernel Hash</p>
                    <p className="text-[11px] font-mono text-white/40 leading-none tabular-nums uppercase">#{selectedPayout.id.slice(0, 16).toUpperCase()}</p>
                  </div>
                  <div className="space-y-4 col-span-2 pt-10 border-t-2 border-white/5 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Authorized Node Entity</p>
                    <p className="text-[18px] font-black text-white uppercase tracking-tight leading-none group-hover:translate-x-2 transition-transform duration-1000">{selectedPayout.organizerName}</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-px bg-gray-100" />
                     <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-4 leading-none"><ShieldCheck className="h-5 w-5 text-slate-900" /> Authorized Banking Registry Hub</p>
                     <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="bg-gray-50/30 border-2 border-gray-50 p-12 rounded-[3rem] space-y-8 shadow-inner">
                    {[
                      { l: 'Bank Node Authority', v: selectedPayout.bankInfo.bankName },
                      { l: 'Account Cluster Protocol', v: selectedPayout.bankInfo.accountType },
                      { l: 'Branch Registry Hash', v: selectedPayout.bankInfo.branchCode },
                      { l: 'Master Account Number Hub', v: selectedPayout.bankInfo.accountNumber }
                    ].map((item, idx) => (
                      <div key={idx} className={`flex justify-between items-center text-[13px] font-black uppercase tracking-tight ${idx < 3 ? 'border-b-2 border-gray-50 pb-6' : ''} group/row`}>
                         <span className="text-slate-300 tracking-[0.2em] leading-none group-hover/row:text-slate-900 transition-colors">{item.l}</span>
                         <span className="text-slate-900 leading-none tabular-nums group-hover/row:translate-x-[-4px] transition-transform">{item.v?.toUpperCase() || 'ROOT_EMPTY'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-8 pt-6">
              {selectedPayout && selectedPayout.status === 'pending' && (
                <>
                  <div className="flex gap-8">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleStatusChange(selectedPayout.id, 'failed')}
                      className="flex-1 h-16 rounded-full font-black text-[12px] uppercase tracking-[0.3em] text-rose-500 hover:bg-rose-50 transition-all hover:scale-105"
                    >
                      Abort & Reject Node
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusChange(selectedPayout.id, 'processing')}
                      className="flex-1 h-16 rounded-full border-2 border-gray-100 bg-white text-slate-900 font-black text-[12px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                    >
                      Audit Mode Flux
                    </Button>
                  </div>
                  <Button 
                    className="w-full h-20 rounded-full bg-slate-900 hover:bg-black text-white font-black text-[14px] uppercase tracking-[0.5em] shadow-[0_30px_80px_rgba(0,0,0,0.4)] transition-all hover:scale-110 active:scale-95 group/auth border-4 border-slate-800"
                    onClick={() => handleStatusChange(selectedPayout.id, 'completed')}
                  >
                    <ShieldCheck className="w-8 h-8 mr-6 group-hover:scale-125 transition-transform" />
                    Authorize Global Liquidation
                  </Button>
                </>
              )}
              
              {selectedPayout && selectedPayout.status === 'processing' && (
                <div className="flex flex-col gap-6">
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusChange(selectedPayout.id, 'failed')}
                    className="h-16 rounded-full border-4 border-rose-50 bg-white text-rose-500 font-black text-[12px] uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                  >
                    Fail Operation Node & Block
                  </Button>
                  <Button 
                    className="h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[14px] uppercase tracking-[0.5em] shadow-[0_30px_80px_rgba(16,185,129,0.3)] transition-all hover:scale-110 active:scale-95 group/liq border-4 border-emerald-400"
                    onClick={() => handleStatusChange(selectedPayout.id, 'completed')}
                  >
                    <Zap className="w-8 h-8 mr-6 group-hover:animate-pulse" />
                    Liquidate Alpha Asset Matrix
                  </Button>
                </div>
              )}
              
              {selectedPayout && (selectedPayout.status === 'completed' || selectedPayout.status === 'failed') && (
                <Button onClick={() => setDialogOpen(false)} className="w-full h-16 rounded-full font-black text-[12px] uppercase tracking-[0.4em] bg-slate-900 text-white shadow-2xl transition-all hover:scale-110 border-4 border-slate-800">
                   Close Authorized Audit Protocol
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PayoutManagement;
