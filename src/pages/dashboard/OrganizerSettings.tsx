
import { useState } from 'react';
import { User, Bell, Shield, Store, Palette, CreditCard, LogOut } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

const OrganizerSettings = () => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações do Organizador</h1>
          <p className="text-gray-600">Gerencie suas preferências e configurações profissionais</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil Profissional
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Loja/FanPage
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Identidade Visual
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
                <CardDescription>
                  Atualize suas informações como organizador de eventos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1">Nome da Empresa/Organizador</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="EventPro Produções"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">CNPJ</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="12.345.678/0001-90"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Email Corporativo</label>
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="contato@eventpro.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Telefone</label>
                    <input
                      type="tel"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Biografia/Descrição da Empresa</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    defaultValue="Empresa especializada em produção de eventos musicais e culturais com mais de 10 anos de experiência no mercado."
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Salvar alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Loja/FanPage</CardTitle>
                <CardDescription>
                  Gerencie sua página de divulgação e loja virtual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ativar Loja Virtual</p>
                      <p className="text-sm text-gray-500">Permita vendas de produtos além de eventos</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Página Pública Ativa</p>
                      <p className="text-sm text-gray-500">Sua fanpage estará visível para o público</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">URL da Página</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue="sanjapass.com/eventpro"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline">Prévia da Página</Button>
                  <Button onClick={handleSaveSettings}>Salvar configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>
                  Personalize a aparência da sua página e eventos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1">Logo da Empresa</label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Store className="h-8 w-8 text-gray-400" />
                      </div>
                      <Button variant="outline">Alterar Logo</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Cor Principal</label>
                    <div className="flex items-center gap-4">
                      <input type="color" defaultValue="#3B82F6" className="w-12 h-8 rounded" />
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        defaultValue="#3B82F6"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Salvar identidade</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Personalize como e quando deseja ser notificado sobre seus eventos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificações de vendas</p>
                      <p className="text-sm text-gray-500">Seja notificado a cada venda de ingresso</p>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Relatórios diários</p>
                      <p className="text-sm text-gray-500">Receba resumo diário de vendas</p>
                    </div>
                    <Switch
                      checked={emailNotificationsEnabled}
                      onCheckedChange={setEmailNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alertas de evento</p>
                      <p className="text-sm text-gray-500">Notificações importantes sobre seus eventos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Salvar preferências</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Gerencie sua senha e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Senha atual</label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Nova senha</label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Confirmar nova senha</label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveSettings}>Alterar senha</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Pagamento</CardTitle>
                <CardDescription>
                  Gerencie suas contas bancárias para recebimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 font-medium italic">Gerencie sua conta na A2 Tickets 360.</p>
                        <p className="text-sm text-gray-500">Agência 1234-5 • Conta 12345-6</p>
                      </div>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full">+ Adicionar nova conta bancária</Button>
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
