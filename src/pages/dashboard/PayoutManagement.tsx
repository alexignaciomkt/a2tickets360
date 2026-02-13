
import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Check, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { financialService } from '@/services/financialService';
import { PayoutRequest } from '@/interfaces/financial';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const statusBadgeStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800"
};

const PayoutManagement = () => {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true);
        const data = await financialService.getPayoutRequests();
        setPayouts(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar solicitações de pagamento:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as solicitações de pagamento.',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };
    
    fetchPayouts();
  }, [toast]);
  
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
  };
  
  const filteredPayouts = filterStatus === 'all' 
    ? payouts 
    : payouts.filter(payout => payout.status === filterStatus);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  const handleViewDetails = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setDialogOpen(true);
  };
  
  const handleStatusChange = (payoutId: string, newStatus: 'processing' | 'completed' | 'failed') => {
    const updatedPayouts = payouts.map(p => {
      if (p.id === payoutId) {
        return {
          ...p, 
          status: newStatus,
          processingDate: newStatus === 'processing' ? new Date().toISOString() : p.processingDate,
          completionDate: newStatus === 'completed' ? new Date().toISOString() : p.completionDate
        };
      }
      return p;
    });
    
    setPayouts(updatedPayouts);
    
    const statusMessages = {
      processing: 'Pagamento em processamento',
      completed: 'Pagamento concluído com sucesso',
      failed: 'Pagamento falhou'
    };
    
    toast({
      title: 'Status atualizado',
      description: statusMessages[newStatus],
    });
    
    setDialogOpen(false);
  };
  
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Pagamentos</h1>
            <p className="text-gray-600 mt-1">
              Controle e aprovar repasses para organizadores
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <div className="flex items-center border rounded-md bg-white">
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'all' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleStatusFilter('all')}
              >
                Todos
              </button>
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'pending' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleStatusFilter('pending')}
              >
                Pendentes
              </button>
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'processing' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleStatusFilter('processing')}
              >
                Em Processamento
              </button>
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'completed' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleStatusFilter('completed')}
              >
                Concluídos
              </button>
            </div>
          </div>
        </div>
        
        {/* Cards informativos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Repasses</p>
                  <h3 className="text-2xl font-bold mt-1">{payouts.length}</h3>
                </div>
                <div className="rounded-full p-3 bg-blue-100">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <h3 className="text-2xl font-bold mt-1">
                    R$ {payouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="rounded-full p-3 bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {payouts.filter(p => p.status === 'pending').length}
                  </h3>
                </div>
                <div className="rounded-full p-3 bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {payouts.filter(p => p.status === 'completed').length}
                  </h3>
                </div>
                <div className="rounded-full p-3 bg-green-100">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabela de repasses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Solicitações de Repasse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Organizador</th>
                    <th className="py-3 px-4 text-left">Data da Solicitação</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center">
                        Carregando solicitações...
                      </td>
                    </tr>
                  ) : filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center">
                        Nenhuma solicitação de repasse encontrada.
                      </td>
                    </tr>
                  ) : filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{payout.id}</td>
                      <td className="py-3 px-4">{payout.organizerName}</td>
                      <td className="py-3 px-4">{formatDate(payout.requestDate)}</td>
                      <td className="py-3 px-4 text-right">
                        R$ {payout.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusBadgeStyles[payout.status as keyof typeof statusBadgeStyles]}`}>
                          {payout.status === 'pending' && 'Pendente'}
                          {payout.status === 'processing' && 'Em Processamento'}
                          {payout.status === 'completed' && 'Concluído'}
                          {payout.status === 'failed' && 'Falhou'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          className="text-primary hover:text-primary/80 text-sm"
                          onClick={() => handleViewDetails(payout)}
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detalhes do repasse */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Repasse</DialogTitle>
            <DialogDescription>
              Informações completas sobre a solicitação de repasse.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">{selectedPayout.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organizador</p>
                  <p className="font-medium">{selectedPayout.organizerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data da Solicitação</p>
                  <p className="font-medium">{formatDate(selectedPayout.requestDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="font-medium">R$ {selectedPayout.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusBadgeStyles[selectedPayout.status as keyof typeof statusBadgeStyles]}`}>
                      {selectedPayout.status === 'pending' && 'Pendente'}
                      {selectedPayout.status === 'processing' && 'Em Processamento'}
                      {selectedPayout.status === 'completed' && 'Concluído'}
                      {selectedPayout.status === 'failed' && 'Falhou'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-medium mb-2">Informações Bancárias</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Banco:</span> {selectedPayout.bankInfo.bankName}</p>
                  <p><span className="text-gray-500">Tipo de Conta:</span> {selectedPayout.bankInfo.accountType}</p>
                  <p><span className="text-gray-500">Agência:</span> {selectedPayout.bankInfo.branchCode}</p>
                  <p><span className="text-gray-500">Conta:</span> {selectedPayout.bankInfo.accountNumber}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            {selectedPayout && selectedPayout.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusChange(selectedPayout.id, 'failed')}
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                >
                  Rejeitar
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusChange(selectedPayout.id, 'processing')}
                  >
                    Em Processamento
                  </Button>
                  <Button onClick={() => handleStatusChange(selectedPayout.id, 'completed')}>
                    Confirmar Pagamento
                  </Button>
                </div>
              </>
            )}
            
            {selectedPayout && selectedPayout.status === 'processing' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusChange(selectedPayout.id, 'failed')}
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                >
                  Marcar como Falha
                </Button>
                <Button onClick={() => handleStatusChange(selectedPayout.id, 'completed')}>
                  Confirmar Pagamento
                </Button>
              </>
            )}
            
            {selectedPayout && (selectedPayout.status === 'completed' || selectedPayout.status === 'failed') && (
              <Button onClick={() => setDialogOpen(false)} className="w-full">
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PayoutManagement;
