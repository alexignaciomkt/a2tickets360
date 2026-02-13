
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Users, DollarSign, Calendar } from 'lucide-react';
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

const OrganizerEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const organizerId = '1'; // Em uma aplicação real, viria do contexto de autenticação
      const eventsData = await organizerService.getEvents(organizerId);
      setEvents(eventsData);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
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
      active: { label: 'Ativo', variant: 'default' as const },
      completed: { label: 'Finalizado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateTicketsSold = (event: Event) => {
    return event.tickets.reduce((sum, ticket) => sum + (ticket.quantity - ticket.remaining), 0);
  };

  const calculateTotalCapacity = (event: Event) => {
    return event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  };

  const calculateRevenue = (event: Event) => {
    return event.tickets.reduce((sum, ticket) => {
      const sold = ticket.quantity - ticket.remaining;
      return sum + (sold * ticket.price);
    }, 0);
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
                  R$ {events.reduce((sum, event) => sum + calculateRevenue(event), 0).toLocaleString('pt-BR')}
                </h3>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
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
                        R$ {revenue.toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/organizer/events/${event.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/organizer/events/${event.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
