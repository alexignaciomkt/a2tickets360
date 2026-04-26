
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
  Download,
  Copy,
  Check,
  Rocket,
  QrCode,
  CheckCircle2,
  MessageCircle,
  Users,
  Lock,
  ChevronDown,
  ExternalLink,
  Globe,
  Ticket as TicketIcon
} from 'lucide-react';
import { eventService, Event } from '@/services/eventService';
import { organizerService } from '@/services/organizerService';
import { cmsService, SiteSection } from '@/services/cmsService';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SocialShareCard from '@/components/events/SocialShareCard';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staffBanner, setStaffBanner] = useState<SiteSection | null>(null);
  const [platformProBanner, setPlatformProBanner] = useState<SiteSection | null>(null);
  const [adsenseConfig, setAdsenseConfig] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [eventData, staff, platformPro, adsense] = await Promise.all([
          eventService.getEventById(id),
          cmsService.getSectionByKey('staff_section'),
          cmsService.getSectionByKey('platform_pro_banner'),
          cmsService.getGlobalConfig('adsense_settings')
        ]);
        setEvent(eventData);
        setStaffBanner(staff);
        setPlatformProBanner(platformPro);
        setAdsenseConfig(adsense);

        // Track View
        if (eventData?.id) {
          const visitorHash = localStorage.getItem('visitor_id') || Math.random().toString(36).substring(7);
          if (!localStorage.getItem('visitor_id')) localStorage.setItem('visitor_id', visitorHash);
          organizerService.trackView('event_page', eventData.id, visitorHash);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-40 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-500 font-medium">Carregando a melhor experiência...</p>
        </div>
      </MainLayout>
    );
  }

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#0f172a'
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `ticketera-share-${event.id}.png`;
      link.click();
      toast.success('Card baixado com sucesso! Agora é só postar.');
    } catch (error) {
      console.error('Erro ao gerar card:', error);
      toast.error('Erro ao gerar card de compartilhamento');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  if (!event) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-40 text-center">
          <Info className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Evento não encontrado</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Não encontramos o evento que você está procurando.</p>
          <Link to="/events" className="btn-primary py-4 px-10 inline-block text-white rounded-xl">Ver todos os eventos</Link>
        </div>
      </MainLayout>
    );
  }

  const now = new Date();
  const eventDateRaw = event.date.includes('T') 
    ? new Date(event.date) 
    : new Date(`${event.date}T${event.time || '00:00'}`);
  const durationHours = parseInt(event.duration || '4');
  const eventEndDate = new Date(eventDateRaw.getTime() + durationHours * 60 * 60 * 1000);
  const isEnded = now > eventEndDate;

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen">
        {/* SHARE MODAL */}
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="max-w-[400px] bg-white rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl">
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900">Viralize o Evento</DialogTitle>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gere um card premium para seus stories</p>
              </div>

              <div className="flex justify-center scale-[0.8] -my-10">
                <SocialShareCard event={event} cardRef={cardRef} />
              </div>

              <div className="grid grid-cols-1 gap-3 relative z-20 bg-white pt-4">
                <Button 
                  onClick={handleDownloadCard}
                  disabled={isCapturing}
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex gap-2 shadow-xl shadow-indigo-100"
                >
                  {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  Baixar Card para Stories
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCopyLink}
                  className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copiar Link do Evento
                </Button>
              </div>
            </div>
            <div className="bg-slate-900 p-6 flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Impulsionado por</span>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Ticketera Engine</span>
            </div>
          </DialogContent>
        </Dialog>
        {/* HERO SECTION - SYMPLA INSPIRED */}
        <div className="relative min-h-[600px] flex items-center overflow-hidden bg-slate-950">
          {/* High-Fidelity Banner Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[10s] ease-linear group-hover:scale-110"
            style={{ 
              backgroundImage: `url(${event.heroImageUrl || event.bannerUrl})`,
              filter: 'blur(20px) brightness(0.6)'
            }}
          ></div>
          
          {/* Glassmorphism Overlay with 60% Opacity Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/60 via-slate-950/50 to-slate-950/90 backdrop-blur-[2px]"></div>
          
          {/* Noise texture for premium feel */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          <div className="max-w-7xl mx-auto w-full px-6 py-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Event Info (Left) */}
              <div className="lg:col-span-5 text-white space-y-8">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge className="bg-indigo-600 text-white border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                      Evento Oficial
                    </Badge>
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                      Ingressos Limitados
                    </Badge>
                  </div>
                  <h1 className="text-xl md:text-3xl font-black tracking-tighter leading-tight uppercase">
                    {event.title}
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                      <Calendar className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data e Hora</p>
                      <p className="font-black text-lg uppercase tracking-tight">
                        {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                      </p>
                      <p className="text-sm font-bold text-indigo-300 uppercase">{event.time}h • {event.duration}h de duração</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                      <MapPin className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Localização</p>
                      <p className="font-black text-lg uppercase tracking-tight truncate max-w-[250px]">
                        {event.location.name}
                      </p>
                      <p className="text-sm font-bold text-indigo-300 uppercase">{event.location.city}, {event.location.state}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                   <Badge className="bg-emerald-500 text-white border-none rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                     <CreditCard className="w-4 h-4" /> Parcele em até 12x
                   </Badge>
                </div>
              </div>

              {/* Poster (Right) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                <div className="relative group w-full flex justify-center">
                  <div className="absolute -inset-10 bg-indigo-600/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <div className="relative aspect-video w-full max-w-[900px] rounded-3xl overflow-hidden shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-950/40 group-hover:border-white/20 transition-all duration-700 flex items-center justify-center">
                    <img 
                      src={event.heroImageUrl || event.bannerUrl} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" 
                      alt={event.title} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Share Icon Corner */}
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full text-white transition-all transform hover:scale-110 active:scale-95 shadow-2xl z-20"
            title="Compartilhar"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT SECTION */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Content (70%) */}
            <div className="lg:w-[68%] space-y-12">
              {/* Sobre o Evento (Image 2 Style) */}
              <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                  <div className="w-8 h-[2px] bg-indigo-600 rounded-full"></div>
                  Sobre o Evento
                </h2>
                <div className="prose prose-slate max-w-none">
                  <div className="max-h-[350px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-indigo-200 transition-colors">
                    <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6">
                      {event.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-50">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Evento</p>
                        <p className="font-black text-slate-900 uppercase text-sm tracking-tight">{new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                        <p className="font-black text-slate-900 uppercase text-sm tracking-tight">{event.location.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Gallery - só aparece se tiver fotos */}
              {event.gallery_urls && event.gallery_urls.length > 0 && (
                <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <div className="w-8 h-[2px] bg-slate-200 rounded-full"></div>
                    Fotos do Local
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {event.gallery_urls.map((url: string, i: number) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer">
                        <img
                          src={url}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQ & Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FAQ Column */}
                <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col h-full">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <div className="w-8 h-[2px] bg-slate-200 rounded-full"></div>
                    FAQ
                  </h2>
                  {event.faqs && event.faqs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-3 flex-grow">
                      {event.faqs.map((faq: { question: string; answer: string }, i: number) => (
                        <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-100 bg-slate-50/50 rounded-xl px-5 overflow-hidden">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <span className="font-black text-slate-700 uppercase text-[9px] tracking-widest text-left">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-500 font-medium pb-4 text-[10px] leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <Accordion type="single" collapsible className="w-full space-y-3 flex-grow">
                      <AccordionItem value="item-1" className="border border-slate-100 bg-slate-50/50 rounded-xl px-5 overflow-hidden">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="font-black text-slate-700 uppercase text-[9px] tracking-widest text-left">Cancelamento</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-500 font-medium pb-4 text-[10px] leading-relaxed">
                          Até 7 dias após a compra, com 48h de antecedência.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2" className="border border-slate-100 bg-slate-50/50 rounded-xl px-5 overflow-hidden">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="font-black text-slate-700 uppercase text-[9px] tracking-widest text-left">Ingresso Impresso</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-500 font-medium pb-4 text-[10px] leading-relaxed">
                          Não é necessário. O ingresso digital é aceito na entrada.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </section>

                {/* Map Column */}
                <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 h-full">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <div className="w-8 h-[2px] bg-slate-200 rounded-full"></div>
                    Localização
                  </h2>
                  <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative group">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${event.location.name || ''}, ${event.location.address || ''}, ${event.location.city}`)}&output=embed`}
                      allowFullScreen
                      className="relative z-0 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                      loading="lazy"
                    ></iframe>
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                       <Button
                        className="w-full bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white rounded-xl h-10 font-black uppercase tracking-widest text-[8px] shadow-lg border border-white"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location.address}, ${event.location.city}`)}`, '_blank')}
                      >
                        Abrir no GPS
                      </Button>
                    </div>
                  </div>
                </section>
              </div>

              {/* About Producer (Image 2 Style - Integrated) */}
              <section className="bg-slate-950 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                
                {/* Public Page Button (Top Right) */}
                <div className="absolute top-6 right-6 z-20">
                  <Button 
                    size="sm"
                    className="bg-white text-slate-950 hover:bg-slate-100 rounded-full h-8 px-4 font-black uppercase tracking-widest text-[8px] flex gap-2 shadow-lg"
                    onClick={() => navigate(`/p/${event.organizer?.slug}`)}
                  >
                    Nosso Site <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-900 shadow-2xl flex-shrink-0">
                    <img 
                      src={event.organizer?.logoUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop"} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={event.organizer?.name} 
                    />
                  </div>

                  <div className="space-y-3 flex-grow text-center md:text-left">
                    <div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Organizador Oficial</p>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                        {event.organizer?.name || 'Produtor Ticketera'}
                      </h3>
                    </div>
                    
                    <p className="text-slate-400 font-medium text-xs leading-relaxed max-w-xl line-clamp-2">
                      {event.organizer?.description || 'Produtor verificado e comprometido com a melhor experiência para o público.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Bottom Ad (Image 2 Style) */}
              <div className="w-full h-[150px] bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Publicidade Horizontal</p>
                 <p className="text-[8px] font-bold">800x200</p>
              </div>

              {/* Sidebar Content (32%) */}
            </div>

            <div className="lg:w-[32%] space-y-8">
              <div className="sticky top-24 space-y-8">
                {/* Upper Branding Banner (Image 2 Style) */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 shadow-xl shadow-indigo-200 group cursor-pointer hover:scale-[1.02] transition-all overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform duration-700"></div>
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Rocket className="w-4 h-4 text-white" />
                       </div>
                       <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Ticketera Pro</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">
                      A ÚNICA PLATAFORMA COM <br /> MKT 360 INTEGRADO
                    </h3>
                  </div>
                </div>

                {/* Ticket Selection Card (Image 2 Style) */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                  <div className="p-8 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tighter uppercase text-slate-900">Seleção de Ingressos</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escolha sua experiência</p>
                    </div>

                    <div className="space-y-4">
                      {event.tickets.map(ticket => (
                        <div key={ticket.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all cursor-pointer">
                          <div className="space-y-1">
                            <span className="font-black text-slate-900 text-sm tracking-tight uppercase">{ticket.name}</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                               {ticket.price === 0 ? 'Inscrição Gratuita' : `R$ ${ticket.price}`}
                            </p>
                            {ticket.description && (
                               <p className="text-[8px] text-slate-400 font-medium uppercase mt-1 leading-tight max-w-[150px]">
                                  {ticket.description}
                               </p>
                            )}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-indigo-100">
                            {ticket.id.includes('vip') ? 'VIP' : '01'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full bg-slate-600 text-white hover:bg-slate-700 h-14 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex gap-2 group transition-all"
                      onClick={() => navigate(`/checkout/${event.id}/${event.tickets[0]?.id || 'individual'}`)}
                    >
                      Comprar Ingressos
                    </Button>
                  </div>
                </div>

                {/* Platform Marketing 360 (Image 2 Style) */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 shadow-xl shadow-slate-900/20 group cursor-pointer hover:from-slate-950 transition-all overflow-hidden relative border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110"></div>
                  <div className="relative z-10 text-center space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">
                      PLATFORM <br /> MARKETING 360
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      ELEVATE YOUR EVENT PROMOTION
                    </p>
                  </div>
                </div>

                {/* Vertical Sidebar AdSense (Bottom - Image 2 Style) */}
                <div className="w-full h-[300px] bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-indigo-200 transition-all">
                  <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" className="w-16 opacity-20 mb-4 grayscale" alt="Google" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Publicidade</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST FOOTER (IMAGE 2 STYLE) */}
        <div className="bg-white border-t border-slate-100 py-16 mt-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
              {/* Payments */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Métodos de Pagamento</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 p-2">
                    <img src="https://img.icons8.com/color/48/visa.png" className="h-full object-contain" alt="Visa" />
                  </div>
                  <div className="h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 p-2">
                    <img src="https://img.icons8.com/color/48/mastercard.png" className="h-full object-contain" alt="Mastercard" />
                  </div>
                  <div className="h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 p-2">
                    <img src="https://img.icons8.com/color/48/amex.png" className="h-full object-contain" alt="Amex" />
                  </div>
                  <div className="h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 p-2">
                    <QrCode className="w-6 h-6 text-slate-400" />
                  </div>
                </div>
                <div className="inline-flex items-center bg-emerald-50 text-emerald-600 rounded-full px-4 py-1.5 border border-emerald-100 shadow-sm">
                   <span className="text-[8px] font-black uppercase tracking-widest">Até 12x no Cartão ou PIX</span>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Compre com Segurança</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                  Os dados sensíveis são criptografados e nunca são salvos em nossos servidores.
                </p>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 rounded-lg shadow-sm border border-emerald-100"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                      <span className="text-[9px] font-black uppercase text-slate-600">Google Safe</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 rounded-lg shadow-sm border border-indigo-100"><Lock className="w-5 h-5 text-indigo-500" /></div>
                      <span className="text-[9px] font-black uppercase text-slate-600">PCI DSS</span>
                   </div>
                </div>
              </div>

              {/* Help */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Precisando de Ajuda?</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                  Acesse nossa Central de Ajuda ou fale com nosso time de suporte.
                </p>
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-12 font-black uppercase tracking-widest text-xs flex gap-2 shadow-sm">
                  <MessageCircle className="w-4 h-4" /> Fale Conosco
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetailPage;
