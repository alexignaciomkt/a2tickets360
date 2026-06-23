
import React, { useState, useEffect } from 'react';
import { Users, CircleDollarSign, Plus, Loader2, Mail, ExternalLink, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Promoter {
  id: string;
  name: string;
  email: string;
  phone?: string;
  coupon_code: string;
  commission_rate: number;
  sales_goal: number;
  status: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  role: string;
  reason: string;
  status: string;
  created_at: string;
}

interface Withdrawal {
  id: string;
  promoter_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const OrganizerPromotersTab = ({ eventId }: { eventId: string }) => {
  const [activeSubTab, setActiveSubTab] = useState<'promoters' | 'applications' | 'withdrawals'>('promoters');
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromoter, setNewPromoter] = useState({ name: '', email: '', phone: '', commission: 10, goal: 50 });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Promoters
    const { data: promotersData } = await supabase.from('promoters').select('*').order('name');
    if (promotersData) setPromoters(promotersData);
    
    // Fetch Applications
    const { data: appData } = await supabase.from('promoter_applications').select('*').order('created_at', { ascending: false });
    if (appData) setApplications(appData);

    // Fetch Withdrawals (Mock for now, until promoter_withdrawals table is heavily populated)
    const { data: withData } = await supabase.from('promoter_withdrawals').select('*, promoters(name)').order('created_at', { ascending: false }).limit(20);
    if (withData) {
      setWithdrawals(withData.map((w: any) => ({ ...w, promoter_name: w.promoters?.name || 'Desconhecido' })));
    }
    
    setLoading(false);
  };

  const handleAddPromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('promoters')
      .insert({
        name: newPromoter.name,
        email: newPromoter.email,
        phone: newPromoter.phone,
        coupon_code: newPromoter.name.split(' ')[0].toUpperCase() + Math.floor(Math.random() * 1000),
        commission_rate: newPromoter.commission,
        sales_goal: newPromoter.goal,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir promoter no Supabase:', error);
      alert('Erro ao aprovar promoter: ' + error.message);
    }

    if (data) {
      setPromoters([...promoters, data]);
      setShowAddModal(false);
      setNewPromoter({ name: '', email: '', phone: '', commission: 10, goal: 50 });
      await supabase.from('promoter_applications').update({ status: 'approved' }).eq('email', data.email);
      setApplications(applications.map(a => a.email === data.email ? { ...a, status: 'approved' } : a));
    }
    setLoading(false);
  };

  const handleApproveApplication = async (app: Application) => {
    setNewPromoter({ name: app.name, email: app.email, phone: app.phone, commission: 10, goal: 50 });
    setShowAddModal(true);
    // Real app would mark this as approved in DB after the modal submits
  };

  const handleMarkAsPaid = async (withdrawalId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('promoter_withdrawals')
      .update({ status: 'paid' })
      .eq('id', withdrawalId);
    
    if (!error) {
      setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'paid' } : w));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Gestão de Promoters</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Promoter
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-100 pb-2">
        <button 
          onClick={() => setActiveSubTab('promoters')}
          className={`pb-2 px-1 text-sm font-black uppercase tracking-widest transition-colors ${activeSubTab === 'promoters' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Promoters Ativos
        </button>
        <button 
          onClick={() => setActiveSubTab('applications')}
          className={`pb-2 px-1 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${activeSubTab === 'applications' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Fila de Aprovação {applications.filter(a => a.status === 'pending').length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{applications.filter(a => a.status === 'pending').length}</span>}
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
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Performance</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
               <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
            ) : promoters.length === 0 ? (
               <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-medium">Nenhum promoter cadastrado ainda.</td></tr>
            ) : promoters.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-none">{p.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="font-black text-gray-900">{p.commission_rate}%</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-gray-700">0 / {p.sales_goal || 0} vendas</p>
                      <p className="text-[10px] font-black text-primary">0%</p>
                   </div>
                   <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-0 transition-all" />
                   </div>
                   <p className="text-[10px] text-gray-400 uppercase mt-1">R$ 0,00 faturado</p>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                      <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-fit">Ativo</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{p.phone || 'Sem Whats'}</p>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <button 
                     onClick={() => {
                        const link = `${window.location.origin}/e/${eventId}?ref=${p.coupon_code}`;
                        navigator.clipboard.writeText(link);
                        alert('Link de venda copiado!');
                     }}
                     className="flex items-center gap-2 text-primary hover:underline text-[10px] font-black uppercase tracking-widest"
                   >
                     <ExternalLink className="w-3 h-3" /> Copiar Link
                   </button>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Perfil</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Motivo</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
               <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
            ) : applications.length === 0 ? (
               <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-medium">Nenhuma candidatura pendente.</td></tr>
            ) : applications.map(a => (
              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-black">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-none">{a.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{a.email} • {a.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-fit">
                        {a.role === 'promoter' ? 'Promoter' : 'Staff'}
                      </span>
                      {a.instagram && <p className="text-[10px] text-indigo-500 font-bold">{a.instagram}</p>}
                   </div>
                </td>
                <td className="px-6 py-4">
                   <p className="text-xs text-gray-600 max-w-xs truncate" title={a.reason}>{a.reason}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  {a.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleApproveApplication(a)} className="text-green-500 hover:text-green-600 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors" title="Aprovar"><CheckCircle className="w-4 h-4" /></button>
                       <button className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Recusar"><XCircle className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Processado</span>
                  )}
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
                <td className="px-6 py-4 text-xs font-bold text-gray-600">{new Date(w.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-black text-gray-900">{w.promoter_name}</td>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Novo Promoter</h3>
            <form onSubmit={handleAddPromoter} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome Completo</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl mt-1 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newPromoter.name}
                  onChange={e => setNewPromoter({...newPromoter, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
                <input 
                  required
                  type="email" 
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl mt-1 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newPromoter.email}
                  onChange={e => setNewPromoter({...newPromoter, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp / Telefone</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl mt-1 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="(00) 00000-0000"
                  value={newPromoter.phone}
                  onChange={e => setNewPromoter({...newPromoter, phone: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Comissão (%)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl mt-1 font-black focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newPromoter.commission}
                    onChange={e => setNewPromoter({...newPromoter, commission: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Meta (Vendas)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl mt-1 font-black focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newPromoter.goal}
                    onChange={e => setNewPromoter({...newPromoter, goal: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerPromotersTab;
