import { useState, useEffect } from 'react';
import { User as UserIcon, Upload, Loader2, Save } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        title: "Perfil Atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível atualizar suas informações. Tente novamente.",
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
        title: "Foto Atualizada",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no Upload",
        description: "Não foi possível enviar a imagem. Verifique o tamanho e formato.",
      });
    } finally {
      setUploadingPhoto(false);
      e.target.value = ''; // Reset input value so the same file can be selected again
    }
  };

  return (
    <DashboardLayout userType={user?.role === 'organizer' ? 'organizer' : 'customer'}>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-16 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
           <div className="space-y-1.5">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Dados Cadastrais</h1>
              <p className="font-medium text-slate-500">
                Gerencie suas informações pessoais.
              </p>
           </div>
        </div>
        
        <Card className="rounded-[2rem] border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50 bg-slate-50/50">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-primary" /> Informações Pessoais
             </CardTitle>
          </CardHeader>
          <CardContent className="p-8 sm:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Nome Completo</Label>
                <Input 
                  name="name"
                  type="text" 
                  className="h-14 rounded-2xl border-gray-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all px-6" 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">E-mail</Label>
                <Input 
                  name="email"
                  type="email" 
                  className="h-14 rounded-2xl border-gray-200 bg-slate-100 text-sm font-semibold focus:ring-0 transition-all px-6 text-slate-500 cursor-not-allowed" 
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Celular</Label>
                <Input 
                  name="phone"
                  type="tel" 
                  className="h-14 rounded-2xl border-gray-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all px-6" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">CPF</Label>
                <Input 
                  name="cpf"
                  type="text" 
                  className="h-14 rounded-2xl border-gray-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all px-6" 
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Data de Nascimento</Label>
                <Input 
                  name="birthDate"
                  type="date" 
                  className="h-14 rounded-2xl border-gray-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all px-6" 
                  value={formData.birthDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Gênero</Label>
                <select 
                  name="gender"
                  className="w-full h-14 px-6 rounded-2xl border-gray-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all border appearance-none outline-none" 
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não dizer">Prefiro não dizer</option>
                </select>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 block">Foto de Perfil</Label>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="h-32 w-32 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center relative group/avatar shrink-0">
                  {uploadingPhoto ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : user?.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt="Perfil" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                     <Upload className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <Button 
                    variant="outline" 
                    disabled={uploadingPhoto} 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="h-12 rounded-xl border-gray-200 text-xs font-black uppercase tracking-widest px-8 shadow-sm hover:bg-slate-50"
                  >
                    {uploadingPhoto ? 'Enviando...' : 'Alterar Foto'}
                  </Button>
                  <p className="text-xs font-medium text-slate-400">PNG, JPG ou WebP. Tamanho máximo: 5MB.</p>
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

            <div className="flex justify-end pt-8 border-t border-gray-100">
              <Button 
                onClick={handleSaveSettings} 
                disabled={loading}
                className="h-14 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest px-10 shadow-md transition-all w-full sm:w-auto"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
