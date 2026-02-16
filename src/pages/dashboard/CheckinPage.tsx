
import { useState } from 'react';
import { Search, Check, X, RefreshCw, Info, Plus, CheckCheck, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CheckInStatus = 'valid' | 'used' | 'invalid';
type ScanStatus = 'none' | CheckInStatus;

interface CheckIn {
  name: string;
  ticketId: string;
  status: CheckInStatus;
  time: string;
}

const CheckinPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('none');
  const [loading, setLoading] = useState(false);
  const [observation, setObservation] = useState('');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  // Mock attendee data
  const mockAttendee = {
    name: 'Maria Silva',
    cpf: '123.456.789-00',
    email: 'maria@example.com',
    photo: 'https://randomuser.me/api/portraits/women/12.jpg',
    eventName: 'Festival SanjaMusic 2025',
    ticketType: 'Ingresso Comum',
    ticketBatch: '1º Lote',
    scanTime: new Date().toISOString(),
    observation: '',
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery) return;

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // For the demo, we'll just check if the query includes certain keywords
      if (searchQuery.includes('valid')) {
        setScanStatus('valid');
      } else if (searchQuery.includes('used')) {
        setScanStatus('used');
      } else if (searchQuery.includes('invalid')) {
        setScanStatus('invalid');
      } else {
        // Default to valid for demo purposes
        setScanStatus('valid');
      }

      setLoading(false);
    }, 1000);
  };

  const resetScan = () => {
    setScanStatus('none');
    setSearchQuery('');
    setObservation('');
  };

  const handleMarkEntry = () => {
    // Verificamos que o status é válido antes de adicionar ao histórico
    if (scanStatus !== 'valid') return;

    // Adicionar ao histórico de check-ins
    const newCheckIn: CheckIn = {
      name: mockAttendee.name,
      ticketId: searchQuery,
      status: scanStatus,
      time: format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })
    };

    setCheckIns(prev => [newCheckIn, ...prev]);

    // Mostrar feedback toast
    toast({
      title: 'Check-in realizado',
      description: `${mockAttendee.name} - ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      variant: 'default',
    });

    // Reset scan
    resetScan();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">A2 Tickets 360 - Controle de Acesso</h1>
            <button className="bg-white/20 hover:bg-white/30 text-white py-1 px-4 rounded-lg text-sm">
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Verificar Ingresso</CardTitle>
              <CardDescription>
                Escaneie o QR Code ou digite o código do ingresso para verificar o status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Escaneie o QR Code ou digite o código do ingresso..."
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !searchQuery}
                    className="py-3 px-6"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        Verificando...
                      </div>
                    ) : (
                      'Verificar'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Scan Results */}
          {scanStatus !== 'none' && (
            <Card className="mb-8 animate-fadeIn">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Result Status */}
                  <div className="md:w-1/3 flex flex-col items-center justify-center p-4">
                    {scanStatus === 'valid' && (
                      <div className="text-center">
                        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <Check className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600">Ingresso Válido</h2>
                        <p className="text-gray-600 mt-2">O ingresso pode ser utilizado.</p>
                      </div>
                    )}

                    {scanStatus === 'used' && (
                      <div className="text-center">
                        <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="h-12 w-12 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-yellow-600">Já Utilizado</h2>
                        <p className="text-gray-600 mt-2">Este ingresso já foi utilizado.</p>
                      </div>
                    )}

                    {scanStatus === 'invalid' && (
                      <div className="text-center">
                        <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                          <X className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600">Ingresso Inválido</h2>
                        <p className="text-gray-600 mt-2">Este ingresso não é válido.</p>
                      </div>
                    )}

                    <Button
                      onClick={handleMarkEntry}
                      className={`mt-6 ${scanStatus === 'valid'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      disabled={scanStatus !== 'valid'}
                    >
                      {scanStatus === 'valid' ? (
                        <div className="flex items-center gap-2">
                          <CheckCheck size={18} />
                          Marcar Entrada
                        </div>
                      ) : 'Voltar'}
                    </Button>
                  </div>

                  {/* Attendee Details */}
                  <div className="md:w-2/3 md:border-l md:pl-6">
                    <h3 className="text-xl font-semibold mb-4">Detalhes do Participante</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="col-span-2 flex items-center">
                        <img
                          src={mockAttendee.photo}
                          alt="Foto do participante"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="ml-4">
                          <h4 className="font-medium text-lg">{mockAttendee.name}</h4>
                          <p className="text-gray-600 text-sm">{mockAttendee.email}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">CPF</p>
                        <p className="font-medium">{mockAttendee.cpf}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Evento</p>
                        <p className="font-medium">{mockAttendee.eventName}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Tipo de Ingresso</p>
                        <p className="font-medium">{mockAttendee.ticketType}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Lote</p>
                        <p className="font-medium">{mockAttendee.ticketBatch}</p>
                      </div>

                      <div className="col-span-2 mt-2">
                        <p className="text-sm text-gray-500">Observações do Organizador</p>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md mt-1"
                          rows={3}
                          placeholder="Adicione observações sobre o participante..."
                          value={observation}
                          onChange={(e) => setObservation(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6 text-center">
                  <Button
                    onClick={resetScan}
                    variant="outline"
                  >
                    Verificar outro ingresso
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Check-ins */}
          {checkIns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Histórico de Check-ins
                </CardTitle>
                <CardDescription>
                  Ingressos verificados nesta sessão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Participante</th>
                        <th className="text-left py-2 px-4">Código</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Horário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkIns.map((checkIn, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{checkIn.name}</td>
                          <td className="py-2 px-4">{checkIn.ticketId.substring(0, 8)}...</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${checkIn.status === 'valid' ? 'bg-green-100 text-green-800' :
                                checkIn.status === 'used' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                              {checkIn.status === 'valid' ? 'Válido' :
                                checkIn.status === 'used' ? 'Já Usado' : 'Inválido'}
                            </span>
                          </td>
                          <td className="py-2 px-4">{checkIn.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckinPage;
