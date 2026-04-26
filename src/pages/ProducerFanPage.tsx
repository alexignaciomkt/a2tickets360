
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  ShoppingBag,
  Info,
  Calendar,
  Ticket as TicketIcon,
  Instagram,
  Facebook,
  ChevronRight,
  ArrowRight,
  Clock,
  LayoutGrid,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { organizerService } from '@/services/organizerService';
import { Skeleton } from '@/components/ui/skeleton';

const ProducerFanPage = () => {
  const { slug } = useParams();
  const { toast } = useToast();

  const [producerData, setProducerData] = useState<any>(null);
  const [producerEvents, setProducerEvents] = useState<any[]>([]);
  const [producerProducts, setProducerProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Visitor tracking
  useEffect(() => {
    const visitorHash = localStorage.getItem('visitor_id') || Math.random().toString(36).substring(7);
    if (!localStorage.getItem('visitor_id')) localStorage.setItem('visitor_id', visitorHash);

    if (producerData?.user_id) {
      organizerService.trackView('producer_page', producerData.user_id, visitorHash);
    }
  }, [producerData?.user_id]);

  useEffect(() => {
    if (slug) {
      loadProducer();
    }
  }, [slug]);

  const loadProducer = async () => {
    try {
      setLoading(true);
      const data = await organizerService.getProducerBySlug(slug!);
      setProducerData(data);

      if (data?.user_id) {
        const [eventsData, productsData] = await Promise.all([
          organizerService.getEvents(data.user_id),
          organizerService.getProducts(data.user_id)
        ]);
        setProducerEvents(eventsData);
        setProducerProducts(productsData.filter((p: any) => p.status === 'active'));
      }
    } catch (err) {
      console.error('Erro ao carregar produtor:', err);
    } finally {
      setLoading(false);
    }
  };

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Automatic Carrousel for Testimonials
  useEffect(() => {
    const testimonials = producerData?.settings?.testimonials || [];
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setActiveTestimonial(prev => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [producerData?.settings?.testimonials]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="max-w-6xl mx-auto px-4 -mt-20">
           <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-40 w-40 rounded-3xl border-8 border-[#F8F9FA]" />
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-40" />
           </div>
        </div>
      </div>
    );
  }

  if (!producerData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 text-center space-y-6 shadow-2xl border-none rounded-[2rem]">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Vitrine não encontrada</h2>
            <p className="text-gray-500 font-medium mt-2">Esta URL não pertence a uma produtora ativa na Ticketera.</p>
          </div>
          <Button variant="default" className="w-full font-black uppercase tracking-widest h-12 rounded-2xl" asChild>
            <Link to="/">Explorar Eventos</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const primaryColor = producerData.settings?.primaryColor || '#7C3AED';
  const buttonStyle = producerData.settings?.buttonStyle || 'rounded-2xl';

  const upcomingEvents = producerEvents.filter((e: any) => 
    (e.status === 'published' || e.status === 'active')
  ).sort((a, b) => new Date(a.start_date || a.date).getTime() - new Date(b.start_date || b.date).getTime());

  const pastEvents = producerEvents.filter((e: any) => 
    new Date(e.start_date || e.date) < new Date()
  ).sort((a, b) => new Date(b.start_date || b.date).getTime() - new Date(a.start_date || a.date).getTime());

  const featuredEvent = upcomingEvents[0];
  
  // Testimonials and Gallery from settings or fallback
  const testimonials = producerData.settings?.testimonials || [
    { text: "Simplesmente a melhor experiência que já tive em eventos. Organização impecável!", name: "Carolina Silva", role: "Frequentadora Assídua" },
    { text: "Os eventos da " + producerData.company_name + " são sinônimo de qualidade e diversão garantida.", name: "Marcos Oliveira", role: "Fã da Marca" },
    { text: "Atendimento excelente e ingressos super fáceis de comprar. Recomendo muito!", name: "Beatriz Santos", role: "Cliente VIP" },
  ];

  const galleryImages = producerData.settings?.gallery || [];
  
  // Visibility overrides
  const showPage = producerData.settings?.showPage !== false;
  const showEvents = producerData.settings?.showEvents !== false;
  const showStore = producerData.settings?.showStore !== false;

  if (!showPage) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 text-center space-y-6 shadow-2xl border-none rounded-[2rem]">
          <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Vitrine Temporariamente Indisponível</h2>
            <p className="text-gray-500 font-medium mt-2">O produtor optou por manter esta vitrine privada no momento.</p>
          </div>
          <Button variant="default" className="w-full font-black uppercase tracking-widest h-12 rounded-2xl" asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans pt-16">
      {/* ─── NAVBAR FIXA ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${buttonStyle} overflow-hidden shadow-sm`}>
            <img src={producerData.logo_url} className="w-full h-full object-cover" />
          </div>
          <span className="font-black uppercase tracking-widest text-[10px] text-gray-900">{producerData.company_name}</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'Eventos', id: 'agenda', show: showEvents },
            { label: 'Sobre', id: 'sobre' },
            { label: 'Loja', id: 'loja', show: showStore && producerProducts.length > 0 },
            { label: 'Memórias', id: 'memorias' },
            { label: 'Depoimentos', id: 'depoimentos' },
          ].filter(item => item.show !== false).map(item => (
            <button 
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`hidden md:flex font-black uppercase text-[10px] tracking-widest ${buttonStyle}`}
          >
            Trabalhe Conosco
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`font-black uppercase text-[10px] tracking-widest ${buttonStyle}`}
            onClick={() => scrollToSection('contato')}
          >
            Contato
          </Button>
        </div>
      </nav>

      {/* ─── HERO & BRANDING ─── */}
      <div id="home" className="max-w-[1400px] mx-auto relative overflow-hidden md:rounded-b-[4rem] shadow-2xl bg-black">
        <img 
          src={producerData.banner_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
          className="w-full h-auto block" 
          alt="Cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 mt-12 md:mt-16">
        {/* ─── CONTEÚDO ON-PAGE ─── */}
        <div className="space-y-32 pb-20 pt-12">
          
          {/* SEÇÃO 1: HERO / PRÓXIMO EVENTO */}
          {showEvents && featuredEvent && (
            <div className="relative group cursor-pointer" onClick={() => window.location.href = `/events/${featuredEvent.id}`}>
              <div className={`overflow-hidden ${buttonStyle} shadow-2xl bg-white border border-gray-100 flex flex-col md:flex-row h-full md:h-[450px]`}>
                <div className="md:w-3/5 relative h-72 md:h-full overflow-hidden">
                  <img src={featuredEvent.banner_url || featuredEvent.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Feature" />
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/90 text-gray-900 font-black px-4 py-2 rounded-xl backdrop-blur border-none shadow-xl uppercase tracking-widest">Em Destaque Agora</Badge>
                  </div>
                </div>
                <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                   <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-[1.1] mb-4 group-hover:text-primary transition-colors" style={{ color: primaryColor }}>
                     {featuredEvent.title}
                   </h2>
                   <div className="space-y-3 mb-8">
                      <p className="flex items-center gap-3 text-gray-500 font-bold uppercase text-xs tracking-widest">
                        <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
                        {new Date(featuredEvent.start_date || featuredEvent.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="flex items-center gap-3 text-gray-500 font-bold uppercase text-xs tracking-widest">
                        <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                        {featuredEvent.location_name || featuredEvent.locationName}
                      </p>
                   </div>
                   <Button 
                     className={`w-full h-14 font-black uppercase tracking-widest text-sm shadow-xl hover:-translate-y-1 transition-all ${buttonStyle}`}
                     style={{ backgroundColor: primaryColor }}
                   >
                     Garantir meu Ingresso <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 2: AGENDA DE EVENTOS */}
          {showEvents && (
            <section id="agenda" className="space-y-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <Badge variant="outline" className="px-4 py-1.5 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px]">Calendário Oficial</Badge>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">{producerData.settings?.titles?.agenda || 'Agenda Completa'}</h3>
            </div>
            
            {upcomingEvents.length === 0 && !featuredEvent ? (
               <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-black uppercase tracking-widest">Nenhum evento futuro agendado</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.filter(e => e.id !== featuredEvent?.id).map(event => (
                  <Link key={event.id} to={`/events/${event.id}`} className="group">
                    <Card className={`overflow-hidden border-none shadow-lg group-hover:shadow-2xl transition-all duration-500 ${buttonStyle}`}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={event.banner_url || event.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute bottom-4 left-4 right-4">
                           <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 mb-2">Vendas Abertas</Badge>
                           <h4 className="text-xl font-black text-white leading-tight">{event.title}</h4>
                        </div>
                      </div>
                      <CardContent className="p-6 bg-white">
                         <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{event.category || 'Premium'}</p>
                              <p className="text-sm font-bold text-gray-900">{new Date(event.start_date || event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {event.city || 'Brasil'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-primary/10 transition-colors" style={{ color: primaryColor }}>
                               <ArrowRight className="w-5 h-5" />
                            </div>
                         </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

          {/* SEÇÃO 3: SOBRE A MARCA */}
          <section id="sobre" className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-5 relative">
              <div className={`aspect-square ${buttonStyle} overflow-hidden shadow-2xl relative border-8 border-white`}>
                <img 
                  src={producerData.settings?.about_image || producerData.logo_url} 
                  className="w-full h-full object-cover" 
                  alt="Sobre"
                />
                <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
            <div className="md:col-span-7 space-y-8 text-left">
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-1.5 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px]">Nossa Identidade</Badge>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 leading-tight">{producerData.settings?.titles?.about || 'A história por trás da produtora'}</h3>
              </div>
              <div 
                className="text-gray-600 text-lg md:text-xl leading-relaxed font-medium prose prose-slate max-w-none prose-p:leading-relaxed prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ 
                  __html: producerData.bio || "Esta produtora ainda não definiu sua biografia oficial, mas sua paixão por criar momentos inesquecíveis é o que nos move todos os dias." 
                }}
              />
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-gray-900">{producerEvents.length}+</p>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Eventos Realizados</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-gray-900">100%</p>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Satisfação Garantida</p>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: LOJA (CONDICIONAL) */}
          {showStore && producerProducts.length > 0 && (
            <section id="loja" className="space-y-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1.5 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px]">Loja Oficial</Badge>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">Itens Exclusivos</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {producerProducts.map(product => (
                  <Link key={product.id} to={`/checkout/product/${product.id}`} className="group">
                    <div className={`bg-white p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 ${buttonStyle} overflow-hidden`}>
                       <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 relative">
                          <img src={product.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={product.name} />
                          <div className="absolute top-2 right-2">
                             <Button size="icon" className="w-8 h-8 rounded-full bg-white/90 text-gray-900 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <ShoppingBag className="w-4 h-4" />
                             </Button>
                          </div>
                       </div>
                       <div className="px-2 pb-2">
                          <h4 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1" style={{ color: primaryColor }}>{product.name}</h4>
                          <p className="text-lg font-black text-gray-900 mt-1">R$ {parseFloat(product.price).toFixed(2)}</p>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* SEÇÃO 5: GALERIA DE MEMÓRIAS */}
          <section id="memorias" className="space-y-16">
            <div className="flex flex-col items-center text-center space-y-4">
              <Badge variant="outline" className="px-4 py-1.5 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px]">Galeria de Memórias</Badge>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">{producerData.settings?.titles?.gallery || 'Momentos Inesquecíveis'}</h3>
            </div>

            {galleryImages.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {galleryImages.map((img: string, idx: number) => (
                    <div key={idx} className={`aspect-square ${buttonStyle} overflow-hidden shadow-lg border-4 border-white transition-transform hover:scale-105 duration-500`}>
                       <img src={img} className="w-full h-full object-cover" alt={`Memória ${idx + 1}`} />
                    </div>
                  ))}
               </div>
            ) : pastEvents.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                 <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                 <p className="text-gray-400 font-black uppercase tracking-widest">Nenhuma memória registrada ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {pastEvents.map(event => (
                   <div key={event.id} className="space-y-6 group">
                      <div className={`relative aspect-[16/10] overflow-hidden shadow-2xl ${buttonStyle} border-4 border-white`}>
                         <img src={event.banner_url || event.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Memory" />
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" className="font-black uppercase text-[10px] tracking-widest rounded-full px-6 py-2.5">Rever Detalhes</Button>
                         </div>
                      </div>
                      <div className="flex justify-between items-start px-2">
                         <div>
                            <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{event.title}</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{new Date(event.start_date || event.date).getFullYear()} • {event.location_name || event.locationName}</p>
                         </div>
                         <div className="flex -space-x-3">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#F8F9FA] bg-gray-100 overflow-hidden shadow-sm">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id}${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            )}
          </section>

          {/* SEÇÃO 6: PROVA SOCIAL / DEPOIMENTOS (CARROSSEL AUTOMÁTICO) */}
          <section id="depoimentos" className="bg-white rounded-[3rem] p-12 md:p-24 shadow-xl border border-gray-100 text-center space-y-12 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" style={{ backgroundColor: primaryColor }} />
             
             <div className="max-w-3xl mx-auto space-y-4">
                <Badge variant="outline" className="px-4 py-1.5 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px]">Prova Social</Badge>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">{producerData.settings?.titles?.testimonials || 'O que o público diz'}</h3>
             </div>

             <div className="relative max-w-4xl mx-auto min-h-[250px] flex flex-col justify-center">
                {testimonials.map((dep: any, i: number) => (
                  <div 
                    key={i} 
                    className={`transition-all duration-1000 absolute inset-0 flex flex-col items-center justify-center space-y-8 ${i === activeTestimonial ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                  >
                    <p className="text-gray-600 text-xl md:text-3xl font-medium italic leading-relaxed max-w-2xl mx-auto">
                       "{dep.text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 overflow-hidden">
                        <img src={dep.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}${dep.name}`} className="w-full h-full" alt={dep.name} />
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-black text-gray-900">{dep.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dep.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Dots for navigation */}
                {testimonials.length > 1 && (
                  <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-2">
                    {testimonials.map((_: any, i: number) => (
                      <button 
                        key={i}
                        onClick={() => setActiveTestimonial(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'w-8' : 'bg-gray-200'}`}
                        style={{ backgroundColor: i === activeTestimonial ? primaryColor : undefined }}
                      />
                    ))}
                  </div>
                 )}
              </div>
           </section>

           {/* FOOTER DO PRODUTOR */}
          <footer id="contato" className="pt-20 border-t border-gray-200">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="md:col-span-2 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${buttonStyle} overflow-hidden shadow-lg`}>
                        <img src={producerData.logo_url} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight text-gray-900">{producerData.company_name}</h4>
                   </div>
                   <p className="text-gray-500 font-medium max-w-sm">
                      Siga nossas redes e fique por dentro de todos os eventos exclusivos. Sua próxima grande memória começa aqui.
                   </p>
                   <div className="flex gap-4">
                      {producerData.instagram_url && (
                        <a href={producerData.instagram_url} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:text-pink-500 transition-colors">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {producerData.facebook_url && (
                        <a href={producerData.facebook_url} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:text-blue-600 transition-colors">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                   </div>
                </div>

                <div className="space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Links Rápidos</p>
                    <ul className="space-y-3">
                      {[
                        { id: 'agenda', show: showEvents },
                        { id: 'sobre', show: true },
                        { id: 'loja', show: showStore && producerProducts.length > 0 },
                        { id: 'memorias', show: true }
                      ].filter(i => i.show).map(item => (
                        <li key={item.id}>
                          <button 
                            onClick={() => scrollToSection(item.id)}
                            className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors capitalize"
                          >
                            {item.id}
                          </button>
                        </li>
                      ))}
                    </ul>
                </div>

                <div className="space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Suporte & Canal</p>
                   <div className={`p-6 rounded-[2rem] bg-gray-900 text-white space-y-4`}>
                      <p className="text-xs font-bold leading-relaxed opacity-80">Dúvidas sobre ingressos ou eventos?</p>
                      <Button 
                        className={`w-full h-10 text-[10px] font-black uppercase tracking-widest bg-white text-gray-900 hover:bg-gray-100 rounded-xl`}
                      >
                        Falar no WhatsApp
                      </Button>
                   </div>
                </div>
             </div>

             <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">
                   Powered by <span className="text-indigo-600">Ticketera</span> • © {new Date().getFullYear()} {producerData.company_name}
                </p>
                <div className="flex gap-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                   <Link to="/terms" className="hover:text-gray-900">Termos</Link>
                   <Link to="/privacy" className="hover:text-gray-900">Privacidade</Link>
                </div>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ProducerFanPage;
