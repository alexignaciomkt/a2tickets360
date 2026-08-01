import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Ticket, Sparkles, CheckCircle2, ChevronRight, ShoppingBag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const PromoterStore = () => {
  const { promoterSlug, eventId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [promoter, setPromoter] = useState<any>(null);
  const [affiliation, setAffiliation] = useState<any>(null);

  useEffect(() => {
    if (!promoterSlug || !eventId) return;

    const fetchStoreData = async () => {
      setLoading(true);
      try {
        // Fetch Promoter
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', promoterSlug) // Usando ID como slug por enquanto
          .single();
          
        if (profileData) {
          setPromoter(profileData);
          
          const { data: pData } = await supabase
            .from('promoters')
            .select('id')
            .eq('user_id', profileData.id)
            .single();

          if (pData) {
            const { data: affData } = await supabase
              .from('promoter_affiliations')
              .select('*')
              .eq('promoter_id', pData.id)
              .eq('event_id', eventId)
              .eq('status', 'approved')
              .single();
              
            if (affData) setAffiliation(affData);
          }
        }

        // Fetch Event
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (eventData) setEvent(eventData);

      } catch (error) {
        console.error('Error fetching store:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [promoterSlug, eventId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-500 font-medium font-black uppercase tracking-widest">Carregando experiência...</p>
        </div>
      </MainLayout>
    );
  }

  if (!event || !promoter) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">Evento Indisponível</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Este link pode ter expirado ou o evento não está mais disponível.</p>
          <Link to="/events" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
            Ver outros eventos
          </Link>
        </div>
      </MainLayout>
    );
  }

  const discountRate = affiliation ? (event.promoter_discount_rate || 0) : 0;
  const hasDiscount = discountRate > 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        
        {/* PROMOTER HEADER BAR */}
        <div className="bg-indigo-600 text-white py-4 px-6 flex items-center justify-center gap-3 shadow-lg relative z-20">
          <Sparkles className="w-5 h-5 text-indigo-300" />
          <p className="font-medium text-sm md:text-base">
            Você está comprando com a indicação de <strong className="font-black tracking-widest uppercase">{promoter.name}</strong>
          </p>
        </div>

        {/* EVENT BANNER */}
        <div className="w-full h-[40vh] md:h-[50vh] relative">
          <img 
            src={event.banner_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="inline-block px-4 py-1.5 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                {event.category || 'Evento'}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {event.start_date ? new Date(event.start_date).toLocaleDateString('pt-BR') : 'Data a definir'}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {event.city}, {event.state}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
             <section>
               <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                 <Ticket className="w-6 h-6 text-indigo-600" />
                 Sobre o Evento
               </h3>
               <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed">
                 {event.description}
               </div>
             </section>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-32">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag className="w-8 h-8 text-indigo-600" />
                </div>
                
                {hasDiscount && (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Desconto Aplicado!</h4>
                      <p className="text-xs text-emerald-700 mt-1">O link do {promoter.name} te garante <strong>{discountRate}% OFF</strong> em todos os ingressos.</p>
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Garantir Ingressos</h3>
                <p className="text-sm text-gray-500 mb-8">Selecione seus ingressos no próximo passo.</p>

                <Button 
                  onClick={() => navigate(`/events/${event.id}?ref=${affiliation?.coupon_code || ''}`)}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-600/20"
                >
                  Comprar Ingressos <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                
                <p className="text-[10px] text-center text-gray-400 font-medium mt-4 uppercase tracking-widest">
                  Ambiente Seguro • A2 Tickets 360
                </p>
             </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default PromoterStore;
