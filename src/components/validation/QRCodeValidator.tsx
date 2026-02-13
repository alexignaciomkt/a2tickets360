
import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, Scan, User, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';

interface TicketData {
  id: string;
  eventName: string;
  attendeeName: string;
  ticketType: string;
  status: 'valid' | 'used' | 'invalid';
  eventDate: string;
  eventLocation: string;
  checkInTime?: string;
}

interface QRCodeValidatorProps {
  eventId?: string;
  onValidation?: (ticketData: TicketData) => void;
}

const QRCodeValidator = ({ eventId, onValidation }: QRCodeValidatorProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedTicket, setLastScannedTicket] = useState<TicketData | null>(null);
  const [manualCode, setManualCode] = useState('');
  const { showToast } = useNotifications();

  // Mock validation function - replace with real API call
  const validateTicket = async (qrCode: string): Promise<TicketData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation logic
    const mockTickets: Record<string, TicketData> = {
      'TICKET123': {
        id: 'TICKET123',
        eventName: 'Festival de Música Eletrônica',
        attendeeName: 'João Silva',
        ticketType: 'VIP',
        status: 'valid',
        eventDate: '2024-01-20T20:00:00Z',
        eventLocation: 'Arena Eventos SP',
      },
      'TICKET456': {
        id: 'TICKET456',
        eventName: 'Festival de Música Eletrônica',
        attendeeName: 'Maria Santos',
        ticketType: 'Pista',
        status: 'used',
        eventDate: '2024-01-20T20:00:00Z',
        eventLocation: 'Arena Eventos SP',
        checkInTime: '2024-01-20T19:30:00Z',
      },
    };

    const ticket = mockTickets[qrCode];
    if (!ticket) {
      throw new Error('Ingresso não encontrado');
    }

    return ticket;
  };

  const handleScan = async (qrCode: string) => {
    setIsScanning(true);
    try {
      const ticketData = await validateTicket(qrCode);
      setLastScannedTicket(ticketData);
      onValidation?.(ticketData);

      if (ticketData.status === 'valid') {
        showToast('success', 'Ingresso Válido', `Check-in realizado para ${ticketData.attendeeName}`);
      } else if (ticketData.status === 'used') {
        showToast('warning', 'Ingresso Já Utilizado', `Este ingresso já foi usado em ${ticketData.checkInTime}`);
      } else {
        showToast('error', 'Ingresso Inválido', 'Este ingresso não é válido');
      }
    } catch (error) {
      showToast('error', 'Erro na Validação', error instanceof Error ? error.message : 'Erro desconhecido');
      setLastScannedTicket(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
      setManualCode('');
    }
  };

  const startCameraScanner = () => {
    // Placeholder for camera scanner integration
    showToast('info', 'Scanner de Câmera', 'Funcionalidade de câmera será implementada em breve');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'used':
        return <XCircle className="h-5 w-5 text-yellow-500" />;
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <QrCode className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'valid':
        return 'default';
      case 'used':
        return 'secondary';
      case 'invalid':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Validação de Ingressos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Scanner */}
          <Button 
            onClick={startCameraScanner}
            className="w-full"
            disabled={isScanning}
          >
            <Scan className="h-4 w-4 mr-2" />
            Escanear com Câmera
          </Button>

          {/* Manual Input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleManualValidation} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Digite o código do ingresso"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isScanning}
            />
            <Button type="submit" disabled={isScanning || !manualCode.trim()}>
              {isScanning ? 'Validando...' : 'Validar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Last Scanned Ticket */}
      {lastScannedTicket && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getStatusIcon(lastScannedTicket.status)}
                Último Ingresso Validado
              </span>
              <Badge variant={getStatusBadgeVariant(lastScannedTicket.status)}>
                {lastScannedTicket.status === 'valid' ? 'Válido' :
                 lastScannedTicket.status === 'used' ? 'Já Usado' : 'Inválido'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{lastScannedTicket.attendeeName}</p>
                  <p className="text-xs text-gray-500">Participante</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{lastScannedTicket.ticketType}</p>
                  <p className="text-xs text-gray-500">Tipo de Ingresso</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{lastScannedTicket.eventLocation}</p>
                  <p className="text-xs text-gray-500">Local</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{lastScannedTicket.id}</p>
                  <p className="text-xs text-gray-500">Código do Ingresso</p>
                </div>
              </div>
            </div>

            {lastScannedTicket.checkInTime && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Check-in realizado em: {new Date(lastScannedTicket.checkInTime).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeValidator;
