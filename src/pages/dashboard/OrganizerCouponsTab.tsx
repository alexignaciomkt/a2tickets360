
import React, { useState, useEffect } from 'react';
import { Tag, Ticket, Plus, Loader2, Trash2, Gift, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'courtesy';
  discount_value: number;
  max_uses: number;
  current_uses: number;
  status: string;
}

const OrganizerCouponsTab = ({ eventId }: { eventId: string }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'courtesy',
    value: 10,
    maxUses: 100
  });

  useEffect(() => {
    fetchCoupons();
  }, [eventId]);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    
    if (data) setCoupons(data);
    setLoading(false);
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        event_id: eventId,
        code: newCoupon.code.toUpperCase(),
        discount_type: newCoupon.type,
        discount_value: newCoupon.type === 'courtesy' ? 100 : newCoupon.value,
        max_uses: newCoupon.maxUses,
        current_uses: 0,
        status: 'active'
      })
      .select()
      .single();

    if (data) {
      setCoupons([data, ...coupons]);
      setShowAddModal(false);
      setNewCoupon({ code: '', type: 'percentage', value: 10, maxUses: 100 });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Cupons e Cortesias</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Cupom
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Código</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Valor</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Uso</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
               <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
            ) : coupons.length === 0 ? (
               <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-medium">Nenhum cupom ativo para este evento.</td></tr>
            ) : coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-900 px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-widest border border-gray-200">
                      {c.code}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {c.discount_type === 'courtesy' ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">
                      <Gift className="w-3 h-3" /> Cortesia
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">
                      <Percent className="w-3 h-3" /> Desconto
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="font-black text-gray-900">
                    {c.discount_type === 'courtesy' ? 'GRÁTIS' : 
                     c.discount_type === 'percentage' ? `${c.discount_value}%` : 
                     `R$ ${c.discount_value.toFixed(2)}`}
                  </p>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[100px] overflow-hidden">
                        <div 
                          className={`h-full ${c.discount_type === 'courtesy' ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${(c.current_uses / c.max_uses) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.current_uses}/{c.max_uses}</p>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Ativo</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-6">Novo Cupom</h3>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Código do Cupom</label>
                <input 
                  required
                  type="text" 
                  placeholder="EX: VERAO2026"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl mt-1 font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tipo de Benefício</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                   {[
                     { id: 'percentage', label: '% Off', icon: Percent },
                     { id: 'fixed', label: 'R$ Off', icon: Tag },
                     { id: 'courtesy', label: 'Cortesia', icon: Gift },
                   ].map(t => (
                     <button
                       key={t.id}
                       type="button"
                       onClick={() => setNewCoupon({...newCoupon, type: t.id as any})}
                       className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${newCoupon.type === t.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                     >
                       <t.icon className="w-4 h-4" />
                       <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                     </button>
                   ))}
                </div>
                <div className="mt-2 p-3 bg-gray-50 rounded-xl">
                  {newCoupon.type === 'percentage' && (
                    <p className="text-[9px] text-gray-500 leading-relaxed"><strong className="text-gray-700">DESCONTO PERCENTUAL:</strong> Aplica uma porcentagem de desconto sobre o valor total da compra. Ideal para promoções de lançamento.</p>
                  )}
                  {newCoupon.type === 'fixed' && (
                    <p className="text-[9px] text-gray-500 leading-relaxed"><strong className="text-gray-700">DESCONTO FIXO:</strong> Subtrai um valor real fixo (Ex: R$ 10,00) do total. Bom para cupons de parcerias e influenciadores.</p>
                  )}
                  {newCoupon.type === 'courtesy' && (
                    <p className="text-[9px] text-gray-500 leading-relaxed"><strong className="text-gray-700">CORTESIA (100%):</strong> Gera um ingresso totalmente gratuito. O cliente pula a etapa de pagamento e retira o ingresso direto.</p>
                  )}
                </div>
              </div>

              {newCoupon.type !== 'courtesy' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Valor do Desconto</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl mt-1 font-black focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newCoupon.value}
                    onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})}
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Limite de Usos</label>
                <input 
                  required
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl mt-1 font-black focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newCoupon.maxUses}
                  onChange={e => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})}
                />
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
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerCouponsTab;
