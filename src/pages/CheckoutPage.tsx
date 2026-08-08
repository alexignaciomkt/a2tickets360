import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Upload, Calendar, MapPin, Eye, EyeOff, Lock, ShieldCheck, ChevronRight, Clock, Copy, MessageCircle } from 'lucide-react';
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
  couponCode: string;
  promoterId?: string;
  discountApplied?: number;
}

// Dados de um jogador para inscricao esportiva
interface PlayerData {
  name: string;
  cpf: string;
  phone: string;
}

interface SportData {
  teamName: string;
  players: PlayerData[];
}

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  originalRegistrationId?: string;
  teamName?: string;
  players?: { order: number; name: string }[];
  usedRepechages?: number;
  maxRepechages?: number;
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
  couponCode: '',
};

const initialSportData: SportData = {
  teamName: '',
  players: [
    { name: '', cpf: '', phone: '' },
    { name: '', cpf: '', phone: '' },
  ],
};

const steps = ['Informações', 'Pagamento', 'Confirmação'];

const CheckoutPage = () => {
  const { eventId, ticketId } = useParams<{ eventId: string; ticketId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, register, refreshUser } = useAuth();

  const [event, setEvent] = useState<SupabaseEvent | null>(null);
  const [ticket, setTicket] = useState<any | null>(null);

  const [formData, setFormData] = useState<CheckoutData>(initialFormData);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [feeConfig, setFeeConfig] = useState({ percentage: 8, fixed: 5, passToBuyer: true });
  
  // Persist PIX and step across reloads
  const sessionKey = `checkout_state_${eventId}_${ticketId}`;
  const getInitialState = () => {
    try {
        const stored = sessionStorage.getItem(sessionKey);
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  };
  const initialState = getInitialState();

  const [pixData, setPixData] = useState<{ encodedImage: string, payload: string } | null>(initialState?.pixData || null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(initialState?.invoiceUrl || null);
  const [purchasedTicketId, setPurchasedTicketId] = useState<string | null>(initialState?.purchasedTicketId || null);
  const [currentStep, setCurrentStep] = useState(initialState?.currentStep || 0);

  // --- Estado esportivo ---
  const [ticketPurpose, setTicketPurpose] = useState<string>('STANDARD');
  const [registrationType, setRegistrationType] = useState<string>('INDIVIDUAL');
  const [participantsPerReg, setParticipantsPerReg] = useState<number>(1);
  const [sportData, setSportData] = useState<SportData>(initialSportData);
  // Repescagem
  const [repechageCpf, setRepechageCpf] = useState('');
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);

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
            // Detectar tipo de lote esportivo
            setTicketPurpose(foundTicket.ticket_purpose || 'STANDARD');
            setRegistrationType(foundTicket.registration_type || 'INDIVIDUAL');
            setParticipantsPerReg(Number(foundTicket.participants_per_registration) || 1);
            // Para DOUBLE, garantir 2 jogadores no sportData
            if (foundTicket.registration_type === 'DOUBLE') {
              setSportData(initialSportData);
            }
          } else {
            setTicket({ name: 'Ingresso Individual', price: 0 });
          }

          // Apply event specific fee settings if available
          const eventPassFee = foundEvent.settings?.pass_fee_to_buyer;
          let newFeeConfig = { percentage: 8, fixed: 5, passToBuyer: eventPassFee !== undefined ? eventPassFee : true };

          const orgId = foundEvent.organizer_id || foundEvent.organizer?.id;
          if (orgId) {
            try {
              const { data: orgData } = await supabase
                .from('organizers')
                .select('fee_percentage, fee_fixed, pass_fee_to_buyer')
                .eq('id', orgId)
                .maybeSingle();
                
              if (orgData) {
                newFeeConfig.percentage = orgData.fee_percentage !== null ? Number(orgData.fee_percentage) : 8;
                newFeeConfig.fixed = orgData.fee_fixed !== null ? Number(orgData.fee_fixed) : 5;
                if (eventPassFee === undefined) {
                  newFeeConfig.passToBuyer = orgData.pass_fee_to_buyer !== false;
                }
              }
            } catch (e) {
              console.warn('Could not load organizer fee settings, using defaults', e);
            }
          }
          
          setFeeConfig(newFeeConfig);
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

  // Check if user already has a ticket for this event
  useEffect(() => {
    const checkExistingTicket = async () => {
      if (!user || !eventId) return;
      
      try {
        const { data, error } = await supabase
          .from('purchased_tickets')
          .select('id')
          .eq('user_id', user.id)
          .eq('event_id', eventId)
          .in('status', ['active', 'used'])
          .maybeSingle();

        if (data) {
          setHasTicket(true);
        }
      } catch (e) {
        console.error('Erro ao verificar ingresso existente:', e);
      }
    };

    checkExistingTicket();
  }, [user, eventId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() === value && name === 'couponCode' ? value : value }));
  };

  const handleApplyCoupon = async () => {
    if (!formData.couponCode) return;
    setValidatingCoupon(true);
    setCouponMessage({ text: '', type: '' });

    try {
      // 1. Procurar cupom na tabela coupons (organizador)
      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', formData.couponCode.toUpperCase())
        .eq('event_id', eventId)
        .single();

      if (couponData) {
         setFormData(prev => ({ ...prev, discountApplied: couponData.discount_value }));
         setCouponMessage({ text: 'Cupom de Desconto aplicado!', type: 'success' });
      } else {
         // 2. Se não for cupom do organizador, procurar se é o "Slug" de um promoter ativo
         const { data: promoterData } = await supabase
           .from('promoters')
           .select('id, name')
           .eq('slug', formData.couponCode.toLowerCase())
           .eq('status', 'active')
           .single();

         if (promoterData) {
            setFormData(prev => ({ ...prev, promoterId: promoterData.id }));
            setCouponMessage({ text: `Promoter ${promoterData.name} vinculado!`, type: 'success' });
         } else {
            setCouponMessage({ text: 'Cupom inválido ou expirado.', type: 'error' });
            setFormData(prev => ({ ...prev, promoterId: undefined, discountApplied: undefined }));
         }
      }
    } catch (e) {
      setCouponMessage({ text: 'Erro ao validar cupom.', type: 'error' });
    }
    setValidatingCoupon(false);
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

  // Atualizar campo de um jogador especifico
  const handlePlayerChange = (playerIndex: number, field: keyof PlayerData, value: string) => {
    setSportData(prev => {
      const newPlayers = [...prev.players];
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], [field]: value };
      return { ...prev, players: newPlayers };
    });
  };

  // Verificar elegibilidade de repescagem via backend
  const handleCheckEligibility = async () => {
    if (!repechageCpf || !eventId || !ticketId) return;
    setCheckingEligibility(true);
    setEligibilityResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/sports/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ticketId, cpf: repechageCpf }),
      });
      const data = await res.json();
      setEligibilityResult(data);
    } catch {
      setEligibilityResult({ eligible: false, reason: 'Erro ao verificar elegibilidade. Tente novamente.' });
    }
    setCheckingEligibility(false);
  };

  // Polling PIX status
  useEffect(() => {
    if (currentStep === 2 && pixData && purchasedTicketId) {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/purchased-tickets/${purchasedTicketId}/status`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'paid' || data.status === 'active') {
                        clearInterval(interval);
                        toast({
                            title: 'Pagamento Confirmado! 🎉',
                            description: 'Seu PIX foi recebido com sucesso!',
                            className: 'bg-green-500 text-white',
                        });
                        sessionStorage.removeItem(sessionKey);
                        navigate('/dashboard/tickets');
                    }
                }
            } catch (err) {
                // just ignore polling errors
            }
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [currentStep, pixData, purchasedTicketId, navigate, sessionKey, toast]);

  const handleNextStep = async () => {
    if (currentStep === 0) {
      // Para REPECHAGE: bloquear avanco sem elegibilidade confirmada
      if (ticketPurpose === 'REPECHAGE') {
        if (!eligibilityResult?.eligible) {
          toast({
            variant: 'destructive',
            title: 'Elegibilidade necessaria',
            description: 'Informe um CPF valido e verifique a elegibilidade antes de continuar.',
          });
          return;
        }
        // Para REPECHAGE, nao precisamos dos campos comuns de cadastro
        // pular direto para pagamento
      } else {
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

      // Validacao esportiva: REGISTRATION/DOUBLE exige nome da dupla e dados dos jogadores
      if (ticketPurpose === 'REGISTRATION' && registrationType === 'DOUBLE') {
        if (!sportData.teamName.trim()) {
          toast({ variant: 'destructive', title: 'Nome da dupla obrigatorio', description: 'Informe o nome da dupla.' });
          return;
        }
        for (let i = 0; i < 2; i++) {
          const p = sportData.players[i];
          if (!p.name.trim() || !p.cpf.trim() || !p.phone.trim()) {
            toast({ variant: 'destructive', title: `Competidor ${i + 1} incompleto`, description: `Preencha nome, CPF e WhatsApp do Competidor ${i + 1}.` });
            return;
          }
        }
      }
      } // fecha else do REPECHAGE (if REPECHAGE → early return, else → valida campos acima)
    } // fecha if(currentStep === 0) — validações do step 0

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

                // Registrar a conversão se houver promoter
                if (formData.promoterId) {
                   await supabase.from('promoter_sales').insert({
                      promoter_id: formData.promoterId,
                      event_id: eventId,
                      ticket_id: ticketData.ticket_id,
                      sale_amount: ticket.price,
                      customer_id: currentUser?.id
                   });
                }

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
            } else {
                // Integracao real com Asaas
                // Montar sportData para envio
                let sportPayload: any = undefined;
                if (ticketPurpose === 'REGISTRATION') {
                    sportPayload = {
                        teamName: sportData.teamName,
                        players: sportData.players.map(p => ({
                            name: p.name,
                            cpf: p.cpf,
                            phone: p.phone,
                        })),
                    };
                } else if (ticketPurpose === 'REPECHAGE' && eligibilityResult?.eligible) {
                    sportPayload = {
                        originalRegistrationId: eligibilityResult.originalRegistrationId,
                        cpf: repechageCpf,
                    };
                }

                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ticketId: ticket.id,
                        quantity: 1,
                        buyerId: user?.id,
                        buyerName: formData.name || eligibilityResult?.teamName || 'Comprador',
                        buyerEmail: formData.email,
                        buyerCpf: formData.cpf || repechageCpf,
                        paymentMethod: 'PIX',
                        sportData: sportPayload,
                    })
                });
                const responseData = await res.json();
                if (responseData.status === 'success' && responseData.invoiceUrl) {
                    setInvoiceUrl(responseData.invoiceUrl);
                    
                    let newPixData = null;
                    if (responseData.pixQrCode && responseData.pixQrCode.encodedImage) {
                        setPixData(responseData.pixQrCode);
                        newPixData = responseData.pixQrCode;
                    } else {
                        window.open(responseData.invoiceUrl, '_blank');
                    }
                    
                    // Save to sessionStorage
                    sessionStorage.setItem(sessionKey, JSON.stringify({
                        currentStep: currentStep + 1,
                        invoiceUrl: responseData.invoiceUrl,
                        pixData: newPixData,
                        purchasedTicketId: responseData.purchasedTicketId
                    }));
                    setPurchasedTicketId(responseData.purchasedTicketId);

                    setLoading(false);
                    setCurrentStep(currentStep + 1);
                    return;
                } else {
                    throw new Error(responseData.error || 'Erro ao processar pagamento no Asaas');
                }
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

    // If successful (free ticket), clear session state just in case
    sessionStorage.removeItem(sessionKey);
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
              {hasTicket && currentStep < 2 ? (
                <div className="bg-white rounded-3xl shadow-xl p-10 text-center border-2 border-amber-100">
                  <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">Você já garantiu seu lugar!</h2>
                  <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
                    Identificamos que você já possui um ingresso ativo para este evento. Para garantir a segurança e o limite de público, é permitido apenas um ingresso por CPF.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => navigate('/dashboard/tickets')}
                      className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      Ver Meus Ingressos
                    </button>
                    <button 
                      onClick={() => navigate('/events')}
                      className="bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors"
                    >
                      Explorar outros eventos
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  {/* Step 1: User Info — REPECHAGE */}
                  {currentStep === 0 && ticketPurpose === 'REPECHAGE' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-2">Repescagem — Verificar Elegibilidade</h2>
                    <p className="text-sm text-gray-500">Informe o CPF de um dos competidores da dupla inscrita neste evento.</p>

                    <div className="flex gap-2">
                      <input
                        id="repechage-cpf"
                        type="text"
                        value={repechageCpf}
                        onChange={e => { setRepechageCpf(e.target.value); setEligibilityResult(null); }}
                        className="input-field flex-1"
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                      <button
                        type="button"
                        onClick={handleCheckEligibility}
                        disabled={checkingEligibility || !repechageCpf}
                        className="bg-primary text-white px-6 rounded-lg font-black uppercase text-xs tracking-widest disabled:opacity-50 transition"
                      >
                        {checkingEligibility ? '...' : 'Verificar'}
                      </button>
                    </div>

                    {eligibilityResult && !eligibilityResult.eligible && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-600 font-semibold text-sm">{eligibilityResult.reason}</p>
                      </div>
                    )}

                    {eligibilityResult?.eligible && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 space-y-3">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Inscrição encontrada ✓</p>
                        <h3 className="text-xl font-black text-slate-900 uppercase">{eligibilityResult.teamName}</h3>
                        <div className="space-y-1">
                          {eligibilityResult.players?.map(p => (
                            <p key={p.order} className="text-sm text-slate-700">
                              <span className="font-bold">Competidor {p.order}:</span> {p.name}
                            </p>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-green-100">
                          <p className="text-sm text-slate-600">
                            Repescagens utilizadas: <strong>{eligibilityResult.usedRepechages} de {eligibilityResult.maxRepechages}</strong>
                          </p>
                        </div>
                        <div className="pt-4 border-t border-green-100 space-y-3">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dados do Pagador</p>
                          <input
                            id="email-repechage"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="input-field w-full"
                            placeholder="Email para confirmação"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Step 1: User Info — REGISTRATION ou STANDARD */}
                  {currentStep === 0 && ticketPurpose !== 'REPECHAGE' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-6">
                      {ticketPurpose === 'REGISTRATION' && registrationType === 'DOUBLE'
                        ? 'Dados do Comprador e da Dupla'
                        : 'Informações pessoais'}
                    </h2>

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
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-tight mb-2">
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

                {/* DADOS DA DUPLA — aparece no step 0 para REGISTRATION/DOUBLE */}
                {currentStep === 0 && ticketPurpose === 'REGISTRATION' && registrationType === 'DOUBLE' && (
                  <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-5">Dados da Dupla</p>
                    <div className="mb-5">
                      <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Dupla *</label>
                      <input
                        id="team-name"
                        type="text"
                        value={sportData.teamName}
                        onChange={e => setSportData(prev => ({ ...prev, teamName: e.target.value }))}
                        className="input-field w-full font-bold uppercase"
                        placeholder="Ex: SILVA & COSTA"
                      />
                    </div>
                    {[0, 1].map(idx => (
                      <div key={idx} className="bg-indigo-50/40 rounded-2xl p-5 mb-4 border border-indigo-100">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Competidor {idx + 1}</p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                            <input id={`player-${idx}-name`} type="text" value={sportData.players[idx]?.name || ''} onChange={e => handlePlayerChange(idx, 'name', e.target.value)} className="input-field w-full" placeholder="Nome completo" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                              <input id={`player-${idx}-cpf`} type="text" value={sportData.players[idx]?.cpf || ''} onChange={e => handlePlayerChange(idx, 'cpf', e.target.value)} className="input-field w-full" placeholder="000.000.000-00" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                              <input id={`player-${idx}-phone`} type="tel" value={sportData.players[idx]?.phone || ''} onChange={e => handlePlayerChange(idx, 'phone', e.target.value)} className="input-field w-full" placeholder="(00) 00000-0000" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 italic mt-2">O comprador não precisa ser competidor. Os dados são independentes.</p>
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-6">Pagamento</h2>

                    {/* CUPOM DE PROMOTER */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                      <label className="block text-sm font-black uppercase tracking-widest text-gray-500 mb-2">
                        Possui cupom ou código de promoter?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="couponCode"
                          value={formData.couponCode}
                          onChange={(e) => setFormData(prev => ({...prev, couponCode: e.target.value.toUpperCase()}))}
                          className="input-field flex-1 font-black uppercase tracking-widest"
                          placeholder="EX: JOAO10"
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !formData.couponCode}
                          className="bg-gray-900 text-white px-6 rounded-lg font-black uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                          {validatingCoupon ? '...' : 'Aplicar'}
                        </button>
                      </div>
                      {couponMessage.text && (
                        <p className={`text-xs font-bold mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                          {couponMessage.text}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div
                        className="flex-1 border-2 border-primary rounded-lg p-4 flex items-center cursor-pointer bg-primary/5"
                      >
                        <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary mr-2 flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                        <span className="font-bold">PIX (Aprovação Instantânea)</span>
                      </div>
                    </div>

                    {/* Removed static credit card fields */}
                  </div>
                )}

                {/* Step 3: Confirmation - PREMIUM TICKET or PIX PAYMENT */}
                {currentStep === 2 && (
                  <div className="text-center py-4 animate-fade-in">
                    
                    {pixData ? (
                        // MODO PAGAMENTO PENDENTE (PIX)
                        <div className="mb-8">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4 animate-pulse">
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <h2 className="text-3xl font-black mb-2 tracking-tight uppercase text-yellow-600">Aguardando Pagamento</h2>
                            <p className="text-gray-500 font-bold mb-8 uppercase text-xs tracking-widest">
                                Escaneie o QR Code abaixo para garantir seu ingresso.
                            </p>

                            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 max-w-sm mx-auto">
                                <img src={`data:image/png;base64,${pixData.encodedImage}`} alt="QR Code PIX" className="w-full h-auto mx-auto border border-gray-200 rounded-lg p-2" />
                                <div className="mt-6">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">PIX Copia e Cola</p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={pixData.payload} 
                                            readOnly 
                                            className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 w-full font-mono outline-none"
                                        />
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(pixData.payload);
                                                toast({ title: 'Copiado!', description: 'Código PIX copiado para a área de transferência', variant: 'default' });
                                            }}
                                            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                {invoiceUrl && (
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => window.open(invoiceUrl, '_blank')}
                                            className="text-indigo-600 text-xs font-bold underline uppercase"
                                        >
                                            Pagar depois (Abrir fatura)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // MODO INGRESSO GARANTIDO (GRATUITO)
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 animate-bounce">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>

                            <h2 className="text-3xl font-black mb-2 tracking-tight uppercase">PARABÉNS! INGRESSO GARANTIDO.</h2>
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
                                <h3 className="text-white font-black text-xl uppercase tracking-tight leading-none">{event.title}</h3>
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
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{formattedDate}</p>
                                        <p className="text-[10px] font-bold uppercase" style={{ color: event.ticket_design?.primaryColor || '#4F46E5' }}>{event.time}H</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Local</p>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate">{event.location.name}</p>
                                        <p className="text-[10px] font-bold uppercase" style={{ color: event.ticket_design?.primaryColor || '#4F46E5' }}>{event.location.city}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 text-left">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Comprador</p>
                                    <p className="text-sm font-black text-gray-950 uppercase tracking-tight">{formData.name}</p>
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
                    </>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
                      {pixData ? (
                         <button
                           onClick={() => {
                               sessionStorage.removeItem(sessionKey);
                               navigate('/dashboard/tickets');
                           }}
                           className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition flex items-center justify-center gap-2"
                         >
                           Ir para Meus Ingressos
                         </button>
                      ) : (
                        <>
                          <button
                            onClick={() => window.open(`https://wa.me/${formData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Aqui está seu ingresso para o evento ${event.title}. Acesse aqui: ${window.location.origin}/dashboard/tickets`)}`, '_blank')}
                            className="bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#128C7E] transition shadow-xl flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5" /> Enviar por WhatsApp
                          </button>
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Check className="w-5 h-5" /> Imprimir Ingresso
                          </button>
                        </>
                      )}
                    </div>

                    {!pixData && (
                        <div className="mt-8 flex justify-center print:hidden">
                            <button
                              className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700 transition"
                              onClick={() => {
                                  sessionStorage.removeItem(sessionKey);
                                  handleFinish();
                              }}
                            >
                              Ir para meus ingressos
                            </button>
                        </div>
                    )}
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
            )}
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
                  {ticket.price > 0 && feeConfig.passToBuyer && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Taxa de serviço</span>
                      <span>R$ {((ticket.price * (feeConfig.percentage / 100)) + feeConfig.fixed).toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>
                        {ticket.price > 0
                          ? `R$ ${((ticket.price - (formData.discountApplied || 0)) + (feeConfig.passToBuyer ? ((ticket.price * (feeConfig.percentage / 100)) + feeConfig.fixed) : 0)).toFixed(2).replace('.', ',')}`
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
