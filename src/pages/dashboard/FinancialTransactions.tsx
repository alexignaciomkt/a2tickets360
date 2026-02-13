
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Filter, Download, AlertTriangle, Check, XCircle, RotateCcw } from 'lucide-react';
import { financialService } from '@/services/financialService';
import { Transaction } from '@/interfaces/financial';

const statusBadgeStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800"
};

const StatusIcon = ({ status }: { status: string }) => {
  switch(status) {
    case 'pending':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'confirmed':
      return <Check className="h-4 w-4 text-green-600" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'refunded':
      return <RotateCcw className="h-4 w-4 text-gray-600" />;
    default:
      return null;
  }
};

const FinancialTransactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let filters = {};
        if (filterStatus !== 'all') {
          filters = { status: filterStatus };
        }
        const data = await financialService.getTransactions(filters);
        setTransactions(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as transações.',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [toast, filterStatus]);
  
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };
  
  const downloadTransactions = () => {
    toast({
      title: 'Download',
      description: 'O arquivo CSV com as transações será baixado.',
    });
  };
  
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
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
  
  const handleInvoice = (invoiceUrl?: string) => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank');
    } else {
      toast({
        title: 'Nota fiscal não disponível',
        description: 'Este pagamento não possui nota fiscal disponível.',
      });
    }
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`px-3 py-1 rounded ${currentPage === i ? 'bg-primary text-white' : 'bg-gray-100'}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        {pages}
        <button
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
      </div>
    );
  };
  
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transações Financeiras</h1>
            <p className="text-gray-600 mt-1">
              Histórico de transações e pagamentos
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <div className="flex items-center border rounded-md bg-white">
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'all' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleStatusFilter('all')}
              >
                Todas
              </button>
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'pending' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleStatusFilter('pending')}
              >
                Pendentes
              </button>
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'confirmed' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleStatusFilter('confirmed')}
              >
                Confirmadas
              </button>
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'refunded' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleStatusFilter('refunded')}
              >
                Estornadas
              </button>
            </div>
            
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
            
            <Button onClick={downloadTransactions} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lista de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Data</th>
                    <th className="py-3 px-4 text-left">Evento</th>
                    <th className="py-3 px-4 text-left">Usuário</th>
                    <th className="py-3 px-4 text-left">Método</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-right">Taxa</th>
                    <th className="py-3 px-4 text-right">Líquido</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-4 text-center">
                        Carregando transações...
                      </td>
                    </tr>
                  ) : paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-4 text-center">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  ) : paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{transaction.id}</td>
                      <td className="py-3 px-4">{formatDate(transaction.date)}</td>
                      <td className="py-3 px-4">{transaction.eventName}</td>
                      <td className="py-3 px-4">{transaction.userName}</td>
                      <td className="py-3 px-4">{transaction.paymentMethod}</td>
                      <td className="py-3 px-4 text-right">
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        R$ {(transaction.fee + transaction.platformFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        R$ {transaction.netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusBadgeStyles[transaction.status as keyof typeof statusBadgeStyles]}`}>
                          <StatusIcon status={transaction.status} />
                          <span className="ml-1">
                            {transaction.status === 'pending' && 'Pendente'}
                            {transaction.status === 'confirmed' && 'Confirmada'}
                            {transaction.status === 'cancelled' && 'Cancelada'}
                            {transaction.status === 'refunded' && 'Estornada'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          className="text-primary hover:text-primary/80 text-sm"
                          onClick={() => handleInvoice(transaction.invoiceUrl)}
                        >
                          Nota fiscal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {renderPagination()}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Total de Transações</p>
                <h3 className="text-xl font-bold">{transactions.length}</h3>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Valor Total</p>
                <h3 className="text-xl font-bold">
                  R$ {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Comissão Total</p>
                <h3 className="text-xl font-bold">
                  R$ {transactions.reduce((sum, t) => sum + t.platformFee, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FinancialTransactions;
