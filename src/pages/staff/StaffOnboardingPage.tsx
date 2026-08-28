import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react';

const COMMON_STATES = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

interface ProfessionalFunction {
    id: string;
    name: string;
    slug: string;
    category: string;
}

export default function StaffOnboardingPage() {
    const { user, loading: authLoading, refreshCapabilities, staffProfileComplete } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [catalogError, setCatalogError] = useState(false);
    
    const [catalog, setCatalog] = useState<ProfessionalFunction[]>([]);
    
    // Form State
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
        if (authLoading) return; // Wait for AuthContext to resolve the session

        if (staffProfileComplete) {
            navigate('/dashboard/staff/invites');
            return;
        }
        loadInitialData();
    }, [staffProfileComplete, navigate, authLoading]);

    const loadInitialData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
            
            // Load Profile Data
            const profRes = await fetch(`${apiUrl}/api/me/staff-profile`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            
            console.log('[STAFF CATALOG AUTH]', {
                hasSession: !!session,
                hasToken: !!session?.access_token,
                tokenPrefix: session?.access_token?.slice(0, 10)
            });

            // Load Catalog
            const catRes = await fetch(`${apiUrl}/api/staff/professional-functions`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            
            let cData: any = [];
            if (catRes.ok) {
                cData = await catRes.json();
                if (Array.isArray(cData)) {
                    setCatalog(cData);
                    setCatalogError(false);
                } else {
                    setCatalogError(true);
                }
            } else {
                setCatalogError(true);
            }
            
            let pData: any = {};
            if (profRes.ok) {
                pData = await profRes.json();
            }

            console.log('[STAFF ONBOARDING]', {
                currentStep: step,
                loading: false,
                error: !profRes.ok || !catRes.ok,
                formData,
                professionalFunctions: cData,
                staffProfileComplete
            });

            console.log('[STAFF FUNCTIONS DEBUG]', {
                authLoading,
                hasSession: !!session,
                hasToken: !!session?.access_token,
                catalogLoading: loading,
                catalogError: !catRes.ok || !Array.isArray(cData),
                catalogLength: cData?.length,
                currentStep: step
            });

            if (pData.profile) {
                setFormData(prev => ({
                    ...prev,
                    name: pData.profile?.name || user?.user_metadata?.name || '',
                    email: pData.profile?.email || user?.email || '',
                    cpf: pData.profile?.cpf || '',
                    phone: pData.profile?.phone || '',
                    birthDate: pData.profile?.birthDate ? pData.profile.birthDate.split('T')[0] : '',
                    city: pData.profile?.city || '',
                    state: pData.profile?.state || '',
                    avatarUrl: pData.profile?.avatarUrl || '', // Consumindo diretamente da identidade global
                }));
            }
            
            if (pData.staffProfile) {
                setFormData(prev => ({
                    ...prev,
                    bio: pData.staffProfile?.bio || ''
                }));
            }
            
            if (pData.professionalFunctions && Array.isArray(pData.professionalFunctions)) {
                setFormData(prev => ({
                    ...prev,
                    professionalFunctionIds: pData.professionalFunctions.map((f: any) => f.id)
                }));
            }
            
        } catch (e) {
            console.error(e);
            toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
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

    const handleComplete = async () => {
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
                toast({ title: 'Perfil concluído com sucesso!' });
                await refreshCapabilities();
                if (!data.profileComplete) {
                     toast({ title: 'Perfil salvo, porém incompleto. Preencha os campos obrigatórios.', variant: 'destructive' });
                     setStep(1);
                }
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

    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-400 w-12 h-12" /></div>;

    return (
        <div className="min-h-screen bg-gray-950 text-white flex justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-white">COMPLETE SEU PERFIL PROFISSIONAL</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Essas informações serão utilizadas para sua identificação e para oportunidades de trabalho em eventos.
                    </p>
                </div>

                <div className="flex flex-col gap-2 mb-8">
                    <div className="text-sm text-gray-400 font-bold mb-1">Etapa {step} de 4</div>
                    <div className="flex gap-2">
                        {[1,2,3,4].map(s => (
                            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-emerald-500' : 'bg-gray-800'}`} />
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 shadow rounded-lg p-6 sm:p-8 text-white">
                    {/* STEP 1: DADOS PESSOAIS */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">1. Dados Pessoais</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-gray-300">E-mail</Label>
                                    <Input value={formData.email} readOnly className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-300">Nome Completo *</Label>
                                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-300">CPF *</Label>
                                    <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-300">WhatsApp *</Label>
                                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-300">Data de Nascimento *</Label>
                                    <Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-gray-300">Estado (UF) *</Label>
                                        <select 
                                            value={formData.state} 
                                            onChange={e => setFormData({...formData, state: e.target.value})} 
                                            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="">Selecione</option>
                                            {COMMON_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-gray-300">Cidade *</Label>
                                        <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-gray-800 border-gray-700 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PERFIL PROFISSIONAL */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">2. Funções em que trabalha *</h3>
                            <p className="text-sm text-gray-400">Selecione pelo menos uma função que você exerce em eventos.</p>
                            
                            {catalogError ? (
                                <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-start gap-3">
                                    <AlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-red-400 font-semibold text-sm">Erro ao carregar o catálogo de funções</h4>
                                        <p className="text-red-300/80 text-xs mt-1">Não foi possível carregar as funções profissionais. Tente novamente mais tarde.</p>
                                    </div>
                                </div>
                            ) : catalog.length === 0 ? (
                                <div className="p-4 bg-gray-800 rounded-lg text-center text-sm text-gray-400">Nenhuma função encontrada.</div>
                            ) : (
                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                    {Object.entries(groupedCatalog).map(([category, functions]) => (
                                        <div key={category}>
                                            <h4 className="text-emerald-400 text-sm font-semibold mb-3">{category}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {functions.map(f => (
                                                    <div key={f.id} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={f.id} 
                                                            checked={formData.professionalFunctionIds.includes(f.id)}
                                                            onCheckedChange={() => handleFunctionToggle(f.id)}
                                                            className="border-gray-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                        />
                                                        <label htmlFor={f.id} className="text-sm cursor-pointer text-gray-200">{f.name}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: APRESENTAÇÃO */}
                    {step === 3 && (
                        <div className="space-y-8">
                            <div className="space-y-4 flex flex-col items-center justify-center">
                                <h3 className="text-lg font-medium text-white self-start">3. Apresentação: Foto Profissional *</h3>
                                <p className="text-sm text-gray-400 self-start">Use uma foto nítida do rosto. Ela poderá ser utilizada para identificação durante os eventos.</p>
                                
                                <div className="mt-4 flex flex-col items-center">
                                    <div className="relative group cursor-pointer w-32 h-32 rounded-full border-2 border-dashed border-gray-600 hover:border-emerald-500 overflow-hidden bg-gray-800 flex items-center justify-center transition-colors">
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-emerald-500">
                                                <UploadCloud className="w-8 h-8 mb-2" />
                                                <span className="text-xs text-center px-2">Clique para<br/>escolher</span>
                                            </div>
                                        )}
                                        
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
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
                                    <p className="text-xs text-gray-500 mt-4 text-center max-w-xs">
                                        Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 5MB.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-white">Sobre você (Opcional)</h3>
                                <Label className="text-gray-300">Conte um pouco sobre sua experiência em eventos</Label>
                                <Textarea 
                                    value={formData.bio}
                                    onChange={e => setFormData({...formData, bio: e.target.value})}
                                    placeholder="Ex: Trabalho com atendimento e credenciamento há 3 anos e já participei de shows, feiras e eventos corporativos."
                                    className="h-32 bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVISÃO */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-center text-white">4. Revisão do Perfil</h3>
                            
                            <div className="flex flex-col items-center">
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 mb-4" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 mb-4 flex items-center justify-center text-xs text-gray-500">Sem Foto</div>
                                )}
                                <h4 className="text-xl font-bold text-white">{formData.name || 'Nome não informado'}</h4>
                                <p className="text-gray-400 text-sm">{formData.city || 'Cidade'} / {formData.state || 'UF'}</p>
                                <p className="text-gray-400 text-sm">{formData.phone || 'Telefone'}</p>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h5 className="font-semibold text-emerald-400 mb-2">Funções Selecionadas:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {formData.professionalFunctionIds.length === 0 && (
                                        <span className="text-gray-500 text-sm">Nenhuma selecionada</span>
                                    )}
                                    {catalog.filter(c => formData.professionalFunctionIds.includes(c.id)).map(f => (
                                        <span key={f.id} className="px-2 py-1 bg-gray-700 text-white rounded text-xs">{f.name}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-between pt-6 border-t border-gray-800">
                        {step > 1 ? (
                            <Button variant="outline" className="text-white border-gray-700 hover:bg-gray-800" onClick={() => setStep(s => s - 1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                            </Button>
                        ) : <div />}
                        
                        {step < 4 ? (
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setStep(s => s + 1)} disabled={step === 3 && !formData.avatarUrl}>
                                Continuar <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleComplete} disabled={saving}>
                                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <><CheckCircle2 className="mr-2 h-5 w-5" /> CONCLUIR MEU PERFIL</>}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
