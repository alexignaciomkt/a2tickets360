
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Mail, Phone, UserCheck, UserX, Clock, DollarSign } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { StaffModal } from '@/components/modals/StaffModal';
import { staffService } from '@/services/staffService';
import { organizerService } from '@/services/organizerService';
import { StaffMember } from '@/interfaces/staff';

const OrganizerStaff = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const organizerId = '1'; // Mock organizer ID
      const [eventsData, staffData] = await Promise.all([
        organizerService.getEvents(organizerId),
        staffService.getEventStaff('all')
      ]);
      setEvents(eventsData);
      setStaff(staffData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do staff.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = () => {
    setEditingStaff(undefined);
    setStaffModalOpen(true);
  };

  const handleEditStaff = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setStaffModalOpen(true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm('Tem certeza que deseja remover este membro do staff?')) {
      try {
        await staffService.deleteStaffMember(staffId);
        setStaff(staff.filter(s => s.id !== staffId));
        toast({
          title: 'Staff removido',
          description: 'Membro do staff removido com sucesso.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao remover staff',
          description: 'Não foi possível remover o membro do staff.',
        });
      }
    }
  };

  const handleToggleActive = async (staffMember: StaffMember) => {
    try {
      await staffService.updateStaffMember(staffMember.id, {
        isActive: !staffMember.isActive
      });
      setStaff(staff.map(s =>
        s.id === staffMember.id
          ? { ...s, isActive: !s.isActive }
          : s
      ));
      toast({
        title: staffMember.isActive ? 'Staff desativado' : 'Staff ativado',
        description: `${staffMember.name} foi ${staffMember.isActive ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar staff',
        description: 'Não foi possível atualizar o status do staff.',
      });
    }
  };

  const handleSendCredentials = async (staffMember: StaffMember) => {
    try {
      const temporaryPassword = Math.random().toString(36).slice(-8);
      await staffService.sendStaffCredentials(staffMember, temporaryPassword);
      toast({
        title: 'Credenciais enviadas',
        description: `Credenciais de acesso enviadas para ${staffMember.email}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar credenciais',
        description: 'Não foi possível enviar as credenciais.',
      });
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === 'all' || s.eventId === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleBadge = (role: 'supervisor' | 'operator') => {
    return (
      <Badge variant={role === 'supervisor' ? 'default' : 'secondary'}>
        {role === 'supervisor' ? 'Supervisor' : 'Operador'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando staff...</p>
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
            <div>
              <h1 className="text-3xl font-bold">Gestão de Staff</h1>
              <p className="text-gray-600 mt-1">Gerencie sua equipe para eventos</p>
            </div>
            <Button onClick={handleCreateStaff}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Staff
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-md">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os eventos</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total de Staff</p>
                  <h3 className="text-2xl font-bold">{staff.length}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Ativos</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    {staff.filter(s => s.isActive).length}
                  </h3>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Supervisores</p>
                  <h3 className="text-2xl font-bold">
                    {staff.filter(s => s.role === 'supervisor').length}
                  </h3>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Operadores</p>
                  <h3 className="text-2xl font-bold">
                    {staff.filter(s => s.role === 'operator').length}
                  </h3>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Membros da Equipe</h2>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Expediente</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell>
                      <div className="font-medium">{staffMember.name}</div>
                      <div className="text-sm text-gray-500">{staffMember.email}</div>
                    </TableCell>
                    <TableCell>
                      {staffMember.customRole ? (
                        <div className="flex flex-col gap-1">
                          <Badge
                            style={{ backgroundColor: staffMember.customRole.color }}
                            className="w-fit text-white hover:opacity-90"
                          >
                            {staffMember.customRole.name}
                          </Badge>
                          <span className="text-xs text-gray-500">{staffMember.eventFunction}</span>
                        </div>
                      ) : (
                        getRoleBadge(staffMember.role || 'operator')
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {staffMember.contractType === 'volunteer' && (
                          <Badge variant="outline" className="border-green-500 text-green-700">Voluntário</Badge>
                        )}
                        {staffMember.contractType === 'clt' && <Badge variant="outline">CLT</Badge>}
                        {staffMember.contractType === 'daily' && <Badge variant="secondary">Diária</Badge>}

                        {staffMember.contractType !== 'volunteer' && staffMember.paymentValue && (
                          <div className="flex items-center text-gray-600 mt-1">
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span>
                              R$ {staffMember.paymentValue}
                              {staffMember.paymentType === 'hourly' ? '/h' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {staffMember.shiftStart ? (
                        <div className="flex items-center text-sm">
                          <Clock className="w-3 h-3 mr-1 text-gray-500" />
                          {staffMember.shiftStart} - {staffMember.shiftEnd}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {events.find(e => e.id === staffMember.eventId)?.title || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={staffMember.isActive ? 'default' : 'secondary'}>
                        {staffMember.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staffMember.lastLogin ? formatDate(staffMember.lastLogin) : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStaff(staffMember)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(staffMember)}
                        >
                          {staffMember.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendCredentials(staffMember)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStaff(staffMember.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredStaff.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum staff encontrado</h3>
                <p className="text-gray-500 mb-4">Adicione membros à sua equipe para gerenciar eventos.</p>
                <Button onClick={handleCreateStaff}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Staff
                </Button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>

      <StaffModal
        open={staffModalOpen}
        onOpenChange={setStaffModalOpen}
        staff={editingStaff}
        events={events}
        onSuccess={() => {
          setStaffModalOpen(false);
          loadData();
        }}
      />
    </>
  );
};

export default OrganizerStaff;
