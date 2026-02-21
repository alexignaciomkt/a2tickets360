
import { Users, Calendar, DollarSign, ShieldCheck, FileText, Save } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { events } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [legalContent, setLegalContent] = useState({
    privacy: { title: '', content: '' },
    terms: { title: '', content: '' }
  });

  useEffect(() => {
    loadLegalPages();
  }, []);

  const loadLegalPages = async () => {
    try {
      const privacy = await api.get<any>('/api/legal/privacy');
      const terms = await api.get<any>('/api/legal/terms');
      setLegalContent({
        privacy: { title: privacy.title, content: privacy.content },
        terms: { title: terms.title, content: terms.content }
      });
    } catch (error) {
      console.error('Error loading legal pages:', error);
    }
  };

  const handleUpdateLegal = async (slug: 'privacy' | 'terms') => {
    try {
      setLoading(true);
      await api.put(`/api/legal/${slug}`, legalContent[slug]);
      toast({
        title: 'Sucesso',
        description: `${slug === 'privacy' ? 'Política' : 'Termos'} atualizados com sucesso.`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar as alterações.'
      });
    } finally {
      setLoading(false);
    }
  };

  // In a real application, these would come from API calls
  const totalEvents = events.length;
  const totalUsers = 250; // Mock data
  const totalRevenue = events.reduce(
    (acc, event) => acc + event.tickets.reduce((sum, ticket) => sum + ((ticket.quantity - ticket.remaining) * ticket.price), 0),
    0
  );
  const pendingEvents = 3; // Mock data

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <TabsTrigger value="overview" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="legal" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">
              Páginas Legais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-2">Painel Administrativo</h1>
              <p className="text-gray-800 font-medium">
                Bem-vindo ao painel administrativo do A2 Tickets 360.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 font-bold text-sm">Total de Eventos</p>
                    <h3 className="text-3xl font-black text-gray-900">{totalEvents}</h3>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 font-bold text-sm">Total de Usuários</p>
                    <h3 className="text-3xl font-black text-gray-900">{totalUsers}</h3>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <Users className="h-7 w-7 text-secondary" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Faturamento Total</p>
                    <h3 className="text-3xl font-bold">R$ {totalRevenue.toFixed(2).replace('.', ',')}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-7 w-7 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Eventos Pendentes</p>
                    <h3 className="text-3xl font-bold">{pendingEvents}</h3>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <ShieldCheck className="h-7 w-7 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Eventos Pendentes de Aprovação</h2>
              {/* ... (keep table) ... */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                        Organizador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-black text-gray-900 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Mock pending events */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">Feira de Artesanato</div>
                        <div className="text-sm text-gray-500">São José dos Campos, SP</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">Vale Cultural</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">2025-09-20</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-green-600 hover:text-green-800 mr-4">
                          Aprovar
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Rejeitar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Eventos Recentes</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                        Organizador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                        Vendas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-black text-gray-900 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((event) => {
                      const ticketsSold = event.tickets.reduce(
                        (sum, ticket) => sum + (ticket.quantity - ticket.remaining),
                        0
                      );
                      const totalTickets = event.tickets.reduce(
                        (sum, ticket) => sum + ticket.quantity,
                        0
                      );

                      return (
                        <tr key={event.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.location.city}, {event.location.state}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{event.organizer.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {ticketsSold} / {totalTickets} ingressos
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: `${(ticketsSold / totalTickets) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Ativo
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/admin/events/${event.id}`} className="text-primary hover:text-primary/80">
                              Detalhes
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Gestão de Páginas Legais</h2>
                  <p className="text-sm text-gray-500">Altere os textos que aparecem no rodapé do sistema</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Privacy Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 uppercase tracking-tighter">Política de Privacidade</h3>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLegal('privacy')}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" /> Salvar
                    </Button>
                  </div>
                  <Input
                    value={legalContent.privacy.title}
                    onChange={(e) => setLegalContent(prev => ({ ...prev, privacy: { ...prev.privacy, title: e.target.value } }))}
                    placeholder="Título da Página"
                    className="font-bold"
                  />
                  <Textarea
                    value={legalContent.privacy.content}
                    onChange={(e) => setLegalContent(prev => ({ ...prev, privacy: { ...prev.privacy, content: e.target.value } }))}
                    placeholder="Conteúdo em Markdown ou Texto Simples"
                    className="min-h-[400px] font-mono text-sm leading-relaxed"
                  />
                </div>

                {/* Terms Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 uppercase tracking-tighter">Termos de Uso</h3>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLegal('terms')}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" /> Salvar
                    </Button>
                  </div>
                  <Input
                    value={legalContent.terms.title}
                    onChange={(e) => setLegalContent(prev => ({ ...prev, terms: { ...prev.terms, title: e.target.value } }))}
                    placeholder="Título da Página"
                    className="font-bold"
                  />
                  <Textarea
                    value={legalContent.terms.content}
                    onChange={(e) => setLegalContent(prev => ({ ...prev, terms: { ...prev.terms, content: e.target.value } }))}
                    placeholder="Conteúdo em Markdown ou Texto Simples"
                    className="min-h-[400px] font-mono text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
