
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Upload, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MainLayout from '@/components/layout/MainLayout';
import { events, Event, Ticket } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';

interface CheckoutData {
  name: string;
  email: string;
  cpf: string;
  photo: File | null;
}

const initialFormData: CheckoutData = {
  name: '',
  email: '',
  cpf: '',
  photo: null,
};

const steps = ['Informações', 'Pagamento', 'Confirmação'];

const CheckoutPage = () => {
  const { eventId, ticketId } = useParams<{ eventId: string; ticketId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CheckoutData>(initialFormData);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Load event and ticket data
  useEffect(() => {
    const foundEvent = events.find((e) => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
      
      const foundTicket = foundEvent.tickets.find((t) => t.id === ticketId);
      if (foundTicket) {
        setTicket(foundTicket);
      }
    }
  }, [eventId, ticketId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, photo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNextStep = () => {
    if (currentStep === 0) {
      // Validate first step
      if (!formData.name || !formData.email || !formData.cpf || !formData.photo) {
        toast({
          variant: 'destructive',
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha todos os campos obrigatórios.',
        });
        return;
      }
    }
    
    if (currentStep === 1) {
      // Simulate payment processing
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setCurrentStep(currentStep + 1);
      }, 2000);
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
  const formattedDate = format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
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
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                    currentStep >= index ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > index ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className={`text-sm font-medium mx-2 ${
                    currentStep >= index ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {step}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-10 md:w-24 ${
                      currentStep > index ? 'bg-primary' : 'bg-gray-200'
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
                      />
                    </div>
                    
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
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Foto para identificação *
                      </label>
                      <div className="mt-1 flex items-center space-x-4">
                        {photoPreview ? (
                          <div className="relative">
                            <img 
                              src={photoPreview} 
                              alt="Preview" 
                              className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                            />
                            <button
                              type="button"
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, photo: null }));
                                setPhotoPreview(null);
                              }}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-3 w-3" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center bg-gray-100 h-20 w-20 rounded-full">
                            <Upload className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        
                        <label className="btn-secondary py-2 px-4 cursor-pointer">
                          Escolher foto
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoChange}
                          />
                        </label>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Esta foto será usada para confirmação de identidade no check-in.
                      </p>
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
                
                {/* Step 3: Confirmation */}
                {currentStep === 2 && (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">Compra confirmada!</h2>
                    <p className="text-gray-600 mb-6">
                      Seu ingresso foi comprado com sucesso. Você pode acessá-lo na sua área de ingressos.
                    </p>
                    
                    <div className="border border-gray-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
                      <h3 className="text-lg font-semibold mb-4">{event.title}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {formattedDate}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        {event.location.name}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Ingresso:</span>
                          <span className="font-medium">{ticket.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-lg">
                            R$ {ticket.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="btn-primary py-3 px-8"
                      onClick={handleFinish}
                    >
                      Ver meus ingressos
                    </button>
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
                        'Continuar para pagamento'
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
                    {event.location.name}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">{ticket.name}</span>
                    <span>R$ {ticket.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Taxa de serviço</span>
                    <span>R$ {(ticket.price * 0.1).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>R$ {(ticket.price * 1.1).toFixed(2).replace('.', ',')}</span>
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
