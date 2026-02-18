import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, MoreHorizontal, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { masterService } from '@/services/masterService';
import { Organizer } from '@/interfaces/organizer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    loadOrganizers();
  }, []);

  const loadOrganizers = async () => {
    try {
      setIsLoading(true);
      const data = await masterService.getOrganizers();
      setOrganizers(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar organizadores',
        description: 'Não foi possível buscar os dados do servidor.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrganizers = activeTab === 'all'
    ? organizers
    : organizers.filter(org => org.emailVerified ? activeTab === 'active' : activeTab === 'pending');

  const handleApprove = async (id: string) => {
    try {
      await masterService.updateOrganizer(id, { emailVerified: true });
      loadOrganizers();
      toast({
        title: 'Organizador aprovado',
        description: 'O organizador foi aprovado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao aprovar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateOrganizer = async () => {
    try {
      if (!newOrg.name || !newOrg.email || !newOrg.password) {
        toast({ title: 'Atenção', description: 'Preencha todos os campos.', variant: 'warning' } as any);
        return;
      }
      await masterService.createOrganizer(newOrg);
      setIsModalOpen(false);
      setNewOrg({ name: '', email: '', password: '' });
      loadOrganizers();
      toast({
        title: 'Organizador criado',
        description: 'O novo organizador foi cadastrado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.response?.data?.error || 'Tente novamente.',
        variant: 'destructive',
      });
    }
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
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
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
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              Carregando organizadores...
                            </td>
                          </tr>
                        ) : filteredOrganizers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              Nenhum organizador encontrado.
                            </td>
                          </tr>
                        ) : filteredOrganizers.map((org) => (
                          <tr key={org.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3">
                                  {org.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-white">{org.name}</div>
                                  <div className="text-gray-400">{org.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-300">A2 Tickets</td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-300">0</td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                              R$ 0,00
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {org.emailVerified ? (
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
                              {!org.emailVerified ? (
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApprove(org.id)}
                                    className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" className="text-gray-400">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Novo Organizador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Empresa</Label>
              <Input
                id="name"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                placeholder="Ex: A2 Produções"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newOrg.email}
                onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                placeholder="contato@empresa.com"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha Temporária</Label>
              <Input
                id="password"
                type="password"
                value={newOrg.password}
                onChange={(e) => setNewOrg({ ...newOrg, password: e.target.value })}
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateOrganizer} className="bg-indigo-600 hover:bg-indigo-700">Criar Organizador</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default OrganizersManagement;
