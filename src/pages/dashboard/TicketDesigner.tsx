
import { useState } from 'react';
import { Save, Eye, Download, Upload, Palette, Type, Image, Layout } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface TicketDesign {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  backgroundImage?: string;
  layout: 'classic' | 'modern' | 'minimal';
  useEventBanner: boolean;
  isPDV: boolean;
}

const TicketDesigner = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');
  const [design, setDesign] = useState<TicketDesign>({
    id: '1',
    name: 'Meu Ingresso',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#3b82f6',
    fontFamily: 'Arial',
    layout: 'classic',
    useEventBanner: false,
    isPDV: false
  });

  const templates = [
    { id: 'classic', name: 'Clássico', preview: 'bg-white border-2 border-gray-300' },
    { id: 'modern', name: 'Moderno', preview: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { id: 'minimal', name: 'Minimalista', preview: 'bg-gray-100 border border-gray-200' },
    { id: 'elegant', name: 'Elegante', preview: 'bg-black text-white' },
  ];

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Roboto', label: 'Roboto' },
  ];

  const handleSaveDesign = () => {
    toast({
      title: 'Design salvo',
      description: 'O design do ingresso foi salvo com sucesso.',
    });
  };

  const handlePreview = () => {
    toast({
      title: 'Visualização',
      description: 'Abrindo visualização do ingresso...',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Exportar design',
      description: 'Exportando design do ingresso...',
    });
  };

  const handleImageUpload = (type: 'logo' | 'background') => {
    toast({
      title: 'Upload de imagem',
      description: `Funcionalidade de upload de ${type} será implementada.`,
    });
  };

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Designer de Ingressos</h1>
            <p className="text-gray-600 mt-1">Crie e personalize o design dos seus ingressos</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleSaveDesign}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Design
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layout className="h-5 w-5 mr-2" />
                  Templates
                </CardTitle>
                <CardDescription>
                  Escolha um template base para seu ingresso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className={`h-12 rounded mb-2 ${template.preview}`}></div>
                      <p className="text-sm font-medium text-center">{template.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Personalização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="colors" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="colors">Cores</TabsTrigger>
                    <TabsTrigger value="typography">Texto</TabsTrigger>
                    <TabsTrigger value="images">Imagens</TabsTrigger>
                  </TabsList>

                  <TabsContent value="colors" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id="backgroundColor"
                            value={design.backgroundColor}
                            onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                            className="w-12 h-10 rounded border"
                          />
                          <Input
                            value={design.backgroundColor}
                            onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="textColor">Cor do Texto</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id="textColor"
                            value={design.textColor}
                            onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                            className="w-12 h-10 rounded border"
                          />
                          <Input
                            value={design.textColor}
                            onChange={(e) => setDesign({ ...design, textColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="accentColor">Cor de Destaque</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id="accentColor"
                            value={design.accentColor}
                            onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                            className="w-12 h-10 rounded border"
                          />
                          <Input
                            value={design.accentColor}
                            onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="typography" className="space-y-4">
                    <div>
                      <Label htmlFor="fontFamily">Fonte</Label>
                      <Select
                        value={design.fontFamily}
                        onValueChange={(value) => setDesign({ ...design, fontFamily: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ticketName">Nome do Ingresso</Label>
                      <Input
                        id="ticketName"
                        value={design.name}
                        onChange={(e) => setDesign({ ...design, name: e.target.value })}
                        placeholder="Ex: VIP, Pista, Camarote..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="space-y-4">
                    <div>
                      <Label>Logo do Evento</Label>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleImageUpload('logo')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Fazer Upload do Logo
                      </Button>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={design.useEventBanner}
                          onChange={(e) => setDesign({ ...design, useEventBanner: e.target.checked })}
                          className="w-4 h-4"
                        />
                        Usar Banner do Evento como Fundo
                      </Label>
                      <p className="text-xs text-gray-500 mb-4">O banner principal do evento será aplicado automaticamente.</p>

                      <Button
                        variant="outline"
                        className="w-full mb-4"
                        onClick={() => handleImageUpload('background')}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Fazer Upload de Imagem Personalizada
                      </Button>

                      <div className="pt-4 border-t">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={design.isPDV}
                            onChange={(e) => setDesign({ ...design, isPDV: e.target.checked })}
                            className="w-4 h-4"
                          />
                          Diferencial Visual para PDV (Físico)
                        </Label>
                        <p className="text-xs text-gray-500">Adiciona um selo distintivo para ingressos de ponto de venda.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Visualização do Ingresso</CardTitle>
                <CardDescription>
                  Veja como seu ingresso ficará depois de personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[500px]">
                <div
                  className="w-96 h-56 rounded-lg shadow-lg border-2 border-dashed border-gray-300 relative overflow-hidden flex flex-col"
                  style={{
                    backgroundColor: design.backgroundColor,
                    backgroundImage: design.useEventBanner ? 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&fit=crop)' : (design.backgroundImage ? `url(${design.backgroundImage})` : 'none'),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: design.textColor,
                    fontFamily: design.fontFamily
                  }}
                >
                  {/* Overlay for readability if image used */}
                  {(design.useEventBanner || design.backgroundImage) && (
                    <div className="absolute inset-0 bg-black/40 z-0"></div>
                  )}
                  {/* Ticket Header */}
                  <div
                    className="h-16 flex items-center justify-between px-4 text-white font-bold text-lg z-10"
                    style={{ backgroundColor: design.accentColor }}
                  >
                    <span>{design.name || 'Nome do Ingresso'}</span>
                    {design.isPDV && (
                      <Badge variant="secondary" className="bg-yellow-400 text-black border-none font-black text-[10px] uppercase tracking-tighter shadow-sm animate-pulse">
                        PDV ELITE
                      </Badge>
                    )}
                  </div>

                  {/* Ticket Body */}
                  <div className="p-4 space-y-2 z-10">
                    <div className="flex justify-between">
                      <span className="font-semibold">Evento:</span>
                      <span className={(design.useEventBanner || design.backgroundImage) ? "text-white shadow-sm" : ""}>Festival de Música 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Data:</span>
                      <span className={(design.useEventBanner || design.backgroundImage) ? "text-white shadow-sm" : ""}>15/03/2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Local:</span>
                      <span className={(design.useEventBanner || design.backgroundImage) ? "text-white shadow-sm" : ""}>Espaço de Eventos A2</span>
                    </div>
                  </div>

                  {/* QR Code Area - REMOVED per user request
                    <div className="absolute bottom-2 right-2 w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded grid grid-cols-3 gap-px">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="bg-black rounded-sm"></div>
                        ))}
                      </div>
                    </div>
                    */}

                  {/* Ticket Number */}
                  <div className="absolute bottom-2 left-2 text-xs opacity-70">
                    #00001
                  </div>
                </div>

                {/* Perforation Effect - REMOVED per user request
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full border-2 border-gray-300"></div>
                  */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </DashboardLayout >
  );
};

export default TicketDesigner;
