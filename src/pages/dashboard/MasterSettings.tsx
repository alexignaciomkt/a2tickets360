
import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Shield,
  DollarSign,
  Bell,
  Users,
  Database,
  Server,
  Key,
  Palette,
  Monitor,
  Save,
  RefreshCw,
  Mail,
  Lock,
  Zap,
  Layout,
  HardDrive,
  ChevronRight,
  ShieldCheck,
  Cpu,
  History,
  Target,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MasterSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'TICKETERA PREMIUM',
    siteDescription: 'Plataforma de alta fidelidade para gestão de eventos e ingressos.',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveEvents: false,
    defaultCommission: 5,
    maxFileSize: 10,
    supportEmail: 'suporte@ticketera.com.br',
    adminEmail: 'admin@ticketera.com.br',
    enableNotifications: true,
    enableSMS: false,
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo'
  });

  const handleSaveSettings = () => {
    console.log('Salvando configurações:', settings);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-16 animate-in fade-in duration-1000 pb-20">
        
        {/* Settings Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Configurações Globais</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Gestão de segurança, taxas da plataforma e parâmetros do sistema Ticketera.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                className="h-8 text-xs font-medium px-3 shadow-sm transition-all rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              >
                <History className="w-3 h-3 mr-1.5" /> Histórico
              </Button>
              <Button 
                onClick={handleSaveSettings}
                className="h-8 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium px-3 shadow-sm transition-all rounded-md"
              >
                <Save className="w-3 h-3 mr-1.5" /> Salvar Configurações
              </Button>
           </div>
        </div>

        <Tabs defaultValue="general" className="w-full space-y-12">
          <div className="bg-gray-50/50 p-2 rounded-full border-2 border-gray-100 shadow-inner inline-flex">
            <TabsList className="bg-transparent h-auto p-0 gap-2">
              {[
                { v: 'general', l: 'Global Matrix', i: Globe },
                { v: 'security', l: 'Identity Protocol', i: Shield },
                { v: 'payments', l: 'Financial Flux', i: DollarSign },
                { v: 'notifications', l: 'Audit Alerts', i: Bell },
                { v: 'system', l: 'Infra Cluster', i: Cpu },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.v}
                  value={tab.v} 
                  className="rounded-full px-10 py-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all shadow-none border border-transparent"
                >
                  <tab.i className="w-4 h-4 mr-3" /> {tab.l}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="general" className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Card className="rounded-[4rem] border-gray-100 shadow-sm bg-white overflow-hidden border-2 group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1500">
              <CardHeader className="p-16 border-b-2 border-gray-50 bg-gray-50/20 py-12">
                 <CardTitle className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300 flex items-center gap-6">
                    <Layout className="w-7 h-7 text-slate-900" /> Branding & Root Matrix Attributes
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-4 group/field">
                    <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 leading-none flex items-center gap-3 transition-colors group-focus-within/field:text-slate-900"><Target className="w-4 h-4" /> Instance Identity Alpha Name</Label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                      className="h-18 rounded-[2rem] border-2 border-gray-100 bg-gray-50/30 text-[14px] font-black uppercase tracking-tight focus:ring-[12px] focus:ring-slate-50 focus:border-slate-900 transition-all px-10 shadow-inner"
                    />
                  </div>
                  <div className="space-y-4 group/field">
                    <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 leading-none flex items-center gap-3 transition-colors group-focus-within/field:text-slate-900"><Mail className="w-4 h-4" /> Master Node Support Hub Email</Label>
                    <Input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => updateSetting('supportEmail', e.target.value)}
                      className="h-18 rounded-[2rem] border-2 border-gray-100 bg-gray-50/30 text-[14px] font-black tracking-tight focus:ring-[12px] focus:ring-slate-50 focus:border-slate-900 transition-all px-10 lowercase shadow-inner"
                    />
                  </div>
                  <div className="space-y-4 md:col-span-2 group/field">
                    <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 leading-none flex items-center gap-3 transition-colors group-focus-within/field:text-slate-900"><FileText className="w-4 h-4" /> Registry Description (SEO Metadata Matrix)</Label>
                    <Textarea
                      value={settings.siteDescription}
                      onChange={(e) => updateSetting('siteDescription', e.target.value)}
                      rows={6}
                      className="rounded-[3rem] border-2 border-gray-100 bg-gray-50/30 text-[14px] font-bold uppercase tracking-tight focus:ring-[12px] focus:ring-slate-50 focus:border-slate-900 p-12 leading-relaxed shadow-inner"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Card className="rounded-[4rem] border-gray-100 shadow-sm bg-white overflow-hidden border-2 group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1500">
              <CardHeader className="p-16 border-b-2 border-gray-50 bg-gray-50/20 py-12">
                 <CardTitle className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300 flex items-center gap-6">
                    <ShieldCheck className="w-7 h-7 text-slate-900" /> Root Access & Identity Protocols
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-16 space-y-6">
                {[
                  { id: 'maintenanceMode', label: 'Kernel Maintenance Protocol', desc: 'Bloqueia o acesso público, APIs de checkout e fluxos de transação imediatamente.', color: 'rose' },
                  { id: 'allowRegistration', label: 'Global Node Registration Flux', desc: 'Habilita o onboarding protocolar de novos produtores e clientes no cluster de dados.', color: 'emerald' },
                  { id: 'requireEmailVerification', label: 'Authorized Verification Logic (2FA)', desc: 'Exige validação de e-mail por protocolo SMTP seguro para ativar novos nós no sistema.', color: 'slate' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-12 border-b-2 border-gray-50 last:border-0 px-12 hover:bg-gray-50/50 rounded-[3rem] transition-all group/row border-b-2 border-transparent hover:border-slate-50">
                    <div className="space-y-3">
                      <Label className="text-[16px] font-black uppercase tracking-tight text-slate-900 leading-none block group-hover/row:translate-x-2 transition-transform duration-700">{item.label}</Label>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none opacity-60 group-hover/row:opacity-100 transition-opacity">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(settings as any)[item.id]}
                      onCheckedChange={(checked) => updateSetting(item.id, checked)}
                      className={`scale-150 data-[state=checked]:${item.color === 'rose' ? 'bg-rose-500' : item.color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-900'} shadow-2xl transition-all`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <Card className="rounded-[4rem] border-gray-100 shadow-sm bg-white overflow-hidden border-2 group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1500">
              <CardHeader className="p-16 border-b-2 border-gray-50 bg-gray-50/20 py-12">
                 <CardTitle className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300 flex items-center gap-6">
                    <Zap className="w-7 h-7 text-slate-900" /> Global Financial Flux Alpha Rules
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                   <div className="space-y-12">
                      <div className="space-y-5 group/field">
                        <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 ml-8 leading-none flex items-center gap-3 transition-colors group-focus-within/field:text-slate-900"><Database className="w-5 h-5" /> Default Platform Asset Fee (%)</Label>
                        <Input
                          type="number"
                          value={settings.defaultCommission}
                          onChange={(e) => updateSetting('defaultCommission', Number(e.target.value))}
                          className="h-20 rounded-[2.5rem] border-2 border-gray-100 bg-gray-50/30 text-[18px] font-black tabular-nums focus:ring-[15px] focus:ring-slate-50 focus:border-slate-900 transition-all px-12 shadow-inner"
                        />
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-6 px-8 leading-relaxed opacity-60">Taxa aplicada sistematicamente a todos os novos nós financeiros registrados no cluster global.</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between bg-slate-900 p-16 rounded-[4rem] text-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group/switch border-4 border-slate-800">
                      <div className="absolute -right-12 -top-12 opacity-5 group-hover/switch:opacity-10 group-hover:scale-150 transition-all duration-1500"><Zap className="w-56 h-56" /></div>
                      <div className="space-y-4 relative z-10">
                        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 leading-none mb-2">Asset Auto-Approval Alpha Protocol</p>
                        <p className="text-[20px] font-black uppercase tracking-tight leading-none group-hover:translate-x-2 transition-transform duration-1000">Ignorar auditoria manual hierarchy</p>
                      </div>
                      <Switch
                        checked={settings.autoApproveEvents}
                        onCheckedChange={(checked) => updateSetting('autoApproveEvents', checked)}
                        className="scale-[2.2] data-[state=checked]:bg-emerald-500 relative z-10 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all"
                      />
                   </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-0 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Card className="rounded-[4rem] border-gray-100 shadow-sm bg-white overflow-hidden border-2 group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1500">
              <CardHeader className="p-16 border-b-2 border-gray-50 bg-gray-50/20 py-12">
                 <CardTitle className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300 flex items-center gap-6">
                    <Server className="w-7 h-7 text-slate-900" /> Infrastructure Node Cluster Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-5 group/field">
                    <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 ml-8 leading-none flex items-center gap-3 transition-colors group-focus-within/field:text-slate-900"><HardDrive className="w-5 h-5" /> Media Server Cluster Load Limit</Label>
                    <Select value={String(settings.maxFileSize)} onValueChange={(v) => updateSetting('maxFileSize', Number(v))}>
                      <SelectTrigger className="h-20 rounded-[2.5rem] border-2 border-gray-100 bg-gray-50/30 text-[14px] font-black uppercase tracking-tight focus:ring-[15px] focus:ring-slate-50 focus:border-slate-900 transition-all px-12 shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[2.5rem] border-none shadow-[0_50px_100px_rgba(0,0,0,0.4)] p-5 bg-white border-4 border-slate-50 animate-in zoom-in-95 duration-500">
                        <SelectItem value="5" className="text-[12px] font-black uppercase p-5 rounded-[1.5rem] focus:bg-slate-900 focus:text-white transition-all mb-2 cursor-pointer">5 MB (Root Basic Node)</SelectItem>
                        <SelectItem value="10" className="text-[12px] font-black uppercase p-5 rounded-[1.5rem] focus:bg-slate-900 focus:text-white transition-all mb-2 cursor-pointer">10 MB (Premium Global Flux)</SelectItem>
                        <SelectItem value="25" className="text-[12px] font-black uppercase p-5 rounded-[1.5rem] focus:bg-slate-900 focus:text-white transition-all cursor-pointer">25 MB (Enterprise Alpha Kernel)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-5 group/field">
                    <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 ml-8 leading-none flex items-center gap-3 transition-colors group-focus-within/field:text-slate-900"><Clock className="w-5 h-5" /> Temporal Node Timezone Protocol</Label>
                    <Select value={settings.timezone} onValueChange={(v) => updateSetting('timezone', v)}>
                      <SelectTrigger className="h-20 rounded-[2.5rem] border-2 border-gray-100 bg-gray-50/30 text-[14px] font-black uppercase tracking-tight focus:ring-[15px] focus:ring-slate-50 focus:border-slate-900 transition-all px-12 shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[2.5rem] border-none shadow-[0_50px_100px_rgba(0,0,0,0.4)] p-5 bg-white border-4 border-slate-50 animate-in zoom-in-95 duration-500">
                        <SelectItem value="America/Sao_Paulo" className="text-[12px] font-black uppercase p-5 rounded-[1.5rem] focus:bg-slate-900 focus:text-white transition-all mb-2 cursor-pointer">América / São Paulo (UTC-3)</SelectItem>
                        <SelectItem value="America/New_York" className="text-[12px] font-black uppercase p-5 rounded-[1.5rem] focus:bg-slate-900 focus:text-white transition-all mb-2 cursor-pointer">América / New York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London" className="text-[12px] font-black uppercase p-5 rounded-[1.5rem] focus:bg-slate-900 focus:text-white transition-all cursor-pointer">Europa / Londres (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
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

export default MasterSettings;
