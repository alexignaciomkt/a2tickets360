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
import {
  Menu,
  X,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { staffService } from '@/services/staffService';
import { StaffMember } from '@/interfaces/staff';

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
  const [isCreatingFunction, setIsCreatingFunction] = useState(false);
  const [newFunctionName, setNewFunctionName] = useState('');
  const [newFunctionDefaultRole, setNewFunctionDefaultRole] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventId: '',
    systemRoleIds: [] as string[],
    staffFunctionId: '',
    isActive: true,
    // Phase 2 fields
    contractType: 'daily' as 'daily' | 'clt' | 'freelance' | 'volunteer',
    paymentValue: 0,
    paymentType: 'fixed' as 'fixed' | 'hourly',
    shiftDate: '',
    shiftStart: '',
    shiftEnd: '',
    breakDuration: 60,
    photoUrl: ''
  });

  const [previews, setPreviews] = useState({
    photo: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews({ photo: url });
      setFormData(prev => ({ ...prev, photoUrl: url }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesData, funcsData] = await Promise.all([
        staffService.getRoles(),
        staffService.getFunctions()
      ]);
      setRoles(rolesData);
      setFunctions(funcsData);
    } catch (error: any) {
      console.error('Failed to load roles and functions');
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação / Conexão',
        description: error.message || 'Não foi possível carregar os acessos do sistema.',
      });
    }
  };

  useEffect(() => {
    if (staff) {
      let dateStr = '';
      let startStr = staff.shiftStart || '';
      let endStr = staff.shiftEnd || '';

      if (staff.shiftStart && staff.shiftStart.includes('T')) {
         dateStr = staff.shiftStart.split('T')[0];
         startStr = staff.shiftStart.split('T')[1].substring(0, 5);
      }
      if (staff.shiftEnd && staff.shiftEnd.includes('T')) {
         endStr = staff.shiftEnd.split('T')[1].substring(0, 5);
      } else if (staff.shiftEnd && !staff.shiftEnd.includes('T')) {
         endStr = staff.shiftEnd;
      }

      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone || '',
        eventId: staff.eventId,
        systemRoleIds: staff.systemRoleIds || [],
        staffFunctionId: staff.staffFunctionId || '',
        isActive: staff.isActive,
        contractType: staff.contractType || 'daily',
        paymentValue: staff.paymentValue || 0,
        paymentType: staff.paymentType || 'fixed',
        shiftDate: dateStr,
        shiftStart: startStr,
        shiftEnd: endStr,
        breakDuration: staff.breakDuration || 60,
        photoUrl: staff.photoUrl || ''
      });
      setPreviews({ photo: staff.photoUrl || '' });
    } else {

      setFormData({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        eventId: events.length > 0 ? events[0].id : '',
        systemRoleIds: initialData?.systemRoleIds || [],
        staffFunctionId: initialData?.staffFunctionId || '',
        isActive: true,
        contractType: 'daily',
        paymentValue: 0,
        paymentType: 'fixed',
        shiftDate: '',
        shiftStart: '',
        shiftEnd: '',
        breakDuration: 60,
        photoUrl: ''
      });
      setPreviews({ photo: '' });
    }
  }, [staff, open, events, roles, initialData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let functionIdToUse = formData.staffFunctionId;

      if (isCreatingFunction && newFunctionName.trim()) {
        const roleIdToSend = (newFunctionDefaultRole === 'none' || !newFunctionDefaultRole) ? undefined : newFunctionDefaultRole;
        
        const newFunc = await staffService.createFunction({
          name: newFunctionName,
          defaultSystemRoleId: roleIdToSend
        });
        
        // Update local list
        setFunctions(prev => [...prev, newFunc]);
        functionIdToUse = newFunc.id;

        // Auto-assign default role if not already in systemRoleIds
        if (roleIdToSend && !formData.systemRoleIds.includes(roleIdToSend)) {
          formData.systemRoleIds.push(roleIdToSend);
        }
      }

      if (!functionIdToUse) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione ou crie uma Função no evento.' });
        setLoading(false);
        return;
      }

      let finalStartDate = null;
      let finalEndDate = null;

      if (formData.shiftDate && formData.shiftStart && formData.shiftEnd) {
        let startStr = `${formData.shiftDate}T${formData.shiftStart}:00`;
        let endStr = `${formData.shiftDate}T${formData.shiftEnd}:00`;

        if (formData.shiftEnd < formData.shiftStart) {
          const [year, month, day] = formData.shiftDate.split('-').map(Number);
          const d = new Date(Date.UTC(year, month - 1, day));
          d.setUTCDate(d.getUTCDate() + 1);
          const nextDay = d.toISOString().split('T')[0];
          endStr = `${nextDay}T${formData.shiftEnd}:00`;
        }

        finalStartDate = startStr + 'Z';
        finalEndDate = endStr + 'Z';
      }

      const dataToSave = {
        ...formData,
        staffFunctionId: functionIdToUse,
        shiftStart: finalStartDate,
        shiftEnd: finalEndDate
      } as any;

      if (staff) {
        await staffService.updateStaffMember(staff.id, dataToSave);
        toast({
          title: 'Staff atualizado',
          description: 'As informações do membro da equipe foram atualizadas.',
        });
      } else {
        await staffService.createStaffMember(formData.eventId, dataToSave);
        toast({
          title: 'Membro da equipe criado',
          description: `Membro criado e acesso enviado por email.`,
        });
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
              : 'Adicione um novo membro, defina sua função e dados de contratação.'
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
              <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-200 mb-4 transition-all">
                {previews.photo ? (
                  <div className="w-24 h-24">
                    <img src={previews.photo} alt="Foto do Membro" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-300">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sem Foto</span>
                  </div>
                )}
              </div>

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
                    disabled={!!staff}
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
                <div className="space-y-2 bg-gray-50 p-4 rounded-md border">
                  <Label htmlFor="staffFunction">Função no evento</Label>
                  
                  {!isCreatingFunction ? (
                    <>
                      <Select
                        value={formData.staffFunctionId}
                        onValueChange={(value) => {
                          const selectedFunc = functions.find(f => f.id === value);
                          const newSystemRoleIds = [...formData.systemRoleIds];
                          
                          if (selectedFunc?.defaultSystemRoleId && !newSystemRoleIds.includes(selectedFunc.defaultSystemRoleId)) {
                            newSystemRoleIds.push(selectedFunc.defaultSystemRoleId);
                          }
                          
                          setFormData({ ...formData, staffFunctionId: value, systemRoleIds: newSystemRoleIds });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          {functions.length === 0 && (
                            <div className="p-2 text-sm text-gray-500 italic">Nenhuma função cadastrada</div>
                          )}
                          {functions.map((func) => (
                            <SelectItem key={func.id} value={func.id}>
                              {func.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                          A função que ele irá desempenhar na prática durante o evento.
                        </p>
                        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setIsCreatingFunction(true)}>
                          + Criar nova função
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3 p-3 bg-white border border-blue-100 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-blue-700 font-semibold">Criar Nova Função</Label>
                        <Button type="button" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsCreatingFunction(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Nome da função</Label>
                        <Input 
                          placeholder="Ex: Segurança Portaria" 
                          value={newFunctionName}
                          onChange={(e) => setNewFunctionName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Acesso sugerido (opcional)</Label>
                        <Select
                          value={newFunctionDefaultRole}
                          onValueChange={setNewFunctionDefaultRole}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Nenhum acesso automático" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum acesso automático</SelectItem>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.displayName || role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Acessos no sistema</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 bg-white p-3 rounded-md border">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`role-${role.id}`}
                          checked={formData.systemRoleIds.includes(role.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, systemRoleIds: [...formData.systemRoleIds, role.id] });
                            } else {
                              setFormData({ ...formData, systemRoleIds: formData.systemRoleIds.filter(id => id !== role.id) });
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer">
                          {role.displayName || role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Define o nível de permissão do usuário no painel e aplicativo.
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
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="shiftDate" className="text-xs">Data do Turno</Label>
                    <Input
                      id="shiftDate"
                      type="date"
                      value={formData.shiftDate}
                      onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                    />
                  </div>
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
                  {formData.shiftDate && <p>• Data: {formData.shiftDate.split('-').reverse().join('/')}</p>}
                  {formData.shiftStart && formData.shiftEnd && (
                    <p>• Horário: {formData.shiftStart} às {formData.shiftEnd}</p>
                  )}
                  {formData.breakDuration > 0 && <p>• Pausa: {formData.breakDuration} minutos</p>}
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
          </div>

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
