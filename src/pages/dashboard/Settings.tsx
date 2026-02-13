
import { useState } from 'react';
import { User, Bell, Shield, CreditCard, LogOut } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
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
    <DashboardLayout userType="customer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-gray-600">Gerencie suas preferências e configurações de conta</p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
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
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1">Nome</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      defaultValue="João da Silva"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      defaultValue="joao.silva@exemplo.com" 
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
                  <div>
                    <label className="text-sm font-medium block mb-1">Data de Nascimento</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      defaultValue="1990-01-01" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Foto de Perfil</label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden">
                      <img 
                        src="https://randomuser.me/api/portraits/men/32.jpg" 
                        alt="Foto de perfil" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <Button variant="outline">Alterar foto</Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Salvar alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Personalize como e quando deseja ser notificado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificações push</p>
                      <p className="text-sm text-gray-500">Receba alertas em tempo real</p>
                    </div>
                    <Switch 
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Emails de marketing</p>
                      <p className="text-sm text-gray-500">Receba novidades e promoções</p>
                    </div>
                    <Switch 
                      checked={emailNotificationsEnabled}
                      onCheckedChange={setEmailNotificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lembretes de eventos</p>
                      <p className="text-sm text-gray-500">Seja lembrado antes dos eventos</p>
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
                
                <div className="my-6 border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Ações da conta</h3>
                  <div className="flex flex-col space-y-3">
                    <Button variant="destructive" className="flex items-center gap-2 w-full sm:w-auto">
                      <LogOut className="h-4 w-4" />
                      Sair de todos os dispositivos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>
                  Gerencie seus cartões e métodos de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 text-white p-2 rounded-md">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">Cartão Mastercard</p>
                        <p className="text-sm text-gray-500">Termina em 4242 • Expira em 03/25</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Remover</Button>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">+ Adicionar novo método de pagamento</Button>
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

export default Settings;
