import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { staffService } from '@/services/staffService';
import { StaffMember, StaffRole } from '@/interfaces/staff';

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: any[];
  staff?: StaffMember;
  onSuccess: () => void;
  initialData?: Partial<StaffMember>; // Added initialData prop
}

export const StaffModal = ({
  open,
  onOpenChange,
  events,
  staff,
  onSuccess,
  initialData
}: StaffModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventId: '',
    roleId: '',
    eventFunction: '',
    isActive: true,
    sendCredentials: true,
    // Phase 2 fields
    contractType: 'daily',
    paymentValue: 0,
    paymentType: 'fixed',
    shiftStart: '',
    shiftEnd: '',
    breakDuration: 60
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await staffService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles');
    }
  };

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone || '',
        eventId: staff.eventId,
        roleId: staff.roleId || '',
        eventFunction: staff.eventFunction || '',
        isActive: staff.isActive,
        sendCredentials: staff.sendCredentials,
        contractType: staff.contractType || 'daily',
        paymentValue: staff.paymentValue || 0,
        paymentType: staff.paymentType || 'fixed',
        shiftStart: staff.shiftStart || '',
        shiftEnd: staff.shiftEnd || '',
        breakDuration: staff.breakDuration || 60
      });
    } else {

      setFormData({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        eventId: events.length > 0 ? events[0].id : '',
        roleId: initialData?.roleId || (roles.length > 0 ? roles[0].id : ''),
        eventFunction: '',
        isActive: true,
        sendCredentials: true,
        contractType: 'daily',
        paymentValue: 0,
        paymentType: 'fixed',
        shiftStart: '',
        shiftEnd: '',
        breakDuration: 60
      });
    }
  }, [staff, open, events, roles, initialData]);

  const generateTemporaryPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Encontrar o role selecionado para pegar o nome legacy (opcional)
      const selectedRole = roles.find(r => r.id === formData.roleId);
      const legacyRole = selectedRole?.name.toLowerCase().includes('admin') || selectedRole?.name.toLowerCase().includes('gerente')
        ? 'supervisor'
        : 'operator';

      const dataToSave = {
        ...formData,
        role: legacyRole as 'supervisor' | 'operator' // Maintain legacy field
      };

      if (staff) {
        await staffService.updateStaffMember(staff.id, dataToSave);
        toast({
          title: 'Staff atualizado',
          description: 'As informações do membro da equipe foram atualizadas.',
        });
      } else {
        const newStaff = await staffService.createStaffMember(formData.eventId, dataToSave);

        if (formData.sendCredentials) {
          const temporaryPassword = generateTemporaryPassword();
          await staffService.sendStaffCredentials(newStaff, temporaryPassword);

          toast({
            title: 'Membro da equipe criado',
            description: `Credenciais enviadas para ${formData.email}`,
          });
        } else {
          toast({
            title: 'Membro da equipe criado',
            description: 'Membro criado sem envio de credenciais.',
          });
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as informações.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {staff ? 'Editar Membro da Equipe' : 'Novo Membro da Equipe'}
          </DialogTitle>
          <DialogDescription>
            {staff
              ? 'Edite as informações do membro da equipe.'
              : 'Adicione um novo membro, defina cargo e dados de contratação.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="general">Dados Gerais</TabsTrigger>
              <TabsTrigger value="contract">Contratação & Escala</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do membro da equipe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event">Evento</Label>
                  <Select
                    value={formData.eventId}
                    onValueChange={(value) => setFormData({ ...formData, eventId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo / Permissão</Label>
                  <Select
                    value={formData.roleId}
                    onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: role.color }}
                            />
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    O nível de acesso ao sistema (App, Painel, etc).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventFunction">Função Operacional</Label>
                  <Input
                    id="eventFunction"
                    value={formData.eventFunction}
                    onChange={(e) => setFormData({ ...formData, eventFunction: e.target.value })}
                    placeholder="Ex: Segurança Portão A, Barman Principal..."
                    required
                  />
                  <p className="text-xs text-gray-500">
                    A função que ele irá desempenhar na prática durante o evento.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contract" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select
                    value={formData.contractType}
                    onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária (Freelancer)</SelectItem>
                      <SelectItem value="clt">CLT (Fixo)</SelectItem>
                      <SelectItem value="volunteer">Voluntário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.contractType !== 'volunteer' && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentValue">Valor (R$)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                        <Input
                          id="paymentValue"
                          type="number"
                          className="pl-8"
                          value={formData.paymentValue}
                          onChange={(e) => setFormData({ ...formData, paymentValue: Number(e.target.value) })}
                        />
                      </div>
                      <Select
                        value={formData.paymentType}
                        onValueChange={(value: any) => setFormData({ ...formData, paymentType: value })}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixo</SelectItem>
                          <SelectItem value="hourly">/ Hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-medium text-sm text-gray-900">Escala de Trabalho</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="shiftStart" className="text-xs">Início</Label>
                    <Input
                      id="shiftStart"
                      type="time"
                      value={formData.shiftStart}
                      onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shiftEnd" className="text-xs">Fim</Label>
                    <Input
                      id="shiftEnd"
                      type="time"
                      value={formData.shiftEnd}
                      onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="breakDuration" className="text-xs">Pausa (min)</Label>
                    <Input
                      id="breakDuration"
                      type="number"
                      placeholder="60"
                      value={formData.breakDuration}
                      onChange={(e) => setFormData({ ...formData, breakDuration: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h4 className="font-bold text-blue-900 text-sm mb-2">Resumo da Contratação</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• {formData.contractType === 'volunteer' ? 'Voluntário (Sem remuneração)' : `Receberá R$ ${formData.paymentValue} ${formData.paymentType === 'hourly' ? 'por hora' : 'fixo'}`}</p>
                  {formData.shiftStart && formData.shiftEnd && (
                    <p>• Horário: das {formData.shiftStart} às {formData.shiftEnd}</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>


          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Membro ativo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendCredentials"
                checked={formData.sendCredentials}
                onCheckedChange={(checked) => setFormData({ ...formData, sendCredentials: !!checked })}
              />
              <Label htmlFor="sendCredentials" className="text-sm">
                Enviar credenciais de acesso por email
              </Label>
            </div>
          </div>

          {!staff && !formData.sendCredentials && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> As credenciais não serão enviadas.
                Você precisará informar manualmente os dados de acesso ao membro da equipe.
              </p>
            </div>
          )}

          {!staff && formData.sendCredentials && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Após criar o membro da equipe,
                as credenciais de acesso serão enviadas automaticamente por email.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : staff ? 'Atualizar' : 'Criar Membro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
