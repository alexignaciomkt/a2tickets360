
import { useState, useEffect } from 'react';
import { User as UserIcon, Bell, Shield, CreditCard, LogOut, Upload, Loader2, Target, Mail, Phone, Hash, Calendar, History, Save, ShieldCheck, Zap } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        title: "Node Updated",
        description: "Suas informações foram sincronizadas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Não foi possível atualizar suas informações no cluster.",
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
        title: "Identity Asset Updated",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Não foi possível carregar o ativo de imagem.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <DashboardLayout userType={user?.role === 'organizer' ? 'organizer' : 'customer'}>
      <div className="space-y-12 animate-in fade-in duration-1000 pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
           <div className="space-y-1.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Identity Configuration</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                Gestão de preferências, ativos de identidade e protocolos de comunicação.
              </p>
           </div>
           
           <div className="flex bg-gray-100/50 p-1.5 rounded-full border border-gray-100 shadow-inner">
            <Tabs defaultValue="profile" className="w-auto">
              <TabsList className="bg-transparent h-auto p-0 gap-1.5">
                {[
                  { v: 'profile', l: 'Identity', i: UserIcon },
                  { v: 'notifications', l: 'Alerts', i: Bell },
                  { v: 'security', l: 'Protocol', i: Shield },
                  { v: 'payment', l: 'Financial', i: CreditCard },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.v}
                    value={tab.v} 
                    className="rounded-full px-8 py-3 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xl transition-all shadow-none"
                  >
                    <tab.i className="w-3.5 h-3.5 mr-2" /> {tab.l}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
           </div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full space-y-12">
          <TabsContent value="profile" className="mt-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
              <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20">
                 <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
                    <Target className="w-5 h-5 text-slate-900" /> Root Identity Metadata
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Authorized Full Name</Label>
                    <Input 
                      name="name"
                      type="text" 
                      className="h-16 rounded-[1.8rem] border-gray-100 bg-gray-50/50 text-[12px] font-black uppercase tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8" 
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Encrypted Email Address</Label>
                    <Input 
                      name="email"
                      type="email" 
                      className="h-16 rounded-[1.8rem] border-gray-100 bg-gray-50/50 text-[12px] font-black tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8 opacity-50 cursor-not-allowed" 
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Temporal Phone Node</Label>
                    <Input 
                      name="phone"
                      type="tel" 
                      className="h-16 rounded-[1.8rem] border-gray-100 bg-gray-50/50 text-[12px] font-black tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Identity Protocol (CPF)</Label>
                    <Input 
                      name="cpf"
                      type="text" 
                      className="h-16 rounded-[1.8rem] border-gray-100 bg-gray-50/50 text-[12px] font-black tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8" 
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Registry Birth Date</Label>
                    <Input 
                      name="birthDate"
                      type="date" 
                      className="h-16 rounded-[1.8rem] border-gray-100 bg-gray-50/50 text-[12px] font-black tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8" 
                      value={formData.birthDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Gender Classification</Label>
                    <select 
                      name="gender"
                      className="w-full h-16 px-8 rounded-[1.8rem] border-gray-100 bg-gray-50/50 text-[12px] font-black uppercase tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 appearance-none" 
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    >
                      <option value="">Select Protocol</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                      <option value="Prefiro não dizer">Prefiro não dizer</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-6 block">Identity Visual Asset</Label>
                  <div className="flex items-center gap-10">
                    <div className="h-28 w-28 rounded-[2.5rem] bg-gray-50 overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center relative group/avatar">
                      {uploadingPhoto ? (
                        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
                      ) : user?.photoUrl ? (
                        <img 
                          src={user.photoUrl} 
                          alt="Identity" 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                        />
                      ) : (
                        <UserIcon className="h-10 w-10 text-slate-200" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                         <Upload className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        disabled={uploadingPhoto} 
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="h-11 rounded-full border-gray-100 text-[10px] font-black uppercase tracking-widest px-8 shadow-sm hover:bg-gray-50"
                      >
                        {uploadingPhoto ? 'Transferring Node...' : 'Update Asset'}
                      </Button>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none px-2">PNG, JPG ou WebP. Max 10MB.</p>
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

                <div className="flex justify-end pt-8 border-t border-gray-50">
                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={loading}
                    className="h-14 rounded-full bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] px-12 shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 group"
                  >
                    {loading ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />}
                    Commit Identity Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
              <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20">
                 <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
                    <Bell className="w-5 h-5 text-slate-900" /> Alert Protocol Preferences
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-6">
                {[
                  { id: 'push', label: 'Push Alert Protocol', desc: 'Receba alertas de kernel em tempo real no dispositivo.', icon: Zap },
                  { id: 'marketing', label: 'Inbound Alpha Stream', desc: 'Receba novidades, promoções e updates do ecossistema.', icon: Mail }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-10 border-b border-gray-50 last:border-0 px-8 hover:bg-gray-50/50 rounded-[2rem] transition-all group/item">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-slate-400 group-hover/item:bg-slate-900 group-hover/item:text-white transition-all shadow-sm">
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[13px] font-black uppercase tracking-tight text-slate-900 leading-none block">{item.label}</Label>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.desc}</p>
                       </div>
                    </div>
                    <Switch 
                      checked={item.id === 'push' ? notificationsEnabled : emailNotificationsEnabled}
                      onCheckedChange={item.id === 'push' ? setNotificationsEnabled : setEmailNotificationsEnabled}
                      className="scale-125 data-[state=checked]:bg-slate-900"
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-8">
                  <Button 
                    onClick={handleSaveSettings}
                    className="h-11 rounded-full bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-10 transition-all shadow-xl shadow-slate-100"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
              <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20">
                 <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
                    <ShieldCheck className="w-5 h-5 text-slate-900" /> Root Access Protocols
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Current Access Key</Label>
                    <Input 
                      type="password" 
                      className="h-16 rounded-[1.8rem] border-gray-100 bg-gray-50/50 text-[12px] font-black tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">New Access Node</Label>
                    <Input 
                      type="password" 
                      className="h-16 rounded-[1.8rem] border-gray-100 bg-gray-50/50 text-[12px] font-black tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-8 border-t border-gray-50">
                  <Button 
                    onClick={handleSaveSettings}
                    className="h-14 rounded-full bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] px-12 shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <ShieldCheck className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" /> Rotate Security Node
                  </Button>
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
