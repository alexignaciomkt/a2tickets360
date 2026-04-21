import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Check, 
  ShoppingBag, 
  MapPin, 
  Truck, 
  CreditCard, 
  ChevronRight, 
  AlertCircle,
  Package,
  ShieldCheck,
  Info,
  Loader2
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import { supabase } from '@/lib/supabase';

const ProductCheckoutPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Shipping, 3: Payment, 4: Success
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    zipCode: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    deliveryMethod: 'pickup', // pickup or shipping
    variant: null as any
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        cpf: (user as any).cpf || '',
        phone: (user as any).phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        // We'll need a way to get one specific product from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*, product_variants(*), organizer:organizer_id(id, company_name, slug)')
          .eq('id', productId)
          .single();

        if (error) throw error;
        setProduct(data);
        
        // If has variants, select the first one by default
        if (data.product_variants && data.product_variants.length > 0) {
            setFormData(prev => ({ ...prev, variant: data.product_variants[0] }));
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Produto não encontrado.'
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.cpf) {
        toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha seus dados para continuar.' });
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.deliveryMethod === 'shipping' && (!formData.zipCode || !formData.address)) {
        toast({ variant: 'destructive', title: 'Endereço obrigatório', description: 'Preencha o endereço para entrega.' });
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleFinishPurchase = async () => {
    try {
      setLoading(true);
      
      const subtotal = parseFloat(formData.variant?.price || product.price);
      const fee = subtotal * 0.12;
      const total = subtotal; // Fee is internal on Ticketera split logic

      const orderData = {
        organizer_id: product.organizer_id,
        buyer_id: user?.id || null,
        buyer_name: formData.name,
        buyer_email: formData.email,
        buyer_phone: formData.phone,
        total_value: subtotal,
        platform_fee: fee,
        producer_net: subtotal - fee,
        status: 'pending',
        shipping_address: formData.deliveryMethod === 'pickup' ? { method: 'Retirada no Local' } : {
            method: 'Entrega via Correios/Transportadora',
            street: formData.address,
            number: formData.number,
            city: formData.city,
            state: formData.state,
            zip: formData.zipCode
        },
        items: [{
            product_id: product.id,
            variant_id: formData.variant?.id || null,
            name: product.name,
            variant_name: formData.variant?.name || null,
            price: subtotal,
            quantity: 1
        }]
      };

      const { error } = await supabase.from('product_orders').insert(orderData);
      if (error) throw error;

      setCurrentStep(4);
      toast({ title: 'Sucesso!', description: 'Seu pedido foi registrado. Aguardando confirmação de pagamento.' });
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      toast({ variant: 'destructive', title: 'Erro técnico', description: 'Não foi possível processar seu pedido.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && currentStep !== 4) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4">
          
          {currentStep < 4 && (
            <div className="mb-10">
              <div className="flex items-center justify-between max-w-xs mx-auto">
                  {[1, 2, 3].map(step => (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black ${currentStep >= step ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-200 text-gray-500'}`}>
                            {currentStep > step ? <Check className="h-5 w-5" /> : step}
                        </div>
                      </div>
                  ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Main Content */}
            <div className={`md:col-span-7 ${currentStep === 4 ? 'col-span-full' : ''}`}>
              
              {currentStep === 1 && (
                <Card className="border-none shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-black">
                        <Info className="h-6 w-6 text-indigo-600" /> Seus Dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome Completo" className="h-12" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@exemplo.com" className="h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>CPF</Label>
                            <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" className="h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label>WhatsApp</Label>
                            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" className="h-12" />
                        </div>
                    </div>

                    {product.product_variants?.length > 0 && (
                        <div className="pt-4 border-t">
                            <Label className="mb-3 block font-bold">Selecione a Variação</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {product.product_variants.map((v: any) => (
                                    <Button 
                                      key={v.id} 
                                      variant={formData.variant?.id === v.id ? 'default' : 'outline'}
                                      className={`h-14 justify-start font-bold ${formData.variant?.id === v.id ? 'bg-indigo-600' : ''}`}
                                      onClick={() => setFormData({...formData, variant: v})}
                                    >
                                        <div className="text-left">
                                            <p className="text-sm">{v.name}</p>
                                            <p className="text-[10px] opacity-70">R$ {parseFloat(v.price || product.price).toFixed(2)}</p>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleNextStep} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-black rounded-xl">
                        Continuar <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="border-none shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black">Entrega e Logística</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup 
                      value={formData.deliveryMethod} 
                      onValueChange={val => setFormData({...formData, deliveryMethod: val})}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${formData.deliveryMethod === 'pickup' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`} onClick={() => setFormData({...formData, deliveryMethod: 'pickup'})}>
                            <RadioGroupItem value="pickup" id="pickup" />
                            <div className="flex-1">
                                <Label htmlFor="pickup" className="font-bold flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Retirada no Local
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">Combine com o produtor no dia do evento.</p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${formData.deliveryMethod === 'shipping' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`} onClick={() => setFormData({...formData, deliveryMethod: 'shipping'})}>
                            <RadioGroupItem value="shipping" id="shipping" />
                            <div className="flex-1">
                                <Label htmlFor="shipping" className="font-bold flex items-center gap-2">
                                    <Truck className="h-4 w-4" /> Envio por Correio
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">Custos de frete serão combinados à parte.</p>
                            </div>
                        </div>
                    </RadioGroup>

                    {formData.deliveryMethod === 'shipping' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-1">
                                    <Label>CEP</Label>
                                    <Input value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} placeholder="00000-000" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Endereço</Label>
                                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, Av..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Cidade" />
                                <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Estado" />
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                        <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                            <strong>Aviso Importante:</strong> A entrega deste produto é de inteira responsabilidade do produtor <strong>{product.organizer?.company_name}</strong>. A A2Tickets processa o pagamento com segurança, mas não realiza a entrega física de mercadorias.
                        </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="h-14 font-black">Voltar</Button>
                    <Button onClick={handleNextStep} className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-black rounded-xl">Próximo</Button>
                  </CardFooter>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="border-none shadow-xl rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black flex items-center gap-2">
                            <CreditCard className="h-6 w-6 text-indigo-600" /> Pagamento Seguro
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-6 border-2 border-indigo-600 bg-indigo-50 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CreditCard className="h-8 w-8 text-indigo-600" />
                                <div>
                                    <p className="font-black">Cartão de Crédito ou PIX</p>
                                    <p className="text-xs text-indigo-400">Processado via Asaas</p>
                                </div>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-bold">R$ {parseFloat(formData.variant?.price || product.price).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 text-sm">
                                <span>Taxa da Plataforma</span>
                                <span>Inclusa</span>
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center text-2xl font-black">
                                <span>Total</span>
                                <span className="text-indigo-600">R$ {parseFloat(formData.variant?.price || product.price).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 justify-center text-xs text-gray-400 font-bold">
                            <ShieldCheck className="h-4 w-4" /> Pagamento Processado com Criptografia SSL
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button onClick={handleFinishPurchase} disabled={loading} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-xl font-black rounded-xl shadow-lg">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Finalizar Pagamento'}
                        </Button>
                        <Button variant="ghost" onClick={() => setCurrentStep(2)} className="text-gray-400 font-bold">Alterar informações de entrega</Button>
                    </CardFooter>
                </Card>
              )}

              {currentStep === 4 && (
                  <Card className="border-none shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in duration-500">
                      <div className="bg-green-600 py-12 text-center text-white">
                          <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur">
                              <ShoppingBag className="h-10 w-10" />
                          </div>
                          <h2 className="text-4xl font-black mb-2">Pedido Recebido!</h2>
                          <p className="text-green-100 font-bold">Obrigado pela sua compra.</p>
                      </div>
                      <CardContent className="p-8 text-center space-y-8">
                          <div className="space-y-2">
                              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Acompanhamento</p>
                              <h3 className="text-xl font-black text-gray-900">Seu pedido já foi enviado ao produtor.</h3>
                              <p className="text-sm text-gray-600 max-w-sm mx-auto">Em instantes você receberá um e-mail com as instruções de confirmação do pagamento e detalhes de entrega.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Button asChild className="h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black shadow-lg">
                                  <Link to="/dashboard">Ir para meu Painel</Link>
                              </Button>
                              <Button asChild variant="outline" className="h-14 border-2 rounded-2xl font-black">
                                  <Link to={`/p/${product.organizer?.slug}`}>Voltar para Loja</Link>
                              </Button>
                          </div>
                      </CardContent>
                  </Card>
              )}
            </div>

            {/* Sidebar Summary */}
            {currentStep < 4 && (
              <div className="md:col-span-5 space-y-6">
                <Card className="border-none shadow-xl rounded-2xl overflow-hidden skew-y-0 hover:-translate-y-1 transition-transform">
                  <div className="h-2 bg-indigo-600"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                        <ShoppingBag className="h-5 w-5 text-indigo-600" /> Resumo do Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
                            <img src={product.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-indigo-500 font-bold">{formData.variant?.name || 'Variação Única'}</p>
                            <p className="text-sm font-black mt-1">R$ {parseFloat(formData.variant?.price || product.price).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t space-y-2 text-sm">
                        <div className="flex justify-between items-center text-gray-500">
                            <span>Vendido por:</span>
                            <span className="font-bold text-gray-900">{product.organizer?.company_name}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500">
                            <span>Quantidade:</span>
                            <span className="font-bold text-gray-900">1</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500">
                            <span>Método:</span>
                            <span className="font-bold text-indigo-600">{formData.deliveryMethod === 'pickup' ? 'Retirada' : 'Entrega'}</span>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl flex gap-3 items-center">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <span className="text-[10px] text-gray-500 font-bold leading-tight uppercase">Garantia de transação segura pela A2Tickets</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-4 p-4 text-xs font-bold text-gray-400">
                    <Package className="h-4 w-4" />
                    ENTREGA EM TODO O BRASIL*
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductCheckoutPage;
