
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Share2,
  Heart,
  Clock,
  ChevronRight,
  Info,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Ticket as TicketIcon
} from 'lucide-react';
import { eventService, Event } from '@/services/eventService';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'tickets' | 'checkout' | 'success'>('details');
  const [quantity, setQuantity] = useState(1);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (error) {
        console.error('Erro ao buscar evento:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-40 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-500 font-medium">Carregando detalhes do evento...</p>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-40 text-center">
          <Info className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Evento não encontrado</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Não encontramos o evento que você está procurando. Ele pode ter sido removido ou o link está incorreto.</p>
          <Link to="/events" className="btn-primary py-4 px-10 inline-block">Ver todos os eventos</Link>
        </div>
      </MainLayout>
    );
  }

  const ticketPrice = event.tickets?.[0]?.price || 0;
  const serviceFee = Math.round(ticketPrice * 0.08); // 8% fee
  const total = (ticketPrice * quantity) + (serviceFee * quantity);

  if (step === 'success') {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-20 px-4 text-center min-h-[70vh] flex flex-col justify-center">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
              <CheckCircle2 className="w-14 h-14" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">PARABÉNS! INGRESSO GARANTIDO.</h1>
          <p className="text-xl text-gray-600 mb-10 font-medium">
            Enviamos os detalhes para o seu e-mail. Prepare-se para uma experiência inesquecível no <span className="text-indigo-600 font-bold">{event.title}</span>!
          </p>
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-dashed border-gray-100 inline-block mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-600 text-white flex items-center justify-center translate-x-1/2 -translate-y-1/2 rotate-45 font-bold pt-6 pr-6">A2</div>
            <QrCode className="w-56 h-56 mx-auto text-gray-900" />
            <div className="mt-6 font-mono font-black text-2xl tracking-tighter text-indigo-600">#{event.id?.toUpperCase()}-{Math.floor(Math.random() * 9999)}</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/dashboard')} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-xl active:scale-95">
              Ver meus ingressos
            </button>
            <Link to="/" className="bg-gray-100 text-gray-700 px-10 py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition">
              Voltar para home
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 pb-20">
        {/* Banner Area */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={event.heroImageUrl || event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover brightness-[0.6]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
          <div className="absolute bottom-8 left-0 w-full px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-white">
                <div className="flex gap-2 mb-4">
                  <span className="bg-indigo-600 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-lg">Evento Oficial</span>
                  <span className="bg-white/20 backdrop-blur text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-lg">Lote 01 Disponível</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight leading-none uppercase">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-indigo-100 font-bold uppercase text-xs tracking-widest">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur"><Calendar className="w-5 h-5" /></div>
                    <span>{new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur"><MapPin className="w-5 h-5" /></div>
                    <span>{event.location.name} • {event.location.city}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="bg-white/10 backdrop-blur-xl p-3 rounded-xl text-white hover:bg-white/20 transition border border-white/20">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="bg-white/10 backdrop-blur-xl p-3 rounded-xl text-white hover:bg-white/20 transition border border-white/20">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
              <h2 className="text-xl font-black text-gray-950 mb-6 tracking-tighter uppercase relative z-10 border-l-4 border-indigo-600 pl-4">A Experiência</h2>
              <div className="prose prose-lg prose-indigo max-w-none text-gray-600 leading-relaxed font-medium relative z-10">
                <p className="text-lg mb-6 font-black text-indigo-900/60 leading-tight italic">
                  "{event.description}"
                </p>
                <p className="mb-8 text-base">
                  Prepare-se para viver momentos épicos. Nossa infraestrutura conta com segurança treinada,
                  estações de hidratação gratuitas e um sistema de som imersivo de altíssima fidelidade.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-100">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2 text-base uppercase tracking-tighter">
                      <Clock className="w-5 h-5 text-indigo-600" /> Cronograma
                    </h4>
                    <ul className="space-y-2 font-bold text-gray-500 uppercase text-[10px] tracking-widest">
                      <li className="flex justify-between border-b border-gray-100 pb-1.5"><span>Abertura</span> <span className="text-indigo-600">{event.startTime}h</span></li>
                      <li className="flex justify-between border-b border-gray-100 pb-1.5"><span>Principal</span> <span className="text-indigo-600">20:30h</span></li>
                      <li className="flex justify-between"><span>Fim</span> <span className="text-indigo-600">{event.endTime}h</span></li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2 text-base uppercase tracking-tighter">
                      <Info className="w-5 h-5 text-indigo-600" /> Importante
                    </h4>
                    <ul className="space-y-2 font-bold text-gray-500 uppercase text-[10px] tracking-widest">
                      <li className="flex items-center gap-2">✅ Classificação 18+</li>
                      <li className="flex items-center gap-2">✅ Acessibilidade PCD</li>
                      <li className="flex items-center gap-2">✅ Estacionamento no Local</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Organização</h2>
              <Link to={`/producer-fan/bombaproducoes`} className="flex items-center justify-between group p-4 rounded-2xl hover:bg-indigo-50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop" className="w-16 h-20 rounded-xl object-cover border-2 border-white shadow-lg group-hover:border-indigo-200 transition-all" alt="Producer" />
                  <div>
                    <h3 className="font-black text-xl group-hover:text-indigo-600 transition tracking-tighter uppercase">{event.organizer?.name || 'Organizador'}</h3>
                    <p className="text-indigo-600 font-black uppercase tracking-widest text-[10px]">Produtor Verificado A2</p>
                    <div className="flex gap-4 mt-3">
                      <div className="text-center">
                        <p className="font-black text-indigo-600 text-base leading-none">42</p>
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Eventos</p>
                      </div>
                      <div className="text-center border-l border-gray-200 pl-4">
                        <p className="font-black text-indigo-600 text-base leading-none">2.5k</p>
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Membros</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 sticky top-24 overflow-hidden">
              <div className="p-6 md:p-8 space-y-6">
                {step === 'details' && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black tracking-tighter uppercase">Ingressos</h3>
                      <span className="text-orange-600 font-black text-[10px] uppercase bg-orange-50 px-3 py-1 rounded-full animate-pulse tracking-widest">Lote 01</span>
                    </div>

                    <div className="space-y-3">
                      {event.tickets.map(ticket => (
                        <div key={ticket.id} className="border-2 border-indigo-600 bg-indigo-50/20 rounded-2xl p-4 relative">
                          <div className="absolute -top-2.5 left-4 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Mais Vendido</div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="font-black text-gray-950 text-base tracking-tighter uppercase">{ticket.name}</span>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Acesso à área exclusiva</p>
                            </div>
                            <span className="text-xl font-black text-indigo-600 font-mono">R$ {ticket.price}</span>
                          </div>

                          <div className="flex items-center justify-between bg-white rounded-xl p-2 px-3 shadow-inner mt-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qtd</span>
                            <div className="flex items-center gap-4">
                              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-lg hover:bg-gray-200 transition">-</button>
                              <span className="font-black text-xl w-6 text-center">{quantity}</span>
                              <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-lg hover:bg-gray-200 transition">+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setStep('checkout')}
                      className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transform active:scale-95"
                    >
                      Ir para Checkout <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {step === 'checkout' && (
                  <div className="space-y-8 animate-fade-in">
                    <button onClick={() => setStep('details')} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest group">
                      <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition" />
                      <span>Voltar para Ingressos</span>
                    </button>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Pagamento</h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Meio de Pagamento</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button className="border-4 border-indigo-600 bg-indigo-50 p-6 rounded-2xl flex flex-col items-center gap-3 shadow-lg">
                            <CreditCard className="w-8 h-8 text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase">Cartão</span>
                          </button>
                          <button className="border-4 border-gray-50 bg-gray-50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:border-indigo-200 transition group">
                            <QrCode className="w-8 h-8 text-gray-400 group-hover:text-indigo-400" />
                            <span className="text-[10px] font-black text-gray-600 uppercase">PIX</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <input type="text" placeholder="Nome Impresso no Cartão" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 outline-none font-black uppercase text-[10px] tracking-tight transition-all" />
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 outline-none font-black text-xs transition-all" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="MM/AA" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 outline-none font-black text-xs text-center" />
                          <input type="text" placeholder="CVV" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 outline-none font-black text-xs text-center" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 text-white p-6 rounded-[2rem] space-y-3 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 blur-3xl rounded-full"></div>
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-white">R$ {ticketPrice * quantity},00</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Taxa (8%)</span>
                        <span className="text-white">R$ {serviceFee * quantity},00</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-4 mt-2">
                        <span className="font-black text-indigo-400 uppercase tracking-widest text-base">Total</span>
                        <span className="text-3xl font-black tracking-tighter">R$ {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button onClick={() => setStep('success')} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 transform active:scale-95">
                      Pagar Agora
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-indigo-50 px-8 py-5 flex items-center gap-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-tight">
                <ShieldCheck className="w-8 h-8 flex-shrink-0" />
                <span>Processamento criptografado via Certificado SSL A2 e Gateways Seguros (Asaas).</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetailPage;
