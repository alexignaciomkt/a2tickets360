
import { useState, useEffect } from 'react';
import { User as UserIcon, Bell, Shield, CreditCard, LogOut, Upload, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';

const Settings = () => {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    gender: '',
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        cpf: user.cpf || '',
        birthDate: user.birthDate || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await organizerService.updateProfile(user.profileDocId || '', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        gender: formData.gender,
      }, user.id);
      
      await refreshUser();
      
      toast({
        title: "Configurações salvas",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível atualizar suas informações.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    
    setUploadingPhoto(true);
    try {
      const file = e.target.files[0];
      const { url } = await organizerService.uploadImage(file, user.id, user.name, undefined, user.role);
      
      await organizerService.updateProfile(user.profileDocId || '', {
        logoUrl: url,
        photo_url: url
      }, user.id);
      
      await refreshUser();
      
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível carregar sua foto.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <DashboardLayout userType={user?.role === 'organizer' ? 'organizer' : 'customer'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-gray-600">Gerencie suas preferências e configurações de conta</p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
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
                      name="name"
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Email</label>
                    <input 
                      name="email"
                      type="email" 
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Telefone / WhatsApp</label>
                    <input 
                      name="phone"
                      type="tel" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">CPF</label>
                    <input 
                      name="cpf"
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Data de Nascimento</label>
                    <input 
                      name="birthDate"
                      type="date" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      value={formData.birthDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Gênero</label>
                    <select 
                      name="gender"
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                      <option value="Prefiro não dizer">Prefiro não dizer</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Foto de Perfil</label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-gray-100 overflow-hidden border-2 border-indigo-100 flex items-center justify-center">
                      {uploadingPhoto ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : user?.photoUrl ? (
                        <img 
                          src={user.photoUrl} 
                          alt="Foto de perfil" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div className="relative">
                      <Button variant="outline" disabled={uploadingPhoto} onClick={() => document.getElementById('avatar-upload')?.click()}>
                        {uploadingPhoto ? 'Enviando...' : 'Alterar foto'}
                      </Button>
                      <input 
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salvar alterações
                  </Button>
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
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveSettings}>Alterar senha</Button>
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
