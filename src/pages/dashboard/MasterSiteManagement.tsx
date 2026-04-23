
import { useState, useEffect } from 'react';
import { 
  Layout, 
  Image as ImageIcon, 
  Monitor, 
  MousePointer2, 
  Newspaper, 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  GripVertical,
  Layers,
  ArrowRight,
  TrendingUp,
  Loader2,
  Settings2,
  Sparkles,
  ChevronRight,
  Maximize2,
  Zap,
  Cpu,
  ShieldCheck,
  Target,
  Database,
  Search
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cmsService, SiteSection } from '@/services/cmsService';

const MasterSiteManagement = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState<Record<string, SiteSection>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const data = await cmsService.getSections();
        const map = data.reduce((acc, curr) => {
          acc[curr.section_key] = curr;
          return acc;
        }, {} as Record<string, SiteSection>);
        setSections(map);
      } catch (error) {
        console.error('Erro ao buscar seções:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSections();
  }, []);

  const handleUpdateSection = (key: string, field: string, value: any) => {
    setSections(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        Object.entries(sections).map(([key, section]) => 
          cmsService.updateSection(key, section)
        )
      );

      toast({
        title: "Kernel Synchronization Success",
        description: "A inteligência visual do site foi atualizada globalmente com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Synchronization Protocol Failure",
        description: "Não foi possível persistir as alterações no cluster autorizado.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-16 pb-40 animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Gerenciamento do Site (CMS)</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Controle os banners, seções de destaque e configurações visuais da página inicial da Ticketera.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="bg-indigo-600 text-white hover:bg-indigo-700 h-8 text-xs font-medium px-3 shadow-sm transition-all rounded-md"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                ) : (
                  <Save className="w-3 h-3 mr-1.5" />
                )}
                Salvar Alterações
              </Button>
           </div>
        </div>

        <Tabs defaultValue="banners" className="w-full space-y-12">
          <div className="bg-slate-100 p-1 rounded-xl inline-flex w-full md:w-auto overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-1 w-full justify-start">
              {[
                { id: 'banners', label: 'Banners Principais', icon: ImageIcon },
                { id: 'dynamic', label: 'Algoritmos', icon: TrendingUp },
                { id: 'static', label: 'Textos Estáticos', icon: Settings2 },
                { id: 'season', label: 'Temas', icon: Sparkles },
                { id: 'ads', label: 'Banners Ads', icon: MousePointer2 },
                { id: 'blog', label: 'Blog', icon: Newspaper },
              ].map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="rounded-lg px-4 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
                  <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="banners" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Carrossel Principal (Hero)</h3>
                <p className="text-sm text-slate-500 font-medium">Gerencie as imagens de destaque da página inicial.</p>
              </div>
              <Button className="bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Banner
              </Button>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
               <div className="divide-y divide-slate-100">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4 shrink-0">
                         <GripVertical className="w-5 h-5 text-slate-300 cursor-grab hover:text-slate-500 transition-colors" />
                         <div className="w-40 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                            <img src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=400`} className="w-full h-full object-cover" alt="Preview" />
                         </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                           <h4 className="font-bold text-slate-800 text-base">Banner do Festival #{i}</h4>
                           <Badge className="bg-emerald-100 text-emerald-700 border-none">Ativo</Badge>
                        </div>
                        <p className="text-xs font-medium text-slate-500">Resolução: 1920x1080</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button variant="outline" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">Editar</Button>
                         <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[1, 2, 3, 4].map((i) => (
                 <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                       <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                          Espaço Publicitário #{i}
                          <Switch className="data-[state=checked]:bg-emerald-500 shadow-sm" />
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-600">Título do Anúncio</Label>
                          <Input className="border-slate-200 focus:ring-indigo-500 transition-all" placeholder="Ex: Patrocinador Oficial" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-600">URL da Imagem</Label>
                          <Input className="border-slate-200 focus:ring-indigo-500 transition-all" placeholder="https://cdn.ticketera.com/..." />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-xs font-semibold text-slate-600">Texto do Botão</Label>
                             <Input className="border-slate-200 focus:ring-indigo-500 transition-all" placeholder="Saiba mais" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-semibold text-slate-600">Link de Destino</Label>
                             <Input className="border-slate-200 focus:ring-indigo-500 transition-all" placeholder="/url-destino" />
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="dynamic" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-800 border-b border-slate-700 p-8 text-white relative overflow-hidden">
                   <div className="relative z-10 space-y-1">
                      <CardTitle className="text-2xl font-bold">Algoritmos de Recomendação</CardTitle>
                      <CardDescription className="text-sm font-medium text-slate-400">Configure a lógica de ordenação automática de eventos na home.</CardDescription>
                   </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="space-y-1">
                         <h4 className="font-bold text-slate-800">Automação por Volume de Tráfego</h4>
                         <p className="text-sm text-slate-500 font-medium">Reordenar automaticamente os eventos com base nos acessos em tempo real.</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                   </div>
                   
                   <div className="space-y-6">
                      <Label className="text-sm font-bold text-slate-700">Prioridade de Exibição (Pesos)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {[
                           { p: 1, label: 'Ordem Alfabética', color: 'slate', active: true },
                           { p: 2, label: 'Vendas Recentes', color: 'slate' },
                           { p: 3, label: 'Taxa de Conversão', color: 'slate' },
                         ].map((item, i) => (
                           <div key={i} className={`p-6 border rounded-xl space-y-4 shadow-sm ${item.active ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white'}`}>
                              <div className={`text-xs font-bold ${item.active ? 'text-indigo-600' : 'text-slate-400'} uppercase`}>Nível de Prioridade {item.p}</div>
                              <div className="font-bold text-slate-800 flex items-center justify-between">
                                 {item.label}
                                 <ChevronRight className={`w-4 h-4 ${item.active ? 'text-indigo-600' : 'text-slate-300'}`} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="static" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* STAFF SECTION EDITOR */}
               <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
                       Seção de Produtores Parceiros
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">Título Principal</Label>
                      <Input 
                        value={sections['staff_section']?.title || ''} 
                        onChange={(e) => handleUpdateSection('staff_section', 'title', e.target.value)}
                        className="border-slate-200 focus:ring-indigo-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">Subtítulo Descritivo</Label>
                      <Input 
                        value={sections['staff_section']?.subtitle || ''} 
                        onChange={(e) => handleUpdateSection('staff_section', 'subtitle', e.target.value)}
                        className="border-slate-200 focus:ring-indigo-500" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600">Texto do Botão</Label>
                        <Input 
                          value={sections['staff_section']?.cta_text || ''} 
                          onChange={(e) => handleUpdateSection('staff_section', 'cta_text', e.target.value)}
                          className="border-slate-200 focus:ring-indigo-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600">Link do Botão</Label>
                        <Input 
                          value={sections['staff_section']?.cta_link || ''} 
                          onChange={(e) => handleUpdateSection('staff_section', 'cta_link', e.target.value)}
                          className="border-slate-200 focus:ring-indigo-500" 
                        />
                      </div>
                    </div>
                  </CardContent>
               </Card>

               {/* PRODUCER CTA EDITOR */}
               <Card className="border-none bg-slate-900 shadow-sm overflow-hidden text-white">
                  <CardHeader className="p-6 border-b border-white/10">
                    <CardTitle className="text-base font-bold flex items-center justify-between">
                       Call to Action: Venda na Ticketera
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-400">Título de Impacto</Label>
                      <Input 
                        value={sections['organizer_cta']?.title || ''} 
                        onChange={(e) => handleUpdateSection('organizer_cta', 'title', e.target.value)}
                        className="border-white/20 bg-white/5 text-white focus:ring-indigo-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-400">Subtítulo / Apelo</Label>
                      <Input 
                        value={sections['organizer_cta']?.subtitle || ''} 
                        onChange={(e) => handleUpdateSection('organizer_cta', 'subtitle', e.target.value)}
                        className="border-white/20 bg-white/5 text-white focus:ring-indigo-500" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-400">Texto do Botão</Label>
                        <Input 
                          value={sections['organizer_cta']?.cta_text || ''} 
                          onChange={(e) => handleUpdateSection('organizer_cta', 'cta_text', e.target.value)}
                          className="border-white/20 bg-white/5 text-white focus:ring-indigo-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-400">Link do Botão</Label>
                        <Input 
                          value={sections['organizer_cta']?.cta_link || ''} 
                          onChange={(e) => handleUpdateSection('organizer_cta', 'cta_link', e.target.value)}
                          className="border-white/20 bg-white/5 text-white focus:ring-indigo-500" 
                        />
                      </div>
                    </div>
                  </CardContent>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="season" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                   <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3"><Sparkles className="w-5 h-5 text-indigo-600" /> Temas Sazonais</CardTitle>
                   <CardDescription className="text-sm font-medium text-slate-500 mt-1">Altere a identidade visual da Ticketera com apenas um clique.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Tema Padrão (Dark/Light)', color: 'bg-slate-900', active: true },
                        { label: 'Tema Carnaval', color: 'bg-rose-500', active: false },
                        { label: 'Tema Verão / Sunset', color: 'bg-amber-400', active: false },
                        { label: 'Modo Escuro Forçado', color: 'bg-black', active: false },
                      ].map((mode, i) => (
                        <div key={i} className={`p-6 rounded-xl border cursor-pointer transition-all hover:shadow-sm flex flex-col items-center text-center ${mode.active ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white'}`}>
                           <div className={`w-12 h-12 rounded-full ${mode.color} mb-4 shadow-sm border-2 border-white`} />
                           <div className="font-bold text-sm text-slate-800 mb-2">{mode.label}</div>
                           <Badge className={`text-[10px] font-semibold py-1 px-3 border-none ${mode.active ? 'bg-indigo-600 text-white hover:bg-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                              {mode.active ? 'ATIVO' : 'ATIVAR'}
                           </Badge>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>



      </div>
    </DashboardLayout>
  );
};

export default MasterSiteManagement;
