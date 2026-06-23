
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
import { supabase } from '@/lib/supabase';
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
      if (eventIds.length === 0) {
        setEvents([]);
        return;
      }
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
    (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Event['status']) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      published: { label: 'Publicado', variant: 'default' as const },
      active: { label: 'Publicado', variant: 'default' as const },
      completed: { label: 'Finalizado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: 'Desconhecido', variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateTicketsSold = (event: any) => {
    return event.real_sold_count || 0;
  };

  const calculateTotalCapacity = (event: Event) => {
    if (!event.tickets || !Array.isArray(event.tickets)) return 0;
    return event.tickets.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0);
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
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Meus Eventos</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Gerencie todos os seus eventos em um só lugar</p>
          </div>
          <Button asChild className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-gray-700 transition-colors shadow-sm">
            <Link to="/organizer/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl"><Calendar className="w-6 h-6 text-indigo-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total de Eventos</p>
              <h3 className="text-3xl font-black text-gray-900">{events.length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl"><Users className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Ingressos Vendidos</p>
              <h3 className="text-3xl font-black text-blue-700">
                {events.reduce((sum, event) => sum + calculateTicketsSold(event), 0)}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Receita Total</p>
              <h3 className="text-3xl font-black text-emerald-700">
                {events.reduce((sum, event) => sum + calculateRevenue(event), 0) > 0
                  ? `R$ ${events.reduce((sum, event) => sum + calculateRevenue(event), 0).toLocaleString('pt-BR')}`
                  : 'Grátis'}
              </h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título ou categoria..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className="h-10 px-6 rounded-xl border-gray-200 font-black gap-2 text-[10px] uppercase tracking-widest hover:bg-gray-50 text-gray-600 shadow-sm"
            >
              <Activity className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
              Atualizar
            </Button>
            <Button variant="outline" className="h-10 px-6 rounded-xl border-gray-200 font-black gap-2 text-[10px] uppercase tracking-widest hover:bg-gray-50 text-gray-600 shadow-sm">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-100">
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Evento</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Data</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Status</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Vendas</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Receita</TableHead>
                <TableHead className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Ações</TableHead>
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
                      <div className="text-xs font-bold text-gray-800">
                        <div>{formatDate(event.date)}</div>
                        <div className="text-gray-500 font-medium">{event.time}</div>
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
                      <div className="text-sm font-black text-emerald-600">
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
                                <span className="text-xs font-bold">Editar Evento</span>
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
