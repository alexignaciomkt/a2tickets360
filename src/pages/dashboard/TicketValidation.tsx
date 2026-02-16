
import { useState, useEffect } from 'react';
import { Search, QrCode, CheckCircle, XCircle, AlertTriangle, Filter, Download, Share2, Copy } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  ticketNumber: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  ticketType: string;
  status: 'valid' | 'used' | 'invalid' | 'cancelled';
  purchaseDate: string;
  validationDate?: string;
  price: number;
  qrCode: string;
}

const TicketValidation = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      ticketNumber: 'TKT-001',
      eventName: 'Festival de Música 2024',
      customerName: 'João Silva',
      customerEmail: 'joao@email.com',
      ticketType: 'VIP',
      status: 'valid',
      purchaseDate: '2024-01-15',
      price: 150,
      qrCode: 'QR123456789'
    },
    {
      id: '2',
      ticketNumber: 'TKT-002',
      eventName: 'Festival de Música 2024',
      customerName: 'Maria Santos',
      customerEmail: 'maria@email.com',
      ticketType: 'Pista',
      status: 'used',
      purchaseDate: '2024-01-16',
      validationDate: '2024-01-20',
      price: 80,
      qrCode: 'QR987654321'
    },
    {
      id: '3',
      ticketNumber: 'TKT-003',
      eventName: 'Conference Tech 2024',
      customerName: 'Pedro Costa',
      customerEmail: 'pedro@email.com',
      ticketType: 'Standard',
      status: 'invalid',
      purchaseDate: '2024-01-17',
      price: 100,
      qrCode: 'QR456789123'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || ticket.eventName === eventFilter;

    return matchesSearch && matchesStatus && matchesEvent;
  });

  const getStatusBadge = (status: Ticket['status']) => {
    const configs = {
      valid: { variant: 'default' as const, label: 'Válido', icon: CheckCircle },
      used: { variant: 'secondary' as const, label: 'Utilizado', icon: CheckCircle },
      invalid: { variant: 'destructive' as const, label: 'Inválido', icon: XCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelado', icon: XCircle },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleValidateTicket = (ticketId: string) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: 'used' as const, validationDate: new Date().toISOString().split('T')[0] }
        : ticket
    ));

    toast({
      title: 'Ingresso validado',
      description: 'O ingresso foi marcado como utilizado.',
    });
  };

  const handleInvalidateTicket = (ticketId: string) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: 'invalid' as const }
        : ticket
    ));

    toast({
      title: 'Ingresso invalidado',
      description: 'O ingresso foi marcado como inválido.',
      variant: 'destructive',
    });
  };

  const handleCancelTicket = (ticketId: string) => {
    if (confirm('Tem certeza que deseja cancelar este ingresso?')) {
      setTickets(tickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: 'cancelled' as const }
          : ticket
      ));

      toast({
        title: 'Ingresso cancelado',
        description: 'O ingresso foi cancelado com sucesso.',
      });
    }
  };

  const handleQRScan = () => {
    // Redirecionar para a página dedicada do scanner
    window.location.href = '/staff/reader';
  };

  const handleShareScanner = (platform: 'whatsapp' | 'copy') => {
    const scannerUrl = `${window.location.origin}/staff/reader`;

    if (platform === 'whatsapp') {
      const text = encodeURIComponent(`Olá! Aqui está o link para o sistema de validação de ingressos: ${scannerUrl}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
      toast({
        title: 'Abrindo WhatsApp',
        description: 'Compartilhando link do scanner...',
      });
    } else {
      navigator.clipboard.writeText(scannerUrl);
      toast({
        title: 'Link copiado!',
        description: 'O link do scanner foi copiado para sua área de transferência.',
      });
    }
  };

  const handleExportReport = () => {
    toast({
      title: 'Exportar relatório',
      description: 'Exportando relatório de validação...',
    });
  };

  const uniqueEvents = [...new Set(tickets.map(ticket => ticket.eventName))];

  const stats = {
    total: tickets.length,
    valid: tickets.filter(t => t.status === 'valid').length,
    used: tickets.filter(t => t.status === 'used').length,
    invalid: tickets.filter(t => t.status === 'invalid' || t.status === 'cancelled').length,
  };

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Validação de Ingressos</h1>
            <p className="text-gray-600 mt-1">Gerencie e valide ingressos dos seus eventos</p>
          </div>
          <div className="flex space-x-2">
            <div className="flex bg-white rounded-md border shadow-sm h-10 px-1 items-center mr-2">
              <span className="text-xs font-medium text-gray-500 px-2 uppercase border-r mr-2">Compartilhar Scanner</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleShareScanner('whatsapp')}
                title="Compartilhar via WhatsApp"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => handleShareScanner('copy')}
                title="Copiar Link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="default" onClick={handleQRScan} className="bg-primary hover:bg-primary/90">
              <QrCode className="h-4 w-4 mr-2" />
              Abrir Scanner
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Ingressos</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                ingressos emitidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Válidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
              <p className="text-xs text-muted-foreground">
                aguardando validação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.used}</div>
              <p className="text-xs text-muted-foreground">
                já validados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inválidos</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
              <p className="text-xs text-muted-foreground">
                cancelados/inválidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por número, nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="valid">Válidos</SelectItem>
                    <SelectItem value="used">Utilizados</SelectItem>
                    <SelectItem value="invalid">Inválidos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-48">
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os eventos</SelectItem>
                    {uniqueEvents.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ingressos</CardTitle>
            <CardDescription>
              Todos os ingressos emitidos e seus status de validação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Compra</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="font-mono text-sm">{ticket.ticketNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.customerName}</div>
                        <div className="text-sm text-gray-500">{ticket.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{ticket.eventName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.ticketType}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        R$ {ticket.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(ticket.purchaseDate).toLocaleDateString('pt-BR')}
                      </div>
                      {ticket.validationDate && (
                        <div className="text-xs text-gray-500">
                          Validado: {new Date(ticket.validationDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        {ticket.status === 'valid' && (
                          <Button
                            size="sm"
                            onClick={() => handleValidateTicket(ticket.id)}
                          >
                            Validar
                          </Button>
                        )}
                        {ticket.status === 'valid' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleInvalidateTicket(ticket.id)}
                          >
                            Invalidar
                          </Button>
                        )}
                        {(ticket.status === 'valid' || ticket.status === 'used') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelTicket(ticket.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum ingresso encontrado
                </h3>
                <p className="text-gray-500">
                  Nenhum ingresso corresponde aos filtros aplicados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TicketValidation;
