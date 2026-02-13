
import { useState } from 'react';
import { Users, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

// Mock data para os organizadores
const mockOrganizers = [
  {
    id: 'org1',
    name: 'Ana Silva',
    email: 'ana@eventpro.com',
    company: 'EventPro',
    events: 24,
    revenue: 45600,
    status: 'active',
    dateJoined: '2023-02-15',
    photoUrl: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 'org2',
    name: 'Carlos Santos',
    email: 'carlos@festejaja.com',
    company: 'FestejaJá',
    events: 18,
    revenue: 32400,
    status: 'active',
    dateJoined: '2023-05-22',
    photoUrl: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 'org3',
    name: 'Mariana Oliveira',
    email: 'mariana@eventosvip.com',
    company: 'Eventos VIP',
    events: 12,
    revenue: 28900,
    status: 'active',
    dateJoined: '2023-08-10',
    photoUrl: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: 'org4',
    name: 'Pedro Mendes',
    email: 'pedro@showtime.com',
    company: 'ShowTime',
    events: 8,
    revenue: 18500,
    status: 'pending',
    dateJoined: '2024-01-30',
    photoUrl: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: 'org5',
    name: 'Juliana Costa',
    email: 'juliana@festivaissp.com',
    company: 'Festivais SP',
    events: 0,
    revenue: 0,
    status: 'pending',
    dateJoined: '2024-02-28',
    photoUrl: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 'org6',
    name: 'Roberto Alves',
    email: 'roberto@megashows.com',
    company: 'MegaShows',
    events: 0,
    revenue: 0,
    status: 'pending',
    dateJoined: '2024-03-15',
    photoUrl: 'https://i.pravatar.cc/150?img=6'
  }
];

const OrganizersManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [organizers, setOrganizers] = useState(mockOrganizers);
  
  const filteredOrganizers = activeTab === 'all' 
    ? organizers 
    : organizers.filter(org => org.status === activeTab);
  
  const handleApprove = (id: string) => {
    setOrganizers(prev => 
      prev.map(org => 
        org.id === id ? { ...org, status: 'active' } : org
      )
    );
    toast({
      title: 'Organizador aprovado',
      description: 'O organizador foi aprovado com sucesso.',
    });
  };
  
  const handleReject = (id: string) => {
    setOrganizers(prev => prev.filter(org => org.id !== id));
    toast({
      title: 'Organizador rejeitado',
      description: 'A solicitação do organizador foi rejeitada.',
      variant: 'destructive',
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Organizadores</h1>
            <p className="text-gray-600 mt-1">
              Gerencie organizadores, aprove solicitações e monitore desempenho.
            </p>
          </div>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Novo Organizador
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Organizadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="m-0">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Organizador</th>
                          <th className="px-4 py-3 text-left font-medium">Empresa</th>
                          <th className="px-4 py-3 text-left font-medium">Eventos</th>
                          <th className="px-4 py-3 text-left font-medium">Faturamento</th>
                          <th className="px-4 py-3 text-left font-medium">Status</th>
                          <th className="px-4 py-3 text-right font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredOrganizers.map((org) => (
                          <tr key={org.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <img 
                                  src={org.photoUrl} 
                                  alt={org.name} 
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                                <div>
                                  <div className="font-medium">{org.name}</div>
                                  <div className="text-gray-500">{org.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{org.company}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{org.events}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              R$ {org.revenue.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {org.status === 'active' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pendente
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              {org.status === 'pending' ? (
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleApprove(org.id)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleReject(org.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="active" className="m-0">
                {/* Content for active tab - same structure as 'all' tab */}
              </TabsContent>
              
              <TabsContent value="pending" className="m-0">
                {/* Content for pending tab - same structure as 'all' tab */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrganizersManagement;
