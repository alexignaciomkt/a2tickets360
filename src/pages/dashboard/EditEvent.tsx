import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Settings, DollarSign, Users, Calendar, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { TicketModal } from '@/components/modals/TicketModal';
import { SalesChannelModal } from '@/components/modals/SalesChannelModal';
import { organizerService } from '@/services/organizerService';
import { Event, Ticket, SalesChannel } from '@/interfaces/organizer';

const EditEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [salesChannelModalOpen, setSalesChannelModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | undefined>();
  const [editingChannel, setEditingChannel] = useState<SalesChannel | undefined>();

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const eventData = await organizerService.getEvent(eventId!);
      setEvent(eventData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar evento',
        description: 'Evento não encontrado.',
      });
      navigate('/organizer/events');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setTicketModalOpen(true);
  };

  const handleEditChannel = (channel: SalesChannel) => {
    setEditingChannel(channel);
    setSalesChannelModalOpen(true);
  };

  const handleTicketModalClose = () => {
    setTicketModalOpen(false);
    setEditingTicket(undefined);
    loadEvent(); // Reload to get updated data
  };

  const handleChannelModalClose = () => {
    setSalesChannelModalOpen(false);
    setEditingChannel(undefined);
    loadEvent(); // Reload to get updated data
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (event) {
      const updatedTickets = event.tickets.filter(ticket => ticket.id !== ticketId);
      setEvent({ ...event, tickets: updatedTickets });
      toast({
        title: 'Ingresso removido',
        description: 'O tipo de ingresso foi removido com sucesso.',
      });
    }
  };

  const handleDeleteSalesChannel = (channelId: string) => {
    if (event) {
      const updatedChannels = event.salesChannels.filter(channel => channel.id !== channelId);
      setEvent({ ...event, salesChannels: updatedChannels });
      toast({
        title: 'Ponto de venda removido',
        description: 'O ponto de venda foi removido com sucesso.',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getChannelTypeBadge = (type: SalesChannel['type']) => {
    const config = {
      online: { label: 'Online', variant: 'default' as const },
      physical: { label: 'Físico', variant: 'secondary' as const },
      partner: { label: 'Parceiro', variant: 'outline' as const },
    };
    return <Badge variant={config[type].variant}>{config[type].label}</Badge>;
  };

  const getTicketCategoryBadge = (category: Ticket['category']) => {
    const config = {
      standard: { label: 'Padrão', variant: 'default' as const },
      vip: { label: 'VIP', variant: 'destructive' as const },
      'early-bird': { label: 'Promoção', variant: 'secondary' as const },
      student: { label: 'Estudante', variant: 'outline' as const },
      group: { label: 'Grupo', variant: 'outline' as const },
    };
    return <Badge variant={config[category].variant}>{config[category].label}</Badge>;
  };

  if (loading || !event) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando evento...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout userType="organizer">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/organizer/events')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <p className="text-gray-600 mt-1">{event.category} • {formatDate(event.date)}</p>
              </div>
            </div>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>

          {/* Event Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Capacidade</p>
                  <h3 className="text-2xl font-bold">{event.capacity}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Vendidos</p>
                  <h3 className="text-2xl font-bold">
                    {event.tickets.reduce((sum, ticket) => sum + (ticket.quantity - ticket.remaining), 0)}
                  </h3>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Receita</p>
                  <h3 className="text-xl font-bold">
                    {formatCurrency(
                      event.tickets.reduce((sum, ticket) => {
                        const sold = ticket.quantity - ticket.remaining;
                        return sum + (sold * ticket.price);
                      }, 0)
                    )}
                  </h3>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Disponíveis</p>
                  <h3 className="text-2xl font-bold">
                    {event.tickets.reduce((sum, ticket) => sum + ticket.remaining, 0)}
                  </h3>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="tickets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tickets">Ingressos</TabsTrigger>
              <TabsTrigger value="sales-channels">Pontos de Venda</TabsTrigger>
              <TabsTrigger value="sales">Vendas</TabsTrigger>
              <TabsTrigger value="analytics">Relatórios</TabsTrigger>
            </TabsList>

            {/* Tickets Tab */}
            <TabsContent value="tickets">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Tipos de Ingressos</h2>
                  <Button onClick={() => setTicketModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Ingresso
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Vendidos</TableHead>
                      <TableHead>Disponíveis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {event.tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ticket.name}</div>
                            <div className="text-sm text-gray-500">{ticket.batch}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTicketCategoryBadge(ticket.category)}
                        </TableCell>
                        <TableCell>{formatCurrency(ticket.price)}</TableCell>
                        <TableCell>{ticket.quantity - ticket.remaining}</TableCell>
                        <TableCell>{ticket.remaining}</TableCell>
                        <TableCell>
                          <Badge variant={ticket.isActive ? 'default' : 'secondary'}>
                            {ticket.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTicket(ticket)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTicket(ticket.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {event.tickets.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ingresso configurado</h3>
                    <p className="text-gray-500 mb-4">Configure os tipos de ingressos para seu evento.</p>
                    <Button onClick={() => setTicketModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Ingresso
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Sales Channels Tab */}
            <TabsContent value="sales-channels">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Pontos de Venda</h2>
                  <Button onClick={() => setSalesChannelModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Ponto de Venda
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {event.salesChannels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell>
                          <div className="font-medium">{channel.name}</div>
                        </TableCell>
                        <TableCell>
                          {getChannelTypeBadge(channel.type)}
                        </TableCell>
                        <TableCell>{channel.commission}%</TableCell>
                        <TableCell>
                          {channel.contactPerson && (
                            <div className="text-sm">
                              <div>{channel.contactPerson}</div>
                              <div className="text-gray-500">{channel.phone}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                            {channel.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditChannel(channel)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSalesChannel(channel.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {event.salesChannels.length === 0 && (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ponto de venda configurado</h3>
                    <p className="text-gray-500 mb-4">Configure onde seus ingressos serão vendidos.</p>
                    <Button onClick={() => setSalesChannelModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Ponto de Venda
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Sales Tab */}
            <TabsContent value="sales">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Histórico de Vendas</h2>
                <p className="text-gray-500">Em desenvolvimento - Histórico detalhado de todas as vendas.</p>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Relatórios e Análises</h2>
                <p className="text-gray-500">Em desenvolvimento - Gráficos e relatórios detalhados.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>

      {/* Modals */}
      <TicketModal
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        eventId={eventId!}
        ticket={editingTicket}
        onSuccess={handleTicketModalClose}
      />

      <SalesChannelModal
        open={salesChannelModalOpen}
        onOpenChange={setSalesChannelModalOpen}
        eventId={eventId!}
        channel={editingChannel}
        onSuccess={handleChannelModalClose}
      />
    </>
  );
};

export default EditEvent;
