import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, CreditCard, Zap, ShieldCheck, ArrowRight, Loader2, 
  CheckCircle2, Wallet, Banknote, Sparkles, MoveRight, ChevronLeft,
  Clock, AlertTriangle, HelpCircle, Check, X
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const AsaasOnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [walletId, setWalletId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isCreatingExpress, setIsCreatingExpress] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLinkWallet = async () => {
    if (!walletId || walletId.length < 10) {
      toast({
        title: 'ID Inválido',
        description: 'Verifique o Wallet ID colado. Ele deve conter letras e números.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLinking(true);
      const { error } = await supabase
        .from('organizers')
        .update({ wallet_id: walletId })
        .eq('id', user?.id);

      if (error) throw error;

      setSuccess(true);
      toast({ title: 'Recebedor Vinculado!', description: 'Sua conta foi vinculada com sucesso.' });
      setTimeout(() => navigate('/organizer/events/create'), 2000);
    } catch (error) {
      console.error('Erro ao vincular wallet:', error);
      toast({ title: 'Erro na vinculação', description: 'Não foi possível salvar o Wallet ID.', variant: 'destructive' });
    } finally {
      setIsLinking(false);
    }
  };

  const handleCreateExpressAccount = async () => {
    setIsCreatingExpress(true);
    // Simulação da criação da Subconta - Na V2 isso baterá na API Real do Asaas para criar a subconta
    setTimeout(() => {
      setIsCreatingExpress(false);
      toast({
        title: 'Conta Express Ativada',
        description: 'Você optou pela conta padrão com repasse em D+30. Você já pode criar eventos pagos.',
      });
      // Mocking a fake wallet ID to unblock them for now
      setWalletId('express_account_' + Date.now());
      handleLinkWallet();
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 relative overflow-x-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-[700px] bg-[#001530] overflow-hidden pointer-events-none rounded-b-[4rem]">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[600px] bg-[#00D7FF] rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[400px] bg-[#0050A0] rounded-full mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none"></div>
        </div>

        {/* Topbar: Voltar */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 pt-6">
          <button 
            onClick={() => navigate('/organizer/dashboard')}
            className="flex items-center gap-2 text-white/70 hover:text-white font-medium transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para o Painel
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10 space-y-24">
          
          {/* 1. HERO SECTION (2 Columns) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center pt-16 md:pt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Left: Text */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#00D7FF] font-bold text-sm tracking-wide">
                <ShieldCheck className="w-4 h-4" />
                Infraestrutura Financeira A2 Tickets360
              </div>
              
              <div className="flex flex-col gap-2">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
                  A revolução do repasse
                </h1>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#00D7FF] drop-shadow-lg">
                  direto na sua conta.
                </h2>
              </div>

              <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                O mercado de eventos mudou. Esqueça plataformas que seguram o seu dinheiro por semanas. Aqui, conectamos o seu evento <strong className="text-white">diretamente ao nosso Banco Parceiro Oficial</strong>, garantindo que o valor das vendas caia no seu saldo em tempo real.
              </p>
            </div>

            {/* Right: Floating Images Composition */}
            <div className="relative h-[400px] md:h-[500px] hidden md:block">
              {/* Main App Mockup */}
              <div className="absolute top-0 right-10 z-20 animate-in fade-in slide-in-from-right-12 duration-1000 delay-200">
                <img 
                  src="/fintech-app.png" 
                  alt="Aplicativo Financeiro A2 Tickets" 
                  className="w-auto h-[450px] object-cover rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-[-6deg] hover:rotate-[-2deg] transition-transform duration-700 border-4 border-slate-800/50"
                />
              </div>
              
              {/* Floating Card */}
              <div className="absolute bottom-10 left-0 z-30 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                <img 
                  src="/fintech-hero.png" 
                  alt="Cartão Corporativo" 
                  className="w-[280px] object-cover rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] rotate-[12deg] hover:rotate-[5deg] transition-transform duration-700 hover:scale-105 border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* 2. EXPLANATION SECTION (Textos Corridos) */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 mb-6">
                  <Banknote className="w-7 h-7 text-[#002B5C]" />
                </div>
                <h2 className="text-3xl font-black text-[#002B5C] leading-tight">
                  Por que exigimos uma <br/>Conta de Recebimentos?
                </h2>
                <div className="space-y-4 text-slate-700 font-medium leading-relaxed text-lg">
                  <p>
                    A maioria das ticketeiras tradicionais funciona como um "atravessador": o cliente compra, o dinheiro vai para a conta da plataforma, e só depois de muitos dias (ou após o evento) eles repassam o valor para o produtor.
                  </p>
                  <p>
                    Na <strong>A2 Tickets360</strong>, nós utilizamos uma tecnologia avançada chamada <em>Split de Pagamento</em>. Ao configurar sua conta parceira, a transação do cliente é dividida matematicamente no milissegundo da compra. A nossa taxa vem para nós, e o <strong className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">valor integral do seu ingresso vai direto para a sua conta bancária oficial</strong>.
                  </p>
                  <p>
                    Isso significa que você tem fluxo de caixa imediato para investir em anúncios, pagar fornecedores e escalar o seu evento sem precisar pedir permissão para sacar o seu próprio dinheiro.
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D7FF] rounded-full blur-3xl opacity-10"></div>
                <ul className="space-y-6 relative z-10">
                  <li className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><Check className="w-6 h-6" /></div>
                    <div><h4 className="font-bold text-slate-900 text-lg">Segurança Jurídica</h4><p className="text-sm text-slate-600 font-medium mt-1">Sua conta será uma conta digital protegida pelas normativas do Banco Central do Brasil.</p></div>
                  </li>
                  <li className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><Check className="w-6 h-6" /></div>
                    <div><h4 className="font-bold text-slate-900 text-lg">Autonomia Total</h4><p className="text-sm text-slate-600 font-medium mt-1">Faça pagamentos, transferências Pix e TEDs sem depender do suporte da ticketera.</p></div>
                  </li>
                  <li className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><Check className="w-6 h-6" /></div>
                    <div><h4 className="font-bold text-slate-900 text-lg">Gestão Descomplicada</h4><p className="text-sm text-slate-600 font-medium mt-1">Acompanhe extratos e baixe relatórios financeiros com qualidade bancária.</p></div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. COMPARATIVE SECTION */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-[#002B5C]">Escolha a sua modalidade de recebimento</h2>
              <p className="text-slate-500 font-medium">Recomendamos fortemente a criação da Conta Oficial para garantir a saúde financeira do seu evento.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Opção A: Conta Oficial (Recomendada) */}
              <div className="bg-[#002B5C] rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col group border border-[#0050A0]">
                <div className="absolute top-0 inset-x-0 h-1 bg-[#00D7FF]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D7FF] opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
                
                <div className="relative z-10 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black text-white">Conta Oficial Parceira</h3>
                    <span className="bg-[#00D7FF]/20 text-[#00D7FF] text-xs font-bold px-3 py-1 rounded-full border border-[#00D7FF]/30">RECOMENDADO</span>
                  </div>
                  <p className="text-blue-200 text-sm mb-8 leading-relaxed">Você cria uma conta gratuita no nosso banco parceiro pelo nosso link. O dinheiro vai direto pra lá.</p>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-[#00D7FF]" /> <span>Repasse <strong>Imediato</strong> (Pix)</span></li>
                    <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-[#00D7FF]" /> <span>Você saca a qualquer momento</span></li>
                    <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-[#00D7FF]" /> <span>Acesso a Cartão de Crédito Corporativo</span></li>
                    <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-[#00D7FF]" /> <span>Conta Digital PJ/PF sem mensalidade</span></li>
                  </ul>
                </div>

                <div className="relative z-10">
                  <Button 
                    className="w-full h-14 bg-[#00D7FF] hover:bg-white text-[#002B5C] font-black text-lg rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                    onClick={() => window.open('https://www.asaas.com/r/a674654f-7568-4f2a-9429-d87cf0a48d18', '_blank')}
                  >
                    Abrir Conta Oficial Grátis <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Opção B: Conta Padrão Ticketera */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative">
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Conta Express Ticketera</h3>
                  <p className="text-slate-600 font-medium text-sm mb-8 leading-relaxed">O dinheiro cai numa conta retida pela plataforma. Você não tem acesso direto ao banco.</p>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-slate-800 font-medium"><Clock className="w-5 h-5 text-amber-500" /> <span>Repasse em <strong>D+30</strong> (após 30 dias)</span></li>
                    <li className="flex items-center gap-3 text-slate-800 font-medium"><AlertTriangle className="w-5 h-5 text-amber-500" /> <span>Saque manual via suporte por e-mail</span></li>
                    <li className="flex items-center gap-3 text-slate-400 font-medium"><X className="w-5 h-5 text-red-400" /> <span className="line-through opacity-70">Acesso a Cartão de Crédito</span></li>
                    <li className="flex items-center gap-3 text-slate-400 font-medium"><X className="w-5 h-5 text-red-400" /> <span className="line-through opacity-70">Conta Digital Completa</span></li>
                  </ul>
                </div>

                <div>
                  <Button 
                    variant="outline"
                    className="w-full h-14 border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-xl"
                    onClick={handleCreateExpressAccount}
                    disabled={isCreatingExpress}
                  >
                    {isCreatingExpress ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Usar Conta Express D+30'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. WALLET ID INTEGRATION FORM */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 border-2 border-[#00D7FF]/30 shadow-2xl shadow-[#002B5C]/10 max-w-5xl mx-auto relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0050A0] to-[#00D7FF]"></div>
             
             {success ? (
               <div className="text-center space-y-6 animate-in zoom-in duration-500 py-10">
                 <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                   <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                 </div>
                 <div>
                   <h3 className="text-3xl font-black text-emerald-950">Conta Conectada!</h3>
                   <p className="text-slate-500 font-medium mt-2 text-lg">Sua infraestrutura financeira está pronta.</p>
                 </div>
                 <div className="flex justify-center pt-4">
                   <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                 </div>
               </div>
             ) : (
               <div className="space-y-12">
                 <div className="text-center max-w-2xl mx-auto space-y-4">
                   <div className="flex items-center justify-center gap-3 text-[#002B5C]">
                     <Wallet className="w-10 h-10" />
                     <h3 className="text-3xl md:text-4xl font-black tracking-tight">Vincular Conta Oficial</h3>
                   </div>
                   <p className="text-slate-600 font-medium text-lg">
                     Siga o passo a passo abaixo no painel do banco para encontrar e colar o seu <strong className="text-slate-900">Wallet ID</strong>.
                   </p>
                 </div>

                 {/* Step-by-step with Image Placeholders */}
                 <div className="grid md:grid-cols-3 gap-6 relative">
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 z-0"></div>

                    {/* Step 1 */}
                    <div className="relative z-10 bg-white pt-6 space-y-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#002B5C] text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-[#002B5C]/20 border-4 border-white">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">Acesse o Painel</h4>
                        <p className="text-slate-500 text-sm mt-2">Faça login na sua nova conta pelo computador ou celular.</p>
                      </div>
                      <div className="h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 p-4">
                         <span className="text-xs font-bold text-center">Aqui entra o Print 1<br/>(Tela Inicial do Painel)</span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative z-10 bg-white pt-6 space-y-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#002B5C] text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-[#002B5C]/20 border-4 border-white">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">Menu de Integrações</h4>
                        <p className="text-slate-500 text-sm mt-2">Clique no menu lateral, vá em <strong className="text-slate-700">Configurações</strong> e depois em <strong className="text-slate-700">Integrações</strong>.</p>
                      </div>
                      <div className="h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 p-4">
                         <span className="text-xs font-bold text-center">Aqui entra o Print 2<br/>(Menu Configurações {'>'} Integrações)</span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative z-10 bg-white pt-6 space-y-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#00D7FF] text-[#002B5C] font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-[#00D7FF]/30 border-4 border-white">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">Copie o Wallet ID</h4>
                        <p className="text-slate-500 text-sm mt-2">Copie o código gigante chamado <strong className="text-slate-700">Wallet ID</strong> e cole aqui embaixo.</p>
                      </div>
                      <div className="h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 p-4">
                         <span className="text-xs font-bold text-center">Aqui entra o Print 3<br/>(Tela mostrando onde copiar o Wallet ID)</span>
                      </div>
                    </div>
                 </div>

                 {/* The Actual Form */}
                 <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner max-w-2xl mx-auto flex flex-col md:flex-row gap-4 items-end mt-8">
                   <div className="space-y-3 flex-1 w-full">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Cole seu Wallet ID aqui</label>
                     <Input 
                       placeholder="Ex: cdcbd1de-2c4f-4b90-a..." 
                       className="h-16 bg-white border-slate-300 font-mono text-base focus:border-[#00D7FF] focus:ring-[#00D7FF] shadow-sm rounded-xl px-4"
                       value={walletId}
                       onChange={(e) => setWalletId(e.target.value)}
                     />
                   </div>
                   <Button 
                     className="w-full md:w-auto h-16 px-8 bg-[#002B5C] hover:bg-[#001530] text-white font-bold text-lg rounded-xl transition-all shadow-xl shadow-[#002B5C]/20 shrink-0"
                     onClick={handleLinkWallet}
                     disabled={isLinking || !walletId}
                   >
                     {isLinking ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Validar e Ativar Vendas'}
                   </Button>
                 </div>
               </div>
             )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AsaasOnboardingPage;
