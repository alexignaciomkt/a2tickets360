import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Minus, Star } from 'lucide-react';
import { serviceCreditsService } from '@/services/serviceCreditsService';
import { useToast } from '@/hooks/use-toast';

interface FeaturedCreditsPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  originEventId?: string;
}

const CREDIT_PRICE = 49.90;

export const FeaturedCreditsPurchaseModal = ({ isOpen, onClose, onSuccess, originEventId }: FeaturedCreditsPurchaseModalProps) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleIncrease = () => {
    if (quantity < 100) setQuantity(q => q + 1);
  };

  const totalValue = quantity * CREDIT_PRICE;

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      const res = await serviceCreditsService.buyFeaturedCredits(quantity, originEventId);
      
      if (res.invoiceUrl) {
        window.open(res.invoiceUrl, '_blank');
        toast({
          title: 'Pedido Gerado',
          description: 'Sua cobrança foi gerada com sucesso. Conclua o pagamento para receber os créditos.',
        });
        onSuccess();
        onClose();
      } else {
        throw new Error('URL de pagamento não retornada.');
      }
    } catch (error: any) {
      console.error('Error purchasing credits:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na compra',
        description: error.response?.data?.error || error.message || 'Ocorreu um erro ao gerar o pedido.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black text-xl uppercase tracking-tight text-indigo-900">
            <Star className="w-6 h-6 text-indigo-600 fill-current" />
            Destaque seus Eventos
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 pt-2">
            Cada crédito dá direito a destacar um evento por um período de exibição. 
            Os créditos que você não utilizar agora permanecem disponíveis para outros eventos.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 space-y-6 mt-2">
          <div className="flex justify-between items-center border-b border-indigo-100/50 pb-4">
            <div>
              <p className="font-bold text-indigo-900">1 Crédito de Destaque</p>
              <p className="text-sm text-indigo-600/80 font-medium">R$ {CREDIT_PRICE.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Duração</p>
              <p className="text-xs font-bold text-indigo-700">Até 30 dias*</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block text-center">
              Selecione a Quantidade
            </label>
            
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={handleDecrease}
                disabled={quantity <= 1 || isProcessing}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-indigo-100 text-indigo-600 shadow-sm disabled:opacity-50 hover:bg-indigo-50 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="w-20 text-center">
                <span className="text-4xl font-black text-indigo-900">{quantity}</span>
              </div>

              <button 
                onClick={handleIncrease}
                disabled={quantity >= 100 || isProcessing}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-indigo-100 text-indigo-600 shadow-sm disabled:opacity-50 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm border border-indigo-50">
            <span className="font-bold text-slate-600">Total a pagar:</span>
            <span className="text-2xl font-black text-indigo-600">
              R$ {totalValue.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <p className="text-[10px] text-center text-slate-400 font-medium">
            *Os detalhes de duração serão exibidos no momento da ativação.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="rounded-xl font-bold">
            Cancelar
          </Button>
          <Button 
            onClick={handlePurchase} 
            disabled={isProcessing}
            className="rounded-xl font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
              </>
            ) : (
              `Comprar ${quantity} ${quantity === 1 ? 'Crédito' : 'Créditos'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
