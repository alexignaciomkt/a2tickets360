
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Users, DollarSign, Calendar, Activity } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { organizerService } from '@/services/organizerService';
import { Event } from '@/interfaces/organizer';
import { useAuth } from '@/contexts/AuthContext';

const OrganizerEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvents();
  }, [user?.id]);

  const loadEvents = async () => {
    try {
      if (!user?.id) return;
      const eventsData = await organizerService.getEvents(user.id);
      
      // Fetch real sales count for each event
      const eventIds = eventsData.map(e => e.id);
      const { data: sales } = await supabase
        .from('purchased_tickets')
        .select('event_id, tickets(price)')
        .in('event_id', eventIds)
        .in('status', ['active', 'used']);

      const updatedEvents = eventsData.map(event => {
        const eventSales = sales?.filter(s => s.event_id === event.id) || [];
        return {
          ...event,
          real_sold_count: eventSales.length,
          real_revenue: eventSales.reduce((acc, s: any) => acc + (s.tickets?.price || 0), 0)
        };
      });

      setEvents(updatedEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await organizerService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      console.log('Evento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Não foi possível excluir o evento. Verifique se existem vendas vinculadas.');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Event['status']) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      published: { label: 'Publicado', variant: 'default' as const },
      active: { label: 'Publicado', variant: 'default' as const },
      completed: { label: 'Finalizado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateTicketsSold = (event: any) => {
    return event.real_sold_count || 0;
  };

  const calculateTotalCapacity = (event: Event) => {
    return event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  const calculateRevenue = (event: any) => {
    return event.real_revenue || 0;
  };

  if (loading) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando eventos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Meus Eventos</h1>
            <p className="text-gray-600 mt-1">Gerencie todos os seus eventos em um só lugar</p>
          </div>
          <Button asChild>
            <Link to="/organizer/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Eventos</p>
                <h3 className="text-2xl font-bold">{events.length}</h3>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ingressos Vendidos</p>
                <h3 className="text-2xl font-bold">
                  {events.reduce((sum, event) => sum + calculateTicketsSold(event), 0)}
                </h3>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Receita Total</p>
                <h3 className="text-2xl font-bold">
                  {events.reduce((sum, event) => sum + calculateRevenue(event), 0) > 0
                    ? `R$ ${events.reduce((sum, event) => sum + calculateRevenue(event), 0).toLocaleString('pt-BR')}`
                    : 'Grátis'}
                </h3>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título ou categoria..."
                className="pl-10 h-12 bg-white border-gray-100 rounded-xl focus-visible:ring-primary shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading}
                className="h-12 px-6 rounded-xl border-gray-100 font-bold gap-2 text-xs uppercase tracking-widest hover:bg-gray-50"
              >
                <Activity className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
                Atualizar Lista
              </Button>
              <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-100 font-bold gap-2 text-xs uppercase tracking-widest hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const ticketsSold = calculateTicketsSold(event);
                const totalCapacity = calculateTotalCapacity(event);
                const revenue = calculateRevenue(event);

                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.category}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(event.date)}</div>
                        <div className="text-gray-500">{event.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(event.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{ticketsSold} / {totalCapacity}</div>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${(ticketsSold / totalCapacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {revenue > 0 ? `R$ ${revenue.toLocaleString('pt-BR')}` : 'Grátis'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm" className="hidden sm:flex border-gray-100 text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-xl">
                          <Link to={`/organizer/event/${event.id}/manage`}>
                            Painel do Evento
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 shadow-xl p-2">
                            <DropdownMenuItem asChild className="rounded-xl py-2 cursor-pointer">
                              <Link to={`/organizer/event/${event.id}/manage`} className="flex items-center">
                                <Eye className="h-4 w-4 mr-2 text-primary" />
                                <span className="text-xs font-bold">Ver Hub do Evento</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl py-2 cursor-pointer">
                              <Link to={`/organizer/events/edit/${event.id}`} className="flex items-center">
                                <Edit className="h-4 w-4 mr-2 text-indigo-500" />
                                <span className="text-xs font-bold">Editar Cadastro</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="rounded-xl py-2 text-red-600 cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span className="text-xs font-bold">Excluir Evento</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Tente ajustar seus filtros de busca.' : 'Comece criando seu primeiro evento.'}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/organizer/events/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Evento
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerEvents;
