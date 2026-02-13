
import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Store, Users, DollarSign, Clock, CreditCard, User } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { PDVModal } from '@/components/modals/PDVModal';
import { SalesPoint } from '@/interfaces/staff';

const SalesPoints = () => {
  const { toast } = useToast();
  const [salesPoints, setSalesPoints] = useState<SalesPoint[]>([
    {
      id: '1',
      name: 'Loja Central',
      address: 'Rua Principal, 123 - Centro',
      manager: 'João Silva',
      phone: '(11) 99999-9999',
      email: 'joao@lojacentral.com',
      commission: 10,
      compensationType: 'percentage',
      compensationValue: 8,
      status: 'active',
      totalSales: 25000,
      ticketsSold: 150,
      cardMachines: [
        {
          id: '1',
          serialNumber: 'MC123456',
          model: 'Moderninha Pro',
          responsiblePerson: 'João Silva',
          responsiblePhone: '(11) 99999-9999'
        }
      ],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Shopping Norte',
      address: 'Av. Norte, 456 - Shopping Norte',
      manager: 'Maria Santos',
      phone: '(11) 88888-8888',
      email: 'maria@shoppingnorte.com',
      commission: 8,
      compensationType: 'fixed',
      compensationValue: 500,
      status: 'active',
      totalSales: 18500,
      ticketsSold: 95,
      cardMachines: [
        {
          id: '2',
          serialNumber: 'MC789012',
          model: 'Point Pro',
          responsiblePerson: 'Maria Santos',
          responsiblePhone: '(11) 88888-8888'
        },
        {
          id: '3',
          serialNumber: 'MC345678',
          model: 'Moderninha Smart',
          responsiblePerson: 'Carlos Oliveira',
          responsiblePhone: '(11) 77777-7777'
        }
      ],
      createdAt: '2024-01-20'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdvModalOpen, setPdvModalOpen] = useState(false);
  const [editingPdv, setEditingPdv] = useState<SalesPoint | undefined>();

  const filteredSalesPoints = salesPoints.filter(point =>
    point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSalesPoint = () => {
    setEditingPdv(undefined);
    setPdvModalOpen(true);
  };

  const handleEditSalesPoint = (point: SalesPoint) => {
    setEditingPdv(point);
    setPdvModalOpen(true);
  };

  const handleDeleteSalesPoint = (pointId: string) => {
    if (confirm('Tem certeza que deseja remover este ponto de venda?')) {
      setSalesPoints(salesPoints.filter(point => point.id !== pointId));
      toast({
        title: 'Ponto de venda removido',
        description: 'Ponto de venda removido com sucesso.',
      });
    }
  };

  const getCompensationDisplay = (point: SalesPoint) => {
    switch (point.compensationType) {
      case 'percentage':
        return `${point.compensationValue}%`;
      case 'fixed':
        return `R$ ${point.compensationValue.toFixed(2)}`;
      case 'per_ticket':
        return `R$ ${point.compensationValue.toFixed(2)}/ingresso`;
      default:
        return `${point.compensationValue}%`;
    }
  };

  const totalSales = salesPoints.reduce((sum, point) => sum + point.totalSales, 0);
  const totalTickets = salesPoints.reduce((sum, point) => sum + point.ticketsSold, 0);
  const activePoints = salesPoints.filter(point => point.status === 'active').length;
  const totalMachines = salesPoints.reduce((sum, point) => sum + point.cardMachines.length, 0);

  return (
    <>
      <DashboardLayout userType="organizer">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Pontos de Venda</h1>
              <p className="text-gray-600 mt-1">Gerencie sua rede de pontos de venda</p>
            </div>
            <Button onClick={handleAddSalesPoint}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ponto de Venda
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pontos Ativos</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePoints}</div>
                <p className="text-xs text-muted-foreground">
                  de {salesPoints.length} pontos totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalSales.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTickets}</div>
                <p className="text-xs text-muted-foreground">
                  este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalTickets > 0 ? Math.round(totalSales / totalTickets) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  por ingresso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maquininhas</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMachines}</div>
                <p className="text-xs text-muted-foreground">
                  cadastradas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar pontos de venda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Sales Points Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pontos de Venda Cadastrados</CardTitle>
              <CardDescription>
                Lista de todos os pontos de venda autorizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Ponto</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Compensação</TableHead>
                    <TableHead>Maquininhas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalesPoints.map((point) => (
                    <TableRow key={point.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Store className="h-4 w-4 mr-2 text-gray-500" />
                          <div>
                            <div className="font-medium">{point.name}</div>
                            <div className="text-sm text-gray-500">ID: {point.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">{point.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{point.manager}</div>
                          <div className="text-sm text-gray-500">{point.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{point.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCompensationDisplay(point)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm">{point.cardMachines.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={point.status === 'active' ? 'default' : 'secondary'}>
                          {point.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>R$ {point.totalSales.toLocaleString('pt-BR')}</div>
                          <div className="text-gray-500">{point.ticketsSold} ingressos</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSalesPoint(point)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSalesPoint(point.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSalesPoints.length === 0 && (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum ponto de venda encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece adicionando seu primeiro ponto de venda autorizado.
                  </p>
                  <Button onClick={handleAddSalesPoint}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Ponto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

      <PDVModal
        open={pdvModalOpen}
        onOpenChange={setPdvModalOpen}
        pdv={editingPdv}
        onSuccess={() => {
          setPdvModalOpen(false);
          // Aqui você recarregaria os dados
        }}
      />
    </>
  );
};

export default SalesPoints;
