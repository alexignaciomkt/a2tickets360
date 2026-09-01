import React, { useState, useEffect } from 'react';
import { Search, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

const PromoterEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [promoterInfo, setPromoterInfo] = useState<any>(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  
  const [selectedEventToApply, setSelectedEventToApply] = useState<any>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (user?.id) fetchVitrineData(true);
  }, [user]);

  const fetchVitrineData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    // 1. Fetch promoter profile
    const { data: pData } = await supabase
      .from('promoters')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    
    if (pData) {
      setPromoterInfo(pData);
      
      // 2. Fetch existing affiliations from the backend
      const { data: affData } = await supabase
        .from('event_promoters')
        .select('event_id')
        .eq('promoter_id', pData.id);
        
      const affEventIds = affData?.map(a => a.event_id) || [];
      
      // 3. Fetch available events from the promoter's city
      let query = supabase
        .from('events')
        .select('*, tickets(name, price, promoter_eligible)')
        .eq('status', 'published')
        .eq('accepts_promoters', true);
        
      // Temporarily removing region filter so you can see all events:
      // if (pData.profile_data?.region) {
      //   query = query.ilike('city', `%${pData.profile_data.region}%`);
      // }
        
      if (affEventIds.length > 0) {
         query = query.not('id', 'in', `(${affEventIds.join(',')})`);
      }
        
      const { data: evData, error: evError } = await query;
      if (evError) {
         console.error("Error fetching available events:", evError);
      }
      if (evData) {
         const eligibleEvents = evData.filter(ev => ev.tickets && ev.tickets.some((t: any) => t.promoter_eligible !== false));
         setAvailableEvents(eligibleEvents);
      }
    }
    if (isInitial) setLoading(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoterInfo || !selectedEventToApply) return;
    setApplying(true);
    
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/promoter/events/${selectedEventToApply.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}) // Backend resolve promoterId pela sessão
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao processar solicitação');
      }

      toast({
        title: "Solicitação Enviada!",
        description: "O produtor analisará seu perfil. Acompanhe em Minhas Afiliações.",
      });
      
      setSelectedEventToApply(null);
      fetchVitrineData(); // Refresh list to remove the applied event
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ops...",
        description: err.message || "Não foi possível enviar a solicitação.",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <DashboardLayout userType="promoter">
      {loading ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="font-black uppercase tracking-widest text-zinc-400">Carregando Vitrine...</p>
        </div>
      ) : (
        <>
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
              <Search className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
               <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Eventos para Trabalhar</h1>
               <p className="text-zinc-400 text-sm">Encontre eventos interessantes ("Vitrine"), dê match e comece a vender.</p>
            </div>
         </div>

         {availableEvents.length === 0 ? (
           <div key="empty" className="text-center py-20 text-zinc-500 bg-white/5 rounded-3xl border border-white/10">
             Nenhum evento com programa de promoters ativo no momento.
           </div>
         ) : (
           <div key="grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableEvents.map(ev => (
                 <div 
                   key={ev.id} 
                   className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all cursor-pointer group"
                   onClick={() => setSelectedEventToApply(ev)}
                 >
                     <div className="h-40 bg-zinc-100 overflow-hidden relative">
                       <img 
                         src={ev.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} 
                         alt={ev.title} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                       />
                       <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                     </div>
                     <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-sm font-black uppercase tracking-tight mb-2 leading-tight text-gray-900 line-clamp-2" title={ev.title}>
                          {ev.title}
                        </h3>
                        <p className="text-[11px] font-bold text-gray-500 mt-auto uppercase flex items-center gap-1">
                          {ev.city}{ev.state ? ` - ${ev.state}` : ''}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                          {ev.start_date ? new Date(ev.start_date).toLocaleDateString('pt-BR') : 'Data a definir'}
                        </p>
                     </div>
                 </div>
              ))}
           </div>
         )}
      </div>

      {/* Application Modal (Dossiê do Evento) */}
      {selectedEventToApply && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedEventToApply(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-3xl border-0 shadow-2xl flex flex-col max-h-[90vh] [&>button:last-child]:hidden">
            {/* Header / Banner */}
            <div className="h-48 relative shrink-0">
               <img src={selectedEventToApply.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               
               <button 
                 onClick={() => setSelectedEventToApply(null)}
                 className="absolute top-4 right-4 w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
               >
                 <span className="sr-only">Fechar</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>

               <div className="absolute bottom-6 left-6 pr-6">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Vitrine de Eventos</span>
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">{selectedEventToApply.title}</h3>
               </div>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Local do Evento</p>
                    <p className="text-sm font-bold text-gray-800">
                      {selectedEventToApply.location_name || 'Local a definir'}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {selectedEventToApply.city}{selectedEventToApply.state ? ` - ${selectedEventToApply.state}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data e Hora</p>
                    <p className="text-sm font-bold text-gray-800">
                      {selectedEventToApply.start_date ? new Date(selectedEventToApply.start_date).toLocaleDateString('pt-BR') : 'Data a definir'}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {selectedEventToApply.start_time || selectedEventToApply.time || 'Horário a definir'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Regras de Monetização
                    </h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-indigo-900/60 uppercase">Sua Comissão:</span>
                      <span className="text-sm font-black text-indigo-700">{selectedEventToApply.promoter_commission_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-900/60 uppercase">Desconto (Cupom):</span>
                      <span className="text-sm font-black text-emerald-600">{selectedEventToApply.promoter_discount_rate}% OFF</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedEventToApply.description && (
                <div className="mb-8">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sobre o Evento</p>
                   <div className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-4">
                      {selectedEventToApply.description}
                   </div>
                </div>
              )}

              {selectedEventToApply.tickets && selectedEventToApply.tickets.filter((t: any) => t.promoter_eligible !== false).length > 0 && (
                <div className="mb-8">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Setores, Valores e Sua Comissão</p>
                   <div className="space-y-3">
                     {selectedEventToApply.tickets.filter((t: any) => t.promoter_eligible !== false).map((t: any, i: number) => {
                        const originalPrice = t.price || 0;
                        const discountRate = selectedEventToApply.promoter_discount_rate || 0;
                        const commissionRate = selectedEventToApply.promoter_commission_rate || 0;
                        
                        const finalPrice = originalPrice * (1 - discountRate / 100);
                        const commissionValue = finalPrice * (commissionRate / 100);

                        return (
                          <div key={i} className="flex flex-col bg-gray-50 border border-gray-100 p-4 rounded-xl gap-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-gray-800">{t.name}</span>
                              <div className="text-right">
                                {discountRate > 0 && (
                                  <span className="text-[11px] font-bold text-gray-400 line-through mr-2">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
                                  </span>
                                )}
                                <span className="text-sm font-black text-indigo-600">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice)}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-200 border-dashed">
                              <span className="text-[11px] font-black text-emerald-600/80 uppercase tracking-widest">
                                Você Ganha ({commissionRate}%):
                              </span>
                              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commissionValue)}
                              </span>
                            </div>
                          </div>
                        );
                     })}
                   </div>
                </div>
              )}

              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
                 <p className="text-xs font-medium text-orange-800 leading-relaxed">
                   <strong>Atenção:</strong> Ao solicitar afiliação, o produtor deste evento analisará seu perfil global. 
                   Sua comissão cai automaticamente na sua conta digital A2 (via Split de Pagamento) a cada venda aprovada pelo seu link.
                 </p>
              </div>
               </div>

            {/* Footer / Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
               <button 
                 type="button"
                 onClick={() => setSelectedEventToApply(null)}
                 className="flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-all border border-gray-200 bg-white"
               >
                 Cancelar
               </button>
               <button 
                 type="button"
                 onClick={handleApply}
                 disabled={applying}
                 className="flex-[2] w-full h-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2"
               >
                 {applying ? 'Solicitando...' : 'Solicitar Afiliação'}
               </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </>
      )}
    </DashboardLayout>
  );
};

export default PromoterEvents;
