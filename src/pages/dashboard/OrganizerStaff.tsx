
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Mail, Phone, UserCheck, UserX, Clock, DollarSign, KeyRound, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { portariaService } from '@/services/portariaService';
import { StaffMember } from '@/interfaces/staff';
import { useAuth } from '@/contexts/AuthContext';

const OrganizerStaff = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Gestão de Múltiplos Turnos
  const [shiftsModalOpen, setShiftsModalOpen] = useState(false);
  const [currentStaffForShifts, setCurrentStaffForShifts] = useState<StaffMember | null>(null);
  const [shiftsList, setShiftsList] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    shiftDate: '',
    startTime: '08:00',
    endTime: '18:00',
    breakDurationMinutes: 60
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const organizerId = user.id;
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

  // Handlers de Turnos (event_staff_shifts)
  const handleOpenShifts = async (staffMember: StaffMember) => {
    setCurrentStaffForShifts(staffMember);
    setShiftsModalOpen(true);
    setIsAddingShift(false);
    setEditingShiftId(null);
    try {
      setShiftsLoading(true);
      const data = await staffService.getEventStaffShifts(staffMember.id);
      setShiftsList(data || []);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os turnos.' });
    } finally {
      setShiftsLoading(false);
    }
  };

  const handleStartAddShift = () => {
    setEditingShiftId(null);
    const defDate = currentStaffForShifts?.shifts?.[0]?.shiftDate || new Date().toISOString().split('T')[0];
    setShiftForm({
      shiftDate: defDate,
      startTime: '08:00',
      endTime: '18:00',
      breakDurationMinutes: 60
    });
    setIsAddingShift(true);
  };

  const handleStartEditShift = (sh: any) => {
    setEditingShiftId(sh.id);
    setShiftForm({
      shiftDate: sh.shiftDate ? (sh.shiftDate.includes('T') ? sh.shiftDate.split('T')[0] : sh.shiftDate) : '',
      startTime: sh.startTime || '08:00',
      endTime: sh.endTime || '18:00',
      breakDurationMinutes: sh.breakDurationMinutes || 0
    });
    setIsAddingShift(true);
  };

  const handleSaveShift = async () => {
    if (!currentStaffForShifts) return;
    if (!shiftForm.shiftDate || !shiftForm.startTime || !shiftForm.endTime) {
      return toast({ variant: 'destructive', title: 'Erro', description: 'Preencha a data, início e fim do turno.' });
    }

    try {
      if (editingShiftId) {
        await staffService.updateEventStaffShift(currentStaffForShifts.id, editingShiftId, {
          shiftDate: shiftForm.shiftDate,
          startTime: shiftForm.startTime,
          endTime: shiftForm.endTime,
          breakDurationMinutes: Number(shiftForm.breakDurationMinutes) || 0
        });
        toast({ title: 'Sucesso', description: 'Turno atualizado com sucesso!' });
      } else {
        await staffService.createEventStaffShift(currentStaffForShifts.id, {
          shiftDate: shiftForm.shiftDate,
          startTime: shiftForm.startTime,
          endTime: shiftForm.endTime,
          breakDurationMinutes: Number(shiftForm.breakDurationMinutes) || 0
        });
        toast({ title: 'Sucesso', description: 'Turno adicionado com sucesso!' });
      }

      setIsAddingShift(false);
      setEditingShiftId(null);
      const data = await staffService.getEventStaffShifts(currentStaffForShifts.id);
      setShiftsList(data || []);
      await loadData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.response?.data?.error || 'Erro ao salvar turno.' });
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!currentStaffForShifts) return;
    if (!confirm('Deseja realmente remover este turno? O membro e seus acessos continuarão intactos.')) return;

    try {
      await staffService.deleteEventStaffShift(currentStaffForShifts.id, shiftId);
      toast({ title: 'Sucesso', description: 'Turno excluído com sucesso.' });
      const data = await staffService.getEventStaffShifts(currentStaffForShifts.id);
      setShiftsList(data || []);
      await loadData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.response?.data?.error || 'Erro ao excluir turno.' });
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

  const handleSendAccess = async (staffMember: StaffMember) => {
    try {
      await staffService.sendAccess(staffMember.id);
      toast({
        title: 'Sucesso',
        description: `Acesso enviado para o e-mail cadastrado.`,
      });
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Não foi possível enviar o acesso.';
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: msg,
      });
    }
  };

  const handleSendRecovery = async (staffMember: StaffMember) => {
    try {
      await staffService.sendRecovery(staffMember.id);
      toast({
        title: 'Sucesso',
        description: `Link de recuperação enviado para o e-mail cadastrado.`,
      });
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Não foi possível enviar a recuperação.';
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: msg,
      });
    }
  };

  const filteredStaff = staff.filter(s => {
    const term = searchTerm.toLowerCase();
    const safeName = (s.name ?? '').toLowerCase();
    const safeEmail = (s.email ?? '').toLowerCase();
    const safeFunction = (s.eventFunction ?? '').toLowerCase();

    const matchesSearch = safeName.includes(term) || safeEmail.includes(term) || safeFunction.includes(term);
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
                      <div className="font-medium">{staffMember.name || '-'}</div>
                      <div className="text-sm text-gray-500">{staffMember.email || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{staffMember.eventFunction || '-'}</div>
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
                      {staffMember.shifts && staffMember.shifts.length > 0 ? (
                        <div className="space-y-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs font-semibold flex items-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
                            onClick={() => handleOpenShifts(staffMember)}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{staffMember.shifts.length} {staffMember.shifts.length === 1 ? 'Turno' : 'Turnos'}</span>
                          </Button>
                          <div className="text-[11px] text-gray-500">
                            {staffMember.shifts[0].startTime} → {staffMember.shifts[0].endTime}
                          </div>
                        </div>
                      ) : staffMember.shiftStart ? (
                        <div className="flex items-center text-sm">
                          <Clock className="w-3 h-3 mr-1 text-gray-500" />
                          {new Date(staffMember.shiftStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
                          {' - '} 
                          {staffMember.shiftEnd ? new Date(staffMember.shiftEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '?'}
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-gray-400 hover:text-gray-700"
                          onClick={() => handleOpenShifts(staffMember)}
                        >
                          + Definir turnos
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {events.find(e => e.id === staffMember.eventId)?.title || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        switch (staffMember.status) {
                          case 'PENDING_PROFILE':
                            return <Badge variant="secondary">Cadastro incompleto</Badge>;
                          case 'PENDING_ACCEPTANCE':
                            return <Badge variant="outline" className="text-yellow-600 border-yellow-400">Aguardando aceite</Badge>;
                          case 'ACTIVE':
                            return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Ativo</Badge>;
                          case 'DECLINED':
                            return <Badge variant="destructive">Recusado</Badge>;
                          case 'CANCELLED':
                            return <Badge variant="secondary">Cancelado</Badge>;
                          case 'COMPLETED':
                            return <Badge variant="outline">Concluído</Badge>;
                          default:
                            return <Badge variant="secondary">{staffMember.isActive ? 'Ativo' : 'Inativo'}</Badge>;
                        }
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenShifts(staffMember)}
                          title="Gerenciar Turnos"
                        >
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStaff(staffMember)}
                          title="Editar Membro"
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
                        {(staffMember.status === 'PENDING_PROFILE' || staffMember.status === 'PENDING_ACCEPTANCE') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendAccess(staffMember)}
                            title="Enviar Acesso"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {(staffMember.status === 'ACTIVE' || staffMember.status === 'COMPLETED') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendRecovery(staffMember)}
                            title="Recuperar Acesso"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStaff(staffMember.id)}
                          title="Remover Membro"
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

      {/* MODAL: GERENCIAMENTO DE MÚLTIPLOS TURNOS */}
      <Dialog open={shiftsModalOpen} onOpenChange={setShiftsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Turnos da Escala: {currentStaffForShifts?.name || 'Membro do Staff'}</DialogTitle>
            <DialogDescription>
              {events.find(e => e.id === currentStaffForShifts?.eventId)?.title
                ? `Evento: ${events.find(e => e.id === currentStaffForShifts?.eventId)?.title}`
                : 'Gerencie a escala e múltiplos turnos deste membro.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Turnos Cadastrados ({shiftsList.length})
              </h4>
              {!isAddingShift && (
                <Button size="sm" onClick={handleStartAddShift} className="h-8 text-xs font-bold bg-primary text-white">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Adicionar Turno
                </Button>
              )}
            </div>

            {/* FORMULÁRIO DE ADICIONAR / EDITAR TURNO */}
            {isAddingShift && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 uppercase">
                    {editingShiftId ? 'Editar Turno' : 'Novo Turno'}
                  </h5>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500" onClick={() => { setIsAddingShift(false); setEditingShiftId(null); }}>
                    Cancelar
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="shift-form-date" className="text-xs">Data do Turno *</Label>
                  <Input
                    id="shift-form-date"
                    type="date"
                    value={shiftForm.shiftDate}
                    onChange={(e) => setShiftForm({ ...shiftForm, shiftDate: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="shift-form-start" className="text-xs">Início *</Label>
                    <Input
                      id="shift-form-start"
                      type="time"
                      value={shiftForm.startTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shift-form-end" className="text-xs">Fim *</Label>
                    <Input
                      id="shift-form-end"
                      type="time"
                      value={shiftForm.endTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shift-form-break" className="text-xs">Pausa (min)</Label>
                    <Input
                      id="shift-form-break"
                      type="number"
                      min={0}
                      step={10}
                      value={shiftForm.breakDurationMinutes}
                      onChange={(e) => setShiftForm({ ...shiftForm, breakDurationMinutes: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => { setIsAddingShift(false); setEditingShiftId(null); }}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveShift} className="bg-primary text-white font-bold">
                    {editingShiftId ? 'Salvar Turno' : 'Adicionar Turno'}
                  </Button>
                </div>
              </div>
            )}

            {/* LISTAGEM DOS TURNOS */}
            {shiftsLoading ? (
              <div className="text-center py-6 text-sm text-gray-500">Carregando turnos...</div>
            ) : shiftsList.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500 bg-slate-50 rounded-xl border border-dashed">
                Nenhum turno cadastrado para este membro.
              </div>
            ) : (
              <div className="space-y-2">
                {shiftsList.map((sh) => {
                  const formatDate = (dateStr?: string) => {
                    if (!dateStr) return '';
                    const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
                    const parts = clean.split('-').map(Number);
                    if (parts.length !== 3) return dateStr;
                    const [y, m, d] = parts;
                    return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
                  };

                  return (
                    <div key={sh.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-sm text-slate-900">{formatDate(sh.shiftDate)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {sh.startTime} → {sh.endTime}
                          </span>
                          {sh.breakDurationMinutes > 0 && (
                            <span className="text-gray-500">Pausa: {sh.breakDurationMinutes} min</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                          onClick={() => handleStartEditShift(sh)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                          onClick={() => handleDeleteShift(sh.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftsModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrganizerStaff;
