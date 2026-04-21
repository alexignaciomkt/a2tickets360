
import React, { useState, useEffect } from 'react';
import { Users, CircleDollarSign, Plus, Loader2, Mail, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Promoter {
  id: string;
  name: string;
  email: string;
  phone?: string;
  slug: string;
  commission_rate: number;
  sales_goal: number;
  status: string;
}

const OrganizerPromotersTab = ({ eventId }: { eventId: string }) => {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromoter, setNewPromoter] = useState({ name: '', email: '', phone: '', commission: 10, goal: 50 });

  useEffect(() => {
    fetchPromoters();
  }, [eventId]);

  const fetchPromoters = async () => {
    const { data, error } = await supabase
      .from('promoters')
      .select('*')
      .order('name');
    
    if (data) setPromoters(data);
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
        slug: newPromoter.name.toLowerCase().replace(/\s+/g, '-'),
        commission_rate: newPromoter.commission,
        sales_goal: newPromoter.goal,
        status: 'active'
      })
      .select()
      .single();

    if (data) {
      setPromoters([...promoters, data]);
      setShowAddModal(false);
      setNewPromoter({ name: '', email: '', phone: '', commission: 10, goal: 50 });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Promoters do Evento</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Promoter
        </button>
      </div>

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
                        const link = `${window.location.origin}/e/${eventId}?ref=${p.slug}`;
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-6">Novo Promoter</h3>
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
