
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Save, 
  MoveUp, 
  MoveDown,
  Layout,
  Star,
  Rocket,
  Edit,
  Check,
  X
} from 'lucide-react';
import { cmsService, HeroBanner, SiteSection } from '@/services/cmsService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const BannerManagerPage = () => {
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [staffSection, setStaffSection] = useState<SiteSection | null>(null);
  const [organizerCta, setOrganizerCta] = useState<SiteSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '', linkUrl: '/events' });
  const [isEditingSection, setIsEditingSection] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [banners, staff, organizer] = await Promise.all([
        cmsService.getHeroBanners(),
        cmsService.getSectionByKey('staff_section'),
        cmsService.getSectionByKey('organizer_cta')
      ]);
      setHeroBanners(banners);
      setStaffSection(staff);
      setOrganizerCta(organizer);
    } catch (error) {
      toast.error('Erro ao carregar banners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHeroBanner = async () => {
    if (!newBanner.title || !newBanner.imageUrl) {
      toast.error('Preencha o título e a imagem');
      return;
    }

    try {
      await cmsService.createHeroBanner({
        title: newBanner.title,
        image_url: newBanner.imageUrl,
        link_url: newBanner.linkUrl,
        is_active: true
      });
      toast.success('Banner criado com sucesso');
      setNewBanner({ title: '', imageUrl: '', linkUrl: '/events' });
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'staff' | 'organizer') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await cmsService.uploadBannerImage(file);
      if (type === 'hero') {
        setNewBanner({ ...newBanner, imageUrl: url });
      } else if (type === 'staff' && staffSection) {
        await cmsService.updateSection('staff_section', { bg_image: url });
        fetchData();
      } else if (type === 'organizer' && organizerCta) {
        await cmsService.updateSection('organizer_cta', { bg_image: url });
        fetchData();
      }
      toast.success('Upload realizado com sucesso');
    } catch (error) {
      toast.error('Erro no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateSection = async (key: string, updates: any) => {
    try {
      await cmsService.updateSection(key, updates);
      toast.success('Seção atualizada');
      setIsEditingSection(null);
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar seção');
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Gestão de Banners</h1>
          <p className="text-slate-500 font-medium">Controle os destaques e seções promocionais da Home.</p>
        </div>

        {/* HERO BANNERS (CAROUSEL) */}
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Carrossel Hero (Max 20)</CardTitle>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Imagens de destaque da Index</p>
                </div>
              </div>
              <Badge className="bg-indigo-600 text-white border-none">{heroBanners.length}/20</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Create */}
              <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-500">Adicionar Novo Banner</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título do Banner</label>
                    <Input 
                      placeholder="Ex: Festival de Verão 2026"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                      className="rounded-xl border-slate-200 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">URL de Destino</label>
                    <Input 
                      placeholder="Ex: /events/id-do-evento"
                      value={newBanner.linkUrl}
                      onChange={(e) => setNewBanner({...newBanner, linkUrl: e.target.value})}
                      className="rounded-xl border-slate-200 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Imagem do Banner</label>
                    <div className="mt-1 flex flex-col gap-4">
                      {newBanner.imageUrl && (
                        <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200">
                          <img src={newBanner.imageUrl} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input 
                          placeholder="URL da Imagem ou Upload"
                          value={newBanner.imageUrl}
                          onChange={(e) => setNewBanner({...newBanner, imageUrl: e.target.value})}
                          className="rounded-xl border-slate-200 focus:ring-indigo-600"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => handleFileUpload(e, 'hero')}
                            disabled={isUploading}
                          />
                          <Button disabled={isUploading} className="bg-slate-900 rounded-xl">
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateHeroBanner}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-xs h-12"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Criar Banner
                  </Button>
                </div>
              </div>

              {/* List Banners */}
              <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {heroBanners.map((banner) => (
                  <div key={banner.id} className="flex items-center gap-4 p-4 rounded-[1.5rem] border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all group">
                    <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                      <img src={banner.image_url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-black text-slate-900 truncate uppercase text-sm tracking-tight">{banner.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{banner.link_url}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${banner.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'} border-none text-[8px] font-black uppercase tracking-widest`}>
                          {banner.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" onClick={() => handleToggleBanner(banner)} className="rounded-full hover:bg-indigo-50 hover:text-indigo-600">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteHeroBanner(banner.id)} className="rounded-full hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PROMOTIONAL SECTIONS (STAFF & PRODUCER) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* STAFF SECTION */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-amber-400 text-slate-900 p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Banner de Staff</CardTitle>
                  <p className="text-slate-700 text-xs font-bold uppercase tracking-widest mt-1">Recrutamento de equipe</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {staffSection && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-3xl overflow-hidden border border-slate-100 mb-4 group relative">
                    <img src={staffSection.bg_image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'staff')} />
                       <Button className="bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest">Trocar Imagem</Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título</label>
                      <Input 
                        value={staffSection.title}
                        onChange={(e) => setStaffSection({...staffSection, title: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtítulo</label>
                      <Input 
                        value={staffSection.subtitle}
                        onChange={(e) => setStaffSection({...staffSection, subtitle: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texto Botão</label>
                        <Input 
                          value={staffSection.cta_text}
                          onChange={(e) => setStaffSection({...staffSection, cta_text: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link Botão</label>
                        <Input 
                          value={staffSection.cta_link}
                          onChange={(e) => setStaffSection({...staffSection, cta_link: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleUpdateSection('staff_section', staffSection)}
                    className="w-full bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs h-12"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PRODUCER CTA */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-indigo-600 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Banner de Produtor</CardTitle>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Conversão de novos produtores</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {organizerCta && (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título</label>
                      <Input 
                        value={organizerCta.title}
                        onChange={(e) => setOrganizerCta({...organizerCta, title: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtítulo</label>
                      <Input 
                        value={organizerCta.subtitle}
                        onChange={(e) => setOrganizerCta({...organizerCta, subtitle: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texto Botão</label>
                        <Input 
                          value={organizerCta.cta_text}
                          onChange={(e) => setOrganizerCta({...organizerCta, cta_text: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link Botão</label>
                        <Input 
                          value={organizerCta.cta_link}
                          onChange={(e) => setOrganizerCta({...organizerCta, cta_link: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleUpdateSection('organizer_cta', organizerCta)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-xs h-12"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BannerManagerPage;
