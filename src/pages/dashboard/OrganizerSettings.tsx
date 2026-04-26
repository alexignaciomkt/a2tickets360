
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User, Bell, Shield, Store, Palette, Loader2, AlertCircle, Globe,
  Instagram, Youtube, Twitter, Linkedin, Music2, ExternalLink, Camera, ImageIcon, Upload, Check,
  Building2, Share2, LayoutGrid, Users
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import OrganizerStoreTab from '@/components/dashboard/OrganizerStoreTab';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Social network config: icon, color, label, placeholder, field
const SOCIAL_NETWORKS = [
  {
    id: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/suaprodutora',
    icon: Instagram, bg: 'bg-gradient-to-br from-purple-50 to-pink-50', iconColor: 'text-pink-500', iconBg: 'bg-pink-100'
  },
  {
    id: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/suaprodutora',
    icon: Globe, bg: 'bg-blue-50', iconColor: 'text-blue-600', iconBg: 'bg-blue-100'
  },
  {
    id: 'tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@suaprodutora',
    icon: Music2, bg: 'bg-gray-50', iconColor: 'text-slate-800', iconBg: 'bg-slate-100'
  },
  {
    id: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@suaprodutora',
    icon: Youtube, bg: 'bg-red-50', iconColor: 'text-red-600', iconBg: 'bg-red-100'
  },
  {
    id: 'twitter_url', label: 'X (Twitter)', placeholder: 'https://x.com/suaprodutora',
    icon: Twitter, bg: 'bg-sky-50', iconColor: 'text-sky-500', iconBg: 'bg-sky-100'
  },
  {
    id: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/suaprodutora',
    icon: Linkedin, bg: 'bg-blue-50', iconColor: 'text-blue-700', iconBg: 'bg-blue-100'
  },
  {
    id: 'whatsapp_number', label: 'WhatsApp de Contato', placeholder: '55 (DDD) 9 XXXX-XXXX',
    icon: Globe, bg: 'bg-green-50', iconColor: 'text-green-600', iconBg: 'bg-green-100'
  },
  {
    id: 'website_url', label: 'Site Oficial', placeholder: 'https://suaprodutora.com.br',
    icon: Globe, bg: 'bg-indigo-50', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100'
  },
];

const OrganizerSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean'],
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'link'
  ];

  // Estados para upload com confirmação
  const [tempBannerFile, setTempBannerFile] = useState<File | null>(null);
  const [tempBannerPreview, setTempBannerPreview] = useState<string | null>(null);
  const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
  const [tempLogoPreview, setTempLogoPreview] = useState<string | null>(null);
  const [tempAboutFile, setTempAboutFile] = useState<File | null>(null);
  const [tempAboutPreview, setTempAboutPreview] = useState<string | null>(null);

  const [originalName, setOriginalName] = useState('');
  const [showSlugWarning, setShowSlugWarning] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const data = await organizerService.getProfile(user.id);
        setProfileData(data);
        setOriginalName(data?.company_name || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev: any) => {
      const newState = { ...prev, [name]: value };
      return newState;
    });

    if (name === 'company_name' || name === 'companyName') {
      setShowSlugWarning(value !== originalName);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Apenas gera a prévia local
    const previewUrl = URL.createObjectURL(file);
    if (field === 'banner_url') {
      setTempBannerFile(file);
      setTempBannerPreview(previewUrl);
    } else if (field === 'logo_url') {
      setTempLogoFile(file);
      setTempLogoPreview(previewUrl);
    } else if (field === 'about_image') {
      setTempAboutFile(file);
      setTempAboutPreview(previewUrl);
    }

    toast({
      title: 'Arquivo selecionado',
      description: 'Clique no botão de confirmação para salvar a alteração.',
    });
  };

  const confirmImageUpload = async (field: 'banner_url' | 'logo_url' | 'about_image') => {
    let file: File | null = null;
    if (field === 'banner_url') file = tempBannerFile;
    if (field === 'logo_url') file = tempLogoFile;
    if (field === 'about_image') file = tempAboutFile;

    if (!file || !user?.id) return;

    setIsSaving(true);
    try {
      console.log(`[UPLOAD] Iniciando upload real do campo ${field}...`);
      const { url } = await organizerService.uploadImage(file, user.id, `settings_${field}`);
      
      let updatedProfile;
      if (field === 'about_image') {
        updatedProfile = {
          ...profileData,
          settings: { ...profileData.settings, about_image: url }
        };
        setTempAboutFile(null);
        setTempAboutPreview(null);
      } else {
        updatedProfile = { ...profileData, [field]: url };
        if (field === 'banner_url') {
          setTempBannerFile(null);
          setTempBannerPreview(null);
        } else {
          setTempLogoFile(null);
          setTempLogoPreview(null);
        }
      }
      
      setProfileData(updatedProfile);
      await organizerService.updateProfile(user.id, updatedProfile, user.id);
      
      toast({ 
        title: 'Sucesso!', 
        description: 'Imagem atualizada com sucesso.', 
        className: 'bg-green-50 border-green-200 text-green-900' 
      });
    } catch (error) {
      console.error(`[UPLOAD_ERROR] Erro ao salvar campo ${field}:`, error);
      toast({ 
        variant: 'destructive', 
        title: 'Erro no upload', 
        description: 'Não foi possível salvar a imagem.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const finalData = { ...profileData };
      
      // Sincronizar Slug se necessário
      if (!finalData.slug || showSlugWarning) {
        let baseSlug = (profileData.company_name || 'produtora')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        if (!finalData.slug) {
          baseSlug = `${baseSlug}-${Math.floor(Date.now() / 1000)}`;
        }
        finalData.slug = baseSlug;
      }

      // Sincronizar Site Oficial com FanPage se estiver vazio
      if (!finalData.website_url && finalData.slug) {
        finalData.website_url = `${window.location.origin}/p/${finalData.slug}`;
      }

      await organizerService.updateProfile(user.id, finalData, user.id);

      toast({
        title: 'Sucesso!',
        description: 'Suas informações foram atualizadas. ' + (showSlugWarning ? 'O link da sua página também foi alterado.' : ''),
      });

      setOriginalName(profileData.company_name);
      setShowSlugWarning(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // The fanpage URL derived from the slug
  const fanpageUrl = profileData?.slug
    ? `${window.location.origin}/p/${profileData.slug}`
    : null;

  if (isLoading) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900">Configurações do Perfil</h1>
            <p className="text-gray-600 font-medium">Gerencie como sua marca aparece para seus clientes</p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="font-black uppercase tracking-widest"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Tudo
          </Button>
        </div>

        {showSlugWarning && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 font-bold uppercase text-[10px] tracking-widest">Aviso Importante</AlertTitle>
            <AlertDescription className="text-amber-800 text-sm font-medium">
              Ao alterar o nome da produtora, o link da sua página pública (Slug) também mudará. Links protegidos ou compartilhados anteriormente podem parar de funcionar.
            </AlertDescription>
          </Alert>
        )}

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => {
            setActiveTab(v);
            setSearchParams({ tab: v });
          }} 
          className="space-y-4"
        >
          <TabsList className="bg-gray-100 p-1 rounded-xl w-full justify-start overflow-x-auto h-auto scrollbar-hide">
            <TabsTrigger value="profile" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Store className="h-4 w-4" />
              Vitrine Pública
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Building2 className="h-4 w-4" />
              Dados da Empresa
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Palette className="h-4 w-4" />
              Identidade Visual
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Share2 className="h-4 w-4" />
              Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <LayoutGrid className="h-4 w-4" />
              Agenda & Loja
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Users className="h-4 w-4" />
              Depoimentos/Galeria
            </TabsTrigger>
          </TabsList>

          {/* === ABA 1: VITRINE PÚBLICA (BIO E IMAGEM SOBRE) === */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
              <CardHeader>
                <CardTitle className="font-black text-lg uppercase tracking-tight">Apresentação da Vitrine</CardTitle>
                <CardDescription className="font-medium text-gray-500">
                  Configure como a história da sua marca aparece para os clientes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest block mb-2">Título da Seção "Sobre"</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-white border-none rounded-xl font-bold text-sm shadow-sm"
                        placeholder="Ex: Nossa História, Quem Somos..."
                        value={profileData?.settings?.titles?.about || ''}
                        onChange={(e) => {
                          setProfileData((prev: any) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              titles: { ...prev.settings?.titles, about: e.target.value }
                            }
                          }));
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Biografia / História</label>
                      <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner min-h-[300px]">
                        <ReactQuill 
                          theme="snow"
                          value={profileData?.bio || ''}
                          onChange={(content) => {
                            setProfileData((prev: any) => ({ ...prev, bio: content }));
                          }}
                          modules={quillModules}
                          formats={quillFormats}
                          className="h-[240px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upload da Imagem da Seção Sobre */}
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Imagem da Seção Sobre</label>
                    <div className="relative group">
                      <div className="aspect-[4/3] rounded-[3rem] overflow-hidden bg-gray-100 border-4 border-white shadow-2xl">
                        <img 
                          src={tempAboutPreview || profileData?.settings?.about_image || profileData?.logo_url} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <label className="flex-1 cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'about_image')} />
                          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                            <Upload className="w-3 h-3" /> Alterar Foto
                          </div>
                        </label>
                        
                        {tempAboutPreview && (
                          <Button 
                            onClick={() => confirmImageUpload('about_image')}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest"
                          >
                            <Check className="w-3 h-3 mr-2" /> Confirmar Troca
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 text-center">Recomendado: 800x600px (4:3)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === ABA 2: DADOS DA EMPRESA === */}
          <TabsContent value="account" className="space-y-4">
            <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
              <CardHeader>
                <CardTitle className="font-black text-lg uppercase tracking-tight">Informações Administrativas</CardTitle>
                <CardDescription className="font-medium text-gray-500">
                  Dados cadastrais da sua produtora.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Nome da Produtora</label>
                    <input
                      name="company_name"
                      type="text"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner"
                      value={profileData?.company_name || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Email Público</label>
                    <input
                      name="email"
                      type="email"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner"
                      value={profileData?.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Categoria / Segmento</label>
                    <input
                      name="category"
                      type="text"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner"
                      value={profileData?.category || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Cidade / UF</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        name="city"
                        type="text"
                        placeholder="Cidade"
                        className="col-span-2 p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner"
                        value={profileData?.city || ''}
                        onChange={handleInputChange}
                      />
                      <input
                        name="state"
                        type="text"
                        placeholder="UF"
                        maxLength={2}
                        className="p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner uppercase"
                        value={profileData?.state || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">CPF ou CNPJ</label>
                    <input
                      name="document"
                      type="text"
                      placeholder="00.000.000/0001-00"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner"
                      value={profileData?.document || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === ABA 2: REDES SOCIAIS === */}
          <TabsContent value="social" className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-black text-lg uppercase tracking-tight">Presença Digital</CardTitle>
                <CardDescription className="font-medium text-gray-500">
                  Links das suas redes sociais que aparecerão na sua FanPage e ingressos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* FanPage link banner */}
                {fanpageUrl && (
                  <div className="mb-6 flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Link da sua FanPage</p>
                      <p className="text-sm font-bold text-indigo-700 truncate">{fanpageUrl}</p>
                    </div>
                    <a href={fanpageUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="text-xs font-black rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-100">
                        Abrir
                      </Button>
                    </a>
                  </div>
                )}

                {/* Site field pre-filled from fanpage */}
                <div className="mb-4">
                  <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <div className="bg-indigo-600 p-2.5 rounded-xl flex-shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">
                        Site Oficial / FanPage
                      </label>
                      <input
                        name="website_url"
                        type="url"
                        placeholder={fanpageUrl || 'https://suaprodutora.com.br'}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-indigo-700"
                        value={profileData?.website_url || fanpageUrl || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SOCIAL_NETWORKS.filter(n => n.id !== 'website_url').map((network) => (
                    <div key={network.id} className={`flex items-center gap-4 ${network.bg} p-4 rounded-2xl`}>
                      <div className={`${network.iconBg} p-2.5 rounded-xl flex-shrink-0`}>
                        <network.icon className={`w-5 h-5 ${network.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">{network.label}</label>
                        <input
                          name={network.id}
                          type={network.id === 'whatsapp_number' ? 'tel' : 'url'}
                          placeholder={network.placeholder}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-sm truncate"
                          value={(profileData?.[network.id] as string) || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === ABA 3: DEPOIMENTOS / GALERIA === */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="font-black text-lg uppercase tracking-tight">Depoimentos (Prova Social)</CardTitle>
                    <CardDescription className="font-medium text-gray-500">Adicione até 10 depoimentos que aparecerão em carrossel na sua vitrine.</CardDescription>
                  </div>
                  <div className="flex-1 max-w-xs ml-auto mr-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Título da Seção</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-gray-50 border-none rounded-lg font-bold text-xs shadow-inner"
                      value={profileData?.settings?.titles?.testimonials || 'Depoimentos'}
                      onChange={(e) => {
                        setProfileData((prev: any) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            titles: { ...prev.settings?.titles, testimonials: e.target.value }
                          }
                        }));
                      }}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="font-black uppercase text-[10px] tracking-widest rounded-xl"
                    disabled={(profileData?.settings?.testimonials?.length || 0) >= 10}
                    onClick={() => {
                      const current = profileData?.settings?.testimonials || [];
                      setProfileData((prev: any) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          testimonials: [...current, { name: '', role: '', text: '', avatar: '' }]
                        }
                      }));
                    }}
                  >
                    + Adicionar Depoimento
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(profileData?.settings?.testimonials || []).map((dep: any, idx: number) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        const current = [...profileData.settings.testimonials];
                        current.splice(idx, 1);
                        setProfileData((prev: any) => ({
                          ...prev,
                          settings: { ...prev.settings, testimonials: current }
                        }));
                      }}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome do Cliente</label>
                        <input 
                          type="text" 
                          className="w-full p-2.5 bg-white border-none rounded-xl font-bold text-sm shadow-sm"
                          value={dep.name}
                          onChange={(e) => {
                            const current = [...profileData.settings.testimonials];
                            current[idx].name = e.target.value;
                            setProfileData((prev: any) => ({
                              ...prev,
                              settings: { ...prev.settings, testimonials: current }
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Cargo / Status (Ex: Cliente VIP)</label>
                        <input 
                          type="text" 
                          className="w-full p-2.5 bg-white border-none rounded-xl font-bold text-sm shadow-sm"
                          value={dep.role}
                          onChange={(e) => {
                            const current = [...profileData.settings.testimonials];
                            current[idx].role = e.target.value;
                            setProfileData((prev: any) => ({
                              ...prev,
                              settings: { ...prev.settings, testimonials: current }
                            }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Texto do Depoimento</label>
                      <textarea 
                        className="w-full p-3 bg-white border-none rounded-xl font-bold text-sm shadow-sm h-20"
                        value={dep.text}
                        onChange={(e) => {
                          const current = [...profileData.settings.testimonials];
                          current[idx].text = e.target.value;
                          setProfileData((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, testimonials: current }
                          }));
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                {(profileData?.settings?.testimonials?.length || 0) === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-[2rem]">
                    <User className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Nenhum depoimento cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="font-black text-lg uppercase tracking-tight">Galeria de Memórias</CardTitle>
                    <CardDescription className="font-medium text-gray-500">Suba fotos de eventos passados para exibir na sua vitrine.</CardDescription>
                  </div>
                  <div className="flex-1 max-w-xs ml-auto mr-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Título da Seção</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-gray-50 border-none rounded-lg font-bold text-xs shadow-inner"
                      value={profileData?.settings?.titles?.gallery || 'Memórias'}
                      onChange={(e) => {
                        setProfileData((prev: any) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            titles: { ...prev.settings?.titles, gallery: e.target.value }
                          }
                        }));
                      }}
                    />
                  </div>
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        setIsSaving(true);
                        try {
                          const uploads = await Promise.all(files.map(f => organizerService.uploadImage(f, user!.id, 'gallery')));
                          const newUrls = uploads.map(u => u.url);
                          const current = profileData?.settings?.gallery || [];
                          setProfileData((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, gallery: [...current, ...newUrls] }
                          }));
                          toast({ title: 'Fotos adicionadas!', description: `${files.length} fotos foram enviadas para sua galeria.` });
                        } catch (err) {
                          toast({ variant: 'destructive', title: 'Erro no upload', description: 'Falha ao enviar algumas fotos.' });
                        } finally {
                          setIsSaving(false);
                        }
                      }} 
                    />
                    <Button variant="outline" size="sm" className="font-black uppercase text-[10px] tracking-widest rounded-xl">
                      <Upload className="w-3 h-3 mr-1" /> Subir Fotos
                    </Button>
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {(profileData?.settings?.gallery || []).map((url: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group">
                      <img src={url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-white hover:text-red-500 hover:bg-transparent"
                          onClick={() => {
                            const current = [...profileData.settings.gallery];
                            current.splice(idx, 1);
                            setProfileData((prev: any) => ({
                              ...prev,
                              settings: { ...prev.settings, gallery: current }
                            }));
                          }}
                        >
                          <AlertCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(profileData?.settings?.gallery?.length || 0) === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                      <ImageIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Sua galeria está vazia</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        {/* === ABA 4: LOJA & ECOMMERCE === */}
        <TabsContent value="store" className="space-y-8">
          {/* 1. CONFIGURAÇÕES DE VISIBILIDADE E LINK */}
          <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
            <CardHeader className="bg-white border-b border-gray-50 pb-6 px-8 pt-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <Store className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                  <CardTitle className="font-black text-2xl uppercase tracking-tighter text-gray-900">Configurações da Agenda & Loja</CardTitle>
                  <CardDescription className="font-medium text-gray-500">Controle a exibição de eventos e produtos na sua página.</CardDescription>
                  <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 max-w-md">
                    <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block mb-2">Título da Agenda na FanPage</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white border-none rounded-xl font-bold text-sm shadow-sm"
                      value={profileData?.settings?.titles?.agenda || 'Agenda Completa'}
                      onChange={(e) => {
                        setProfileData((prev: any) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            titles: { ...prev.settings?.titles, agenda: e.target.value }
                          }
                        }));
                      }}
                    />
                  </div>
                </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-4 border-gray-200"
                    onClick={() => window.open(`/p/${profileData.slug}`, '_blank')}
                    disabled={!profileData.slug}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Ver Vitrine
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Página Pública</p>
                    <p className="text-sm font-bold text-gray-900">{profileData.settings?.showPage !== false ? 'Ativa' : 'Oculta'}</p>
                  </div>
                  <Switch 
                    checked={profileData.settings?.showPage !== false}
                    onCheckedChange={(val) => setProfileData((prev: any) => ({
                      ...prev,
                      settings: { ...prev.settings, showPage: val }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Agenda de Eventos</p>
                    <p className="text-sm font-bold text-gray-900">{profileData.settings?.showEvents !== false ? 'Exibir' : 'Ocultar'}</p>
                  </div>
                  <Switch 
                    checked={profileData.settings?.showEvents !== false}
                    onCheckedChange={(val) => setProfileData((prev: any) => ({
                      ...prev,
                      settings: { ...prev.settings, showEvents: val }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seção de Loja</p>
                    <p className="text-sm font-bold text-gray-900">{profileData.settings?.showStore !== false ? 'Exibir' : 'Ocultar'}</p>
                  </div>
                  <Switch 
                    checked={profileData.settings?.showStore !== false}
                    onCheckedChange={(val) => setProfileData((prev: any) => ({
                      ...prev,
                      settings: { ...prev.settings, showStore: val }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Link Personalizado da sua FanPage</Label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-100 px-4 h-12 rounded-xl flex items-center border border-gray-200">
                    <span className="text-gray-400 text-xs font-medium mr-1">{window.location.origin}/p/</span>
                    <span className="text-gray-900 text-xs font-black">{profileData.slug || '...'}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="rounded-xl font-black uppercase text-[10px] tracking-widest h-12 border border-dashed border-gray-300"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/p/${profileData.slug}`);
                      toast({ title: 'Link copiado!', description: 'Divulgue sua página nas redes sociais.' });
                    }}
                  >
                    Copiar Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. GERENCIADOR DE PRODUTOS E VENDAS (WOOCOMMERCE STYLE) */}
          <OrganizerStoreTab profileData={profileData} />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-black text-lg uppercase tracking-tight">Identidade Visual</CardTitle>
                    <CardDescription className="font-medium text-gray-500">Defina a capa e as cores da sua vitrine oficial.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-2">
                    {/* BANNER */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-gray-700">Banner de Capa</h3>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">Dimensão recomendada: 1920 × 600px</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            id="banner-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 'banner_url')} 
                            disabled={isSaving} 
                          />
                          {tempBannerFile ? (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="text-xs font-black uppercase tracking-widest rounded-xl bg-green-600 hover:bg-green-700"
                              onClick={() => confirmImageUpload('banner_url')}
                              disabled={isSaving}
                            >
                              {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                              Confirmar Troca
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs font-black uppercase tracking-widest rounded-xl"
                              asChild
                            >
                              <label htmlFor="banner-upload" className="cursor-pointer flex items-center gap-2">
                                <Upload className="w-3 h-3" />
                                Escolher Banner
                              </label>
                            </Button>
                          )}
                        </div>
                      </div>

                      <label 
                        htmlFor="banner-upload" 
                        className="cursor-pointer block relative h-52 w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group transition-all hover:border-primary/50"
                      >
                        {(tempBannerPreview || profileData?.banner_url || profileData?.bannerUrl) ? (
                          <img 
                            src={tempBannerPreview || profileData.banner_url || profileData.bannerUrl} 
                            alt="Banner" 
                            className="w-full h-full object-cover animate-in fade-in"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                            <ImageIcon className="w-12 h-12" />
                            <p className="text-xs font-black uppercase tracking-widest">Clique para selecionar um banner</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      </label>
                    </div>

                    {/* CORES E ESTILOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-primary" /> Cor de Destaque
                        </h3>
                        <div className="flex items-center gap-4">
                          <input 
                            type="color" 
                            className="w-12 h-12 rounded-lg cursor-pointer border-none"
                            value={profileData?.settings?.primaryColor || '#7C3AED'}
                            onChange={(e) => setProfileData((prev: any) => ({
                              ...prev,
                              settings: { ...prev?.settings, primaryColor: e.target.value }
                            }))}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-900">{profileData?.settings?.primaryColor || '#7C3AED'}</p>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Hex Code</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">Esta cor será usada em botões, links e destaques da sua vitrine.</p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                          <Store className="w-4 h-4 text-primary" /> Estilo da Vitrine
                        </h3>
                        <select 
                          className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary shadow-inner"
                          value={profileData?.settings?.buttonStyle || 'rounded-xl'}
                          onChange={(e) => setProfileData((prev: any) => ({
                            ...prev,
                            settings: { ...prev?.settings, buttonStyle: e.target.value }
                          }))}
                        >
                          <option value="rounded-none">Reto (Moderno/Sharp)</option>
                          <option value="rounded-lg">Suave (Arredondado Leve)</option>
                          <option value="rounded-xl">Clássico Ticketera (Arredondado)</option>
                          <option value="rounded-full">Cápsula (Extremo)</option>
                        </select>
                        <p className="text-[10px] text-gray-400 font-medium">Define a curvatura dos botões e cards na sua página.</p>
                      </div>
                    </div>

                    {/* DIVIDER */}
                    <div className="border-t border-gray-100" />

                    {/* LOGO */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-gray-700">Logotipo / Avatar</h3>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">Dimensão recomendada: 400 × 400px (quadrado)</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            id="logo-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 'logo_url')} 
                            disabled={isSaving} 
                          />
                          {tempLogoFile ? (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="text-xs font-black uppercase tracking-widest rounded-xl bg-green-600 hover:bg-green-700"
                              onClick={() => confirmImageUpload('logo_url')}
                              disabled={isSaving}
                            >
                              {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                              Confirmar Troca
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs font-black uppercase tracking-widest rounded-xl"
                              asChild
                            >
                              <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2">
                                <Upload className="w-3 h-3" />
                                Escolher Logo
                              </label>
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Logo preview square */}
                        <label htmlFor="logo-upload" className="cursor-pointer group flex-shrink-0">
                          <div className="relative w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group-hover:border-primary/30 transition-all shadow-sm">
                            {(tempLogoPreview || profileData?.logo_url) ? (
                              <img src={tempLogoPreview || profileData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                                <Store className="w-10 h-10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </label>

                        {/* Logo preview circle (how it looks on fanpage) */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Prévia na FanPage</p>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                              {profileData?.logo_url ? (
                                <img src={profileData.logo_url} alt="Logo círculo" className="w-full h-full object-cover" />
                              ) : (
                                <Store className="w-7 h-7 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">{profileData?.company_name || 'Nome da Produtora'}</p>
                              <p className="text-xs font-medium text-gray-400">{profileData?.category || 'Categoria'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tip */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-amber-800">Dica de Qualidade</p>
                        <p className="text-xs font-medium text-amber-700 mt-1 leading-relaxed">
                          Use imagens em alta resolução para garantir que sua marca apareça de forma nítida em todos os dispositivos, inclusive nos ingressos digitais.
                        </p>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>

              {/* PREVIEW MINI */}
              <div className="space-y-4">
                <Card className="border-none shadow-sm bg-gray-900 text-white overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-black text-xs uppercase tracking-widest text-gray-400">Preview Rápido</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="w-full h-24 rounded-lg bg-gray-800 overflow-hidden relative">
                      {profileData?.banner_url && <img src={profileData.banner_url} className="w-full h-full object-cover opacity-50" />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-700 shadow-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-gray-800 rounded" />
                      <div className="h-2 w-20 bg-gray-800 rounded opacity-50" />
                    </div>
                    <Button 
                      className={`w-full h-8 text-[10px] font-black uppercase tracking-widest ${profileData?.settings?.buttonStyle || 'rounded-xl'}`}
                      style={{ backgroundColor: profileData?.settings?.primaryColor || '#7C3AED' }}
                    >
                      Comprar Ingresso
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerSettings;
