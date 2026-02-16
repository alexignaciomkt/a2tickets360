
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { authService } from '@/services/authService';
import { Mail, User, Lock, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado (UF) deve ter 2 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      city: '',
      state: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await authService.registerCandidate(data);
      setIsSuccess(true);
      toast({
        title: 'Cadastro realizado!',
        description: 'Verifique seu e-mail para confirmar a conta.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-[#050505] min-h-screen py-20 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            {isSuccess ? (
              <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-3xl text-center shadow-2xl">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Mail className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Verifique seu E-mail</h2>
                <p className="text-gray-400 mb-8 text-lg">
                  Enviamos um link de confirmação para o seu e-mail. <br />
                  <strong>Confirme para ativar seu perfil no Marketplace.</strong>
                </p>
                <Button
                  className="w-full h-14 rounded-2xl bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest"
                  onClick={() => navigate('/login')}
                >
                  Voltar para o Login
                </Button>
              </div>
            ) : (
              <div className="bg-[#0A0A0A] border border-white/5 p-8 md:p-12 rounded-3xl shadow-2xl">
                <div className="mb-10 text-center">
                  <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Junte-se ao Staff</h1>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">A2 Tickets 360 &bull; Profissionais de Elite</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">Nome Completo</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <Input placeholder="João da Silva" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-primary focus:border-primary" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">E-mail</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <Input type="email" placeholder="seu@email.com" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-primary focus:border-primary" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">Senha</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <Input type="password" placeholder="******" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-primary focus:border-primary" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">WhatsApp</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <Input placeholder="(11) 99999-9999" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-primary focus:border-primary" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">Cidade</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <Input placeholder="São José" className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white placeholder:text-gray-700 focus:ring-primary focus:border-primary" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">Estado (UF)</FormLabel>
                            <FormControl>
                              <Input placeholder="SP" maxLength={2} className="h-14 bg-[#111] border-white/5 rounded-2xl text-white placeholder:text-gray-700 focus:ring-primary focus:border-primary text-center" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 mt-4 transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        "Cadastrar Perfil"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-8 text-center">
                  <p className="text-gray-500 text-sm">
                    Já é um profissional parceiro?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                      Entrar
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
