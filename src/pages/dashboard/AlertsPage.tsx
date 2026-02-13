
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Eye, Clock, Filter, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: string;
  type: 'fraud' | 'suspicious' | 'security' | 'information';
  title: string;
  description: string;
  date: string;
  status: 'new' | 'pending' | 'resolved';
}

const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'fraud',
    title: 'Possível fraude de ingressos detectada',
    description: 'Múltiplas tentativas de uso do mesmo QR code em locais diferentes foram identificadas para o evento "Festival de Verão".',
    date: '2025-01-15T14:32:00',
    status: 'new'
  },
  {
    id: 'alert-002',
    type: 'suspicious',
    title: 'Atividade suspeita em conta de organizador',
    description: 'Foram detectadas tentativas de login incomuns na conta do organizador "Festas Premium".',
    date: '2025-01-14T09:15:00',
    status: 'pending'
  },
  {
    id: 'alert-003',
    type: 'security',
    title: 'Alerta de segurança - Tentativa de brute force',
    description: 'Múltiplas tentativas consecutivas de login foram detectadas visando várias contas de usuários.',
    date: '2025-01-12T22:48:00',
    status: 'resolved'
  },
  {
    id: 'alert-004',
    type: 'information',
    title: 'Alta demanda de acessos simultâneos',
    description: 'O evento "Show Nacional" registrou um pico de acessos simultâneos que pode exigir recursos adicionais de servidor.',
    date: '2025-01-10T18:05:00',
    status: 'resolved'
  },
  {
    id: 'alert-005',
    type: 'fraud',
    title: 'Ingressos duplicados identificados',
    description: 'Sistema identificou tentativa de clonar ingressos para o evento "Festa de Réveillon".',
    date: '2025-01-08T10:22:00',
    status: 'pending'
  },
];

const AlertsPage = () => {
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(mockAlerts);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filterByStatus = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredAlerts(mockAlerts);
    } else {
      setFilteredAlerts(mockAlerts.filter(alert => alert.status === status));
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fraud':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'suspicious':
        return <Eye className="h-6 w-6 text-amber-500" />;
      case 'security':
        return <Shield className="h-6 w-6 text-orange-500" />;
      case 'information':
        return <Bell className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Alertas de Segurança</h1>
          <p className="text-gray-600">Monitore alertas de eventos suspeitos e atividades anômalas</p>
        </div>
        
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas
              <Badge variant="destructive" className="ml-2">{mockAlerts.filter(a => a.status === 'new').length} novos</Badge>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="flex items-center border rounded-md">
                <button 
                  className={`px-3 py-1 text-sm ${statusFilter === 'all' ? 'bg-primary text-white' : ''}`}
                  onClick={() => filterByStatus('all')}
                >
                  Todos
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${statusFilter === 'new' ? 'bg-red-600 text-white' : ''}`}
                  onClick={() => filterByStatus('new')}
                >
                  Novos
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${statusFilter === 'pending' ? 'bg-amber-500 text-white' : ''}`}
                  onClick={() => filterByStatus('pending')}
                >
                  Pendentes
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${statusFilter === 'resolved' ? 'bg-green-600 text-white' : ''}`}
                  onClick={() => filterByStatus('resolved')}
                >
                  Resolvidos
                </button>
              </div>
              
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map(alert => (
                  <Card key={alert.id} className={`border-l-4 ${
                    alert.status === 'new' ? 'border-l-red-500' : 
                    alert.status === 'pending' ? 'border-l-amber-500' : 'border-l-green-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <div className="flex items-center gap-2 mt-1 sm:mt-0">
                              <Badge className={`${
                                alert.status === 'new' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                                alert.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
                                'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}>
                                {alert.status === 'new' ? 'Novo' : 
                                 alert.status === 'pending' ? 'Pendente' : 'Resolvido'}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(alert.date)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-2">{alert.description}</p>
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm">Ver detalhes</Button>
                            {alert.status !== 'resolved' && (
                              <Button className="ml-2" size="sm">Marcar como resolvido</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-1">Nenhum alerta encontrado</h3>
                  <p className="text-gray-500">
                    Não há alertas ativos com os filtros selecionados.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
