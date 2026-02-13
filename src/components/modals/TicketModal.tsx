
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
import { Ticket } from '@/interfaces/organizer';

interface TicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  ticket?: Ticket;
  onSuccess: () => void;
}

export const TicketModal = ({
  open,
  onOpenChange,
  eventId,
  ticket,
  onSuccess,
}: TicketModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    batch: '1º Lote',
    salesStart: '',
    salesEnd: '',
    category: 'standard' as 'standard' | 'vip' | 'early-bird' | 'student' | 'group',
    isActive: true,
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        name: ticket.name,
        description: ticket.description || '',
        price: ticket.price,
        quantity: ticket.quantity,
        batch: ticket.batch,
        salesStart: ticket.salesStart || '',
        salesEnd: ticket.salesEnd || '',
        category: ticket.category,
        isActive: ticket.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        batch: '1º Lote',
        salesStart: '',
        salesEnd: '',
        category: 'standard',
        isActive: true,
      });
    }
  }, [ticket, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ticketData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        quantity: formData.quantity,
        batch: formData.batch,
        salesStart: formData.salesStart,
        salesEnd: formData.salesEnd,
        category: formData.category,
        remaining: formData.quantity,
        isActive: formData.isActive,
      };

      if (ticket) {
        await organizerService.updateTicket(ticket.id, ticketData);
        toast({
          title: 'Ingresso atualizado',
          description: 'O ingresso foi atualizado com sucesso.',
        });
      } else {
        await organizerService.createTicket(eventId, ticketData);
        toast({
          title: 'Ingresso criado',
          description: 'O novo ingresso foi criado com sucesso.',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o ingresso.',
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
            {ticket ? 'Editar Ingresso' : 'Novo Ingresso'}
          </DialogTitle>
          <DialogDescription>
            {ticket 
              ? 'Edite as informações do ingresso.' 
              : 'Configure um novo tipo de ingresso para seu evento.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Ingresso</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Pista, Camarote, VIP..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o que está incluído neste ingresso..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value: 'standard' | 'vip' | 'early-bird' | 'student' | 'group') => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Padrão</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="early-bird">Promoção</SelectItem>
                <SelectItem value="student">Estudante</SelectItem>
                <SelectItem value="group">Grupo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Lote</Label>
            <Input
              id="batch"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              placeholder="Ex: 1º Lote, 2º Lote..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesStart">Início das Vendas</Label>
              <Input
                id="salesStart"
                type="datetime-local"
                value={formData.salesStart}
                onChange={(e) => setFormData({ ...formData, salesStart: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesEnd">Fim das Vendas</Label>
              <Input
                id="salesEnd"
                type="datetime-local"
                value={formData.salesEnd}
                onChange={(e) => setFormData({ ...formData, salesEnd: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Ingresso ativo</Label>
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
              {loading ? 'Salvando...' : ticket ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
