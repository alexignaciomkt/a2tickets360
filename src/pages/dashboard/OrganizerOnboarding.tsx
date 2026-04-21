import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Building2, Palette, Landmark, CheckCircle2,
    ArrowLeft, ArrowRight, Camera, Upload, ShieldCheck,
    MapPin, Sparkles, Building, Briefcase, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import { webhookService } from '@/services/webhookService';
import { supabase } from '@/lib/supabase';
import EventWizardStepper from '@/components/events/EventWizardStepper';

const STEPS = [
    { number: 1, title: 'Identidade Visual', icon: <Palette className="h-4 w-4" /> },
    { number: 2, title: 'Dados Pessoais', icon: <User className="h-4 w-4" /> },
    { number: 3, title: 'Documentos', icon: <FileText className="h-4 w-4" /> },
    { number: 4, title: 'Financeiro', icon: <Landmark className="h-4 w-4" /> },
    { number: 5, title: 'Seu Feed', icon: <Camera className="h-4 w-4" /> },
];

const OrganizerOnboarding = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedPosts, setFeedPosts] = useState<any[]>([]);
    const isInitializing = useRef(true);

    // Form State
    const [formData, setFormData] = useState({
        // Visual (Step 1)
        companyName: '',
        bio: '',
        logoUrl: '',
        bannerUrl: '',
        slug: '',
        category: '',
        instagramUrl: '',
        facebookUrl: '',
        whatsappNumber: '',
        websiteUrl: '',

        // Pessoal (Step 2)
        cpf: '',
        rg: '',
        phone: '',
        birthDate: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        documentFrontUrl: '',
        documentBackUrl: '',
        cnpj: '',
        companyAddress: '',

        // Financeiro (Step 3)
        asaasApiKey: '',
        lastStep: 1,
    });

    const [previews, setPreviews] = useState({
        docFront: null as string | null,
        docBack: null as string | null,
        logo: null as string | null,
        banner: null as string | null,
    });

    const [lastSavedData, setLastSavedData] = useState<string>('');

    // Auto-save logic with debounce
    useEffect(() => {
        // Bloqueia auto-save se estiver inicializando ou salvando
        if (isInitializing.current || loading || saving) return;

        const currentDataStr = JSON.stringify(formData);

        // Persistência local imediata para segurança do usuário
        if (user?.id) {
            localStorage.setItem(`onboarding_draft_${user.id}`, currentDataStr);
        }

        if (lastSavedData && currentDataStr !== lastSavedData) {
            const timer = setTimeout(() => {
                console.log('⏱️ [AutoSave] Detectada mudança, salvando rascunho...');
                saveProfile();
            }, 2000); // 2 seconds debounce
            return () => clearTimeout(timer);
        }
    }, [formData, loading, saving, lastSavedData, user?.id]);

    useEffect(() => {
        const init = async () => {
            if (user?.id) {
                isInitializing.current = true;
                setLoading(true);
                console.log('🚀 [Onboarding] Iniciando carga de dados...');

                try {
                    let pendingData: any = {};
                    const pendingReg = localStorage.getItem('A2Tickets_PendingRegistration');
                    
                    if (pendingReg) {
                        try {
                            const parsed = JSON.parse(pendingReg);
                            const isCpf = parsed.cnpj?.replace(/\D/g, '').length === 11;
                            pendingData = { ...parsed };
                            if (isCpf) {
                                pendingData.cpf = parsed.cnpj;
                                pendingData.cnpj = '';
                            }
                            localStorage.removeItem('A2Tickets_PendingRegistration');
                            
                            console.log('📦 [Onboarding] Processando dados pendentes do registro...');
                            await organizerService.updateProfile(user.profileDocId || '', pendingData, user.id);
                        } catch (e) {
                            console.error('Erro ao processar registro pendente:', e);
                        }
                    }

                    const localDraft = localStorage.getItem(`onboarding_draft_${user.id}`);
                    let draftData: any = {};
                    if (localDraft) {
                        try {
                            draftData = JSON.parse(localDraft);
                        } catch (e) {
                            console.error('Erro ao ler rascunho local:', e);
                        }
                    }
                    
                    await loadProfile(pendingData, draftData);
                } finally {
                    setLoading(false);
                    // Delay maior para garantir que o AuthContext e o banco estabilizaram
                    setTimeout(() => {
                        isInitializing.current = false;
                        console.log('✅ [Onboarding] Inicialização completa. Auto-save liberado.');
                    }, 1500);
                }
            }
        };
        init();
    }, [user?.id]);

    const loadProfile = async (pendingOverrides: any = {}, draftOverrides: any = {}) => {
        try {
            setLoading(true);
            const profile = await organizerService.getProfile(user!.id);
            if (profile) {
                // Remove internal fields that shouldn't be in formData for saving
                const { id, email, createdAt, updatedAt, passwordHash, ...safeProfile } = profile;

                // Map data with priority: Pending (signup) > Draft (local) > Profile (DB)
                // Map data with priority: DB > Signup Overrides
                const mappedData = {
                    ...formData,
                    ...profile,
                    companyName: pendingOverrides.companyName || profile.company_name || profile.companyName || formData.companyName,
                    logoUrl: profile.logo_url || profile.logoUrl || formData.logoUrl,
                    bannerUrl: profile.banner_url || profile.bannerUrl || formData.bannerUrl,
                    slug: pendingOverrides.slug || profile.slug || formData.slug,
                    phone: pendingOverrides.phone || profile.phone || formData.phone,
                    cnpj: pendingOverrides.cnpj || profile.cnpj || profile.cpf_cnpj || formData.cnpj,
                    documentFrontUrl: profile.document_front_url || profile.documentFrontUrl || formData.documentFrontUrl,
                    documentBackUrl: profile.document_back_url || profile.documentBackUrl || formData.documentBackUrl,
                    ...draftOverrides,
                    ...pendingOverrides
                };

                setFormData(mappedData);

                // Retomar do último passo salvo
                if (profile.last_step && profile.last_step > 0 && profile.last_step <= 5) {
                    console.log('🔄 [Onboarding] Retomando do passo:', profile.last_step);
                    setCurrentStep(profile.last_step);
                }

                // Track initial state to avoid immediate auto-save
                setLastSavedData(JSON.stringify(mappedData));

                setPreviews({
                    docFront: profile.document_front_url || profile.documentFrontUrl || null,
                    docBack: profile.document_back_url || profile.documentBackUrl || null,
                    logo: profile.logo_url || null,
                    banner: profile.banner_url || null,
                });
            } else {
                // Se não vier do banco mas tivermos pending
                setFormData(prev => ({
                    ...prev,
                    ...pendingOverrides
                }));
            }
        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-generate slug from companyName if slug is exactly as generated from previous name
            // or if it was empty. This makes it smart but still allows manual override.
            if (name === 'companyName') {
                const autoSlug = value
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                
                newData.slug = autoSlug;
            }
            
            return newData;
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, previewKey: keyof typeof previews, customName?: string) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview imediato local
            const localUrl = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [previewKey]: localUrl }));

            try {
                // Upload real para o servidor com userId para rastreabilidade
                const { url } = await organizerService.uploadImage(file, user?.id, formData.companyName, customName);

                // Atualiza o formData com a nova URL (Usando atualização funcional para segurança)
                setFormData(prev => {
                    const newData = { ...prev, [field]: url };
                    
                    // Persistência imediata no banco (sem depender do debounce)
                    if (user?.id && !saving) {
                        organizerService.updateProfile(user.profileDocId || user.id, { [field]: url }, user.id)
                            .then(() => console.log(`✅ [UPLOAD] ${field} salvo imediatamente no banco: ${url}`))
                            .catch(err => console.error(`❌ [UPLOAD] Falha ao salvar ${field} imediatamente:`, err));
                    }
                    
                    return newData;
                });

                // Atualiza lastSavedData para sincronizar rascunho
                setTimeout(() => {
                    setFormData(current => {
                        setLastSavedData(JSON.stringify(current));
                        return current;
                    });
                }, 100);
            } catch (err) {
                console.error('Erro no upload:', err);
                toast({
                    variant: 'destructive',
                    title: 'Erro no Upload',
                    description: 'Não foi possível salvar a imagem no servidor Minio.'
                });
            }
        }
    };

    const handlePhotoFeedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setSaving(true);
        try {
            const newPosts = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const { url } = await organizerService.uploadImage(file, user?.id, formData.companyName);
                newPosts.push({ id: Math.random().toString(), imageUrl: url });
            }
            setFeedPosts(prev => [...newPosts, ...prev]);
            toast({ title: 'Sucesso', description: `${files.length} foto(s) preparadas para o seu feed!` });
        } catch (err) {
            console.error('Erro no upload do feed:', err);
            toast({ variant: 'destructive', title: 'Erro no Upload', description: 'Não foi possível salvar as fotos.' });
        } finally {
            setSaving(false);
        }
    };

    const removeFeedPhoto = async (postId: string) => {
        try {
            setFeedPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            console.error('Erro ao remover post:', err);
        }
    };

    const handleCepBlur = async () => {
        const cep = formData.postalCode.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    address: `${data.logradouro}, ${data.bairro}`,
                    city: data.localidade,
                    state: data.uf
                }));
            }
        } catch (err) {
            console.warn('Erro ao buscar CEP:', err);
        }
    };

    const saveProfile = async (step?: number) => {
        if (!user?.id) {
            console.error('SaveProfile: No user ID');
            return false;
        }

        if (loading) {
            console.warn('SaveProfile: Still loading profile');
            return false;
        }

        if (saving) return false;

        setSaving(true);
        const maxRetries = 2;
        let attempt = 0;

        const executeSave = async () => {
            const finalData: any = { ...formData };
            finalData.lastStep = step || currentStep;

            console.log(`💾 [SaveProfile] Salvando passo ${finalData.lastStep}...`);
            
            // 1. Atualizar Perfil (Sequencial)
            await organizerService.updateProfile(user.profileDocId || user.id, finalData, user.id);

            // 2. Disparar Webhook (AGUARDAR para evitar concorrência no Supabase Lock)
            await webhookService.dispatch('producer_registered', {
                userId: user.id,
                email: user.email,
                companyName: finalData.companyName || 'Novo Produtor',
                timestamp: new Date().toISOString()
            });

            setLastSavedData(JSON.stringify(formData));
            return true;
        };

        const trySave = async (): Promise<boolean> => {
            try {
                return await executeSave();
            } catch (err: any) {
                const isLockError = err.message?.includes('lock:a3tickets_sb_auth');
                
                if (isLockError && attempt < maxRetries) {
                    attempt++;
                    console.warn(`⚠️ [SaveProfile] Erro de Lock detectado (Tentativa ${attempt}). Tentando novamente em 600ms...`);
                    await new Promise(resolve => setTimeout(resolve, 600));
                    return await trySave();
                }

                console.error('Erro ao salvar perfil:', err);
                const errorMessage = isLockError 
                    ? 'O sistema está processando outra alteração. Por favor, tente clicar novamente em alguns segundos.'
                    : (err.message || 'Seu progresso não foi salvo no servidor Supabase.');
                
                toast({
                    variant: 'destructive',
                    title: 'Erro ao salvar',
                    description: errorMessage
                });
                return false;
            }
        };

        try {
            return await trySave();
        } finally {
            setSaving(false);
        }
    };

    const nextStep = async () => {
        if (loading || saving) return;

        const next = currentStep + 1;
        if (next > 5) return;

        const saved = await saveProfile(next);
        if (saved) {
            setCurrentStep(next);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = async () => {
        if (currentStep > 1) {
            const prev = currentStep - 1;
            await saveProfile(prev);
            setCurrentStep(prev);
            window.scrollTo(0, 0);
        }
    };

    const handleStepClick = async (step: number) => {
        const saved = await saveProfile(step);
        if (saved) {
            setCurrentStep(step);
            window.scrollTo(0, 0);
        }
    };

    const skipOnboarding = () => {
        toast({ title: 'Acesso Liberado', description: 'Você pode concluir seu perfil a qualquer momento nas configurações.' });
        navigate('/organizer/dashboard');
    };

    const finishOnboarding = async () => {
        setSaving(true);
        try {
            // Include completion flags in the final data
            const finalData = { 
                ...formData, 
                status: 'pending', 
                profile_complete: true,
                lastStep: 5 
            };
            
            // Atomic update via organizerService
            await organizerService.updateProfile(user!.profileDocId || user!.id, finalData, user!.id);
            
            // Persist Feed Posts if any exist
            if (feedPosts.length > 0) {
                console.log(`[ONBOARDING] Salvando ${feedPosts.length} fotos no feed...`);
                // Add a default caption to make the fanpage look professional
                const postsWithCaption = feedPosts.map(p => ({
                    ...p,
                    caption: `Flashback: Um pouco dos nossos eventos anteriores! ✨ #Produção #${formData.companyName || 'Evento'}`
                }));
                await organizerService.saveFeedPosts(user!.id, postsWithCaption);
            }
            
            // Dispatch the SPECIAL AI ANALYSIS WEBHOOK (AWAIT to prevent lock collision)
            await webhookService.dispatch('onboarding_completed', {
                userId: user!.id,
                email: user!.email,
                name: user!.name,
                ...finalData,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('A2Tickets_showWelcome', 'true');
            toast({ title: '🎊 Cadastro Concluído!', description: 'Agora você pode criar seus eventos (eles ficarão ativos após sua aprovação).' });
            navigate('/organizer/dashboard');
        } catch (err: any) {
            console.error('Erro ao completar perfil:', err);
            const errorMessage = err.message || 'Não foi possível finalizar seu cadastro. Tente novamente.';
            toast({ 
                variant: 'destructive', 
                title: 'Erro ao Concluir', 
                description: errorMessage 
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4 border border-indigo-100">
                        <Sparkles className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                        Seja bem-vindo, {user?.name.split(' ')[0]}!
                    </h1>
                    <p className="mt-2 text-gray-500 font-medium">
                        Precisamos completar seu cadastro de produtor para liberar o sistema.
                    </p>
                </div>

                <EventWizardStepper steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

                <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm min-h-[500px]">
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-indigo-500" /> Vitrine do Produtor
                                    </h3>
                                    <p className="text-sm text-gray-500">Personalize como os usuários verão sua página pública</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <Sparkles className="h-4 w-4 text-indigo-600" />
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Criação de FanPage</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Nome da Produtora / Marca *</label>
                                        <Input name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Ex: Elite Eventos" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">URL Personalizada (Slug)</label>
                                        <div className="flex items-center">
                                            <span className="bg-gray-100 border border-r-0 border-gray-200 px-3 py-2 rounded-l-xl text-xs text-gray-500 font-bold">a2tickets360.com.br/p/</span>
                                            <Input disabled name="slug" value={formData.slug} onChange={handleInputChange} placeholder="minha-produtora" className="rounded-l-none bg-gray-50 text-gray-500 font-bold cursor-not-allowed opacity-100" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Sobre a Produtora (Bio)</label>
                                    <Textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Conte sua história e os tipos de eventos que você produz..." rows={3} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-4 block">Logo de Perfil</label>
                                        <div className="relative w-32 h-32 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group transition-all hover:border-indigo-400 overflow-hidden">
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_url', 'logo')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            {previews.logo ? (
                                                <img src={previews.logo} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="h-6 w-6 text-gray-300 mx-auto" />
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Subir Foto</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-4 block">Banner de Capa</label>
                                        <div className="relative h-32 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group transition-all hover:border-indigo-400 overflow-hidden">
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_url', 'banner')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            {previews.banner ? (
                                                <img src={previews.banner} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Upload Capa</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-indigo-500" /> Registro Profissional
                                </h3>
                                <p className="text-sm text-gray-500">Informações para verificação e emissão de notas</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">CPF do Responsável *</label>
                                    <Input name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Data de Nascimento *</label>
                                    <Input name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">CNPJ da Empresa (Opcional)</label>
                                    <Input name="cnpj" value={formData.cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Telefone de Contato *</label>
                                    <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(11) 98765-4321" />
                                </div>

                                <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Endereço Comercial / Residencial</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">CEP</label>
                                            <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} onBlur={handleCepBlur} placeholder="00000-000" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Logradouro / Bairro</label>
                                            <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Av. Paulista, 1000 - Bela Vista" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Cidade</label>
                                            <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="São Paulo" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Estado (UF)</label>
                                            <Input name="state" value={formData.state} onChange={handleInputChange} placeholder="SP" maxLength={2} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-indigo-500" /> Documentos de Identidade
                                </h3>
                                <p className="text-sm text-gray-500">Necessários para verificação e conformidade legal</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
                                <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700 font-medium">Seus documentos são criptografados e só acessíveis pelo time de compliance. Nunca compartilhamos com terceiros.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-4 block">Documento (Frente) *</label>
                                    <div className="relative h-48 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group transition-all hover:border-indigo-400 overflow-hidden">
                                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'documentFrontUrl', 'docFront', 'doc_identidade_frente')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        {previews.docFront ? (
                                            <img src={previews.docFront} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center px-4">
                                                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-xs text-gray-400 font-bold uppercase">RG, CNH ou Passaporte</p>
                                                <p className="text-[10px] text-gray-300 mt-1">Frente do documento</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-4 block">Documento (Verso) *</label>
                                    <div className="relative h-48 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group transition-all hover:border-indigo-400 overflow-hidden">
                                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'documentBackUrl', 'docBack', 'doc_identidade_verso')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        {previews.docBack ? (
                                            <img src={previews.docBack} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center px-4">
                                                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-xs text-gray-400 font-bold uppercase">Verso do documento</p>
                                                <p className="text-[10px] text-gray-300 mt-1">PNG, JPG ou PDF</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Landmark className="h-5 w-5 text-indigo-500" /> Configuração de Repasses
                                </h3>
                                <p className="text-sm text-gray-500">Como você receberá o valor dos ingressos vendidos</p>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                        <img src="https://www.asaas.com/assets/favicon/favicon-32x32.png" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-indigo-900 font-bold">Configuração de Pagamentos (Opcional)</h4>
                                            <span className="text-[9px] bg-white text-indigo-500 px-2 py-0.5 rounded-full font-bold border border-indigo-100 uppercase">Configurar Depois</span>
                                        </div>
                                        <p className="text-sm text-indigo-700/80 mt-1 font-medium">
                                            Utilizamos o **Asaas** para que você receba o valor dos seus ingressos via Pix e Cartão de forma instantânea.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/60 rounded-2xl p-6 border border-white">
                                        <h5 className="text-indigo-900 font-bold mb-2">Por que configurar agora?</h5>
                                        <ul className="text-xs text-indigo-700/70 space-y-2 mb-4 list-disc pl-4 font-medium">
                                            <li>Receba seus lucros automaticamente a cada venda.</li>
                                            <li>Ofereça Checkout Transparente (Pix e Cartão) na sua FanPage.</li>
                                            <li>Split de comissão seguro e homologado pelo Banco Central.</li>
                                        </ul>
                                        <a
                                            href="https://sandbox.asaas.com/r/acbd710c-189a-4ae3-ac75-74b4a2b668e4"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
                                        >
                                            Não tenho conta? Criar conta parceira Asaas <ArrowRight className="h-4 w-4" />
                                        </a>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 block">Sua API Key do Asaas</label>
                                        <div className="relative">
                                            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                name="asaasApiKey"
                                                value={formData.asaasApiKey}
                                                onChange={handleInputChange}
                                                className="pl-10 h-12 rounded-xl focus:ring-indigo-500"
                                                placeholder="$a2p_..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Camera className="h-5 w-5 text-indigo-500" /> Seu Feed Profissional <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full ml-2">OPCIONAL</span>
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-lg mt-1">
                                        Suba suas <strong>3 primeiras fotos</strong> de eventos antigos ou infraestrutura. Elas irão popular sua <strong>FanPage</strong> (seu site exclusivo) e darão um ar profissional logo no início!
                                    </p>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-indigo-600" />
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase">Popular FanPage</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    <div className="relative aspect-square rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 flex flex-col items-center justify-center group hover:border-indigo-400 transition-all cursor-pointer">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handlePhotoFeedUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <Upload className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase mt-2">Adicionar Fotos</span>
                                    </div>

                                    {feedPosts.map((post) => (
                                        <div key={post.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm text-right">
                                            <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeFeedPhoto(post.id)}
                                                    className="h-8 w-8 p-0 rounded-full"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 1 || saving}
                        className="text-gray-500 font-bold uppercase tracking-tighter gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="link"
                            onClick={skipOnboarding}
                            disabled={saving}
                            className="text-gray-400 hover:text-indigo-600 text-xs font-bold uppercase tracking-widest hidden sm:block"
                        >
                            Fazer mais tarde
                        </Button>
                        <p className="hidden sm:block text-xs font-bold text-gray-400 uppercase tracking-widest px-4 border-l border-gray-200">
                            Passo {currentStep} de 5
                        </p>
                        {currentStep < 5 ? (
                            <Button
                                onClick={nextStep}
                                disabled={loading || saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-tighter px-8 h-12 rounded-2xl shadow-lg shadow-indigo-100 gap-2"
                            >
                                {saving ? 'Salvando...' : 'Próxima Etapa'} <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={finishOnboarding}
                                disabled={loading || saving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-tighter px-10 h-12 rounded-2xl shadow-lg shadow-emerald-100 gap-2 animate-bounce hover:animate-none"
                            >
                                {saving ? 'Salvando...' : 'Concluir Cadastro'} <CheckCircle2 className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerOnboarding;
