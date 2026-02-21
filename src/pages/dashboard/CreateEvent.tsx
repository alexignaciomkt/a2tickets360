import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag, FileText, MapPin, Ticket, CheckCircle2,
  ArrowLeft, ArrowRight, Camera, Calendar, Clock,
  Users, DollarSign, Sparkles, Save, Send, ShieldCheck
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import EventWizardStepper from '@/components/events/EventWizardStepper';
import CategoryCombobox from '@/components/events/CategoryCombobox';
import TicketBuilder, { TicketTier } from '@/components/events/TicketBuilder';
import EventPreviewCard from '@/components/events/EventPreviewCard';

const STEPS = [
  { number: 1, title: 'Tipo & Categoria', icon: <Tag className="h-4 w-4" /> },
  { number: 2, title: 'Informações', icon: <FileText className="h-4 w-4" /> },
  { number: 3, title: 'Data & Local', icon: <MapPin className="h-4 w-4" /> },
  { number: 4, title: 'Ingressos', icon: <Ticket className="h-4 w-4" /> },
  { number: 5, title: 'Revisão', icon: <CheckCircle2 className="h-4 w-4" /> },
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');
  const [locationPostalCode, setLocationPostalCode] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [tickets, setTickets] = useState<TicketTier[]>([
    { id: `temp_${Date.now()}`, name: '', price: 0, quantity: 100, category: 'standard' }
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImageUrl(url);
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
      case 4: return tickets.length > 0 && tickets.every(t => t.name && t.quantity > 0 && (eventType === 'free' || t.price >= 0));
      default: return true;
    }
  };

  const nextStep = () => {
    if (currentStep < 5 && canAdvance()) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!user?.id) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const eventData = {
        organizerId: user.id,
        title, description, category, eventType, date, time, duration,
        locationName, locationAddress, locationCity, locationState, locationPostalCode,
        capacity, status,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      };
      const newEvent = await organizerService.createEvent(eventData);
      for (const ticket of tickets) {
        await organizerService.createTicket(newEvent.id, {
          name: ticket.name, price: ticket.price, quantity: ticket.quantity, category: ticket.category,
        });
      }
      toast({
        title: status === 'published' ? '🚀 Evento publicado!' : '💾 Rascunho salvo!',
        description: status === 'published' ? 'Seu evento está no ar!' : 'Você pode continuar editando.',
      });
      navigate('/organizer/events');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao criar evento', description: error.message || 'Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
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

          <button type="button" onClick={() => setEventType('free')}
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
        <CategoryCombobox value={category} onChange={setCategory} />
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
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          {previewUrl ? (
            <div className="relative h-56 w-full rounded-lg overflow-hidden">
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <p className="text-white font-medium">Clique para alterar</p>
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Data *</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Horário *</label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Duração estimada</label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 8 horas"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500" />
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
      <TicketBuilder tickets={tickets} onChange={setTickets} eventType={eventType} />
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
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="button" onClick={() => handleSubmit('draft')} disabled={isSubmitting}
          variant="outline" className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 gap-2 h-12">
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Salvando...' : 'Salvar como Rascunho'}
        </Button>
        <Button type="button" onClick={() => handleSubmit('published')} disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 h-12 shadow-lg shadow-indigo-200">
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Publicando...' : 'Publicar Evento'}
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout userType="organizer">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/organizer/events')}
            className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-500" /> Criar Novo Evento
            </h1>
            <p className="text-sm text-gray-500 mt-1">Siga as etapas para configurar seu evento completo</p>
          </div>
        </div>

        <EventWizardStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

        {renderProfileWarning()}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 min-h-[400px] shadow-sm">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {currentStep < 5 && (
          <div className="flex justify-between items-center">
            <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 1}
              className="text-gray-500 hover:text-gray-900 gap-2">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              Etapa {currentStep} de 5
            </div>
            <Button type="button" onClick={nextStep} disabled={!canAdvance()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50">
              Próximo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;
