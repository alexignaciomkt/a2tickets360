
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, LineChart, Clock, Plus, Globe, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { organizerService } from '@/services/organizerService';
import { Event } from '@/interfaces/organizer';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeModal from '@/components/modals/WelcomeModal';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const organizerId = user?.id || '';

  useEffect(() => {
    if (!organizerId) return;

    const fetchData = async () => {
      try {
        const [events, statsData] = await Promise.all([
          organizerService.getEvents(organizerId),
          organizerService.getStats(organizerId)
        ]);
        setEventsList(events);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Check for welcome flag
    const welcomeFlag = localStorage.getItem('A2Tickets_showWelcome');
    if (welcomeFlag === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('A2Tickets_showWelcome');
    }
  }, [organizerId]);

  const totalEvents = eventsList.length;
  const totalTicketsSold = eventsList.reduce(
    (acc, event) => acc + (Array.isArray(event.tickets) ? event.tickets.reduce((sum, ticket) => sum + (ticket.quantity - ticket.remaining), 0) : 0),
    0
  );
  const totalRevenue = eventsList.reduce(
    (acc, event) => acc + (Array.isArray(event.tickets) ? event.tickets.reduce((sum, ticket) => sum + ((ticket.quantity - ticket.remaining) * (Number(ticket.price) || 0)), 0) : 0),
    0
  );

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Painel do Organizador</h1>
          <p className="text-gray-800 font-medium">
            Gerencie seus eventos, acompanhe vendas e administre ingressos.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Eventos</p>
                <h3 className="text-3xl font-bold">{totalEvents}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ingressos Vendidos</p>
                <h3 className="text-3xl font-bold">{totalTicketsSold}</h3>
              </div>
              <div className="bg-secondary/10 p-3 rounded-full">
                <Users className="h-7 w-7 text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Receita Total</p>
                <h3 className="text-3xl font-bold">
                  {totalRevenue > 0 ? `R$ ${totalRevenue.toFixed(2).replace('.', ',')}` : 'Grátis'}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-bold text-sm">Próximo Evento</p>
                <h3 className="text-lg font-black text-gray-900 truncate">
                  {stats?.nextEvent?.title || 'Nenhum evento'}
                </h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Visitantes (Credenciamento)</p>
                <h3 className="text-3xl font-bold">{stats?.visitorCount || 0}</h3>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Users className="h-7 w-7 text-indigo-600" />
              </div>
            </div>
            <Link to="/organizer/visitors" className="text-indigo-600 text-xs font-bold mt-4 block hover:underline">
              Gerenciar visitantes →
            </Link>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Vendas de Ingressos</h2>
            <div>
              <select className="input-field text-sm">
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <LineChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                Sua produção ainda não possui dados de vendas suficientes para gerar gráficos.
              </p>
              <p className="text-xs text-gray-400 mt-1">Dados atualizados em tempo real.</p>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Meus Eventos</h2>
            <div className="flex gap-3">
              <Link to="/producer/me" target="_blank" className="btn-secondary py-2 px-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Ver Página Pública
              </Link>
              <Link to="/organizer/events/create" className="btn-primary py-2 px-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Evento
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-900 uppercase tracking-wider">
                    Data
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : eventsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                          <Calendar className="h-12 w-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Nenhum evento encontrado</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                          Você ainda não criou nenhum evento. Comece agora mesmo e leve sua produção para o próximo nível!
                        </p>
                        <Link to="/organizer/events/create" className="btn-primary py-3 px-8 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Criar Primeiro Evento
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : eventsList.map((event) => {
                  const ticketsSold = Array.isArray(event.tickets) ? event.tickets.reduce(
                    (sum, ticket) => sum + (ticket.quantity - ticket.remaining),
                    0
                  ) : 0;
                  const totalTickets = Array.isArray(event.tickets) ? event.tickets.reduce(
                    (sum, ticket) => sum + ticket.quantity,
                    0
                  ) : 0;
                  const eventDate = new Date(event.date);
                  const today = new Date();

                  let status;
                  let statusClass;

                  if (eventDate < today) {
                    status = 'Concluído';
                    statusClass = 'bg-gray-100 text-gray-800';
                  } else if (ticketsSold >= totalTickets) {
                    status = 'Esgotado';
                    statusClass = 'bg-red-100 text-red-800';
                  } else {
                    status = 'Ativo';
                    statusClass = 'bg-green-100 text-green-800';
                  }

                  return (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.location?.city}, {event.location?.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.date}
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
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/organizer/events/edit/${event.id}`} className="text-primary hover:text-primary/80 mr-4">
                          Editar
                        </Link>
                        <Link to={`/organizer/attendees?eventId=${event.id}`} className="text-secondary hover:text-secondary/80">
                          Participantes
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
