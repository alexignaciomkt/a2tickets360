import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Upload, Calendar, MapPin, Eye, EyeOff, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { eventService, Event as SupabaseEvent } from '@/services/eventService';
import { organizerService } from '@/services/organizerService';
import { webhookService } from '@/services/webhookService';
import { supabase } from '@/lib/supabase';

interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  photo: File | null;
  password?: string;
  city: string;
  state: string;
  address: string;
  birthDate: string;
  gender: string;
}

const initialFormData: CheckoutData = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  photo: null,
  password: '',
  city: '',
  state: '',
  address: '',
  birthDate: '',
  gender: '',
};

const steps = ['Informações', 'Pagamento', 'Confirmação'];

const CheckoutPage = () => {
  const { eventId, ticketId } = useParams<{ eventId: string; ticketId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, register, refreshUser } = useAuth();

  const [event, setEvent] = useState<SupabaseEvent | null>(null);
  const [ticket, setTicket] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CheckoutData>(initialFormData);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        cpf: user.cpf || prev.cpf,
        city: user.city || prev.city,
        state: user.state || prev.state,
        address: user.address || prev.address,
        birthDate: user.birthDate || prev.birthDate,
        gender: user.gender || prev.gender,
      }));
      
      if (user.photoUrl && !photoPreview) {
        setPhotoPreview(user.photoUrl);
      }
    }
  }, [user]);

  // Load real event and ticket data from Supabase
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      try {
        const foundEvent = await eventService.getEventById(eventId);
        if (foundEvent) {
          setEvent(foundEvent);
          // In Supabase version, tickets are a separate query, but our getEventById should handle it or we fetch here
          const { data: ticketsData } = await supabase
            .from('tickets')
            .select('*')
            .eq('event_id', eventId);
            
          const foundTicket = ticketsData?.find((t: any) => t.id === ticketId);
          if (foundTicket) {
            setTicket(foundTicket);
          } else {
            setTicket({ name: 'Ingresso Individual', price: 0 });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar as informações do evento.',
        });
      }
    };

    loadEvent();
  }, [eventId, ticketId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, photo: file }));

      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      // Validate required fields including city and birthDate for mailing
      if (!formData.name || !formData.email || !formData.phone || !formData.cpf) {
        toast({
          variant: 'destructive',
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha: Nome, Email, WhatsApp e CPF.',
        });
        return;
      }

      if (!formData.city || !formData.state) {
        toast({
          variant: 'destructive',
          title: 'Localização obrigatória',
          description: 'Informe sua cidade e estado para continuar.',
        });
        return;
      }

      if (!formData.birthDate) {
        toast({
          variant: 'destructive',
          title: 'Data de nascimento obrigatória',
          description: 'Informe sua data de nascimento para continuar.',
        });
        return;
      }

      if (!user && !formData.password) {
        toast({
          variant: 'destructive',
          title: 'Senha obrigatória',
          description: 'Crie uma senha para acessar seus ingressos.',
        });
        return;
      }
      
      if (!formData.photo && !user?.photoUrl) {
          toast({
            variant: 'destructive',
            title: 'Foto obrigatória',
            description: 'A foto de identificação é necessária para garantir sua segurança e agilizar seu check-in na portaria.',
          });
          return;
      }
    }

    // Lógica real de processamento de checkout (Fase 1: Cadastro ou atualização de perfil)
    let currentUser = user;
    if (currentStep === 0) {
      if (!user) {
        // Novo usuário — registrar
        setLoading(true);
        try {
            const regResult = await register({
                email: formData.email,
                password: formData.password || '',
                name: formData.name,
                role: 'customer',
                cpf: formData.cpf,
                phone: formData.phone,
                city: formData.city,
                state: formData.state,
                address: formData.address,
                birthDate: formData.birthDate
            });

            if (!regResult.success) {
                toast({
                    variant: 'destructive',
                    title: 'Erro no cadastro',
                    description: 'Não foi possível criar sua conta no Supabase Auth.',
                });
                setLoading(false);
                return;
            }
            const { data } = await supabase.auth.getUser();
            currentUser = data.user ? { id: data.user.id, name: formData.name, email: formData.email, role: 'customer' } as any : null;
        } catch (err) {
            console.error('Erro ao registrar:', err);
            setLoading(false);
            return;
        }
        setLoading(false);
      } else {
        // Usuário já logado — persistir dados de mailing imediatamente
        setLoading(true);
        try {
          await supabase.from('profiles').update({
            name: formData.name,
            phone: formData.phone,
            cpf: formData.cpf,
            city: formData.city,
            state: formData.state,
            address: formData.address || null,
            birth_date: formData.birthDate || null,
            gender: formData.gender || null,
          }).eq('user_id', user.id);
          await refreshUser();
        } catch (e) {
          console.warn('[CHECKOUT] Falha ao salvar dados do perfil:', e);
        }
        setLoading(false);
      }
    }

    if (currentStep === 1 || (currentStep === 0 && ticket.price === 0)) {
        setLoading(true);
        
        try {
            // Se for grátis, gera o ingresso direto
            if (ticket.price === 0) {
                let photoUrl = user?.photoUrl || '';
                if (formData.photo) {
                    const upload = await organizerService.uploadImage(
                        formData.photo, 
                        user?.id, 
                        user?.name || formData.name,
                        undefined,
                        currentUser?.role || 'customer'
                    );
                    photoUrl = upload.url;
                }

                // ETAPA: Persistência do Ingresso no Supabase
                const ticketData = {
                    user_id: currentUser?.id,
                    event_id: eventId,
                    ticket_id: (ticketId && ticketId !== 'individual') ? ticketId : null,
                    status: 'active',
                    photo_url: photoUrl,
                    qr_code_data: `TICKET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                };

                console.log('Tentando salvar ingresso:', ticketData);

                // Atualizar o perfil do usuário com CPF e Foto caso ele já exista mas não tenha esses dados
                if (currentUser?.id) {
                    await supabase.from('profiles').update({
                        cpf: formData.cpf,
                        phone: formData.phone,
                        city: formData.city,
                        state: formData.state,
                        address: formData.address,
                        birth_date: formData.birthDate,
                        gender: formData.gender,
                        photo_url: photoUrl,
                        profile_complete: true
                    }).eq('user_id', currentUser.id);
                    
                    // Sincroniza o contexto de Auth com os novos dados gravados
                    await refreshUser();
                }

                const { error, data } = await supabase
                    .from('purchased_tickets')
                    .insert(ticketData)
                    .select();

                if (error) {
                    console.error('Erro detalhado do Supabase:', error);
                    throw error;
                }
                
                // Baixa no estoque do ingresso
                if (ticketData.ticket_id) {
                    const { data: currentTicket } = await supabase
                        .from('tickets')
                        .select('remaining')
                        .eq('id', ticketData.ticket_id)
                        .single();
                        
                    if (currentTicket && currentTicket.remaining > 0) {
                        await supabase
                            .from('tickets')
                            .update({ remaining: currentTicket.remaining - 1 })
                            .eq('id', ticketData.ticket_id);
                    }
                }
                
                console.log('Ingresso salvo com sucesso:', data);

                // Disparar Webhook para n8n (WhatsApp/Email Automação)
                await webhookService.dispatch('ticket_sold', {
                    ticket_id: ticketData.qr_code_data,
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    customer_cpf: formData.cpf,
                    event_id: eventId,
                    city: formData.city,
                    state: formData.state,
                    photo_url: photoUrl
                });
            }
            
            setLoading(false);
            setCurrentStep(currentStep === 0 && ticket.price === 0 ? 2 : currentStep + 1);
        } catch (err: any) {
            console.error('Erro no catch do processamento:', err);
            toast({
                variant: 'destructive',
                title: 'Erro no processamento',
                description: `Erro: ${err.message || 'Ocorreu um erro ao gerar seu ingresso no Supabase.'}`,
            });
            setLoading(false);
        }
        return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleFinish = () => {
    navigate('/dashboard/tickets');
  };

  if (!event || !ticket) {
    return (
      <MainLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-gray-500">Carregando informações do ingresso...</p>
        </div>
      </MainLayout>
    );
  }

  // Format date
  const formattedDate = format(new Date(event.date || event.start_date || new Date()), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <MainLayout>
      <div className="bg-page py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>

          {/* Steps Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${currentStep >= index ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                  {currentStep > index ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className={`text-sm font-medium mx-2 ${currentStep >= index ? 'text-primary' : 'text-gray-500'
                    }`}>
                    {step}
                  </div>

                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-10 md:w-24 ${currentStep > index ? 'bg-primary' : 'bg-gray-200'
                      }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Step 1: User Info */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-6">Informações pessoais</h2>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome completo *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="input-field w-full"
                          required
                          disabled={!!user}
                        />
                      </div>

                      {!user && (
                        <div>
                          <label htmlFor="password" senior-class="block text-sm font-medium text-gray-700 mb-1">
                            Senha de Acesso *
                          </label>
                          <div className="relative">
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={handleInputChange}
                              className="input-field w-full pr-10"
                              placeholder="Crie uma senha"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                          CPF *
                        </label>
                        <input
                          id="cpf"
                          name="cpf"
                          type="text"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          className="input-field w-full"
                          placeholder="000.000.000-00"
                          required
                          disabled={!!user && !!user.cpf}
                        />
                      </div>

                       <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          WhatsApp (DDD + Número) *
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input-field w-full"
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade *
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="input-field w-full"
                          placeholder="Sua cidade"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          Estado (UF) *
                        </label>
                        <input
                          id="state"
                          name="state"
                          type="text"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="input-field w-full"
                          placeholder="EX: SP"
                          maxLength={2}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Endereço Completo
                        </label>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="input-field w-full"
                          placeholder="Rua, Número, Bairro"
                        />
                      </div>

                      <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Data de Nascimento *
                        </label>
                        <input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          className="input-field w-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                      <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
                        Foto para identificação *
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div 
                          className={`relative h-32 w-32 rounded-3xl overflow-hidden border-4 border-dashed transition-all duration-300 flex items-center justify-center bg-white ${
                            photoPreview ? 'border-primary border-solid' : 'border-indigo-200 hover:border-primary'
                          }`}
                        >
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-center p-4">
                              <Upload className="h-8 w-8 text-indigo-200 mx-auto" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-tight mb-2">
                            {photoPreview ? 'Foto Identificada' : 'Tirar Selfie Agora'}
                          </h4>
                          <p className="text-slate-500 text-xs font-medium mb-4 max-w-[250px]">
                            A selfie é obrigatória para sua segurança e para agilizar sua entrada no evento.
                          </p>
                          
                          <label className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-full cursor-pointer transition-all shadow-lg shadow-primary/20">
                            <Upload className="w-4 h-4" />
                            {photoPreview ? 'Trocar Foto' : 'Tirar Selfie / Escolher'}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              capture="user"
                              onChange={handlePhotoChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-6">Pagamento</h2>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div
                        className="flex-1 border-2 border-primary rounded-lg p-4 flex items-center cursor-pointer bg-primary/5"
                      >
                        <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary mr-2"></div>
                        <span>Cartão de crédito</span>
                      </div>
                      <div
                        className="flex-1 border-2 border-gray-200 rounded-lg p-4 flex items-center cursor-pointer"
                      >
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-2"></div>
                        <span>PIX</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                        Número do cartão
                      </label>
                      <input
                        id="card-number"
                        type="text"
                        className="input-field w-full"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Data de validade
                        </label>
                        <input
                          id="expiry"
                          type="text"
                          className="input-field w-full"
                          placeholder="MM/AA"
                        />
                      </div>

                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          type="text"
                          className="input-field w-full"
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="card-holder" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome no cartão
                      </label>
                      <input
                        id="card-holder"
                        type="text"
                        className="input-field w-full"
                        placeholder="Nome como aparece no cartão"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation - PREMIUM TICKET */}
                {currentStep === 2 && (
                  <div className="text-center py-4 animate-fade-in">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 animate-bounce">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>

                    <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">PARABÉNS! INGRESSO GARANTIDO.</h2>
                    <p className="text-gray-500 font-bold mb-8 uppercase text-[10px] tracking-widest">
                      Seu lugar está reservado. Prepare-se para o épico!
                    </p>

                    {/* Ticket Premium Wrapper */}
                    <div id="premium-ticket" className="relative max-w-sm mx-auto bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-800 group print:shadow-none print:border-black">
                        {/* Ticket Stub Top */}
                        <div 
                            className="absolute top-0 left-0 w-full h-4" 
                            style={{ backgroundColor: event.ticket_design?.primaryColor || '#4F46E5' }}
                        ></div>
                        
                        {/* Event Image / Gradient Header */}
                        <div 
                            className="h-32 p-6 flex items-end relative overflow-hidden"
                            style={{ 
                                background: `linear-gradient(to bottom right, ${event.ticket_design?.primaryColor || '#4F46E5'}, ${event.ticket_design?.secondaryColor || '#7C3AED'})` 
                            }}
                        >
                            <div className="absolute top-4 right-6 text-white/20 font-black text-4xl uppercase select-none">A2</div>
                            <div className="relative z-10 text-left">
                                <h3 className="text-white font-black text-xl uppercase tracking-tighter leading-none">{event.title}</h3>
                                <p className="text-indigo-200 text-[8px] font-black uppercase tracking-widest mt-1 italic">Exclusive Experience</p>
                            </div>
                        </div>

                        {/* Ticket Body */}
                        <div className="p-8 bg-white relative">
                            {/* Stub Perforation Effect */}
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900 rounded-full border-4 border-gray-800"></div>
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900 rounded-full border-4 border-gray-800"></div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-gray-100"></div>

                            {/* QR Code Section */}
                            <div className="mb-8 flex justify-center pt-4">
                                <div className="p-4 bg-white border-4 border-gray-900 rounded-3xl shadow-xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500">
                                    <div className="bg-gray-900 p-2 rounded-xl">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`TICKET-${event.id}`)}`} 
                                            alt="QR Code"
                                            className="w-40 h-40 invert grayscale"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Info */}
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Data & Hora</p>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{formattedDate}</p>
                                        <p className="text-[10px] font-bold uppercase" style={{ color: event.ticket_design?.primaryColor || '#4F46E5' }}>{event.time}H</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Local</p>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter truncate">{event.location.name}</p>
                                        <p className="text-[10px] font-bold uppercase" style={{ color: event.ticket_design?.primaryColor || '#4F46E5' }}>{event.location.city}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 text-left">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Comprador</p>
                                    <p className="text-sm font-black text-gray-950 uppercase tracking-tighter">{formData.name}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span 
                                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: `${event.ticket_design?.primaryColor || '#4F46E5'}1A`, color: event.ticket_design?.primaryColor || '#4F46E5' }}
                                        >
                                            {ticket.name}
                                        </span>
                                        <span className="font-mono text-[10px] font-black text-gray-300">#{(Math.random() * 100000).toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Stub */}
                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center items-center gap-2">
                            <ShieldCheck className="w-4 h-4" style={{ color: event.ticket_design?.primaryColor || '#4F46E5' }} />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Autenticado por Ticketera A2</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
                      <button
                        onClick={() => window.open(`https://wa.me/${formData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Aqui está seu ingresso para o evento ${event.title}. Acesse aqui: ${window.location.origin}/dashboard/tickets`)}`, '_blank')}
                        className="bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#128C7E] transition shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Receber no WhatsApp
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-xl flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" /> Imprimir Ingresso
                      </button>
                    </div>

                    <div className="mt-8 flex justify-center print:hidden">
                        <button
                          className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700 transition"
                          onClick={handleFinish}
                        >
                          Ir para meus ingressos
                        </button>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < 2 && (
                  <div className="mt-8 flex justify-end">
                    {currentStep > 0 && (
                      <button
                        className="btn-outline py-2 px-6 mr-4"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={loading}
                      >
                        Voltar
                      </button>
                    )}
                    <button
                      className="btn-primary py-2 px-6"
                      onClick={handleNextStep}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </div>
                      ) : currentStep === 0 ? (
                        ticket.price > 0 ? 'Continuar para pagamento' : 'Garantir Ingresso Grátis'
                      ) : (
                        'Finalizar compra'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold mb-4">Resumo da compra</h3>

                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h4 className="font-medium mb-2">{event.title}</h4>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formattedDate}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location_name || 'Local definido'}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">{ticket.name}</span>
                    <span>{ticket.price > 0 ? `R$ ${ticket.price.toFixed(2).replace('.', ',')}` : 'Grátis'}</span>
                  </div>
                  {ticket.price > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Taxa de serviço</span>
                      <span>R$ {(ticket.price * 0.1).toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>
                        {ticket.price > 0
                          ? `R$ ${(ticket.price * 1.1).toFixed(2).replace('.', ',')}`
                          : 'Grátis'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
