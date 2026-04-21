
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import { Mail, User, Lock, Phone, CreditCard, Loader2, CheckCircle, ChevronDown, Rocket, Shield, BarChart3, Calendar, Sparkles, Users, Camera, ArrowRight, PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function isValidCpf(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

function isValidCnpj(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  return true;
}

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres'),
  mobilePhone: z.string().min(10, 'Telefone inválido'),
  cpfCnpj: z.string().refine((val) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length === 11) return isValidCpf(clean);
    if (clean.length === 14) return isValidCnpj(clean);
    return false;
  }, 'CPF ou CNPJ inválido'),
  slug: z.string().min(3, 'O link deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hifens'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterOrganizerPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      mobilePhone: '',
      cpfCnpj: '',
      slug: '',
    },
  });

  // Gerar slug automático ao digitar o nome
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);

    // Se o slug ainda não foi editado manualmente ou está vazio
    const autoSlug = name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    form.setValue('slug', autoSlug);
  };

  // handleFileUpload removido

  const onSubmit = async (data: RegisterFormData) => {
    console.log('🚀 Iniciando cadastro:', data);
    setIsSubmitting(true);
    try {
      const result = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'organizer',
        phone: data.mobilePhone,
        companyName: data.name,
        cnpj: data.cpfCnpj,
        slug: data.slug,
      } as any);

      console.log('✅ Resultado do cadastro Context:', result);

      if (result.success) {
        localStorage.setItem('A2Tickets_PendingRegistration', JSON.stringify({
            slug: data.slug,
            cnpj: data.cpfCnpj,
            phone: data.mobilePhone,
            companyName: data.name
        }));
        setIsSuccessModalOpen(true);
      } else {
        if (result.error && result.error.includes('em uso')) {
          form.setError('email', { type: 'manual', message: 'Este e-mail já está cadastrado em nosso sistema.' });
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro no cadastro',
            description: result.error || 'Não foi possível completar o cadastro. Verifique as configurações do servidor.',
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Erro no onSubmit:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormError = (errors: any) => {
    console.error('⚠️ Erros de validação Zod bloqueando envio:', errors);
    toast({
      variant: 'destructive',
      title: 'Verifique os campos',
      description: 'Alguns campos não foram preenchidos corretamente.',
    });
  };

  const benefits = [
    {
      icon: Calendar,
      title: 'Eventos Ilimitados',
      description: 'Publique quantos eventos quiser sem limitações'
    },
    {
      icon: Users,
      title: 'Gestão Completa',
      description: 'Controle total sobre inscrições e check-ins'
    },
    {
      icon: BarChart3,
      title: 'Relatórios',
      description: 'Analytics completos sobre seus eventos'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Plataforma segura com suporte dedicado'
    }
  ];

  return (
    <MainLayout>
      <div className="bg-[#050505] min-h-screen py-20 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Benefits Col */}
                <div className="lg:col-span-5 space-y-8">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
                    <Rocket className="w-4 h-4 text-indigo-400 mr-2" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Área do Produtor</span>
                  </div>

                  <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
                    Sua Produtora <br />
                    <span className="text-indigo-400">com Gestão de Elite.</span>
                  </h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <benefit.icon className="w-6 h-6 text-indigo-400 mb-3" />
                        <h3 className="text-white font-bold text-sm uppercase mb-1 tracking-tight">{benefit.title}</h3>
                        <p className="text-gray-500 text-[10px] leading-tight">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Col */}
                <div className="lg:col-span-7">
                  <div className="bg-[#0A0A0A] border border-white/5 p-8 md:p-10 rounded-3xl shadow-2xl">
                    <div className="mb-8">
                      <Button variant="ghost" onClick={() => navigate('/register')} className="text-indigo-400 hover:text-indigo-300 p-0 h-auto font-bold flex items-center group">
                        <ChevronDown className="w-4 h-4 rotate-90 mr-1 group-hover:-translate-x-1 transition-transform" /> Voltar para Escolha
                      </Button>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">Nome Fantasia / Empresa</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <Input
                                      placeholder="A2 Produções"
                                      className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-indigo-500"
                                      {...field}
                                      onChange={onNameChange}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">Link da sua Página (Slug)</FormLabel>
                                <div className="flex gap-2">
                                  <div className="flex-1 flex overflow-hidden rounded-2xl border border-white/5 bg-[#111] focus-within:ring-1 focus-within:ring-indigo-500">
                                    <span className="flex items-center pl-4 pr-1 text-gray-600 text-sm font-bold">a2tickets360.com.br/p/</span>
                                    <Input
                                      placeholder="sua-produtora"
                                      className="h-14 flex-1 bg-transparent border-0 ring-0 focus-visible:ring-0 shadow-none outline-none pl-0 text-indigo-400 font-bold placeholder:text-gray-700"
                                      {...field}
                                    />
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-500 pl-1 mt-1 font-medium">Este será o endereço público da sua empresa na plataforma.</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">E-mail Corporativo</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <Input type="email" placeholder="contato@empresa.com" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-indigo-500" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="cpfCnpj"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">CPF ou CNPJ</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <Input placeholder="00.000.000/0001-00" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-indigo-500" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="mobilePhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">WhatsApp de Contato</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <Input placeholder="(11) 99999-9999" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-indigo-500" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Foto de Capa (Removida) */}

                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">Defina sua Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <Input type="password" placeholder="Mínimo 8 caracteres" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-indigo-500" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-lg shadow-xl shadow-indigo-500/20 mt-4 transition-all"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            "Ativar meu Acesso"
                          )}
                        </Button>
                      </form>
                    </Form>

                    <div className="mt-8 text-center">
                      <p className="text-gray-500 text-sm font-medium">
                        Já é um produtor parceiro?{' '}
                        <Link to="/login" className="text-indigo-400 font-black hover:underline">
                          Entrar Agora
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

            </div>
          </div>
        </div>

        {/* Welcome Success Modal */}
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/5 rounded-3xl p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <PartyPopper className="w-10 h-10 text-indigo-400" />
            </div>
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                Bem-vindo à <br />
                <span className="text-indigo-400">A2 Tickets 360º!</span>
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-base leading-relaxed">
                Sua conta de produtor foi criada com sucesso! <br />
                Processamos seu login automaticamente para que você possa iniciar a configuração da sua fanpage imediatamente.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-8 space-y-4">
              <Button 
                onClick={() => navigate('/organizer/onboarding')}
                className="w-full h-14 rounded-2xl bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest flex items-center justify-center group"
              >
                Configurar meu Site
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                Você será redirecionado para o onboarding da sua página.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default RegisterOrganizerPage;
