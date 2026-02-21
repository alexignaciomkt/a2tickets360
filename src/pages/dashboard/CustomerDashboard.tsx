import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Clock, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { customerService } from '@/services/customerService';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const data = await customerService.getTickets(user.email);
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [user?.email]);

  const activeTicketsCount = tickets.filter(t => t.paymentStatus === 'paid').length;
  const nextTicket = tickets.find(t => t.paymentStatus === 'paid');
  const nextEvent = nextTicket?.event;

  return (
    <DashboardLayout userType="customer">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Olá, {user?.name || 'Visitante'}</h1>
          <p className="text-gray-600">
            Bem-vindo(a) ao seu painel de ingressos no A2 Tickets 360.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ingressos Ativos</p>
                <h3 className="text-3xl font-bold">{isLoading ? '...' : activeTicketsCount}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Ticket className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Próximo Evento</p>
                <h3 className="text-lg font-bold truncate">
                  {isLoading ? 'Carregando...' : (nextEvent?.title || 'Nenhum próximo')}
                </h3>
              </div>
              <div className="bg-secondary/10 p-3 rounded-full">
                <Calendar className="h-7 w-7 text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Compras</p>
                <h3 className="text-3xl font-bold">{isLoading ? '...' : tickets.length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Clock className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Meus Ingressos</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-gray-500">Estamos recuperando seus ingressos...</p>
            </div>
          ) : tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {sale.event?.title || 'Evento não encontrado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">
                          {sale.ticket?.name || 'Ingresso'}
                        </div>
                        <div className="text-sm text-gray-500">
                          R$ {Number(sale.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          sale.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {sale.paymentStatus === 'paid' ? 'Válido' :
                            sale.paymentStatus === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={`/dashboard/tickets/${sale.id}`} className="text-primary hover:text-primary/80">
                          Ver Detalhes
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Ticket className="h-10 w-10 text-indigo-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Nenhum ingresso ainda</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10">
                Você ainda não adquiriu ingressos para nenhum evento. Que tal descobrir novas experiências agora?
              </p>
              <Link to="/events" className="btn-primary py-4 px-12 rounded-2xl font-black text-lg uppercase tracking-tight shadow-xl shadow-indigo-100 inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                Explorar Eventos
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
