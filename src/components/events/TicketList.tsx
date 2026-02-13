
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '@/data/mockData';

interface TicketListProps {
  tickets: Ticket[];
  eventId: string;
}

const TicketList = ({ tickets, eventId }: TicketListProps) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBuy = () => {
    if (selectedTicket) {
      navigate(`/checkout/${eventId}/${selectedTicket}`);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Ingressos</h2>
      
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div 
            key={ticket.id}
            className={`border rounded-lg p-5 transition-all ${
              selectedTicket === ticket.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => setSelectedTicket(ticket.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{ticket.name}</h3>
              <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                {ticket.batch}
              </span>
            </div>
            
            {ticket.description && (
              <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3">
              <div>
                <span className="text-primary font-bold text-xl">
                  R$ {ticket.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  {ticket.remaining} disponíveis
                </span>
              </div>
              
              <div className="mt-3 sm:mt-0">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedTicket === ticket.id ? 'border-primary bg-primary' : 'border-gray-300'
                }`}>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <button
          className="btn-primary py-3 px-8 w-full sm:w-auto"
          disabled={!selectedTicket}
          onClick={handleBuy}
        >
          Comprar ingresso
        </button>
      </div>
    </div>
  );
};

export default TicketList;
