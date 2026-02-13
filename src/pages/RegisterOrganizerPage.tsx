
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Sparkles, Users, Calendar, BarChart3, Shield } from 'lucide-react';

const RegisterOrganizerPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUserByRole } = useAuth();
  const isUpgrade = searchParams.get('upgrade') === 'true';

  const handleRegisterAsOrganizer = async () => {
    setLoading(true);

    // Simular processo de registro/upgrade
    setTimeout(() => {
      if (isUpgrade && user) {
        // Upgrade de usuário existente
        setUserByRole('organizer');
        navigate('/organizer/events/create');
      } else {
        // Novo registro como organizador
        setUserByRole('organizer');
        navigate('/organizer');
      }
      setLoading(false);
    }, 1500);
  };

  const benefits = [
    {
      icon: Calendar,
      title: 'Crie Eventos Ilimitados',
      description: 'Publique quantos eventos quiser sem limitações'
    },
    {
      icon: Users,
      title: 'Gestão Completa de Participantes',
      description: 'Controle total sobre inscrições e check-ins'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Detalhados',
      description: 'Analytics completos sobre seus eventos'
    },
    {
      icon: Shield,
      title: 'Segurança e Confiabilidade',
      description: 'Plataforma segura com suporte dedicado'
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-primary rounded-2xl">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {isUpgrade ? 'Torne-se um Organizador' : 'Crie Eventos Incríveis'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {isUpgrade
                  ? 'Upgrade sua conta e comece a criar eventos profissionais hoje mesmo'
                  : 'Junte-se à A2Tickets e transforme suas ideias em eventos memoráveis'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

              {/* Benefícios */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Sparkles className="h-6 w-6 text-primary mr-2" />
                  Por que escolher a A2Tickets?
                </h2>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <benefit.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                            <p className="text-xs text-gray-600">{benefit.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Formulário de Ação */}
              <div>
                <Card className="card-modern">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                      {isUpgrade ? 'Upgrade para Organizador' : 'Cadastro de Organizador'}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {isUpgrade
                        ? 'Sua conta será atualizada instantaneamente'
                        : 'Comece a criar eventos em minutos'
                      }
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {isUpgrade && user && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Olá, {user.name}!</strong><br />
                          Você será redirecionado para criar seu primeiro evento após o upgrade.
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Parceiro A2Tickets</h1>
                        <p className="mt-2 text-gray-600">Junte-se a nós e comece a vender seus eventos</p>
                      </div>

                      <ul className="text-xs space-y-2 text-gray-600">
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          Eventos ilimitados
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          Gestão completa de participantes
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          Relatórios e analytics
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                          Suporte dedicado
                        </li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleRegisterAsOrganizer}
                      disabled={loading}
                      className="w-full btn-primary text-sm"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isUpgrade ? 'Fazendo upgrade...' : 'Criando conta...'}
                        </div>
                      ) : (
                        isUpgrade ? 'Fazer Upgrade Agora' : 'Criar Conta de Organizador'
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Ao continuar, você concorda com nossos{' '}
                      <a href="/terms" className="text-primary hover:underline">Termos de Uso</a>{' '}
                      e{' '}
                      <a href="/privacy" className="text-primary hover:underline">Política de Privacidade</a>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterOrganizerPage;
