
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { organizerService } from '@/services/organizerService';
import { SalesChannel } from '@/interfaces/organizer';

interface SalesChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  channel?: SalesChannel;
  onSuccess: () => void;
}

export const SalesChannelModal = ({
  open,
  onOpenChange,
  eventId,
  channel,
  onSuccess,
}: SalesChannelModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'online' as 'online' | 'physical' | 'partner',
    address: '',
    email: '',
    commission: 0,
    contactPerson: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (channel) {
      setFormData({
        name: channel.name,
        type: channel.type,
        address: channel.address || '',
        email: channel.email || '',
        commission: channel.commission,
        contactPerson: channel.contactPerson || '',
        phone: channel.phone || '',
        status: channel.status,
      });
    } else {
      setFormData({
        name: '',
        type: 'online',
        address: '',
        email: '',
        commission: 0,
        contactPerson: '',
        phone: '',
        status: 'active',
      });
    }
  }, [channel, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const channelData = {
        name: formData.name,
        type: formData.type,
        address: formData.address,
        email: formData.email,
        commission: formData.commission,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        status: formData.status,
      };

      if (channel) {
        await organizerService.updateSalesChannel(channel.id, channelData);
        toast({
          title: 'Ponto de venda atualizado',
          description: 'O ponto de venda foi atualizado com sucesso.',
        });
      } else {
        await organizerService.createSalesChannel(eventId, channelData);
        toast({
          title: 'Ponto de venda criado',
          description: 'O novo ponto de venda foi criado com sucesso.',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o ponto de venda.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {channel ? 'Editar Ponto de Venda' : 'Novo Ponto de Venda'}
          </DialogTitle>
          <DialogDescription>
            {channel 
              ? 'Edite as informações do ponto de venda.' 
              : 'Configure um novo ponto de venda para seu evento.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Ponto de Venda</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Loja Centro, Site Oficial..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'online' | 'physical' | 'partner') => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="physical">Físico</SelectItem>
                <SelectItem value="partner">Parceiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission">Comissão (%)</Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              value={formData.commission}
              onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {formData.type === 'physical' && (
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo do ponto de venda..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Pessoa de Contato</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Nome do responsável..."
            />
          </div>

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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contato@exemplo.com"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
            />
            <Label htmlFor="status">Ponto de venda ativo</Label>
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
              {loading ? 'Salvando...' : channel ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
