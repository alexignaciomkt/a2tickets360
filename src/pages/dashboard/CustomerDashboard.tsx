
import { useState, useEffect } from 'react';
import { Calendar, Ticket, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { users, PurchasedTicket, events } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<number>(0);

  useEffect(() => {
    if (user) {
      // Find user in mock data
      const userRecord = users.find((u) => u.id === user.id || u.email === user.email);
      if (userRecord) {
        setTickets(userRecord.tickets);

        // Count upcoming events (active tickets)
        const activeTickets = userRecord.tickets.filter((t) => t.status === 'active');
        setUpcomingEvents(activeTickets.length);
      }
    }
  }, [user]);

  // Get next event
  const nextEvent = tickets.length > 0 ?
    events.find((e) => e.id === tickets[0].eventId) : null;

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
                <h1 className="text-xl font-bold">Painel do Cliente - A2 Tickets 360</h1>
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
                  {nextEvent ? nextEvent.title : 'Nenhum evento próximo'}
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
                <p className="text-gray-500 text-sm">Total de Eventos</p>
                <h3 className="text-3xl font-bold">{tickets.length}</h3>
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

          {tickets.length > 0 ? (
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
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {ticket.eventTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">
                          {ticket.ticketName}
                        </div>
                        <div className="text-sm text-gray-500">
                          R$ {ticket.price.toFixed(2).replace('.', ',')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {ticket.status === 'active' ? 'Válido' :
                            ticket.status === 'used' ? 'Utilizado' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={`/dashboard/tickets/${ticket.id}`} className="text-primary hover:text-primary/80">
                          Ver QR Code
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Você ainda não tem ingressos. Compre seu primeiro ingresso agora!</p>
              <a href="/events" className="mt-4 btn-primary inline-block py-2 px-6">
                Ver eventos
              </a>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
