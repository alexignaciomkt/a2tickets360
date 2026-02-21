import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Building2, Palette, Landmark, CheckCircle2,
    ArrowLeft, ArrowRight, Camera, Upload, ShieldCheck,
    MapPin, Sparkles, Building, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import EventWizardStepper from '@/components/events/EventWizardStepper';

const STEPS = [
    { number: 1, title: 'Dados Pessoais', icon: <User className="h-4 w-4" /> },
    { number: 2, title: 'Sua Produtora', icon: <Building2 className="h-4 w-4" /> },
    { number: 3, title: 'Identidade Visual', icon: <Palette className="h-4 w-4" /> },
    { number: 4, title: 'Financeiro', icon: <Landmark className="h-4 w-4" /> },
];

const OrganizerOnboarding = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1
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
        // Step 2
        companyName: '',
        cnpj: '',
        companyAddress: '',
        bio: '',
        // Step 3
        logoUrl: '',
        bannerUrl: '',
        // Step 4
        asaasApiKey: '',
        lastStep: 1,
    });

    const [previews, setPreviews] = useState({
        docFront: null as string | null,
        docBack: null as string | null,
        logo: null as string | null,
        banner: null as string | null,
    });

    useEffect(() => {
        if (user?.id) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const profile = await organizerService.getProfile(user!.id);
            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    ...profile
                }));
                if (profile.lastStep && profile.lastStep > 1 && profile.lastStep <= 4) {
                    setCurrentStep(profile.lastStep);
                }
                setPreviews({
                    docFront: profile.documentFrontUrl || null,
                    docBack: profile.documentBackUrl || null,
                    logo: profile.logoUrl || null,
                    banner: profile.bannerUrl || null,
                });
            }
        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, previewKey: keyof typeof previews) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [previewKey]: url }));
            setFormData(prev => ({ ...prev, [field]: url })); // In a real app, this would be the uploaded S3/Cloudinary URL
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
        if (!user?.id) return;
        setSaving(true);
        try {
            const dataToSave = { ...formData };
            if (step) dataToSave.lastStep = step;
            await organizerService.updateProfile(user.id, dataToSave);
            return true;
        } catch (err) {
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Tente novamente em instantes.' });
            return false;
        } finally {
            setSaving(false);
        }
    };

    const nextStep = async () => {
        const next = currentStep + 1;
        const saved = await saveProfile(next);
        if (saved) {
            setCurrentStep(next);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const skipOnboarding = () => {
        toast({ title: 'Acesso Liberado', description: 'Você pode concluir seu perfil a qualquer momento nas configurações.' });
        navigate('/organizer/dashboard');
    };

    const finishOnboarding = async () => {
        const saved = await saveProfile();
        if (saved) {
            try {
                await organizerService.completeProfile(user!.id);
                toast({ title: '🎊 Cadastro Concluído!', description: 'Agora você pode criar seus eventos.' });
                navigate('/organizer/dashboard');
            } catch (err) {
                toast({ variant: 'destructive', title: 'Erro ao finalizar', description: 'Tente novamente.' });
            }
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
                {/* Header */}
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

                <EventWizardStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

                <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm min-h-[500px]">
                    {/* Step 1: Dados Pessoais */}
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-indigo-500" /> Dados do Responsável
                                </h3>
                                <p className="text-sm text-gray-500">Informações pessoais para verificação de identidade</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">CPF *</label>
                                    <Input name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">RG *</label>
                                    <Input name="rg" value={formData.rg} onChange={handleInputChange} placeholder="12.345.678-x" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Telefone *</label>
                                    <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(11) 98765-4321" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Data de Nascimento *</label>
                                    <Input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Endereço de Correspondência</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">CEP</label>
                                        <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} onBlur={handleCepBlur} placeholder="00000-000" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="text-xs text-gray-500 mb-1 block">Logradouro *</label>
                                        <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Rua, Número, Bairro" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500 mb-1 block">Cidade *</label>
                                        <Input name="city" value={formData.city} onChange={handleInputChange} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500 mb-1 block">Estado *</label>
                                        <Input name="state" value={formData.state} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verificação de Documentos
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-indigo-300 transition-colors bg-gray-50 group">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'documentFrontUrl', 'docFront')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        {previews.docFront ? (
                                            <div className="h-40 relative rounded-lg overflow-hidden">
                                                <img src={previews.docFront} className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-xs font-bold">Trocar Documento (Frente)</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
                                                    <Camera className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-600">Documento Frente</p>
                                                <p className="text-xs text-gray-400">RG ou CNH</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-indigo-300 transition-colors bg-gray-50 group">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'documentBackUrl', 'docBack')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        {previews.docBack ? (
                                            <div className="h-40 relative rounded-lg overflow-hidden">
                                                <img src={previews.docBack} className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-xs font-bold">Trocar Documento (Verso)</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
                                                    <Camera className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-600">Documento Verso</p>
                                                <p className="text-xs text-gray-400">RG ou CNH</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Sua Produtora */}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-indigo-500" /> Dados da Produtora
                                </h3>
                                <p className="text-sm text-gray-500">Fale um pouco sobre sua empresa ou marca</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Nome Fantasia / Marca *</label>
                                    <Input name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Ex: Eventos Elite" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">CNPJ (Opcional)</label>
                                        <Input name="cnpj" value={formData.cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00" />
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Não obrigatório, mas recomendado para eventos pagos</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Endereço Comercial</label>
                                        <Input name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} placeholder="Mesmo do pessoal ou um comercial" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Sobre a Produtora</label>
                                    <Textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Conte um pouco sobre os tipos de eventos que você produz..." rows={4} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Identidade Visual */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-indigo-500" /> Vitrine do Produtor
                                </h3>
                                <p className="text-sm text-gray-500">Personalize como os usuários verão sua página pública</p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-4 block">Logo da Produtora</label>
                                    <div className="flex items-center gap-8">
                                        <div className="relative w-32 h-32 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group transition-all hover:border-indigo-400 overflow-hidden">
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl', 'logo')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            {previews.logo ? (
                                                <img src={previews.logo} className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="h-6 w-6 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-700">Logo de Perfil</p>
                                            <p className="text-xs text-gray-500 mt-1">Recomendado: Quadrado, min 400x400px</p>
                                            <p className="text-xs text-indigo-500 font-bold mt-2 uppercase">Aparecerá no header dos seus eventos</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-4 block">Banner de Capa</label>
                                    <div className="relative h-48 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group transition-all hover:border-indigo-400 overflow-hidden">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'bannerUrl', 'banner')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        {previews.banner ? (
                                            <img src={previews.banner} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-xs text-gray-400 font-bold uppercase">Upload do banner da página do produtor</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Preview Mockup */}
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                    <h4 className="text-[10px] items-center gap-2 font-black text-gray-400 uppercase tracking-widest mb-4 flex">
                                        <Sparkles className="h-3 w-3" /> Preview da sua FanPage
                                    </h4>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scale-90 origin-top">
                                        <div className="h-20 bg-gray-200 relative">
                                            {previews.banner && <img src={previews.banner} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="px-6 pb-6 relative">
                                            <div className="absolute -top-10 left-6 w-20 h-20 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden shadow-md">
                                                {previews.logo && <img src={previews.logo} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="pt-12">
                                                <h5 className="font-bold text-gray-900">{formData.companyName || 'Sua Produtora'}</h5>
                                                <p className="text-xs text-gray-400 truncate">{formData.bio || 'Sua descrição aparecerá aqui...'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Financeiro */}
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
                                        <h4 className="text-indigo-900 font-bold">Integração com Asaas</h4>
                                        <p className="text-sm text-indigo-700/80 mt-1">
                                            Utilizamos o Asaas para processar pagamentos e realizar o split automático de comissões de forma segura.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-6 border border-indigo-100">
                                        <h5 className="text-gray-900 font-bold mb-2">Ainda não tem conta no Asaas?</h5>
                                        <p className="text-xs text-gray-500 mb-4">Crie sua conta agora mesmo. É rápido e gratuito para começar.</p>
                                        <a
                                            href="https://www.asaas.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
                                        >
                                            Criar minha conta no Asaas <ArrowRight className="h-4 w-4" />
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
                                                className="pl-10"
                                                placeholder="$a2p_..."
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                            Atenção: Sem esta chave você só poderá criar eventos gratuitos.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-white/50 rounded-2xl border border-white">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                        Seus dados bancários e chaves são criptografados e utilizados apenas para o processamento de pagamentos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
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
                            Passo {currentStep} de 4
                        </p>
                        {currentStep < 4 ? (
                            <Button
                                onClick={nextStep}
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-tighter px-8 h-12 rounded-2xl shadow-lg shadow-indigo-100 gap-2"
                            >
                                {saving ? 'Salvando...' : 'Próxima Etapa'} <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={finishOnboarding}
                                disabled={saving}
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
