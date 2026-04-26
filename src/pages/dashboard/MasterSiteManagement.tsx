import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Image as ImageIcon, Plus, Trash2, ExternalLink, Save, GripVertical,
  Layout, Star, Rocket, Edit, Check, X, Power, Search, ArrowRight,
  Zap, TrendingUp, ShieldCheck, Smartphone, Settings2, Sparkles
} from 'lucide-react';
import { cmsService, HeroBanner, SiteSection } from '@/services/cmsService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Reorder, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MasterSiteManagement = () => {
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [staffSection, setStaffSection] = useState<SiteSection | null>(null);
  const [organizerCta, setOrganizerCta] = useState<SiteSection | null>(null);
  const [platformProBanner, setPlatformProBanner] = useState<SiteSection | null>(null);
  const [homeAds, setHomeAds] = useState<Record<string, SiteSection | null>>({
    home_ad_1: null,
    home_ad_2: null,
    home_ad_3: null,
    home_ad_4: null
  });
  const [adsenseConfig, setAdsenseConfig] = useState<any>({
    sidebar_ad_client: '',
    sidebar_ad_slot: '',
    footer_ad_client: '',
    footer_ad_slot: '',
    is_enabled: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isEditingSection, setIsEditingSection] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [banners, staff, organizer, platformPro, adsense, ad1, ad2, ad3, ad4] = await Promise.all([
        cmsService.getHeroBanners(),
        cmsService.getSectionByKey('staff_section'),
        cmsService.getSectionByKey('organizer_cta'),
        cmsService.getSectionByKey('platform_pro_banner'),
        cmsService.getGlobalConfig('adsense_settings'),
        cmsService.getSectionByKey('home_ad_1'),
        cmsService.getSectionByKey('home_ad_2'),
        cmsService.getSectionByKey('home_ad_3'),
        cmsService.getSectionByKey('home_ad_4')
      ]);
      setHeroBanners(banners.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      
      const defaults = {
        staff: { title: 'Trabalhe Conosco', subtitle: 'Venha fazer parte do nosso time', cta_text: 'Saiba Mais', cta_link: '/staff', bg_image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800', is_active: false },
        organizer: { title: 'Produza seu Evento', subtitle: 'A melhor plataforma para produtores', cta_text: 'Criar Evento', cta_link: '/organizer', bg_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', is_active: false },
        platformPro: { title: 'A2 Tickets Pro', subtitle: 'Recursos avançados para seu negócio', cta_text: 'Conhecer', cta_link: '/pro', bg_image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', is_active: false },
        ad1: { title: 'Tecnologia A2 Tickets', subtitle: 'A gestão mais elegante do entretenimento', cta_text: 'Saiba Mais', cta_link: '/', bg_image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', is_active: false },
        ad2: { title: 'Monetize seu Evento', subtitle: 'As melhores taxas do mercado', cta_text: 'Ver Planos', cta_link: '/', bg_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', is_active: false },
        ad3: { title: 'Check-in 2FA Visual', subtitle: 'Segurança máxima para o seu público', cta_text: 'Conhecer', cta_link: '/', bg_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200', is_active: false },
        ad4: { title: 'Baixe o App', subtitle: 'Seus ingressos sempre à mão', cta_text: 'Baixar Agora', cta_link: '/', bg_image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800', is_active: false }
      };

      setStaffSection(staff || defaults.staff as any);
      setOrganizerCta(organizer || defaults.organizer as any);
      setPlatformProBanner(platformPro || defaults.platformPro as any);
      if (adsense) setAdsenseConfig(adsense);
      setHomeAds({
        home_ad_1: ad1 || defaults.ad1 as any,
        home_ad_2: ad2 || defaults.ad2 as any,
        home_ad_3: ad3 || defaults.ad3 as any,
        home_ad_4: ad4 || defaults.ad4 as any
      });
    } catch (error) {
      toast.error('Erro ao carregar banners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdsense = async () => {
    try {
      await cmsService.updateGlobalConfig('adsense_settings', adsenseConfig);
      toast.success('Configurações de AdSense salvas');
    } catch (error) {
      toast.error('Erro ao salvar AdSense');
    }
  };

  const handleSaveBanner = async () => {
    if (!editingBanner.title || !editingBanner.imageUrl) {
      toast.error('Preencha o título e a imagem');
      return;
    }

    try {
      if (editingBanner.id) {
        await cmsService.updateHeroBanner(editingBanner.id, {
          title: editingBanner.title,
          image_url: editingBanner.imageUrl,
          link_url: editingBanner.linkUrl,
          is_active: editingBanner.isActive
        });
        toast.success('Banner atualizado');
      } else {
        await cmsService.createHeroBanner({
          title: editingBanner.title,
          image_url: editingBanner.imageUrl,
          link_url: editingBanner.linkUrl,
          is_active: true,
          sort_order: heroBanners.length
        });
        toast.success('Banner criado');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteHeroBanner = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    try {
      await cmsService.deleteHeroBanner(id);
      toast.success('Banner excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir banner');
    }
  };

  const handleToggleBanner = async (banner: HeroBanner) => {
    try {
      await cmsService.updateHeroBanner(banner.id, { is_active: !banner.is_active });
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleReorder = async (newOrder: HeroBanner[]) => {
    setHeroBanners(newOrder);
    try {
      await cmsService.reorderHeroBanners(newOrder.map(b => b.id));
      toast.success('Ordem atualizada');
    } catch (error) {
      toast.error('Erro ao salvar ordem');
    }
  };

  const handleFileUpload = async (file: File, callback: (url: string) => void) => {
    setIsUploading(true);
    try {
      const url = await cmsService.uploadBannerImage(file);
      callback(url);
      toast.success('Upload realizado');
    } catch (error) {
      toast.error('Erro no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateSection = async (key: string, section: SiteSection | null) => {
    if (!section) return;
    try {
      await cmsService.updateSection(key, section);
      toast.success('Seção atualizada');
      setIsEditingSection(null);
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar seção');
    }
  };


  const openEditModal = (banner?: HeroBanner) => {
    setEditingBanner(banner ? {
      id: banner.id,
      title: banner.title,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url,
      isActive: banner.is_active
    } : {
      title: '',
      imageUrl: '',
      linkUrl: '/events',
      isActive: true
    });
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        {/* HEADER MINIMALISTA */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Painel Administrativo</p>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão do Site</h1>
            <p className="text-slate-500 font-medium text-xs mt-1 max-w-md">Controle os banners, seções de destaque e configurações visuais da página inicial da Ticketera.</p>
          </div>
        </header>

        <Tabs defaultValue="banners" className="w-full space-y-12">
          <div className="bg-slate-100 p-1 rounded-xl inline-flex w-full md:w-auto overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-1 w-full justify-start">
              <TabsTrigger value="banners" className="rounded-lg px-4 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
                <ImageIcon className="w-4 h-4 mr-2" /> Banners Principais
              </TabsTrigger>
              <TabsTrigger value="sections" className="rounded-lg px-4 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
                <Star className="w-4 h-4 mr-2" /> Seções da Index
              </TabsTrigger>
              <TabsTrigger value="ads" className="rounded-lg px-4 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
                <Zap className="w-4 h-4 mr-2" /> Banners Ads
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="banners" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-4xl space-y-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                    <Layout className="w-4 h-4" /> Carrossel Hero
                  </h2>
                  <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] px-3">{heroBanners.length}/20 Banners</Badge>
                </div>
                <Button 
                  onClick={() => openEditModal()}
                  className="bg-slate-950 hover:bg-indigo-600 text-white rounded-full h-10 px-6 font-black uppercase tracking-widest text-[9px] transition-all shadow-xl shadow-slate-200"
                >
                  <Plus className="w-4 h-4 mr-2" /> Novo Banner
                </Button>
              </div>

              <Reorder.Group axis="y" values={heroBanners} onReorder={handleReorder} className="space-y-3">
                <AnimatePresence>
                  {heroBanners.map((banner) => (
                    <Reorder.Item 
                      key={banner.id} 
                      value={banner}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group"
                    >
                      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-3 flex items-center gap-4 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-indigo-500 transition-all"></div>
                        <div className="p-2 text-slate-300 group-hover:text-indigo-400"><GripVertical className="w-5 h-5" /></div>
                        <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                          <img src={banner.image_url} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" alt="" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-tight truncate">{banner.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5">{banner.link_url}</p>
                        </div>
                        <div className="flex items-center gap-1 pr-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditModal(banner); }} className="w-9 h-9 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleToggleBanner(banner); }} className={`w-9 h-9 rounded-full ${banner.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-50'}`}><Power className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteHeroBanner(banner.id); }} className="w-9 h-9 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>

              {heroBanners.length === 0 && (
                <div className="py-20 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-[10px]">Nenhum banner cadastrado</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sections" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-4xl space-y-8">
              <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 mb-6">
                <Star className="w-4 h-4" /> Seções Institucionais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { section: staffSection, key: 'staff_section', label: 'Staff Section', icon: <Star className="w-4 h-4" /> },
                  { section: organizerCta, key: 'organizer_cta', label: 'Organizer CTA', icon: <Rocket className="w-4 h-4" /> },
                  { section: platformProBanner, key: 'platform_pro_banner', label: 'Platform Pro', icon: <Layout className="w-4 h-4" /> }
                ].map(({ section, key, label }) => (
                  <div key={key} className="bg-white border border-slate-100 rounded-[1.5rem] p-4 flex flex-col gap-4 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-amber-400 transition-all"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                        {section?.bg_image ? (
                          <img src={section.bg_image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200"><ImageIcon className="w-5 h-5" /></div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-indigo-600/50 leading-none">{label}</span>
                        <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-tight truncate mt-1 leading-none">{section?.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <Switch 
                        checked={section?.is_active || false} 
                        onCheckedChange={() => handleUpdateSection(key, { ...section, is_active: !section?.is_active } as SiteSection)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingSection(key)} className="text-xs font-bold text-slate-500 hover:text-indigo-600">Editar Detalhes <Edit className="w-3 h-3 ml-2" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ads" className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-4xl space-y-6">
              <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                <Zap className="w-4 h-4" /> Banners Promocionais (Ads)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { section: homeAds.home_ad_1, key: 'home_ad_1', label: 'Home Ad 1 (Topo)' },
                  { section: homeAds.home_ad_2, key: 'home_ad_2', label: 'Home Ad 2 (Categorias)' },
                  { section: homeAds.home_ad_3, key: 'home_ad_3', label: 'Home Ad 3 (Segurança)' },
                  { section: homeAds.home_ad_4, key: 'home_ad_4', label: 'Home Ad 4 (Mobile)' },
                ].map(({ section, key, label }) => (
                  <div key={key} className="bg-white border border-slate-100 rounded-[1.5rem] p-4 flex flex-col gap-4 hover:border-indigo-100 transition-all group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-amber-400 transition-all"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                        {section?.bg_image ? (
                          <img src={section.bg_image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200"><ImageIcon className="w-5 h-5" /></div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-indigo-600/50 leading-none">{label}</span>
                        <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-tight truncate mt-1 leading-none">{section?.title || 'Não configurado'}</h4>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <Switch 
                        checked={section?.is_active || false} 
                        onCheckedChange={() => handleUpdateSection(key, { ...section, is_active: !section?.is_active } as SiteSection)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingSection(key)} className="text-xs font-bold text-slate-500 hover:text-indigo-600">Editar Detalhes <Edit className="w-3 h-3 ml-2" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-2xl space-y-6">
              <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                <Search className="w-4 h-4" /> Google AdSense
              </h2>
              <div className="bg-slate-950 rounded-[2rem] p-6 text-white space-y-6 shadow-2xl shadow-slate-900/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Status Global</span>
                  <div 
                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest cursor-pointer transition-all ${adsenseConfig.is_enabled ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}
                    onClick={() => setAdsenseConfig({...adsenseConfig, is_enabled: !adsenseConfig.is_enabled})}
                  >
                    {adsenseConfig.is_enabled ? 'Ativado' : 'Desativado'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Sidebar Ad Slot</label>
                    <Input value={adsenseConfig.sidebar_ad_slot} onChange={(e) => setAdsenseConfig({...adsenseConfig, sidebar_ad_slot: e.target.value})} placeholder="Slot ID" className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Footer Ad Slot</label>
                    <Input value={adsenseConfig.footer_ad_slot} onChange={(e) => setAdsenseConfig({...adsenseConfig, footer_ad_slot: e.target.value})} placeholder="Slot ID" className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs" />
                  </div>
                </div>
                <Button onClick={handleUpdateAdsense} className="w-full bg-white text-slate-950 hover:bg-indigo-500 hover:text-white rounded-xl h-10 font-black uppercase tracking-widest text-[9px] transition-all">Salvar Configurações</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL DE EDIÇÃO DE BANNER HERO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white">
            <h3 className="text-xl font-black uppercase tracking-tight">{editingBanner?.id ? 'Editar Banner' : 'Novo Banner'}</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Configurações de exibição na Index</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="aspect-video rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 group relative">
                {editingBanner?.imageUrl ? (
                  <img src={editingBanner.imageUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-[9px] font-black uppercase">Sem Imagem</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], (url) => setEditingBanner({...editingBanner, imageUrl: url}))}
                    disabled={isUploading}
                  />
                  <Button disabled={isUploading} className="bg-white text-slate-900 rounded-full font-black text-[9px] uppercase tracking-widest px-6">
                    {isUploading ? 'Subindo...' : 'Trocar Imagem'}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Título do Banner</label>
                <Input 
                  value={editingBanner?.title}
                  onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                  className="rounded-xl border-slate-100 h-11"
                  placeholder="Nome do Banner"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Link de Destino</label>
                <Input 
                  value={editingBanner?.linkUrl}
                  onChange={(e) => setEditingBanner({...editingBanner, linkUrl: e.target.value})}
                  className="rounded-xl border-slate-100 h-11"
                  placeholder="/events/slug-do-evento"
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveBanner}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100"
            >
              Confirmar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE EDIÇÃO AVANÇADA (Aparência) */}
      <Dialog open={!!isEditingSection} onOpenChange={() => setIsEditingSection(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-amber-400 p-8 text-slate-950">
            <h3 className="text-xl font-black uppercase tracking-tight">Editar Seção</h3>
            <p className="text-slate-900/40 text-[10px] font-bold uppercase tracking-widest mt-1">Configurações institucionais da Home</p>
          </div>
          
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {(() => {
              const activeSection = 
                isEditingSection === 'staff_section' ? staffSection :
                isEditingSection === 'organizer_cta' ? organizerCta :
                isEditingSection === 'platform_pro_banner' ? platformProBanner :
                isEditingSection?.startsWith('home_ad_') ? homeAds[isEditingSection] : null;

              const updateActiveSection = (updates: any) => {
                if (isEditingSection === 'staff_section') setStaffSection({ ...staffSection, ...updates } as any);
                else if (isEditingSection === 'organizer_cta') setOrganizerCta({ ...organizerCta, ...updates } as any);
                else if (isEditingSection === 'platform_pro_banner') setPlatformProBanner({ ...platformProBanner, ...updates } as any);
                else if (isEditingSection?.startsWith('home_ad_')) setHomeAds({ ...homeAds, [isEditingSection]: { ...homeAds[isEditingSection], ...updates } as any });
              };

              if (!activeSection) return null;

              return (
               <div className="space-y-6 pb-6">
                 <div className="aspect-video rounded-3xl overflow-hidden group relative border border-slate-100 shadow-inner">
                   <img src={activeSection.bg_image} className="w-full h-full object-cover" alt="" />
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], (url) => updateActiveSection({ bg_image: url }))} />
                     <Button className="bg-white text-slate-900 rounded-full font-black text-[9px] uppercase tracking-widest px-6 shadow-xl">Trocar Imagem</Button>
                   </div>
                 </div>

                 {/* CONTEÚDO BÁSICO */}
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                   <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Layout className="w-3 h-3" /> Textos Principais</h4>
                   <div className="space-y-3">
                     <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Título</label>
                       <Input value={activeSection.title} onChange={(e) => updateActiveSection({ title: e.target.value })} placeholder="Título Principal" className="rounded-xl h-10 text-xs font-bold" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Subtítulo</label>
                       <Input value={activeSection.subtitle} onChange={(e) => updateActiveSection({ subtitle: e.target.value })} placeholder="Subtítulo ou Descrição" className="rounded-xl h-10 text-xs" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Texto Botão</label>
                         <Input value={activeSection.cta_text} onChange={(e) => updateActiveSection({ cta_text: e.target.value })} placeholder="Ex: SAIBA MAIS" className="rounded-xl h-10 text-xs font-bold" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Link Destino</label>
                         <Input value={activeSection.cta_link} onChange={(e) => updateActiveSection({ cta_link: e.target.value })} placeholder="/pagina" className="rounded-xl h-10 text-xs" />
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* CONFIGURAÇÕES DE APARÊNCIA */}
                 <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-4">
                   <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2"><Edit className="w-3 h-3" /> Aparência Avançada</h4>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-3 bg-white p-3 rounded-xl border border-indigo-100/50">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 block border-b border-slate-100 pb-2">Tag Sup.</label>
                        <Input 
                          value={activeSection.config?.badgeText || ''} 
                          onChange={(e) => updateActiveSection({ config: { ...activeSection.config, badgeText: e.target.value } })} 
                          placeholder="Ex: PREMIUM ADS" 
                          className="h-8 text-[10px] uppercase font-bold" 
                        />
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-[8px] font-bold text-slate-400">Cor Fundo</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={activeSection.config?.badgeColor || '#4f46e5'} onChange={(e) => updateActiveSection({ config: { ...activeSection.config, badgeColor: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                              <span className="text-[9px] text-slate-400 font-mono uppercase">{activeSection.config?.badgeColor || '#4f46e5'}</span>
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[8px] font-bold text-slate-400">Cor Texto</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={activeSection.config?.badgeTextColor || '#ffffff'} onChange={(e) => updateActiveSection({ config: { ...activeSection.config, badgeTextColor: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                            </div>
                          </div>
                        </div>
                     </div>

                     <div className="space-y-3 bg-white p-3 rounded-xl border border-indigo-100/50">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 block border-b border-slate-100 pb-2">Botão (CTA)</label>
                        <div className="flex gap-2 pt-1">
                          <div className="flex-1 space-y-1">
                            <label className="text-[8px] font-bold text-slate-400">Cor Fundo</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={activeSection.config?.ctaColor || '#0f172a'} onChange={(e) => updateActiveSection({ config: { ...activeSection.config, ctaColor: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                              <span className="text-[9px] text-slate-400 font-mono uppercase">{activeSection.config?.ctaColor || '#0f172a'}</span>
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[8px] font-bold text-slate-400">Cor Texto</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={activeSection.config?.ctaTextColor || '#ffffff'} onChange={(e) => updateActiveSection({ config: { ...activeSection.config, ctaTextColor: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                            </div>
                          </div>
                        </div>
                     </div>
                   </div>

                   <div className="bg-white p-3 rounded-xl border border-indigo-100/50 space-y-3">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Cor do Título</label>
                         <div className="flex items-center gap-2">
                           <input type="color" value={activeSection.config?.titleColor || '#000000'} onChange={(e) => updateActiveSection({ config: { ...activeSection.config, titleColor: e.target.value } })} className="w-8 h-8 rounded-full cursor-pointer overflow-hidden border border-slate-200" />
                           <span className="text-[9px] text-slate-400 font-mono uppercase">{activeSection.config?.titleColor || '#000000'}</span>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Cor do Subtítulo</label>
                         <div className="flex items-center gap-2">
                           <input type="color" value={activeSection.config?.subtitleColor || '#64748b'} onChange={(e) => updateActiveSection({ config: { ...activeSection.config, subtitleColor: e.target.value } })} className="w-8 h-8 rounded-full cursor-pointer overflow-hidden border border-slate-200" />
                         </div>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Tamanho Título</label>
                         <select 
                           value={activeSection.config?.titleSize || 'text-xl md:text-3xl'} 
                           onChange={(e) => updateActiveSection({ config: { ...activeSection.config, titleSize: e.target.value } })}
                           className="w-full h-8 text-[10px] rounded border-slate-200"
                         >
                           <option value="text-lg md:text-xl">Pequeno</option>
                           <option value="text-xl md:text-3xl">Médio (Padrão)</option>
                           <option value="text-3xl md:text-4xl">Grande</option>
                           <option value="text-4xl md:text-6xl">Gigante</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Tam. Subtítulo</label>
                         <select 
                           value={activeSection.config?.subtitleSize || 'text-[10px] md:text-[11px]'} 
                           onChange={(e) => updateActiveSection({ config: { ...activeSection.config, subtitleSize: e.target.value } })}
                           className="w-full h-8 text-[10px] rounded border-slate-200"
                         >
                           <option value="text-[9px] md:text-[10px]">Pequeno</option>
                           <option value="text-[10px] md:text-[11px]">Médio (Padrão)</option>
                           <option value="text-sm md:text-base">Grande</option>
                         </select>
                       </div>
                     </div>
                   </div>
                 </div>

                 <Button 
                   onClick={() => handleUpdateSection(isEditingSection!, activeSection)} 
                   className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-xl transition-colors"
                 >
                   Salvar Alterações
                 </Button>
               </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MasterSiteManagement;
