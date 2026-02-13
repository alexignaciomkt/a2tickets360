
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, Download, Mail, CheckCircle, Clock, Users } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { organizerService } from '@/services/organizerService';
import { Sale } from '@/interfaces/organizer';

const OrganizerAttendees = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [checkInFilter, setCheckInFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (eventId) {
      loadSales();
    } else {
      loadAllSales();
    }
  }, [eventId]);

  const loadSales = async () => {
    try {
      const salesData = await organizerService.getSales(eventId!);
      setSales(salesData);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os participantes.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllSales = async () => {
    try {
      // Em uma implementação real, criaria um método para buscar todas as vendas do organizador
      const organizerId = '1';
      const events = await organizerService.getEvents(organizerId);
      const allSales: Sale[] = [];
      
      for (const event of events) {
        const eventSales = await organizerService.getSales(event.id);
        allSales.push(...eventSales);
      }
      
      setSales(allSales);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sale.paymentStatus === statusFilter;
    const matchesCheckIn = checkInFilter === 'all' || sale.checkInStatus === checkInFilter;
    
    return matchesSearch && matchesStatus && matchesCheckIn;
  });

  const getPaymentStatusBadge = (status: Sale['paymentStatus']) => {
    const config = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      paid: { label: 'Pago', variant: 'default' as const },
      refunded: { label: 'Reembolsado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getCheckInStatusBadge = (status: Sale['checkInStatus']) => {
    const config = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      'checked-in': { label: 'Check-in Feito', variant: 'default' as const },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleExport = () => {
    toast({
      title: 'Exportando dados',
      description: 'O arquivo será baixado em instantes.',
    });
  };

  const handleSendEmail = () => {
    toast({
      title: 'Email enviado',
      description: 'Email promocional enviado para todos os participantes.',
    });
  };

  if (loading) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando participantes...</p>
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
            <h1 className="text-3xl font-bold">Participantes</h1>
            <p className="text-gray-600 mt-1">
              {eventId ? 'Participantes do evento' : 'Todos os participantes dos seus eventos'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleSendEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total de Vendas</p>
                <h3 className="text-2xl font-bold">{sales.length}</h3>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Check-ins Feitos</p>
                <h3 className="text-2xl font-bold">
                  {sales.filter(sale => sale.checkInStatus === 'checked-in').length}
                </h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pendentes</p>
                <h3 className="text-2xl font-bold">
                  {sales.filter(sale => sale.checkInStatus === 'pending').length}
                </h3>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Receita Total</p>
                <h3 className="text-xl font-bold">
                  {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalPrice, 0))}
                </h3>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status do Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={checkInFilter} onValueChange={setCheckInFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status do Check-in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Check-ins</SelectItem>
                <SelectItem value="checked-in">Check-in Feito</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Ingresso</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Data da Compra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.buyerName}</div>
                      <div className="text-sm text-gray-500">ID: {sale.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{sale.buyerEmail}</div>
                      {sale.buyerPhone && (
                        <div className="text-gray-500">{sale.buyerPhone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Ticket ID: {sale.ticketId}</div>
                      <div className="text-gray-500">Canal: {sale.channelId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>{formatCurrency(sale.totalPrice)}</TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(sale.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    {getCheckInStatusBadge(sale.checkInStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(sale.saleDate)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum participante encontrado</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || checkInFilter !== 'all'
                  ? 'Tente ajustar seus filtros de busca.'
                  : 'Ainda não há participantes cadastrados.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerAttendees;
