import React, { useState, useEffect } from 'react';
import { Users, Plus, Loader2, ExternalLink, Trash2, CheckCircle, XCircle, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface PromoterProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Promoter {
  id: string;
  user_id: string;
  pix_key: string;
  asaas_wallet_id: string;
  profiles: PromoterProfile;
}

interface Affiliation {
  id: string;
  eventId: string;
  promoterId: string;
  referralCode: string;
  commissionRate: string;
  status: string;
  settlementMode: string;
  createdAt: string;
  promoterName: string;
  promoterEmail: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  promoters: Promoter;
}

const OrganizerPromotersTab = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'promoters' | 'applications' | 'withdrawals'>('promoters');
  const [mainTab, setMainTab] = useState<'operacional' | 'vendas'>('operacional');
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState<Affiliation | null>(null);

  const fieldTranslations: Record<string, string> = {
    region: 'Região de Atuação',
    channels: 'Canais de Divulgação',
    experience: 'Experiência',
    past_events: 'Eventos Anteriores',
    social_links: 'Redes Sociais',
    audience_size: 'Tamanho do Público (Alcance)'
  };

  // Configurações do Evento (Monetização Promoter)
  const [acceptsPromoters, setAcceptsPromoters] = useState(false);
  const [promoterCommissionRate, setPromoterCommissionRate] = useState(10);
  const [promoterDiscountRate, setPromoterDiscountRate] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId, activeSubTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Affiliations from canonical backend
      const affRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/organizer/events/${eventId}/promoters`, {
        headers: {
          'Authorization': `Bearer ${user?.id ? (await supabase.auth.getSession()).data.session?.access_token : ''}`
        }
      });
      if (affRes.ok) {
        const affData = await affRes.json();
        console.log('Fetched affiliations:', affData);
        if (affData.promoters && affData.summary) {
          setAffiliations(affData.promoters);
          setSalesSummary(affData.summary);
        } else {
          setAffiliations(affData);
        }
      } else {
        console.error("Error fetching affiliations:", await affRes.text());
      }

      // Fetch Event Settings
      const { data: eventData } = await supabase
        .from('events')
        .select('accepts_promoters, promoter_commission_rate, promoter_discount_rate')
        .eq('id', eventId)
        .single();

      if (eventData) {
        setAcceptsPromoters(eventData.accepts_promoters || false);
        setPromoterCommissionRate(eventData.promoter_commission_rate || 10);
        setPromoterDiscountRate(eventData.promoter_discount_rate || 0);
      }

      // Fetch Withdrawals for this organizer
      if (user?.id) {
        const { data: withData, error: withError } = await supabase
          .from('promoter_payout_requests')
          .select('*, promoters(*, profiles(*))')
          .eq('organizer_id', user.id)
          .order('requested_at', { ascending: false });
          
        if (withData) setWithdrawals(withData);
        if (withError) console.error("Error fetching withdrawals:", withError);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
    }
    setLoading(false);
  };

  const handleApproveApplication = async (affId: string) => {
    setLoading(true);
    // Gerar um cupom code aleatório
    const couponCode = `PROM${Math.floor(Math.random() * 10000)}`;

    const { error } = await supabase
      .from('promoter_affiliations')
      .update({ status: 'approved', coupon_code: couponCode })
      .eq('id', affId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao aprovar.' });
    } else {
      toast({ title: 'Sucesso', description: 'Promoter aprovado com sucesso!' });
      setAffiliations(affiliations.map(a => a.id === affId ? { ...a, status: 'approved', coupon_code: couponCode } : a));
      setShowApplicationModal(null);
    }
    setLoading(false);
  };

  const handleRejectApplication = async (affId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('promoter_affiliations')
      .update({ status: 'rejected' })
      .eq('id', affId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao recusar.' });
    } else {
      toast({ title: 'Sucesso', description: 'Promoter recusado.' });
      setAffiliations(affiliations.map(a => a.id === affId ? { ...a, status: 'rejected' } : a));
      setShowApplicationModal(null);
    }
    setLoading(false);
  };

  const handleMarkAsPaid = async (withdrawalId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('promoter_payout_requests')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', withdrawalId);
    
    if (!error) {
      setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'paid' } : w));
      toast({ title: 'Sucesso', description: 'Saque marcado como pago! O promoter verá o saldo atualizado.' });
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao marcar como pago.' });
    }
    setLoading(false);
  };

  const activePromoters = affiliations.filter(a => a.status === 'APPROVED');
  const pendingApplications = affiliations.filter(a => a.status === 'PENDING');

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      const response = await fetch(`${apiUrl}/api/organizer/events/${eventId}/promoter-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          accepts_promoters: acceptsPromoters,
          promoter_commission_rate: promoterCommissionRate,
          promoter_discount_rate: promoterDiscountRate
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar');
      }
      
      toast({ title: 'Sucesso', description: 'Configurações de promoter atualizadas com sucesso!' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao salvar configurações do promoter.' });
    }
    setSavingSettings(false);
  };

  return (
    <div className="space-y-8">
      
      {/* ══════════════════════════════════════════════════════
          CONFIGURAÇÕES DO PROGRAMA DE PROMOTERS
      ══════════════════════════════════════════════════════ */}
      <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-indigo-100/50 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2">
              Programa de Promoters (Afiliados)
            </h3>
            <p className="text-xs text-indigo-700/70 font-medium mt-1">
              Ative para permitir que promoters vendam ingressos para o seu evento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAcceptsPromoters(!acceptsPromoters)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${acceptsPromoters ? 'bg-indigo-600' : 'bg-indigo-200'}`}
          >
            <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute ${acceptsPromoters ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {acceptsPromoters && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="text-xs font-bold text-indigo-900 mb-1 block uppercase tracking-widest">
                Comissão do Promoter (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={promoterCommissionRate} 
                  onChange={(e) => setPromoterCommissionRate(Number(e.target.value))}
                  className="w-full bg-white border border-indigo-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-black text-indigo-900 outline-none transition-all" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-indigo-700/60 mt-2 font-medium">Porcentagem (após desconto) que o promoter ganha.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-indigo-900 mb-1 block uppercase tracking-widest">
                Desconto do Cliente (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={promoterDiscountRate} 
                  onChange={(e) => setPromoterDiscountRate(Number(e.target.value))}
                  className="w-full bg-white border border-indigo-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-black text-indigo-900 outline-none transition-all" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-indigo-700/60 mt-2 font-medium">Desconto para quem comprar com link de promoter.</p>
            </div>
          </div>
        )}
        <div className="px-8 py-4 bg-indigo-500/5 flex justify-end">
          <button 
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
          >
            {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Regras'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Gestão de Promoters</h3>
        </div>

        {/* MAIN TABS */}
        <div className="flex gap-4 border-b border-gray-200">
          <button 
            onClick={() => setMainTab('operacional')}
            className={`pb-3 px-2 text-sm font-black uppercase tracking-widest transition-colors ${mainTab === 'operacional' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Promoters
          </button>
          <button 
            onClick={() => setMainTab('vendas')}
            className={`pb-3 px-2 text-sm font-black uppercase tracking-widest transition-colors ${mainTab === 'vendas' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Vendas
          </button>
        </div>

        {mainTab === 'operacional' ? (
          <>
            <div className="flex gap-4 border-b border-gray-100 pb-2">
        <button 
          onClick={() => setActiveSubTab('promoters')}
          className={`pb-2 px-1 text-sm font-black uppercase tracking-widest transition-colors ${activeSubTab === 'promoters' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Promoters Ativos ({activePromoters.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('applications')}
          className={`pb-2 px-1 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${activeSubTab === 'applications' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Fila de Aprovação {pendingApplications.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingApplications.length}</span>}
        </button>
        <button 
          onClick={() => setActiveSubTab('withdrawals')}
          className={`pb-2 px-1 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${activeSubTab === 'withdrawals' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Saques {withdrawals.filter(w => w.status === 'pending').length > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{withdrawals.filter(w => w.status === 'pending').length}</span>}
        </button>
      </div>

      {activeSubTab === 'promoters' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Promoter</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Comissão</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamento</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Código (Link)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {affiliations.length > 0 ? (
                    affiliations.map((aff) => (
                      <tr key={aff.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{aff.promoterName}</div>
                          <div className="text-sm text-slate-500">{aff.promoterEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            aff.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            aff.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {aff.status === 'APPROVED' ? 'Ativo' : aff.status === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{aff.commissionRate}%</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600">{aff.settlementMode}</div>
                        </td>
                        <td className="px-6 py-4">
                          {aff.status === 'APPROVED' && aff.referralCode ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                {aff.referralCode}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {aff.performance ? (
                            <div className="flex flex-col space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Vendas:</span>
                                <span className="font-medium text-slate-900">{aff.performance.sales} (Cred: {aff.performance.credentials})</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Receita:</span>
                                <span className="font-medium text-emerald-600">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.performance.grossRevenue)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Comissão:</span>
                                <span className="font-medium text-indigo-600">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.performance.commissionGenerated)}
                                </span>
                              </div>
                              <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                                <span className="text-slate-500 font-medium">A Pagar:</span>
                                <span className="font-bold text-orange-600">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.performance.commissionPayable)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Nenhum promoter encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {activeSubTab === 'applications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {affiliations.filter(a => a.status === 'PENDING').length > 0 ? (
              affiliations.filter(a => a.status === 'PENDING').map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{app.promoterName}</h4>
                        <p className="text-sm text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                    <button 
                      onClick={() => handleApplicationStatus(app.id, 'APPROVED')}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aprovar</span>
                    </button>
                    <button 
                      onClick={() => handleApplicationStatus(app.id, 'REJECTED')}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Recusar</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">Nenhuma solicitação pendente</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-1">
                  Quando os promoters solicitarem afiliação ao seu evento, elas aparecerão aqui.
                </p>
              </div>
            )}
          </div>
      )}

      {activeSubTab === 'withdrawals' && (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Promoter</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Valor Solicitado</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
               <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
            ) : withdrawals.length === 0 ? (
               <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-medium">Nenhuma solicitação de saque.</td></tr>
            ) : withdrawals.map(w => (
              <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-gray-600">{new Date(w.requested_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <p className="font-black text-gray-900">{w.promoters?.profiles?.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                     {w.promoters?.pix_key ? `PIX: ${w.promoters.pix_key}` : (w.promoters?.asaas_wallet_id ? `Asaas: ${w.promoters.asaas_wallet_id}` : 'Sem chave cadastrada')}
                  </p>
                </td>
                <td className="px-6 py-4 font-black text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(w.amount)}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-fit ${
                    w.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                    w.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {w.status === 'pending' ? 'Aguardando Pagamento' : w.status === 'paid' ? 'Pago' : 'Recusado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {w.status === 'pending' && (
                    <button 
                      onClick={() => handleMarkAsPaid(w.id)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                    >
                      Marcar como Pago
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
          </>
        ) : (
          /* ABA VENDAS */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h4 className="text-lg font-black uppercase tracking-widest text-gray-900">Vendas por Promoter</h4>
              <p className="text-sm text-gray-500 font-medium">Acompanhe o desempenho dos promoters deste evento.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Vendas via Promoters</p>
                <p className="text-2xl font-black text-gray-900">{salesSummary?.promoterPaidSales || 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Credenciais Vendidas</p>
                <p className="text-2xl font-black text-gray-900">{salesSummary?.promoterCredentials || 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Receita Gerada</p>
                <p className="text-2xl font-black text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesSummary?.promoterGrossRevenue || 0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Comissões Geradas</p>
                <p className="text-2xl font-black text-indigo-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesSummary?.promoterCommissionGenerated || 0)}</p>
              </div>
            </div>

            {/* Participação */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">Participação nas Vendas</p>
                <p className="text-sm text-indigo-900 font-medium"><span className="text-2xl font-black mr-2">{Number(salesSummary?.promoterSalesShare || 0).toFixed(1).replace('.', ',')}%</span> das vendas deste evento vieram de promoters.</p>
              </div>
            </div>

            {/* Ranking */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Ranking de Promoters</h4>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {activePromoters.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 font-medium">Este evento ainda não possui promoters ativos.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-16">#</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Promoter</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Vendas</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Credenciais</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Receita</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Comissão</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">A Pagar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {salesSummary?.promoterPaidSales === 0 ? (
                          <tr><td colSpan={7} className="p-8 text-center text-gray-500 font-medium">Nenhuma venda realizada por promoters neste evento ainda.</td></tr>
                        ) : (
                          [...activePromoters]
                            .sort((a, b) => {
                              const salesA = a.performance?.sales || 0;
                              const salesB = b.performance?.sales || 0;
                              if (salesB !== salesA) return salesB - salesA;
                              const revA = a.performance?.grossRevenue || 0;
                              const revB = b.performance?.grossRevenue || 0;
                              return revB - revA;
                            })
                            .map((aff, index) => (
                              <tr key={aff.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 font-black text-gray-400">
                                  {index === 0 ? <span className="text-2xl">🥇 1</span> : index + 1}
                                </td>
                                <td className="px-6 py-4 font-black text-gray-900">{aff.promoterName}</td>
                                <td className="px-6 py-4 text-center font-bold text-gray-600">{aff.performance?.sales || 0}</td>
                                <td className="px-6 py-4 text-center font-medium text-gray-500">{aff.performance?.credentials || 0}</td>
                                <td className="px-6 py-4 text-right font-black text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.performance?.grossRevenue || 0)}</td>
                                <td className="px-6 py-4 text-right font-black text-indigo-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.performance?.commissionGenerated || 0)}</td>
                                <td className="px-6 py-4 text-right font-black text-orange-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aff.performance?.commissionPayable || 0)}</td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerPromotersTab;
