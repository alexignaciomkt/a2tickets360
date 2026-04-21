import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QRCodeTicket from '@/components/tickets/QRCodeTicket';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Ticket as TicketIcon, Calendar, MapPin } from 'lucide-react';

const CustomerTickets = () => {
  const { ticketId } = useParams<{ ticketId?: string }>();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTickets = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('purchased_tickets')
          .select(`
            *,
            events:event_id (title, start_date, location_name),
            tickets:ticket_id (name, price)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setTickets(data);
          
          if (ticketId) {
            const found = data.find(t => t.id === ticketId);
            if (found) setSelectedTicket(found);
          } else if (data.length > 0) {
            setSelectedTicket(data[0]);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar ingressos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [user, ticketId]);
  
  const handleTicketSelect = (ticket: any) => {
    setSelectedTicket(ticket);
  };
  
  return (
    <DashboardLayout userType="customer">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Meus Ingressos</h1>
        <p className="text-gray-500 font-medium italic">Gerencie seus acessos e apresente na portaria.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Ticket List */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6">Sua Carteira</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-[10px] font-bold uppercase">Sincronizando...</p>
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100'
                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                    }`}
                    onClick={() => handleTicketSelect(ticket)}
                  >
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${selectedTicket?.id === ticket.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                            <TicketIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-sm uppercase tracking-tight truncate leading-tight">
                                {ticket.events?.title || 'Evento'}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {ticket.tickets?.name || 'Individual'}
                            </p>
                            <div className="mt-2">
                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] rounded-full ${
                                    ticket.status === 'active' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'used' ? 'bg-gray-200 text-gray-600' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {ticket.status === 'active' ? 'Disponível' :
                                     ticket.status === 'used' ? 'Utilizado' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                    <TicketIcon className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold text-xs uppercase italic">Nenhum ingresso na carteira</p>
                <a href="/events" className="btn-primary py-2 px-6 mt-6 inline-block text-[10px]">
                  Explorar Eventos
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Ticket Display */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="space-y-6">
              <QRCodeTicket
                ticket={selectedTicket}
                userName={user?.name}
                userPhoto={user?.photoUrl || selectedTicket.photo_url}
              />
              
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Detalhes do Evento</h4>
                          <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="w-4 h-4 text-indigo-400" />
                                  <span className="text-sm font-bold uppercase italic">
                                      {selectedTicket.events?.start_date ? new Date(selectedTicket.events.start_date).toLocaleDateString('pt-BR', { dateStyle: 'long' }) : 'Data a definir'}
                                  </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4 text-indigo-400" />
                                  <span className="text-sm font-bold uppercase italic">{selectedTicket.events?.location_name || 'Local definido'}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="w-full md:w-auto flex flex-col gap-3">
                          <button className="bg-gray-900 text-white py-4 px-8 rounded-full font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:bg-black active:scale-95">
                              Baixar Wallet PDF
                          </button>
                          <button className="border-2 border-gray-100 text-gray-400 py-3 px-8 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-gray-50">
                              Enviar para E-mail
                          </button>
                      </div>
                  </div>
              </div>
            </div>
          ) : !loading && (
            <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center min-h-[500px] text-center border-2 border-dashed border-gray-100">
              <div className="p-6 bg-gray-50 rounded-full mb-6">
                  <QrCode className="w-12 h-12 text-gray-200" />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Selecione um ingresso para visualizar o QR Code</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerTickets;
