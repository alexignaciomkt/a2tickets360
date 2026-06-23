import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircleDollarSign, TrendingUp, Ticket, Copy, CheckCircle2, Wallet, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

const PromoterDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [promoterInfo, setPromoterInfo] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  
  const [balance, setBalance] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  useEffect(() => {
    // Para simplificar o mockup sem auth complexa, vamos buscar o primeiro promoter "demo" ou usar um fake logado.
    // Em produção, isso viria do Auth Context atrelado ao `user_id`.
    fetchPromoterData();
  }, []);

  const fetchPromoterData = async () => {
    setLoading(true);
    
    // Simulação: pegamos o primeiro promoter ativo para demonstração (se houver)
    const { data: pData } = await supabase.from('promoters').select('*').eq('status', 'active').limit(1).single();
    
    if (pData) {
      setPromoterInfo(pData);
      
      // Simulação de Vendas e Comissões baseadas na meta e taxa para o painel não ficar vazio no demo
      setTicketsSold(12);
      setTotalSold(12 * 85); // 12 ingressos a R$ 85
      const calculatedBalance = (12 * 85) * (pData.commission_rate / 100);
      setBalance(calculatedBalance);
      
      // Buscamos as solicitações reais se existirem
      const { data: wData } = await supabase.from('promoter_withdrawals').select('*').eq('promoter_id', pData.id).order('created_at', { ascending: false });
      if (wData) setWithdrawals(wData);
    }
    
    setLoading(false);
  };

  const handleRequestWithdrawal = async () => {
    if (balance < 50 || !promoterInfo) return;
    
    setRequestingWithdrawal(true);
    
    const { data, error } = await supabase.from('promoter_withdrawals').insert({
      promoter_id: promoterInfo.id,
      amount: balance,
      status: 'pending'
    });
    
    if (!error) {
      setWithdrawalSuccess(true);
      setBalance(0); // Zera o saldo após solicitar
      fetchPromoterData(); // Atualiza a lista
    }
    
    setRequestingWithdrawal(false);
    setTimeout(() => setWithdrawalSuccess(false), 3000);
  };

  const copyCoupon = () => {
    navigator.clipboard.writeText(promoterInfo?.coupon_code?.toUpperCase() || 'PROMOTER10');
    alert('Cupom copiado!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-zinc-400">Carregando Dashboard...</p>
      </div>
    );
  }

  if (!promoterInfo) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Conta não encontrada ou em análise</h1>
        <p className="text-zinc-400 text-center max-w-md mb-8">Sua conta de Promoter ainda está sob análise do organizador ou não foi configurada corretamente. Aguarde a liberação.</p>
        <Link to="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-black uppercase tracking-widest text-xs transition-colors border border-white/10">Voltar para a Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Background Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <img src="/background site.png" alt="Bg" className="w-full h-full object-cover opacity-10" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo_512x512.png" alt="Logo" className="w-8 h-8" />
            <span className="font-black tracking-tight hidden md:block">A2 TICKETS</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-white leading-none">{promoterInfo.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-indigo-400">Promoter Oficial</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black shadow-lg shadow-indigo-500/20 border border-white/10">
              {promoterInfo.name.charAt(0)}
            </div>
            <button onClick={() => navigate('/login')} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
        
        {/* Welcome & Coupon */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white/5 p-6 rounded-3xl border border-white/10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Painel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Vendas</span>
            </h1>
            <p className="text-zinc-400 font-medium mt-1">Acompanhe suas conversões em tempo real.</p>
          </div>
          
          <div className="bg-black/50 p-4 rounded-2xl border border-indigo-500/30 flex items-center gap-4 w-full md:w-auto">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Seu Cupom de Desconto</p>
              <p className="text-2xl font-black text-white tracking-widest">{promoterInfo.coupon_code.toUpperCase()}</p>
            </div>
            <button 
              onClick={copyCoupon}
              className="w-12 h-12 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 rounded-xl flex items-center justify-center transition-colors border border-indigo-500/30 ml-auto md:ml-4"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Comissão: {promoterInfo.commission_rate}%</span>
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Saldo Disponível</p>
              <p className="text-4xl font-black tracking-tight text-white mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Meta: {promoterInfo.sales_goal}</span>
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Ingressos Vendidos</p>
              <p className="text-4xl font-black tracking-tight text-white mt-1">
                {ticketsSold} <span className="text-lg text-zinc-500">/ {promoterInfo.sales_goal}</span>
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Volume Movimentado (R$)</p>
              <p className="text-4xl font-black tracking-tight text-white mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSold)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Withdrawal Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-b from-white/10 to-transparent border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Saque Rápido</h3>
              <p className="text-zinc-400 text-sm mb-6">Transfira seu saldo disponível direto para sua conta via Pix após a aprovação do produtor.</p>
              
              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Regra de Saque</p>
                <p className="text-sm font-medium text-zinc-300">Valor mínimo para solicitar saque é de <strong className="text-white">R$ 50,00</strong>.</p>
              </div>
            </div>

            <button
              onClick={handleRequestWithdrawal}
              disabled={balance < 50 || requestingWithdrawal}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                balance >= 50 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {requestingWithdrawal ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               withdrawalSuccess ? <><CheckCircle2 className="w-5 h-5" /> Solicitado!</> :
               'Solicitar Saque'}
            </button>
          </div>

          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-3xl">
             <h3 className="text-xl font-black uppercase tracking-tight mb-6">Histórico de Saques</h3>
             
             {withdrawals.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                 <Wallet className="w-8 h-8 mb-2 opacity-50" />
                 <p className="font-medium">Nenhum saque solicitado ainda.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {withdrawals.map((w) => (
                   <div key={w.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                     <div>
                       <p className="font-black text-white text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(w.amount)}</p>
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{new Date(w.created_at).toLocaleString()}</p>
                     </div>
                     <div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         w.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                         w.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                         'bg-red-500/10 text-red-400 border-red-500/20'
                       }`}>
                         {w.status === 'pending' ? 'Em Análise' : w.status === 'paid' ? 'Pago' : 'Recusado'}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default PromoterDashboard;
