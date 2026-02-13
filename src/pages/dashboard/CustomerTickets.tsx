import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QRCodeTicket from '@/components/tickets/QRCodeTicket';
import { users, PurchasedTicket } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

const CustomerTickets = () => {
  const { ticketId } = useParams<{ ticketId?: string }>();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<PurchasedTicket | null>(null);
  
  useEffect(() => {
    if (user) {
      // Find user in mock data
      const userRecord = users.find((u) => u.id === user.id || u.email === user.email);
      if (userRecord) {
        setTickets(userRecord.tickets);
        
        // If a ticket ID is provided, select that ticket
        if (ticketId) {
          const ticket = userRecord.tickets.find((t) => t.id === ticketId);
          if (ticket) {
            setSelectedTicket(ticket);
          }
        } else if (userRecord.tickets.length > 0) {
          // Otherwise, select the first ticket
          setSelectedTicket(userRecord.tickets[0]);
        }
      }
    }
  }, [user, ticketId]);
  
  const handleTicketSelect = (ticket: PurchasedTicket) => {
    setSelectedTicket(ticket);
  };
  
  return (
    <DashboardLayout userType="customer">
      <h1 className="text-2xl font-bold mb-6">Meus Ingressos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Ticket List */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Seus Ingressos</h2>
          
          {tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTicketSelect(ticket)}
                >
                  <h3 className="font-medium truncate">{ticket.eventTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ticket.ticketName}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ticket.status === 'active' ? 'Válido' :
                       ticket.status === 'used' ? 'Utilizado' : 'Cancelado'}
                    </span>
                    <span className="text-xs text-gray-500">
                      R$ {ticket.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">Nenhum ingresso encontrado</p>
              <a href="/events" className="text-primary hover:underline text-sm mt-2 inline-block">
                Ver eventos
              </a>
            </div>
          )}
        </div>
        
        {/* Ticket Display */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <QRCodeTicket
                ticket={selectedTicket}
                userName={user?.name}
                userPhoto={user?.photoUrl}
              />
              
              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-4">
                  Apresente este QR Code na entrada do evento para validação.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button className="btn-secondary py-2 px-6">
                    Baixar ingresso
                  </button>
                  <button className="btn-primary py-2 px-6">
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-[400px]">
              <p className="text-gray-500">Selecione um ingresso para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerTickets;
