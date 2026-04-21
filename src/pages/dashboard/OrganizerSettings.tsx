
import { useState, useEffect } from 'react';
import { User, Bell, Shield, Store, Palette, CreditCard, Loader2, AlertCircle, Globe } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const OrganizerSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  // State for slug warning
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
    setProfileData((prev: any) => ({ ...prev, [name]: value }));
    
    if (name === 'company_name' || name === 'companyName') {
      setShowSlugWarning(value !== originalName);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    setIsSaving(true);
    try {
      const { url } = await organizerService.uploadImage(file, user.id, `settings_${field}`);
      setProfileData((prev: any) => ({ ...prev, [field]: url }));
      
      toast({
        title: 'Upload concluído',
        description: 'A imagem foi enviada com sucesso. Clique em Salvar Tudo para aplicar.',
        className: 'bg-green-50 border-green-200 text-green-900',
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: 'Falha ao enviar a imagem. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      // Se não existir slug ainda, gera um agora baseado no company_name
      let finalData = { ...profileData };
      if (!finalData.slug || showSlugWarning) {
        let baseSlug = (profileData.company_name || 'produtora')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
          
        // Adiciona timestamp para garantir que é único e evitar colisão PGRST116
        if (!finalData.slug) {
           baseSlug = `${baseSlug}-${Math.floor(Date.now() / 1000)}`;
        }
        finalData.slug = baseSlug;
      }

      await organizerService.updateProfile(user.id, finalData, user.id);
      
      toast({
        title: "Sucesso!",
        description: "Suas informações foram atualizadas. " + (showSlugWarning ? "O link da sua página também foi alterado." : ""),
      });
      
      setOriginalName(profileData.company_name);
      setShowSlugWarning(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="profile" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <User className="h-4 w-4" />
              Perfil Profissional
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Globe className="h-4 w-4" />
              Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Store className="h-4 w-4" />
              Loja/FanPage
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2 font-bold text-xs uppercase tracking-tighter">
              <Palette className="h-4 w-4" />
              Identidade Visual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-black text-lg uppercase tracking-tight">Informações da Produtora</CardTitle>
                <CardDescription className="font-medium text-gray-500">
                  Estes dados são usados para identificar sua marca em ingressos e na sua página oficial.
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
                      value={profileData?.company_name || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Email Público</label>
                    <input
                      name="email"
                      type="email"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner"
                      value={profileData?.email || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Instagram (@)</label>
                    <input
                      name="instagram_url"
                      type="text"
                      placeholder="@suaprodutora"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner"
                      value={profileData?.instagram_url || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest">WhatsApp de Contato</label>
                    <input
                      name="whatsapp_number"
                      type="tel"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner"
                      value={profileData?.whatsapp_number || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Sobre a Produtora (História)</label>
                  <textarea
                    name="bio"
                    className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner h-32"
                    value={profileData?.bio || ""}
                    onChange={handleInputChange}
                    placeholder="Conte a história da sua produtora e seus principais eventos..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-black text-lg uppercase tracking-tight">Presença Digital</CardTitle>
                <CardDescription className="font-medium text-gray-500">
                  Links das suas redes sociais que aparecerão na barra lateral da sua FanPage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Website Oficial</label>
                      <input
                        name="website_url"
                        type="url"
                        placeholder="https://suaprodutora.com.br"
                        className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold"
                        value={profileData?.website_url || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Link Facebook</label>
                      <input
                        name="facebook_url"
                        type="url"
                        placeholder="fb.com/suaprodutora"
                        className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold"
                        value={profileData?.facebook_url || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-black text-lg uppercase tracking-tight">Capas e Logotipo</CardTitle>
                <CardDescription className="font-medium text-gray-500">
                  As dimensões ideais são 1200x400 para o banner e 400x400 para o logo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  {/* Banner Preview */}
                  <div className="relative h-48 w-full bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center group mb-12">
                     {profileData?.banner_url ? (
                       <img src={profileData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                     ) : (
                       <div className="text-center">
                         <Palette className="w-10 h-10 text-gray-300 mx-auto" />
                         <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Sem Banner de Capa</p>
                       </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                       <label className="cursor-pointer">
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner_url')} disabled={isSaving} />
                         <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-xs font-black uppercase tracking-widest">
                           {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Alterar Capa'}
                         </div>
                       </label>
                     </div>
                     
                     {/* Profile Pic Preview (Facebook Style Overlay) */}
                     <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-2xl bg-white p-1 shadow-xl z-10 group/avatar overflow-hidden">
                        {profileData?.logo_url ? (
                          <img src={profileData.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl">
                            <Store className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_url')} disabled={isSaving} />
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Palette className="text-white w-4 h-4 cursor-pointer" />}
                        </label>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store" className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-black text-lg uppercase tracking-tight">Configurações da FanPage</CardTitle>
                <p className="text-gray-500 font-medium mt-1">
                  Sua FanPage está ativa em: <span className="text-primary font-bold">a2tickets360.com.br/p/{profileData?.slug || 'aguardando'}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-black uppercase text-xs tracking-tight">Página Pública Ativa</p>
                      <p className="text-xs font-medium text-gray-500">Sua página estará visível para motores de busca e clientes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl opacity-50 cursor-not-allowed">
                    <div>
                      <p className="font-black uppercase text-xs tracking-tight">Agendar Horário de Loja</p>
                      <p className="text-xs font-medium text-gray-500">Disponível em breve para vendas de produtos físicos</p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerSettings;
