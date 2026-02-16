
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStaffAuth } from '@/contexts/StaffAuthContext';
import { useQRCodeScanner } from '@/hooks/useQRCodeScanner';
import { staffService } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import { CheckInRecord } from '@/interfaces/staff';
import {
  Camera,
  Search,
  Check,
  X,
  LogOut,
  Users,
  Clock,
  Scan,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StaffCheckinPage = () => {
  const { staffAuth, logout } = useStaffAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [manualCode, setManualCode] = useState('');
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState(0);

  useEffect(() => {
    if (!staffAuth) {
      navigate('/staff/login');
      return;
    }
    loadCheckInHistory();
  }, [staffAuth, navigate]);

  const loadCheckInHistory = async () => {
    if (!staffAuth) return;

    try {
      const history = await staffService.getCheckInHistory(staffAuth.eventId);
      setCheckInHistory(history);

      // Contar check-ins de hoje
      const today = new Date().toDateString();
      const todayCount = history.filter(record =>
        new Date(record.checkInTime).toDateString() === today
      ).length;
      setTodayCheckIns(todayCount);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleQRCodeScan = (qrData: string) => {
    processCheckIn(qrData);
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processCheckIn(manualCode.trim());
      setManualCode('');
    }
  };

  const processCheckIn = async (ticketCode: string) => {
    if (!staffAuth) return;

    try {
      const checkInRecord = await staffService.performCheckIn(ticketCode, staffAuth);

      toast({
        title: 'Check-in realizado!',
        description: `${checkInRecord.participantName} - ${format(new Date(), "HH:mm", { locale: ptBR })}`,
      });

      // Atualizar histórico
      loadCheckInHistory();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no check-in',
        description: 'Não foi possível realizar o check-in. Tente novamente.',
      });
    }
  };

  const { isScanning, startScanning, stopScanning } = useQRCodeScanner({
    onScan: handleQRCodeScan,
    onError: (error) => toast({
      variant: 'destructive',
      title: 'Erro na câmera',
      description: error,
    }),
    elementId: 'reader'
  });

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  if (!staffAuth) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">A2 Tickets 360</h1>
              <p className="text-gray-600">{staffAuth.eventTitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Staff</p>
                <p className="font-medium">{staffAuth.staffName}</p>
                <Badge variant={staffAuth.role === 'supervisor' ? 'default' : 'secondary'}>
                  {staffAuth.role === 'supervisor' ? 'Supervisor' : 'Operador'}
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel Principal de Check-in */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Check-ins Hoje</p>
                      <h3 className="text-2xl font-bold">{todayCheckIns}</h3>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Horário</p>
                      <h3 className="text-xl font-bold">
                        {format(new Date(), "HH:mm", { locale: ptBR })}
                      </h3>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scanner de QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scan className="h-5 w-5 mr-2" />
                  Scanner de QR Code
                </CardTitle>
                <CardDescription>
                  Escaneie o QR Code do ingresso para realizar o check-in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div id="reader" className="w-full h-64 bg-black rounded-lg overflow-hidden relative">
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                        Câmera desligada
                      </div>
                    )}
                  </div>

                  {isScanning ? (
                    <Button onClick={stopScanning} variant="outline" className="w-full">
                      Parar Scanner
                    </Button>
                  ) : (
                    <Button onClick={startScanning} className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Iniciar Scanner
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Check-in Manual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Check-in Manual
                </CardTitle>
                <CardDescription>
                  Digite o código do ingresso manualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualCheckIn} className="flex space-x-2">
                  <Input
                    placeholder="Digite o código do ingresso..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!manualCode.trim()}>
                    <Check className="h-4 w-4 mr-2" />
                    Check-in
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Check-ins */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Últimos Check-ins
                </CardTitle>
                <CardDescription>
                  Bem-vindo ao sistema de check-in do A2 Tickets 360.lizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {checkInHistory.slice(0, 10).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-sm">{record.participantName}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(record.checkInTime), "dd/MM HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  ))}

                  {checkInHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum check-in realizado ainda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCheckinPage;
