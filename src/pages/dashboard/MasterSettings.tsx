
import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Shield,
  DollarSign,
  Mail,
  Bell,
  Users,
  Database,
  Server,
  Key,
  Palette,
  Monitor,
  Save,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeroCarousel } from '@/components/blocks/hero-carousel';

const MasterSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'A2 Tickets 360',
    siteDescription: 'Plataforma completa para eventos',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveEvents: false,
    defaultCommission: 5,
    maxFileSize: 10,
    supportEmail: 'suporte@A2 Tickets 360.com',
    adminEmail: 'admin@A2 Tickets 360.com',
    enableNotifications: true,
    enableSMS: false,
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo'
  });

  // Hero slides para demonstração do carousel
  const heroSlides = [
    {
      id: '1',
      title: 'Configurações Master',
      description: 'Gerencie todas as configurações da plataforma A2 Tickets 360',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop',
      backgroundUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&auto=format&fit=crop',
      date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      location: 'Painel Administrativo',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      category: 'ADMINISTRAÇÃO',
      price: 'Controle Total',
      rating: 5.0,
      link: '/master/settings',
      tags: ['Admin', 'Configurações', 'Master']
    }
  ];

  const handleSaveSettings = () => {
    console.log('Salvando configurações:', settings);
    // Aqui você implementaria a lógica para salvar as configurações
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Hero Carousel Section */}
        <div className="relative -mx-6 -mt-6 mb-8">
          <HeroCarousel slides={heroSlides} autoPlayDelay={8000} />
        </div>

        {/* Main Settings Content */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Configurações Master</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie todas as configurações da plataforma A2 Tickets 360
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
              <TabsTrigger value="general" className="flex items-center gap-2 py-3">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 py-3">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2 py-3">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Pagamentos</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2 py-3">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Aparência</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2 py-3">
                <Server className="h-4 w-4" />
                <span className="hidden sm:inline">Sistema</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações Gerais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Email de Suporte</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => updateSetting('supportEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="siteDescription">Descrição do Site</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => updateSetting('siteDescription', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações de Segurança
                </h3>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label>Modo de Manutenção</Label>
                      <p className="text-sm text-muted-foreground">
                        Ativar para impedir acesso público ao site
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label>Permitir Registros</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir novos usuários se registrarem
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowRegistration}
                      onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label>Verificação de Email Obrigatória</Label>
                      <p className="text-sm text-muted-foreground">
                        Exigir verificação de email para novos usuários
                      </p>
                    </div>
                    <Switch
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configurações de Pagamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCommission">Comissão Padrão (%)</Label>
                    <Input
                      id="defaultCommission"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.defaultCommission}
                      onChange={(e) => updateSetting('defaultCommission', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label>Aprovar Eventos Automaticamente</Label>
                      <p className="text-sm text-muted-foreground">
                        Eventos são aprovados sem revisão manual
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoApproveEvents}
                      onCheckedChange={(checked) => updateSetting('autoApproveEvents', checked)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Notificações
                </h3>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificações por email
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label>Notificações por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificações por SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableSMS}
                      onCheckedChange={(checked) => updateSetting('enableSMS', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email do Administrador</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => updateSetting('adminEmail', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Configurações de Aparência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="auto">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Configurações do Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxFileSize}
                      onChange={(e) => updateSetting('maxFileSize', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">América/São Paulo</SelectItem>
                        <SelectItem value="America/New_York">América/Nova York</SelectItem>
                        <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MasterSettings;
