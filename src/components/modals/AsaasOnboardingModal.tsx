import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Landmark } from 'lucide-react';
import { organizerService } from '@/services/organizerService';

interface AsaasOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerId: string;
  onSuccess: (updatedProfile: any) => void;
}

export const AsaasOnboardingModal = ({ open, onOpenChange, organizerId, onSuccess }: AsaasOnboardingModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cpfCnpj: '',
    mobilePhone: '',
    postalCode: '',
    address: '',
    addressNumber: '',
    province: '', // Bairro
    incomeValue: '5000',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/organizers/${organizerId}/asaas-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao ativar conta Asaas');
      }

      const updatedProfile = await response.json();
      onSuccess(updatedProfile);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erro ao ativar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-blue-600" />
            Ativar Conta de Recebimentos
          </DialogTitle>
          <DialogDescription>
            Para receber os valores dos ingressos diretamente, precisamos criar sua subconta integrada (Asaas). Preencha seus dados reais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">CPF ou CNPJ (Apenas números)</label>
              <Input
                name="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Celular com DDD</label>
              <Input
                name="mobilePhone"
                value={formData.mobilePhone}
                onChange={handleChange}
                placeholder="(00) 90000-0000"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">CEP</label>
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="00000-000"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Endereço (Rua/Avenida)</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Av. Paulista"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Número</label>
              <Input
                name="addressNumber"
                value={formData.addressNumber}
                onChange={handleChange}
                placeholder="1000"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Bairro</label>
              <Input
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Bela Vista"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            disabled={loading}
          >
            {loading ? 'Ativando Conta...' : 'Criar Conta de Recebimentos'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
