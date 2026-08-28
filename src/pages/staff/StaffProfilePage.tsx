import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, User } from 'lucide-react';
import { UploadCloud } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const COMMON_STATES = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

interface ProfessionalFunction {
    id: string;
    name: string;
    slug: string;
    category: string;
}

export default function StaffProfilePage() {
    const { user, refreshCapabilities } = useAuth();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [catalog, setCatalog] = useState<ProfessionalFunction[]>([]);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        birthDate: '',
        city: '',
        state: '',
        avatarUrl: '',
        bio: '',
        professionalFunctionIds: [] as string[]
    });

    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Usuário não autenticado");

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
            
            // 1. Solicita presign URL
            const presignRes = await fetch(`${apiUrl}/api/uploads/presign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'profile-avatar',
                    fileName: file.name,
                    contentType: file.type || 'image/jpeg',
                    fileSize: file.size
                })
            });

            if (!presignRes.ok) {
                const errorData = await presignRes.json();
                throw new Error(errorData.error || 'Falha ao obter URL de upload');
            }

            const { presignedUrl, publicUrl } = await presignRes.json();

            // 2. Faz o upload para o MinIO/S3
            const uploadRes = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type || 'image/jpeg'
                }
            });

            if (!uploadRes.ok) {
                throw new Error('Falha no envio da foto');
            }

            // 3. Atualiza estado
            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
            
            toast({
                title: "Foto enviada",
                description: "Sua foto de perfil foi carregada com sucesso.",
            });
        } catch (error: any) {
            console.error("[UPLOAD ERROR]", error);
            toast({
                title: "Erro no upload",
                description: error.message || "Não foi possível enviar a foto.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
            
            const profRes = await fetch(`${apiUrl}/api/me/staff-profile`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const catRes = await fetch(`${apiUrl}/api/staff/professional-functions`);
            
            if (profRes.ok && catRes.ok) {
                const pData = await profRes.json();
                const cData = await catRes.json();
                
                setCatalog(cData);
                
                if (pData.profile) {
                    setFormData(prev => ({
                        ...prev,
                        name: pData.profile.name || user?.user_metadata?.name || '',
                        email: pData.profile.email || user?.email || '',
                        cpf: pData.profile.cpf || '',
                        phone: pData.profile.phone || '',
                        birthDate: pData.profile.birthDate ? pData.profile.birthDate.split('T')[0] : '',
                        city: pData.profile.city || '',
                        state: pData.profile.state || '',
                        avatarUrl: pData.profile.avatarUrl || '', // Consumindo diretamente da identidade global
                    }));
                }
                
                if (pData.staffProfile) {
                    setFormData(prev => ({
                        ...prev,
                        bio: pData.staffProfile.bio || ''
                    }));
                }
                
                if (pData.professionalFunctions) {
                    setFormData(prev => ({
                        ...prev,
                        professionalFunctionIds: pData.professionalFunctions.map((f: any) => f.id)
                    }));
                }
            }
        } catch (e) {
            toast({ title: 'Erro ao carregar perfil', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleFunctionToggle = (id: string) => {
        setFormData(prev => {
            const exists = prev.professionalFunctionIds.includes(id);
            if (exists) {
                return { ...prev, professionalFunctionIds: prev.professionalFunctionIds.filter(fid => fid !== id) };
            } else {
                return { ...prev, professionalFunctionIds: [...prev.professionalFunctionIds, id] };
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
            
            const res = await fetch(`${apiUrl}/api/me/staff-profile`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            if (data.success) {
                toast({ title: 'Perfil atualizado com sucesso!' });
                await refreshCapabilities();
            } else {
                toast({ title: 'Erro ao salvar perfil', variant: 'destructive' });
            }
        } catch (e) {
            toast({ title: 'Erro de conexão', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const groupedCatalog = catalog.reduce((acc, func) => {
        if (!acc[func.category]) acc[func.category] = [];
        acc[func.category].push(func);
        return acc;
    }, {} as Record<string, ProfessionalFunction[]>);

    if (loading) {
        return (
            <DashboardLayout title="Meu Perfil Staff" icon={User} role="staff">
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Meu Perfil Staff" icon={User} role="staff">
            <div className="max-w-4xl space-y-8 pb-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
                    
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="flex-shrink-0 w-full sm:w-1/3 space-y-4">
                            <h3 className="text-lg font-bold text-gray-900">Foto Profissional</h3>
                            <p className="text-sm text-gray-500">Usada para sua identificação no evento.</p>
                            <div className="mt-4 flex flex-col items-center sm:items-start">
                                <div className="relative group cursor-pointer w-32 h-32 rounded-full border-2 border-dashed border-gray-200 hover:border-indigo-500 overflow-hidden bg-gray-50 flex items-center justify-center transition-colors">
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-indigo-500">
                                            <UploadCloud className="w-8 h-8 mb-2" />
                                            <span className="text-xs text-center px-2">Clique para<br/>escolher</span>
                                        </div>
                                    )}
                                    
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                        </div>
                                    )}

                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/webp" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleAvatarUpload}
                                        disabled={isUploading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-4 text-center sm:text-left max-w-[12rem]">
                                    Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 5MB.
                                </p>
                            </div>
                        </div>
                        
                        <div className="w-full sm:w-2/3 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Dados Pessoais</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>E-mail (Login)</Label>
                                    <Input value={formData.email} readOnly className="bg-gray-50" />
                                </div>
                                <div>
                                    <Label>Nome Completo</Label>
                                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <Label>CPF</Label>
                                    <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                                </div>
                                <div>
                                    <Label>WhatsApp</Label>
                                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div>
                                    <Label>Data de Nascimento</Label>
                                    <Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Estado (UF)</Label>
                                        <select 
                                            value={formData.state} 
                                            onChange={e => setFormData({...formData, state: e.target.value})} 
                                            className="w-full border-gray-200 rounded-md px-3 py-2 text-sm"
                                        >
                                            <option value="">Selecione</option>
                                            {COMMON_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Cidade</Label>
                                        <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 border-t pt-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Sobre Você</h3>
                            <p className="text-sm text-gray-500 mb-4">Resumo da sua experiência (opcional).</p>
                            <Textarea 
                                value={formData.bio}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                placeholder="Conte sobre sua experiência em eventos..."
                                className="h-24"
                            />
                        </div>
                    </div>

                    <div className="space-y-6 border-t pt-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Funções Profissionais</h3>
                            <p className="text-sm text-gray-500 mb-4">Selecione as áreas em que atua.</p>
                            <div className="space-y-6">
                                {Object.entries(groupedCatalog).map(([category, functions]) => (
                                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-indigo-600 text-sm font-semibold mb-3 uppercase tracking-wider">{category}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {functions.map(f => (
                                                <div key={f.id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={f.id} 
                                                        checked={formData.professionalFunctionIds.includes(f.id)}
                                                        onCheckedChange={() => handleFunctionToggle(f.id)}
                                                    />
                                                    <label htmlFor={f.id} className="text-sm cursor-pointer">{f.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t flex justify-end">
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8" 
                            onClick={handleSave} 
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                            Salvar Alterações
                        </Button>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
