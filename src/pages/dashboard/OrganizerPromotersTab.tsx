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
  event_id: string;
  promoter_id: string;
  coupon_code: string;
  commission_rate: number;
  status: string;
  application_data: any;
  created_at: string;
  promoters: Promoter;
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
    // Fetch Affiliations
    const { data: affData, error: affError } = await supabase
      .from('promoter_affiliations')
      .select('*, promoters(*, profiles(*))')
      .eq('event_id', eventId);
      
    if (affData) {
      console.log('Fetched affiliations:', affData);
      setAffiliations(affData);
    }
    if (affError) console.error("Error fetching affiliations:", affError);

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

  const activePromoters = affiliations.filter(a => a.status === 'approved');
  const pendingApplications = affiliations.filter(a => a.status === 'pending');

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const { error } = await supabase
      .from('events')
      .update({
        accepts_promoters: acceptsPromoters,
        promoter_commission_rate: promoterCommissionRate,
        promoter_discount_rate: promoterDiscountRate
      })
      .eq('id', eventId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao salvar configurações do promoter.' });
    } else {
      toast({ title: 'Sucesso', description: 'Configurações de promoter atualizadas com sucesso!' });
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
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Promoter</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Comissão (%)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Cupom</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
               <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
            ) : activePromoters.length === 0 ? (
               <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-medium">Nenhum promoter ativo ainda.</td></tr>
            ) : activePromoters.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black uppercase">
                      {p.promoters?.profiles?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-none">{p.promoters?.profiles?.name || 'Desconhecido'}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{p.promoters?.profiles?.email || 'N/A'} • {p.promoters?.profiles?.phone || 'Sem celular'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="font-black text-gray-900">{p.commission_rate}%</span>
                </td>
                <td className="px-6 py-4">
                   <span className="bg-gray-100 text-gray-700 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md w-fit">
                      {p.coupon_code}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button 
                     onClick={() => {
                        const link = `${window.location.origin}/e/${eventId}?ref=${p.coupon_code}`;
                        navigator.clipboard.writeText(link);
                        toast({ title: 'Link de venda copiado!' });
                     }}
                     className="flex items-center justify-end w-full gap-2 text-primary hover:underline text-[10px] font-black uppercase tracking-widest"
                   >
                     <ExternalLink className="w-3 h-3" /> Copiar Link
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {activeSubTab === 'applications' && (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Candidato</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Detalhes</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
               <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
            ) : pendingApplications.length === 0 ? (
               <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-medium">Nenhuma candidatura pendente.</td></tr>
            ) : pendingApplications.map(a => (
              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-black uppercase">
                      {a.promoters?.profiles?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-none">{a.promoters?.profiles?.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{a.promoters?.profiles?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-600">
                   {new Date(a.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                   <button 
                     onClick={() => setShowApplicationModal(a)}
                     className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                   >
                      <FileText className="w-3 h-3" /> Ver Questionário
                   </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                     <button onClick={() => handleApproveApplication(a.id)} className="text-green-500 hover:text-green-600 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors" title="Aprovar"><CheckCircle className="w-4 h-4" /></button>
                     <button onClick={() => handleRejectApplication(a.id)} className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Recusar"><XCircle className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {/* Modal do Questionário de Candidatura */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6 border-b border-gray-100 pb-4">
              Análise de Perfil
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Candidato</p>
                <p className="text-lg font-bold text-gray-900">{showApplicationModal.promoters?.profiles?.name}</p>
                <p className="text-sm text-gray-500 font-medium">{showApplicationModal.promoters?.profiles?.email}</p>
              </div>

              {/* Exibir o JSON de application_data se existir */}
              {showApplicationModal.application_data ? (
                 <div className="space-y-4">
                   {Object.entries(showApplicationModal.application_data).map(([key, value]) => (
                     <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                         {fieldTranslations[key] || key.replace(/_/g, ' ')}
                       </p>
                       {typeof value === 'object' && value !== null ? (
                          <div className="space-y-1 mt-2">
                             {Object.entries(value).map(([k, v]) => (
                                <p key={k} className="text-sm font-medium text-gray-700">
                                  <span className="font-bold capitalize text-gray-500">{k.replace('_', ' ')}:</span> {String(v)}
                                </p>
                             ))}
                          </div>
                       ) : (
                          <p className="text-sm text-gray-900 font-bold whitespace-pre-wrap">{String(value)}</p>
                       )}
                     </div>
                   ))}
                 </div>
              ) : (
                 <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">Nenhum questionário preenchido por este candidato.</p>
                 </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setShowApplicationModal(null)}
                className="flex-1 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all"
              >
                Fechar
              </button>
              <button 
                onClick={() => handleRejectApplication(showApplicationModal.id)}
                className="flex-1 bg-red-50 text-red-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all"
              >
                Recusar
              </button>
              <button 
                onClick={() => handleApproveApplication(showApplicationModal.id)}
                className="flex-[2] bg-green-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
              >
                Aprovar Promoter
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default OrganizerPromotersTab;
