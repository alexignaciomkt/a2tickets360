
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Music, 
  Heart, 
  Laptop, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Newspaper, 
  TrendingUp, 
  ShieldCheck, 
  Image as ImageIcon,
  Rocket,
  Plus,
  Minus,
  HelpCircle
} from 'lucide-react';
import { eventService, Event } from '@/services/eventService';
import { cmsService, SiteSection } from '@/services/cmsService';
import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';

import AdBanner from '@/components/ui/AdBanner';

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [rankedSections, setRankedSections] = useState<{ category: string, events: Event[] }[]>([]);
  const [cmsSections, setCmsSections] = useState<Record<string, SiteSection>>({});
  const [heroBanners, setHeroBanners] = useState<{ id: string; title: string; imageUrl: string; link: string; category?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Mock Blog Data
  const blogPosts = [
    {
      id: '1',
      title: 'Como organizar um evento de sucesso em 2024',
      excerpt: 'Descubra as principais tendências e tecnologias que estão moldando o futuro dos eventos no Brasil.',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
      date: '20 de Abr, 2024'
    },
    {
      id: '2',
      title: 'O impacto do check-in rápido na experiência do cliente',
      excerpt: 'Saiba como reduzir filas e aumentar a satisfação do seu público com tecnologias de validação instantânea.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      date: '18 de Abr, 2024'
    },
    {
      id: '3',
      title: 'Estratégias de marketing para esgotar ingressos',
      excerpt: 'Aprenda a usar dados e psicologia de vendas para garantir que seu evento seja um "Sold Out".',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      date: '15 de Abr, 2024'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [featured, ranked, sections, adminBanners, activeFaqs] = await Promise.all([
          eventService.getFeaturedEvents(),
          eventService.getRankedEventSections(),
          cmsService.getSections(),
          cmsService.getActiveHeroBanners().catch(() => []),
          cmsService.getActiveFAQs().catch(() => [])
        ]);
        
        setFeaturedEvents(featured);
        setRankedSections(ranked);
        setFaqs(activeFaqs || []);
        
        const sectionsMap = sections.reduce((acc, curr) => {
          acc[curr.section_key] = curr;
          return acc;
        }, {} as Record<string, SiteSection>);
        setCmsSections(sectionsMap);

        // Build hero banners with priority hierarchy:
        // P2: Featured events (approved by admin with is_featured=true)
        // P3: Admin-uploaded banners (fallback/filler)
        const eventSlides = featured.map(event => ({
          id: event.id,
          title: event.title,
          category: event.category?.split(' / ')[0],
          link: `/events/${event.id}`,
          imageUrl: event.bannerUrl || event.imageUrl || '',
        })).filter(s => s.imageUrl);

        const adminSlides = adminBanners.map(b => ({
          id: b.id,
          title: b.title,
          category: 'Destaque',
          link: b.link_url || '/events',
          imageUrl: b.image_url,
        }));

        // Combine: featured events first, then admin banners
        const combined = [...eventSlides, ...adminSlides].slice(0, 20);
        setHeroBanners(combined);

      } catch (error) {
        console.error('Erro ao carregar dados da Home:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  return (
    <MainLayout>
      <div className="pb-20 bg-white text-slate-900">
        
        {/* HERO SYMPLA-STYLE (Centered with Previews) */}
        <section className="relative pt-10 pb-16 bg-gray-50 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 relative">
            {heroBanners.length > 0 ? (
              <div className="relative group">
                <div className="flex items-center justify-center gap-4">
                  {/* Previous Preview */}
                  <div className="hidden lg:block w-1/6 opacity-30 scale-90 blur-[1px] transition-all duration-500 rounded-3xl overflow-hidden h-[400px]">
                    <img 
                      src={heroBanners[(currentSlide - 1 + heroBanners.length) % heroBanners.length].imageUrl} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Main Banner */}
                  <div className="w-full lg:w-4/6 relative group/banner">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[400px] md:h-[500px]"
                      >
                        <img
                          src={heroBanners[currentSlide]?.imageUrl}
                          alt={heroBanners[currentSlide]?.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500 flex items-end p-10">
                           <Link
                              to={heroBanners[currentSlide]?.link || '/events'}
                              className="bg-white text-indigo-600 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
                            >
                              GARANTIR MEU LUGAR
                            </Link>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <button 
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-600 hover:text-white transition-all z-20"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % heroBanners.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-600 hover:text-white transition-all z-20"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Next Preview */}
                  <div className="hidden lg:block w-1/6 opacity-30 scale-90 blur-[1px] transition-all duration-500 rounded-3xl overflow-hidden h-[400px]">
                    <img 
                      src={heroBanners[(currentSlide + 1) % heroBanners.length].imageUrl} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info Below Image */}
                <div className="mt-8 text-center space-y-2">
                  <Badge className="bg-indigo-100 text-indigo-600 border-none uppercase font-black text-[9px] tracking-widest px-4 py-1">
                    {heroBanners[currentSlide]?.category || 'Destaque'}
                  </Badge>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-900 leading-none">
                    {heroBanners[currentSlide]?.title}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-slate-500 font-medium text-sm italic">
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-indigo-600" /> Brasil</div>
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-indigo-600" /> Confira as Datas</div>
                  </div>
                </div>

                {/* Pagination Dots */}
                {heroBanners.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {heroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 transition-all duration-500 rounded-full ${currentSlide === idx ? 'w-8 bg-indigo-600' : 'w-1.5 bg-slate-300'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-black h-[500px] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-2xl px-4">
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-white">
                    A2 TICKETS
                  </h1>
                  <p className="text-sm md:text-base text-slate-300 font-medium italic opacity-80">
                    "A plataforma mais completa para eventos no Brasil."
                  </p>
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-3 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-500 shadow-2xl group"
                  >
                    EXPLORAR EVENTOS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CATEGORIES BAR (Sympla Style - Circles) */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center flex-wrap gap-8 md:gap-16">
            {[
              { label: 'Música', icon: Music, color: 'bg-blue-50 text-blue-600', id: 'Show / Concerto' },
              { label: 'Teatro', icon: Sparkles, color: 'bg-purple-50 text-purple-600', id: 'Teatro' },
              { label: 'Palestras', icon: Laptop, color: 'bg-indigo-50 text-indigo-600', id: 'Palestra / Workshop' },
              { label: 'Festas', icon: Heart, color: 'bg-rose-50 text-rose-600', id: 'Festa / Balada' },
              { label: 'Cursos', icon: Newspaper, color: 'bg-emerald-50 text-emerald-600', id: 'Curso' },
              { label: 'Gastronomia', icon: Zap, color: 'bg-orange-50 text-orange-600', id: 'Gastronomia' },
            ].map((cat, i) => (
              <Link
                key={i}
                to={`/events?category=${cat.id}`}
                className="flex flex-col items-center gap-3 group transition-all"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${cat.color} flex items-center justify-center border border-transparent group-hover:border-indigo-600 group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                  <cat.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-slate-500 group-hover:text-indigo-600 transition-colors">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ADS SPACE 1 */}
        {cmsSections['home_ad_1']?.is_active !== false && (
          <AdBanner 
            imageUrl={cmsSections['home_ad_1']?.bg_image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070"} 
            title={cmsSections['home_ad_1']?.title || "TECNOLOGIA A2 TICKETS"} 
            subtitle={cmsSections['home_ad_1']?.subtitle || "A gestão mais elegante do entretenimento nacional."} 
            badge={cmsSections['home_ad_1']?.config?.badgeText || "PREMIUM ADS"} 
            cta={cmsSections['home_ad_1']?.cta_text || "SAIBA MAIS"}
            config={cmsSections['home_ad_1']?.config}
          />
        )}

        {/* DYNAMIC CATEGORY SHELVES */}
        <div className="space-y-20 py-10">
          {rankedSections.map((section, idx) => (
            <React.Fragment key={section.category}>
              <section className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-indigo-600 rounded-full" /> {section.category}
                    </h2>
                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Os melhores eventos desta categoria</p>
                  </div>
                  <Link to={`/events?category=${section.category}`} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:opacity-70 transition flex items-center gap-2">
                    VER TODOS <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {section.events.slice(0, 4).map(event => (
                    <motion.div
                      key={event.id}
                      whileHover={{ y: -10 }}
                      className="p-[3px] rounded-[2.5rem] bg-gradient-to-br from-[#00BFFF] via-[#00FF00] via-[#FFFF00] to-[#FF8C00] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,191,255,0.2)] transition-all duration-500"
                    >
                      <div className="bg-white rounded-[2.3rem] overflow-hidden h-full group flex flex-col">
                        <Link to={`/events/${event.id}`} className="flex-1">
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={event.bannerUrl || event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 border border-white/20 shadow-sm">
                              {event.location?.city}
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            <h3 className="font-black text-[15px] line-clamp-1 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none">{event.title}</h3>
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                               <div className="flex items-center gap-2">
                                 <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {new Date(event.date).toLocaleDateString('pt-BR')}
                               </div>
                               <div className="flex items-center gap-2">
                                 <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px]">
                                   R$ {event.tickets?.[0]?.price.toFixed(2) || '0,00'}
                                 </div>
                               </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* ADS INTERCALADO (A cada 2 categorias) */}
              {idx === 0 && cmsSections['home_ad_2']?.is_active !== false && (
                <AdBanner 
                  imageUrl={cmsSections['home_ad_2']?.bg_image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"} 
                  title={cmsSections['home_ad_2']?.title || "MONETIZE SEU EVENTO"} 
                  subtitle={cmsSections['home_ad_2']?.subtitle || "As melhores taxas e antecipação em D+1."} 
                  badge={cmsSections['home_ad_2']?.config?.badgeText || "ORGANIZADOR ADS"} 
                  cta={cmsSections['home_ad_2']?.cta_text || "VER PLANOS"}
                  config={cmsSections['home_ad_2']?.config}
                />
              )}
              {idx === 1 && cmsSections['home_ad_3']?.is_active !== false && (
                <AdBanner 
                  imageUrl={cmsSections['home_ad_3']?.bg_image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"} 
                  title={cmsSections['home_ad_3']?.title || "CHECK-IN 2FA VISUAL"} 
                  subtitle={cmsSections['home_ad_3']?.subtitle || "Segurança máxima para o seu público."} 
                  badge={cmsSections['home_ad_3']?.config?.badgeText || "TECNOLOGIA"} 
                  cta={cmsSections['home_ad_3']?.cta_text || "CONHECER"}
                  config={cmsSections['home_ad_3']?.config}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STAFF SECTION (Refined Sympla Style) */}
        {cmsSections['staff_section']?.is_active !== false && cmsSections['staff_section'] && (
          <section className="max-w-7xl mx-auto px-4 py-20">
            <div className="relative rounded-[3rem] overflow-hidden group h-[300px] md:h-[350px] shadow-2xl border border-gray-100 bg-white">
              <div className="absolute inset-0 flex flex-col md:flex-row">
                 <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center space-y-4 z-10">
                    <Badge 
                      className="w-fit border-none uppercase font-black text-[9px] tracking-widest px-4 py-1"
                      style={{ 
                        backgroundColor: cmsSections['staff_section']?.config?.badgeColor || '#fbbf24', 
                        color: cmsSections['staff_section']?.config?.badgeTextColor || '#000000' 
                      }}
                    >
                      <Star className="w-3 h-3 mr-2 fill-current" /> {cmsSections['staff_section']?.config?.badgeText || "OPORTUNIDADE"}
                    </Badge>
                    <h2 
                      className={`font-black tracking-tighter uppercase leading-tight ${cmsSections['staff_section']?.config?.titleSize || 'text-3xl md:text-4xl'}`}
                      style={{ color: cmsSections['staff_section']?.config?.titleColor || '#0f172a' }}
                    >
                      {cmsSections['staff_section'].title}
                    </h2>
                    <p 
                      className={`font-medium leading-relaxed max-w-md ${cmsSections['staff_section']?.config?.subtitleSize || 'text-sm'}`}
                      style={{ color: cmsSections['staff_section']?.config?.subtitleColor || '#64748b' }}
                    >
                      {cmsSections['staff_section'].subtitle}
                    </p>
                    <Link 
                      to={cmsSections['staff_section'].cta_link} 
                      className="w-fit inline-flex items-center gap-2 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 hover:opacity-90"
                      style={{ 
                        backgroundColor: cmsSections['staff_section']?.config?.ctaColor || '#4f46e5', 
                        color: cmsSections['staff_section']?.config?.ctaTextColor || '#ffffff' 
                      }}
                    >
                      {cmsSections['staff_section'].cta_text} <ArrowRight className="w-4 h-4" />
                    </Link>
                 </div>
                 <div className="hidden md:block w-1/2 relative overflow-hidden">
                    <img
                      src={cmsSections['staff_section'].bg_image}
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                      alt="Staff"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
                 </div>
              </div>
            </div>
          </section>
        )}

        {/* ADS SPACE FINAL */}
        {cmsSections['home_ad_4']?.is_active !== false && (
          <AdBanner 
            imageUrl={cmsSections['home_ad_4']?.bg_image || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200"} 
            title={cmsSections['home_ad_4']?.title || "BAIXE O APP TICKETERA"} 
            subtitle={cmsSections['home_ad_4']?.subtitle || "Seus ingressos sempre à mão, offline ou online."} 
            badge={cmsSections['home_ad_4']?.config?.badgeText || "MOBILE"} 
            cta={cmsSections['home_ad_4']?.cta_text || "BAIXAR AGORA"}
            config={cmsSections['home_ad_4']?.config}
          />
        )}

        {/* BLOG SECTION */}
        <section className="bg-gray-50/50 py-24 mt-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
                  <Newspaper className="text-indigo-600" /> Nosso Blog
                </h2>
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">Noticias e Fofocas do Mundo dos eventos No brasil e No mundo</p>
              </div>
              <Link to="/blog" className="text-[9px] font-black uppercase tracking-widest text-indigo-600">VER BLOG</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative h-48 rounded-3xl overflow-hidden mb-4 border border-gray-100">
                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 mb-1 block">{post.date}</span>
                  <h3 className="text-lg font-black tracking-tighter uppercase leading-tight group-hover:text-indigo-600 transition-colors mb-2">{post.title}</h3>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed line-clamp-2">{post.excerpt}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ORGANIZER CTA (Refined Sympla Style - Blue Gradient) */}
        {cmsSections['organizer_cta'] && (
          <section className="max-w-7xl mx-auto px-4 py-20">
            <div className="bg-gradient-to-br from-[#0052cc] via-[#0066ff] to-[#6610f2] rounded-[3rem] p-10 md:p-20 relative overflow-hidden group shadow-2xl shadow-indigo-200">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 -skew-x-12 translate-x-1/4" />
              <div className="absolute bottom-0 right-10 hidden lg:block translate-y-1/4">
                 <div className="w-96 h-64 bg-white/10 rounded-3xl border border-white/20 p-4 transform -rotate-6 group-hover:rotate-0 transition-transform duration-700">
                    <div className="w-full h-4 bg-white/20 rounded-full mb-4" />
                    <div className="w-2/3 h-4 bg-white/20 rounded-full mb-8" />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-20 bg-white/20 rounded-xl" />
                       <div className="h-20 bg-white/20 rounded-xl" />
                    </div>
                 </div>
              </div>
              
              <div className="relative z-10 space-y-6 max-w-2xl text-white">
                <Badge className="bg-white/20 text-white border-none uppercase font-black text-[9px] tracking-widest px-4 py-1">
                  <Rocket className="w-3 h-3 mr-2" /> PARA PRODUTORES
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
                  {cmsSections['organizer_cta'].title}
                </h2>
                <p className="text-sm opacity-90 font-medium leading-relaxed max-w-lg">
                  {cmsSections['organizer_cta'].subtitle}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link to={cmsSections['organizer_cta'].cta_link} className="inline-flex items-center gap-2 bg-[#00ff88] text-slate-900 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                    {cmsSections['organizer_cta'].cta_text} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/about-producers" className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all">
                    VEJA COMO FUNCIONA
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQ SECTION (Accordion) */}
        {faqs.length > 0 && (
          <section className="bg-white py-24 border-t border-gray-100">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-16 space-y-4">
                <HelpCircle className="w-12 h-12 text-indigo-600 mx-auto" />
                <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900">
                  Tire suas dúvidas aqui
                </h2>
                <p className="text-slate-500 font-medium italic">Encontre respostas rápidas para as perguntas mais comuns.</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div 
                    key={faq.id}
                    className={`border rounded-3xl transition-all duration-300 overflow-hidden ${openFaq === faq.id ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                    >
                      <span className={`text-lg font-bold tracking-tight uppercase transition-colors ${openFaq === faq.id ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {faq.question}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openFaq === faq.id ? 'bg-indigo-600 text-white rotate-180' : 'bg-white text-slate-400 group-hover:text-indigo-600 shadow-sm'}`}>
                         {openFaq === faq.id ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-6 md:px-8 pb-8 text-slate-600 font-medium leading-relaxed border-t border-gray-50 pt-4">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </MainLayout>
  );
};

export default Index;
