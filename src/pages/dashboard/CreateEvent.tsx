import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Tag, FileText, MapPin, Ticket, CheckCircle2,
  ArrowLeft, ArrowRight, Camera, Calendar, Clock,
  Users, DollarSign, Sparkles, Save, Send, ShieldCheck, Star
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import { serviceCreditsService } from '@/services/serviceCreditsService';
import { supabase } from '@/lib/supabase';
import { getEventTemporalStatus } from '@/utils/eventDateTime';
import EventWizardStepper from '@/components/events/EventWizardStepper';
import CategoryCombobox from '@/components/events/CategoryCombobox';
import TicketBuilder, { TicketTier } from '@/components/events/TicketBuilder';
import EventPreviewCard from '@/components/events/EventPreviewCard';
import { FeaturedCreditsPurchaseModal } from '@/components/modals/FeaturedCreditsPurchaseModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FULL_STEPS = [
  { number: 1, title: 'Tipo & Categoria', icon: <Tag className="h-4 w-4" /> },
  { number: 2, title: 'Informações', icon: <FileText className="h-4 w-4" /> },
  { number: 3, title: 'Data & Local', icon: <MapPin className="h-4 w-4" /> },
  { number: 4, title: 'Ingressos', icon: <Ticket className="h-4 w-4" /> },
  { number: 5, title: 'Revisão', icon: <CheckCircle2 className="h-4 w-4" /> },
];

const EDIT_STEPS = [
  { number: 1, title: 'Tipo & Categoria', icon: <Tag className="h-4 w-4" /> },
  { number: 2, title: 'Informações', icon: <FileText className="h-4 w-4" /> },
  { number: 3, title: 'Data & Local', icon: <MapPin className="h-4 w-4" /> },
  { number: 4, title: 'Revisão', icon: <CheckCircle2 className="h-4 w-4" /> },
];

const CreateEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const isEditMode = !!eventId;
  const STEPS = isEditMode ? EDIT_STEPS : FULL_STEPS;
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [acceptsPromoters, setAcceptsPromoters] = useState(false);
  const [promoterCommissionRate, setPromoterCommissionRate] = useState(10);
  const [promoterDiscountRate, setPromoterDiscountRate] = useState(0);

  // Featured Credits State
  const [availableCredits, setAvailableCredits] = useState<number | null>(null);
  const [useFeaturedCredit, setUseFeaturedCredit] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      if (user?.role !== 'organizer' && user?.role !== 'admin') return;
      try {
        const response = await serviceCreditsService.getServiceCredits();
        setAvailableCredits(response?.summary?.available || 0);
      } catch (error) {
        console.error('Failed to fetch service credits', error);
      }
    };
    fetchCredits();
  }, [user]);

  // Renderização do Aviso de Perfil Incompleto (Não bloqueante)
  const renderProfileWarning = () => {
    if (user?.role === 'organizer' && !user.profileComplete) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-2 bg-amber-100 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Cadastro Incompleto</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Seu perfil ainda não possui todos os documentos e informações fiscais necessários.
              Você pode criar o evento, mas ele precisará de validação extra da nossa equipe.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/organizer/onboarding')}
            className="text-amber-700 hover:bg-amber-100 font-bold uppercase text-[10px] tracking-widest"
          >
            Completar Agora →
          </Button>
        </div>
      );
    }
    return null;
  };

  // Form State
  const [eventType, setEventType] = useState<'paid' | 'free'>('paid');
  const [category, setCategory] = useState('');
  const [categoryCode, setCategoryCode] = useState<string | undefined>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState<string | null>(null);
  const uploadTokenRef = useRef(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Edit Mode Initial State Storage
  const [initialEventData, setInitialEventData] = useState<any>(null);
  const [initialHasSales, setInitialHasSales] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertReason, setAlertReason] = useState<'SALES' | 'RESURRECTION' | null>(null);

  useEffect(() => {
    const loadEventForEdit = async () => {
      if (!isEditMode || !eventId) return;
      try {
        const eventData = await organizerService.getEventById(eventId);
        if (eventData) {
          setInitialEventData(eventData);
          setEventType(eventData.eventType || 'paid');
          setCategory(eventData.category || '');
          setCategoryCode(eventData.categoryCode || '');
          setTitle(eventData.title || '');
          setDescription(eventData.description || '');
          setImageUrl(eventData.bannerUrl || '');
          setPreviewUrl(eventData.bannerUrl || '');
          
          if (eventData.startDate || eventData.start_date) {
            const startD = new Date(eventData.startDate || eventData.start_date);
            setDate(startD.toISOString().split('T')[0]);
            setTime(startD.toTimeString().slice(0,5));
          }
          if (eventData.endDate || eventData.end_date) {
            const endD = new Date(eventData.endDate || eventData.end_date);
            setEndDate(endD.toISOString().split('T')[0]);
            setEndTime(endD.toTimeString().slice(0,5));
          }
          
          setLocationName(eventData.locationName || '');
          setLocationAddress(eventData.address || '');
          setLocationCity(eventData.city || '');
          setLocationState(eventData.state || '');
          setLocationPostalCode(eventData.postalCode || '');
          setCapacity(eventData.capacity || 100);
          
          // Verificar Vendas
          const { data: salesData } = await supabase
            .from('sales')
            .select('id')
            .eq('event_id', eventId)
            .eq('payment_status', 'paid')
            .limit(1);
            
          const { data: ptData } = await supabase
            .from('purchased_tickets')
            .select('id')
            .eq('event_id', eventId)
            .in('status', ['active', 'used', 'confirmed'])
            .limit(1);
            
          if ((salesData && salesData.length > 0) || (ptData && ptData.length > 0)) {
            setInitialHasSales(true);
          }
        }
      } catch (err) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados do evento.' });
      }
    };
    loadEventForEdit();
  }, [isEditMode, eventId]);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');
  const [locationPostalCode, setLocationPostalCode] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [tickets, setTickets] = useState<TicketTier[]>([
    { id: `temp_${Date.now()}`, name: '', price: 0, quantity: 100, category: 'standard', registrationType: 'INDIVIDUAL', participantsPerRegistration: 1, ticketPurpose: 'REGISTRATION' }
  ]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`[UPLOAD 1] arquivo selecionado: ${file.name}`);
      const token = Math.random();
      uploadTokenRef.current = token;

      // 1. Mostrar preview local imediato
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setBannerUploadError(null);
      setIsBannerUploading(true);

      try {
        // 2. Upload para o servidor
        const { url: remoteUrl } = await organizerService.uploadImage(file, user?.id, 'producer-banner');
        if (uploadTokenRef.current === token) {
          console.log(`[UPLOAD 7] imageUrl setado: ${remoteUrl}`);
          setImageUrl(remoteUrl);
        }
      } catch (err) {
        console.error('Erro no upload da imagem:', err);
        if (uploadTokenRef.current === token) {
          setBannerUploadError('Não foi possível enviar o banner. Tente novamente.');
          toast({
            variant: 'destructive',
            title: 'Erro no Upload',
            description: err instanceof Error ? err.message : 'Não foi possível salvar a imagem no servidor. Tente novamente.'
          });
        }
      } finally {
        console.log(`[UPLOAD 8] finally executado. Token local: ${token}, Token atual: ${uploadTokenRef.current}`);
        if (uploadTokenRef.current === token) {
          setIsBannerUploading(false);
        }
      }
    }
  };

  const handleCepBlur = async () => {
    const cep = locationPostalCode.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setLocationAddress(prev => prev || `${data.logradouro}, ${data.bairro}`);
        setLocationCity(data.localidade);
        setLocationState(data.uf);
      }
    } catch (err) {
      console.warn('Erro ao buscar CEP:', err);
    }
  };

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 1: return !!category;
      case 2: return title.length >= 1 && description.length >= 10;
      case 3: return !!date && !!time && !!locationName && !!locationAddress && capacity > 0;
      case 4: {
        const hasValidTickets = tickets.length > 0 && tickets.every(t => t.name.trim().length > 0 && t.quantity > 0);
        const usedCapacity = tickets
          .filter(t => t.ticketPurpose === 'REGISTRATION')
          .reduce((sum, t) => sum + (t.quantity * t.participantsPerRegistration), 0);
        return hasValidTickets && usedCapacity <= capacity;
      }
      default: return true;
    }
  };

  const nextStep = () => {
    if (isBannerUploading) {
      toast({ variant: 'destructive', title: 'Aguarde', description: 'O envio do banner ainda está em andamento.' });
      return;
    }
    if (currentStep < 5 && canAdvance()) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (isBannerUploading) {
      toast({ variant: 'destructive', title: 'Aguarde', description: 'O envio do banner ainda está em andamento.' });
      return;
    }
    if (previewUrl && !imageUrl) {
      toast({ variant: 'destructive', title: 'Erro na imagem', description: 'A imagem ainda não foi enviada ou o upload falhou. Tente novamente.' });
      return;
    }

    if (!user?.id) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
      return;
    }

    let userTimeZone = '';
    try {
      userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!userTimeZone) throw new Error('Timezone empty');
      // Validate IANA
      Intl.DateTimeFormat(undefined, { timeZone: userTimeZone }).format();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro de Sistema', description: 'Não foi possível determinar o fuso horário válido (timezone) do seu navegador. Verifique as configurações do sistema.' });
      return;
    }

    const executeSave = async (forceStatus: 'draft' | 'published') => {
      setIsSubmitting(true);
      try {
        const slug = title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim();

        const finalImageUrl = previewUrl ? imageUrl : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';

        const eventData: any = {
          organizerId: user.id,
          title, 
          slug,
          description, 
          category,
          categoryCode,
          eventType, 
          date, 
          time, 
          timezone: userTimeZone,
          endDate, 
          endTime, 
          duration,
          locationName, 
          locationAddress, 
          locationCity, 
          locationState, 
          locationPostalCode,
          capacity, 
          status: forceStatus,
          acceptsPromoters,
          promoterCommissionRate,
          promoterDiscountRate,
          imageUrl: finalImageUrl,
          isFeatured: false, 
          featuredPaymentStatus: 'none',
        };

        if (!isEditMode) {
          eventData.tickets = tickets.map(t => ({
            name: t.name,
            price: t.price,
            quantity: t.quantity,
            category: t.category,
            registrationType: t.registrationType,
            participantsPerRegistration: t.participantsPerRegistration,
            ticketPurpose: t.ticketPurpose
          }));
          
          const newEvent = await organizerService.createEvent(eventData);
          if (forceStatus === 'draft') {
            toast({ title: '💾 Rascunho salvo!', description: 'Você pode continuar editando.' });
            navigate('/organizer/events');
            return;
          }

          if (useFeaturedCredit) {
            try {
              await serviceCreditsService.activateFeaturedCredit(newEvent.id);
            } catch (err) {
              console.error('Erro ao ativar destaque:', err);
              // Avançado: reconsultar estado
              try {
                const status = await serviceCreditsService.getFeaturedCreditStatus(newEvent.id);
                if (status.activeHighlight) {
                   // Tratado como sucesso
                } else {
                   toast({
                     variant: 'destructive',
                     title: 'Aviso',
                     description: 'Seu evento foi publicado, mas não foi possível ativar o destaque. Nenhum crédito foi utilizado.'
                   });
                }
              } catch (recheckErr) {
                toast({
                  variant: 'destructive',
                  title: 'Aviso',
                  description: 'Seu evento foi publicado, mas não foi possível confirmar a ativação do destaque. Consulte o evento antes de tentar novamente.'
                });
              }
            }
          }

          toast({ title: 'Sucesso!', description: 'Evento criado.' });
          navigate('/organizer/events');
          return;
        } else {
          // Edit Mode
          await organizerService.updateEvent(eventId!, eventData);
          toast({ title: 'Sucesso!', description: 'Evento atualizado.' });
          navigate(`/organizer/event/${eventId}/manage`);
        }
      } catch (error: any) {
        console.error('Erro detalhado ao salvar evento:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message || 'Tente novamente.' });
      } finally {
        setIsSubmitting(false);
      }
    };

    // Verificações antes de salvar
    if (isEditMode && initialEventData) {
      let isCriticalChange = false;
      
      let oldDate = '';
      let oldTime = '';
      if (initialEventData.startDate || initialEventData.start_date) {
        const startD = new Date(initialEventData.startDate || initialEventData.start_date);
        oldDate = startD.toISOString().split('T')[0];
        oldTime = startD.toTimeString().slice(0,5);
      }
      
      if (date !== oldDate || time !== oldTime || locationName !== initialEventData.locationName) {
        isCriticalChange = true;
      }
      
      const oldTemporalStatus = getEventTemporalStatus(initialEventData.startDate || initialEventData.start_date, initialEventData.endDate || initialEventData.end_date);
      const newStartISO = `${date}T${time}:00`;
      const newEndISO = endDate ? `${endDate}T${endTime || '00:00'}:00` : null;
      const newTemporalStatus = getEventTemporalStatus(newStartISO, newEndISO);
      
      if (oldTemporalStatus === 'ENCERRADO' && newTemporalStatus === 'FUTURO') {
        setAlertReason('RESURRECTION');
        setIsAlertOpen(true);
        return;
      }
      
      if (initialHasSales && isCriticalChange) {
        setAlertReason('SALES');
        setIsAlertOpen(true);
        return;
      }
    }

    executeSave(status);
  };

  const confirmAlertAndSave = () => {
    setIsAlertOpen(false);
    const originalStatus = initialEventData?.status === 'active' || initialEventData?.status === 'published' ? 'published' : (initialEventData?.status || 'draft');
    // @ts-ignore
    executeSave(originalStatus);
  };

  // ===== RENDER STEPS =====

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tipo do Evento</h3>
        <p className="text-sm text-gray-500 mb-4">Seu evento terá ingressos pagos ou será gratuito?</p>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setEventType('paid')}
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${eventType === 'paid'
                ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all
              ${eventType === 'paid' ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
              <DollarSign className={`h-6 w-6 ${eventType === 'paid' ? 'text-indigo-600' : 'text-gray-400'}`} />
            </div>
            <h4 className={`font-semibold text-lg mb-1 ${eventType === 'paid' ? 'text-gray-900' : 'text-gray-600'}`}>Evento Pago</h4>
            <p className="text-sm text-gray-500">Venda ingressos com diferentes lotes e categorias</p>
            {eventType === 'paid' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            )}
          </button>

          <button type="button" onClick={() => {
            setEventType('free');
            setTickets(prev => prev.map(t => ({
              ...t,
              price: 0,
              name: t.name || 'Inscrição Gratuita'
            })));
          }}
            className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${eventType === 'free'
                ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all
              ${eventType === 'free' ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
              <Users className={`h-6 w-6 ${eventType === 'free' ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <h4 className={`font-semibold text-lg mb-1 ${eventType === 'free' ? 'text-gray-900' : 'text-gray-600'}`}>Evento Gratuito</h4>
            <p className="text-sm text-gray-500">Inscrição gratuita com controle de participantes</p>
            {eventType === 'free' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Categoria</h3>
        <p className="text-sm text-gray-500 mb-4">
          Selecione uma categoria existente ou crie uma nova. Categorias criadas ficam disponíveis para todos os produtores.
        </p>
        <CategoryCombobox value={category} onChange={(val, code) => { setCategory(val); setCategoryCode(code); }} />
        {category && (
          <div className="mt-3 flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
              {category}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Informações Básicas</h3>
        <p className="text-sm text-gray-500 mb-6">Como seu evento será apresentado ao público</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Título do Evento *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: 1ª Feira de Negócios de São José dos Campos"
          className="bg-white border-gray-300 text-gray-900 text-lg placeholder:text-gray-400 focus:border-indigo-500 h-12" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Descrição *</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva seu evento de forma atrativa..."
          rows={5}
          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 resize-none" />
        <p className="text-xs text-gray-400 mt-1">{description.length} caracteres (mínimo 10)</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Banner / Arte do Evento</label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors relative cursor-pointer group bg-gray-50">
          <input type="file" accept="image/*" onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          {previewUrl ? (
            <div className="relative h-56 w-full rounded-lg overflow-hidden">
              <img src={previewUrl} alt="Preview" className={`h-full w-full object-cover transition-all ${isBannerUploading ? 'opacity-50 grayscale' : ''}`} />
              
              {isBannerUploading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                  <div className="h-8 w-8 rounded-full border-4 border-white border-t-transparent animate-spin mb-2"></div>
                  <p className="text-white font-medium">Enviando imagem...</p>
                </div>
              ) : bannerUploadError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-900/80 rounded-lg">
                  <p className="text-white font-medium text-center px-4">{bannerUploadError}</p>
                  <p className="text-white/80 text-sm mt-2">Clique para tentar novamente</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <p className="text-white font-medium">Clique para alterar</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="h-14 w-14 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-all">
                <Camera className="h-7 w-7 text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Clique para fazer upload</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP (Max. 5MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Data, Horário & Localização</h3>
        <p className="text-sm text-gray-500 mb-6">Quando e onde acontecerá seu evento</p>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" /> Data & Horário
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Início do Evento</h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Data *</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500 h-11" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Horário *</label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500 h-11" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-rose-600 uppercase tracking-wider">Término do Evento</h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Data de Término</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-rose-500 h-11" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Horário de Término</label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-rose-500 h-11" />
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Duração estimada ou Observação</label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 8 horas ou 'Até o último convidado'"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 h-11" />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-indigo-500" /> Localização
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nome do Local *</label>
            <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Ex: Centro de Convenções"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">CEP</label>
            <Input value={locationPostalCode} onChange={(e) => setLocationPostalCode(e.target.value)} onBlur={handleCepBlur} placeholder="12345-000"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Endereço *</label>
            <Input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="Ex: Av. Principal, 1000 - Centro"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cidade</label>
            <Input value={locationCity} onChange={(e) => setLocationCity(e.target.value)} placeholder="Ex: São José dos Campos"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Estado</label>
            <Input value={locationState} onChange={(e) => setLocationState(e.target.value)} placeholder="Ex: SP"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500" />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" /> Capacidade
        </h4>
        <div className="max-w-xs">
          <label className="text-xs text-gray-500 mb-1 block">Capacidade Máxima *</label>
          <Input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} placeholder="1000"
            className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500" />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {eventType === 'free' ? 'Configurar Inscrição' : 'Configurar Ingressos'}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {eventType === 'free' ? 'Defina como os participantes se inscreverão' : 'Crie os lotes e categorias de ingressos'}
        </p>
      </div>
      <TicketBuilder tickets={tickets} onChange={setTickets} eventType={eventType} capacity={capacity} categoryCode={categoryCode} />
      
      {/* Bloco de Promoters / Afiliados */}
      <div className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Programa de Promoters (Afiliados)
            </h4>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Permita que promotores vendam ingressos para este evento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAcceptsPromoters(!acceptsPromoters)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${acceptsPromoters ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute ${acceptsPromoters ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {acceptsPromoters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-widest">
                Comissão do Promoter (%)
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={promoterCommissionRate} 
                  onChange={(e) => setPromoterCommissionRate(Number(e.target.value))}
                  className="bg-white border-indigo-200 focus:border-indigo-500 pl-4 pr-8 font-black" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Quanto o promoter ganha.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-widest">
                Desconto do Comprador (%)
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={promoterDiscountRate} 
                  onChange={(e) => setPromoterDiscountRate(Number(e.target.value))}
                  className="bg-white border-indigo-200 focus:border-indigo-500 pl-4 pr-8 font-black" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Benefício de quem compra.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Revisão Final</h3>
        <p className="text-sm text-gray-500 mb-6">Confira tudo antes de publicar. Você poderá editar depois.</p>
      </div>
      <EventPreviewCard data={{
        eventType, category, title, description,
        imageUrl: previewUrl || imageUrl,
        date, time, duration, locationName, locationAddress, locationCity, locationState, capacity, tickets,
      }} />

      {/* Seção de Promoção / Monetização - Nova UI de Créditos */}
      <div className={`mt-8 p-6 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden relative group border-indigo-500 bg-indigo-50/50 shadow-2xl shadow-indigo-100`}>

        <div className="absolute top-0 right-0 p-4 bg-indigo-500 text-white rounded-bl-3xl animate-in zoom-in duration-300">
          <Star className="w-6 h-6 fill-current" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 bg-indigo-600 text-white drop-shadow-xl`}>
            <Star className={`w-10 h-10 fill-current`} />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
              {useFeaturedCredit ? '⭐ Destaque Selecionado' : 'Créditos de Destaque'}
            </h4>
            <p className="text-sm text-gray-500 font-medium">
              {useFeaturedCredit 
                ? `Este evento será destacado após a publicação. 1 crédito será utilizado. Após a publicação você ficará com ${(availableCredits || 0) - 1} crédito(s) disponível(is).`
                : availableCredits && availableCredits > 0
                  ? `Você possui ${availableCredits} crédito(s) disponível(is). Deseja usar 1 crédito para destacar este evento no carrossel principal da plataforma?`
                  : 'Destaque seu evento no carrossel principal da plataforma.'
              }
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            {useFeaturedCredit ? (
              <Button
                type="button"
                onClick={() => setUseFeaturedCredit(false)}
                className={`rounded-full h-12 px-8 font-black uppercase text-xs tracking-widest transition-all bg-gray-200 hover:bg-gray-300 text-gray-800`}
              >
                Cancelar Destaque
              </Button>
            ) : availableCredits && availableCredits > 0 ? (
              <div className="flex flex-col gap-2 w-full md:w-auto items-center">
                <Button
                  type="button"
                  onClick={() => setUseFeaturedCredit(true)}
                  className={`rounded-full h-12 px-8 font-black uppercase text-xs tracking-widest transition-all bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200`}
                >
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  Usar 1 Crédito
                </Button>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Não, obrigado
                </div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-black text-indigo-600 tracking-tight">R$ 49,90</div>
                <Button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className={`rounded-full h-12 px-8 font-black uppercase text-xs tracking-widest transition-all bg-indigo-600 hover:bg-indigo-700 text-white`}
                >
                  Comprar Créditos
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <FeaturedCreditsPurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={() => {}}
      />
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="button" onClick={() => handleSubmit('draft')} disabled={isSubmitting || isBannerUploading}
          variant="outline" className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 gap-2 h-12">
          <Save className="h-4 w-4" />
          {isBannerUploading ? 'Enviando banner...' : isSubmitting ? 'Salvando...' : 'Salvar como Rascunho'}
        </Button>
        <Button type="button" onClick={() => handleSubmit('published')} disabled={isSubmitting || isBannerUploading}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 h-12 shadow-lg shadow-indigo-200">
          <Send className="h-4 w-4" />
          {isBannerUploading 
            ? 'Enviando banner...' 
            : isSubmitting
              ? (user?.profileComplete ? 'Publicando...' : 'Enviando...')
              : (user?.profileComplete ? 'Publicar Evento' : 'Solicitar Publicação')}
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout userType="organizer">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(isEditMode ? `/organizer/event/${eventId}/manage` : '/organizer/events')}
            className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-500" /> {isEditMode ? `Editar Evento` : `Criar Novo Evento`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{isEditMode ? `Atualize as informações do seu evento.` : `Siga as etapas para configurar seu evento completo`}</p>
          </div>
        </div>

        <EventWizardStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

        {renderProfileWarning()}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 min-h-[400px] shadow-sm">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && (!isEditMode ? renderStep4() : renderStep5())}
          {currentStep === 5 && !isEditMode && renderStep5()}
        </div>

        {currentStep < STEPS.length && (
          <div className="flex justify-between items-center">
            <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isSubmitting || isBannerUploading}
              className="text-gray-500 hover:text-gray-900 gap-2">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              Etapa {currentStep} de {STEPS.length}
            </div>
            <Button type="button" onClick={nextStep} disabled={!canAdvance() || isSubmitting || isBannerUploading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50">
              {isBannerUploading ? 'Enviando banner...' : 'Próximo'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              Atenção: Alteração Crítica!
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertReason === 'SALES' && (
                <>Este evento <b>já possui participantes ou credenciais emitidas</b>. A alteração de Data, Horário ou Local afetará as informações apresentadas aos participantes. Tem certeza de que deseja continuar?</>
              )}
              {alertReason === 'RESURRECTION' && (
                <>Você está transformando um <b>evento encerrado</b> em um evento futuro. Tem certeza de que deseja continuar?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAlertAndSave} className="bg-red-600 hover:bg-red-700">Confirmar Alteração</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CreateEvent;
