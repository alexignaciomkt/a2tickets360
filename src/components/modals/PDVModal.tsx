
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SalesPoint, CardMachine } from '@/interfaces/staff';

interface PDVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdv?: SalesPoint;
  onSuccess: () => void;
}

export const PDVModal = ({
  open,
  onOpenChange,
  pdv,
  onSuccess,
}: PDVModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    manager: '',
    phone: '',
    email: '',
    commission: 0,
    compensationType: 'percentage' as 'percentage' | 'fixed' | 'per_ticket',
    compensationValue: 0,
    status: 'active' as 'active' | 'inactive',
  });
  const [cardMachines, setCardMachines] = useState<Omit<CardMachine, 'id'>[]>([]);

  useEffect(() => {
    if (pdv) {
      setFormData({
        name: pdv.name,
        address: pdv.address,
        manager: pdv.manager,
        phone: pdv.phone,
        email: pdv.email,
        commission: pdv.commission,
        compensationType: pdv.compensationType,
        compensationValue: pdv.compensationValue,
        status: pdv.status,
      });
      setCardMachines(pdv.cardMachines.map(({ id, ...machine }) => machine));
    } else {
      setFormData({
        name: '',
        address: '',
        manager: '',
        phone: '',
        email: '',
        commission: 0,
        compensationType: 'percentage',
        compensationValue: 0,
        status: 'active',
      });
      setCardMachines([]);
    }
  }, [pdv, open]);

  const addCardMachine = () => {
    setCardMachines([...cardMachines, {
      serialNumber: '',
      model: '',
      responsiblePerson: '',
      responsiblePhone: '',
    }]);
  };

  const updateCardMachine = (index: number, field: keyof Omit<CardMachine, 'id'>, value: string) => {
    const updated = [...cardMachines];
    updated[index] = { ...updated[index], [field]: value };
    setCardMachines(updated);
  };

  const removeCardMachine = (index: number) => {
    setCardMachines(cardMachines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui você implementaria a lógica de salvar no service
      console.log('Salvando PDV:', { ...formData, cardMachines });
      
      toast({
        title: pdv ? 'PDV atualizado' : 'PDV criado',
        description: pdv 
          ? 'Ponto de venda atualizado com sucesso.' 
          : 'Ponto de venda criado com sucesso.',
      });

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

  const getCompensationLabel = () => {
    switch (formData.compensationType) {
      case 'percentage':
        return 'Porcentagem (%)';
      case 'fixed':
        return 'Valor Fixo (R$)';
      case 'per_ticket':
        return 'Por Ingresso (R$)';
      default:
        return 'Valor';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pdv ? 'Editar Ponto de Venda' : 'Novo Ponto de Venda'}
          </DialogTitle>
          <DialogDescription>
            {pdv 
              ? 'Edite as informações do ponto de venda.' 
              : 'Cadastre um novo ponto de venda autorizado.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do PDV</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do ponto de venda"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Responsável</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Nome do responsável"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
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
          </div>

          {/* Compensação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Compensação</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compensationType">Tipo de Compensação</Label>
                <Select
                  value={formData.compensationType}
                  onValueChange={(value: 'percentage' | 'fixed' | 'per_ticket') => 
                    setFormData({ ...formData, compensationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem</SelectItem>
                    <SelectItem value="fixed">Valor Fixo</SelectItem>
                    <SelectItem value="per_ticket">Por Ingresso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compensationValue">{getCompensationLabel()}</Label>
                <Input
                  id="compensationValue"
                  type="number"
                  step="0.01"
                  value={formData.compensationValue}
                  onChange={(e) => setFormData({ ...formData, compensationValue: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Maquininhas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Maquininhas de Cartão</h3>
              <Button type="button" variant="outline" size="sm" onClick={addCardMachine}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Maquininha
              </Button>
            </div>

            {cardMachines.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma maquininha cadastrada</p>
            ) : (
              <div className="space-y-4">
                {cardMachines.map((machine, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Maquininha {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCardMachine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Número de Série</Label>
                        <Input
                          value={machine.serialNumber}
                          onChange={(e) => updateCardMachine(index, 'serialNumber', e.target.value)}
                          placeholder="Número de série"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Input
                          value={machine.model}
                          onChange={(e) => updateCardMachine(index, 'model', e.target.value)}
                          placeholder="Modelo da maquininha"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável</Label>
                        <Input
                          value={machine.responsiblePerson}
                          onChange={(e) => updateCardMachine(index, 'responsiblePerson', e.target.value)}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone do Responsável</Label>
                        <Input
                          value={machine.responsiblePhone}
                          onChange={(e) => updateCardMachine(index, 'responsiblePhone', e.target.value)}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
            />
            <Label htmlFor="status">PDV ativo</Label>
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
              {loading ? 'Salvando...' : pdv ? 'Atualizar' : 'Criar PDV'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
