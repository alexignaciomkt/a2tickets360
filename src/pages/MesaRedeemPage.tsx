
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, Users, CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MesaRedeemPage = () => {
  const { token: urlToken } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [token, setToken] = useState(urlToken || '');
  const [step, setStep] = useState(urlToken ? 'validate' : 'input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [groupData, setGroupData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: ''
  });

  const validateToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Find the parent purchase by token
      const { data: parent, error: pErr } = await supabase
        .from('purchased_tickets')
        .select(`
          id, 
          event_id, 
          ticket_id,
          events (title),
          tickets (name, capacity_per_unit)
        `)
        .eq('group_token', token)
        .is('parent_purchase_id', null)
        .single();

      if (pErr || !parent) throw new Error('Token inválido ou não encontrado.');

      // 2. Count how many already redeemed
      const { count, error: cErr } = await supabase
        .from('purchased_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('parent_purchase_id', parent.id);

      const capacity = parent.tickets?.capacity_per_unit || 1;
      const redeemed = count || 0;

      if (redeemed >= capacity - 1) { // -1 because parent is 1st seat? Or parent is owner and guests are others?
        // Logic: If Mesa is for 4 people, owner has 1, guests can have 3.
        throw new Error('Todas as vagas desta mesa/camarote já foram preenchidas.');
      }

      setGroupData({ ...parent, redeemed, capacity });
      setStep('form');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlToken) validateToken();
  }, [urlToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create or Update Profile for Mailing Gold
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .upsert({
          email: formData.email,
          name: formData.name,
          cpf: formData.cpf,
          phone: formData.phone,
          birth_date: formData.birthDate,
          role: 'customer'
        }, { onConflict: 'email' })
        .select()
        .single();

      if (profErr) throw profErr;

      // 2. Create the ticket
      const { error: tErr } = await supabase
        .from('purchased_tickets')
        .insert({
          user_id: profile.user_id || (await supabase.auth.getUser()).data.user?.id, // Use existing if possible
          event_id: groupData.event_id,
          ticket_id: groupData.ticket_id,
          parent_purchase_id: groupData.id,
          status: 'active',
          qr_code_data: `GUEST-${groupData.id}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`
        });

      if (tErr) throw tErr;

      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 border border-gray-100 relative overflow-hidden">
          
          {/* Progress Decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
             <div className="h-full bg-primary transition-all duration-500" style={{ width: step === 'input' ? '33%' : step === 'form' ? '66%' : '100%' }} />
          </div>

          {step === 'input' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                 <Ticket className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Resgate de Mesa</h2>
                <p className="text-gray-500 font-medium mt-2">Insira o código enviado pelo dono da mesa para gerar seu ingresso individual.</p>
              </div>
              <form onSubmit={validateToken} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="DIGITE O TOKEN AQUI"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center font-black text-xl uppercase tracking-widest focus:border-primary outline-none transition-all"
                  value={token}
                  onChange={e => setToken(e.target.value.toUpperCase())}
                />
                {error && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-widest">{error}</p>}
                <button 
                  disabled={loading || !token}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Validar Acesso <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-4 mb-8">
                 <div className="bg-green-50 p-3 rounded-2xl"><Users className="w-6 h-6 text-green-600" /></div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grupo Validado</p>
                    <p className="font-black text-gray-900">{groupData?.events?.title} - {groupData?.tickets?.name}</p>
                 </div>
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Seus Dados</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome Completo</label>
                  <input required type="text" className="w-full px-4 py-3 bg-gray-50 rounded-xl mt-1 font-medium outline-none focus:ring-2 focus:ring-primary/20" 
                         value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
                  <input required type="email" className="w-full px-4 py-3 bg-gray-50 rounded-xl mt-1 font-medium outline-none focus:ring-2 focus:ring-primary/20" 
                         value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">CPF</label>
                    <input required type="text" className="w-full px-4 py-3 bg-gray-50 rounded-xl mt-1 font-medium outline-none focus:ring-2 focus:ring-primary/20" 
                           value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</label>
                    <input required type="text" className="w-full px-4 py-3 bg-gray-50 rounded-xl mt-1 font-medium outline-none focus:ring-2 focus:ring-primary/20" 
                           value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Data de Nascimento</label>
                  <input required type="date" className="w-full px-4 py-3 bg-gray-50 rounded-xl mt-1 font-medium outline-none focus:ring-2 focus:ring-primary/20" 
                         value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                </div>
                
                {error && <p className="text-red-500 text-xs font-bold uppercase">{error}</p>}
                
                <button 
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Gerar Meu Ingresso'}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8 animate-in zoom-in-95">
              <div className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
                 <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Sucesso!</h2>
              <p className="text-gray-500 font-medium mt-4">Seu ingresso individual foi gerado e vinculado à mesa. Você já pode visualizá-lo em seus ingressos.</p>
              <button 
                onClick={() => navigate('/my-tickets')}
                className="w-full mt-10 bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
              >
                Ver Meus Ingressos
              </button>
            </div>
          )}

        </div>
        
        <p className="text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-8">
           Powered by Ticketera Security System
        </p>
      </div>
    </div>
  );
};

export default MesaRedeemPage;
