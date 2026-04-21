
import React, { useState, useEffect } from 'react';
import { Shield, Save, Loader2, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EventSettings {
  max_tickets_per_cpf: number;
  require_individual_data: boolean;
  allow_mesa_token_resale: boolean;
}

const OrganizerRulesTab = ({ eventId, initialSettings }: { eventId: string, initialSettings?: any }) => {
  const [settings, setSettings] = useState<EventSettings>({
    max_tickets_per_cpf: initialSettings?.max_tickets_per_cpf || 5,
    require_individual_data: initialSettings?.require_individual_data ?? true,
    allow_mesa_token_resale: initialSettings?.allow_mesa_token_resale ?? false,
    group_logic: initialSettings?.group_logic || []
  });
  const [eventTickets, setEventTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data } = await supabase.from('tickets').select('*').eq('event_id', eventId);
      if (data) setEventTickets(data);
    };
    fetchTickets();
  }, [eventId]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('events')
      .update({ settings })
      .eq('id', eventId);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
        <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
           <div className="bg-amber-50 p-3 rounded-2xl">
              <Shield className="w-6 h-6 text-amber-600" />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Regras de Segurança e Limites</h3>
              <p className="text-sm text-gray-500 font-medium">Configure como seu público pode interagir com o evento.</p>
           </div>
        </div>

        <div className="space-y-6">
           {/* Limite por CPF */}
           <div className="flex items-start justify-between gap-8">
              <div className="space-y-1">
                 <p className="font-black text-gray-900 uppercase tracking-tighter text-sm">Limite de Ingressos por CPF</p>
                 <p className="text-xs text-gray-500 font-medium">Quantos ingressos uma única pessoa (CPF) pode comprar no total.</p>
              </div>
              <div className="w-24">
                 <input 
                   type="number"
                   className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl font-black text-center focus:ring-2 focus:ring-primary/20 outline-none"
                   value={settings.max_tickets_per_cpf}
                   onChange={e => setSettings({...settings, max_tickets_per_cpf: Number(e.target.value)})}
                 />
              </div>
           </div>

           <div className="h-px bg-gray-50" />

           {/* Dados Individuais */}
           <div className="flex items-start justify-between gap-8">
              <div className="space-y-1">
                 <p className="font-black text-gray-900 uppercase tracking-tighter text-sm">Exigir Dados Individuais</p>
                 <p className="text-xs text-gray-500 font-medium">Cada ingresso deve ter um CPF e Nome diferente (Mailing Gold).</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-pointer transition-colors"
                   onClick={() => setSettings({...settings, require_individual_data: !settings.require_individual_data})}
                   style={{ backgroundColor: settings.require_individual_data ? '#000' : '#E5E7EB' }}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.require_individual_data ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
           </div>

           <div className="h-px bg-gray-50" />

           {/* Lógica de Grupos (Mesa/Camarote) */}
           <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                 <p className="font-black text-gray-900 uppercase tracking-tighter text-sm">Mesas e Camarotes (Lógica de Grupo)</p>
                 <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Novo</span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Defina quantos "assentos" cada tipo de ingresso possui. Isso gerará tokens de resgate para os convidados.</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                 {eventTickets.length === 0 ? (
                    <p className="text-[10px] text-gray-400 font-bold uppercase text-center py-4">Nenhum ingresso pago encontrado para configurar.</p>
                 ) : eventTickets.filter(t => t.price > 0).map(t => (
                   <div key={t.id} className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex-1">
                         <p className="text-xs font-black text-gray-900 uppercase">{t.name}</p>
                         <p className="text-[10px] text-gray-400 font-bold">R$ {t.price.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <label className="text-[10px] text-gray-400 font-black uppercase">Capacidade:</label>
                         <input 
                           type="number" 
                           min="1"
                           className="w-16 bg-gray-50 border-0 rounded-lg px-2 py-2 text-center font-black text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                           value={settings.group_logic?.find((g: any) => g.ticket_id === t.id)?.capacity || 1}
                           onChange={(e) => {
                              const logic = [...(settings.group_logic || [])];
                              const idx = logic.findIndex((g: any) => g.ticket_id === t.id);
                              if (idx >= 0) logic[idx].capacity = Number(e.target.value);
                              else logic.push({ ticket_id: t.id, capacity: Number(e.target.value) });
                              setSettings({...settings, group_logic: logic});
                           }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 flex gap-3">
           <Info className="w-5 h-5 text-blue-600 shrink-0" />
           <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest leading-relaxed">
             Atenção: Alterar o limite por CPF não afeta compras já realizadas, apenas novas transações a partir de agora.
           </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-900/10'}`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? 'Regras Atualizadas!' : <><Save className="w-4 h-4" /> Salvar Configurações</>}
        </button>
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
         <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
         <div>
            <p className="text-xs font-black text-amber-900 uppercase tracking-tighter mb-1">Dica de Produtor</p>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
               Manter a opção "Exigir Dados Individuais" ativada garante que sua base de e-mails seja 100% qualificada, 
               pois impede que um único usuário compre 10 ingressos usando apenas o seu próprio e-mail.
            </p>
         </div>
      </div>
    </div>
  );
};

export default OrganizerRulesTab;
