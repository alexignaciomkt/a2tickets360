import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Landmark, Download, Eye, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { PayoutRequestModal } from '@/components/modals/PayoutRequestModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { organizerService } from '@/services/organizerService';
import { Event, FinancialSummary } from '@/interfaces/organizer';
import { useAuth } from '@/contexts/AuthContext';


const OrganizerFinancial = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, [user?.id]);

  const loadFinancialData = async () => {
    if (!user?.id) return;
    try {
      const organizerId = user.id;
      
      const profileData = await organizerService.getProfile(organizerId);
      setProfile(profileData);

      const eventsData = await organizerService.getEvents(organizerId);
      setEvents(eventsData);

      if (eventsData.length > 0) {
        const summary = await organizerService.getFinancialSummary(eventsData[0].id);
        setFinancialSummary(summary);
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando dados financeiros...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Área Financeira</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Gerencie suas receitas, repasses e informações bancárias</p>
          </div>
          <Button className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-gray-700 transition-colors shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório Financeiro
          </Button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Receita Bruta</p>
              <h3 className="text-xl font-black text-gray-900">
                {financialSummary ? formatCurrency(financialSummary.grossRevenue) : 'R$ 0,00'}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl"><CreditCard className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Valor do Produtor</p>
              <h3 className="text-xl font-black text-gray-900">
                {financialSummary ? formatCurrency(financialSummary.producerAmount) : 'R$ 0,00'}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-xl"><Landmark className="w-6 h-6 text-orange-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Taxas A2</p>
              <h3 className="text-xl font-black text-gray-900">
                {financialSummary ? formatCurrency(financialSummary.platformFeeAmount) : 'R$ 0,00'}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl"><DollarSign className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Total Pago (GMV)</p>
              <h3 className="text-xl font-black text-gray-900">{financialSummary ? formatCurrency(financialSummary.gmv) : 'R$ 0,00'}</h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-xl w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="transactions" className="font-bold text-[10px] uppercase tracking-tight rounded-lg">Transações</TabsTrigger>
            <TabsTrigger value="expenses" className="font-bold text-[10px] uppercase tracking-tight rounded-lg">Despesas</TabsTrigger>
            <TabsTrigger value="payouts" className="font-bold text-[10px] uppercase tracking-tight rounded-lg">Repasses</TabsTrigger>
            <TabsTrigger value="events" className="font-bold text-[10px] uppercase tracking-tight rounded-lg">Por Evento</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-white border-b border-gray-50 pb-4 px-6 pt-6">
                <CardTitle className="font-black text-lg uppercase tracking-tight">Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-100">
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Data</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Descrição</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Valor</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Status</TableHead>
                      <TableHead className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(financialSummary?.transactions || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhuma transação encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (financialSummary?.transactions || []).map((transaction: any) => (
                        <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-white border-b border-gray-50 pb-4 px-6 pt-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-black text-lg uppercase tracking-tight">Gestão de Despesas (Saídas)</CardTitle>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl h-auto"
                    onClick={() => setExpenseModalOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Registrar Despesa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-100">
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Data</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Descrição</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Fornecedor</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Valor</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Status</TableHead>
                      <TableHead className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhuma despesa registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense) => (
                        <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold border-indigo-200 text-indigo-600 uppercase text-[10px]">
                            {expense.supplier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-red-600 font-bold">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={expense.status === 'paid' ? 'default' : 'secondary'}>
                            {expense.status === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-white border-b border-gray-50 pb-4 px-6 pt-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-black text-lg uppercase tracking-tight">Histórico de Repasses</CardTitle>
                  <Button 
                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl h-auto"
                    onClick={() => setPayoutModalOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Solicitar Repasse
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-100">
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Data</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Eventos</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Valor</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Status</TableHead>
                      <TableHead className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(financialSummary?.payouts || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhum repasse encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (financialSummary?.payouts || []).map((payout: any) => (
                        <TableRow key={payout.id}>
                        <TableCell>{formatDate(payout.date)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {payout.events.map((event, index) => (
                              <div key={index} className="text-sm">{event}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payout.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                            {payout.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-white border-b border-gray-50 pb-4 px-6 pt-6">
                <CardTitle className="font-black text-lg uppercase tracking-tight">Resumo Financeiro por Evento</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-100">
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Evento</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Data</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Transações</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Receita Bruta</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Taxa A2</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Valor do Produtor</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">GMV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => {
                      const eventTx = (financialSummary?.transactions || []).filter((tx: any) => tx.eventId === event.id);
                      const transactionsCount = eventTx.length;
                      const grossRevenue = eventTx.reduce((sum: number, tx: any) => sum + (tx.grossAmount || 0), 0);
                      const fees = eventTx.reduce((sum: number, tx: any) => sum + (tx.platformFeeAmount || 0), 0);
                      const netRevenue = eventTx.reduce((sum: number, tx: any) => sum + (tx.producerAmount || 0), 0);
                      const gmv = eventTx.reduce((sum: number, tx: any) => sum + (tx.gmv || 0), 0);

                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.category}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(event.date)}</TableCell>
                          <TableCell>
                            {transactionsCount}
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(grossRevenue)}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(fees)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(netRevenue)}
                          </TableCell>
                          <TableCell className="font-medium text-indigo-600">
                            {formatCurrency(gmv)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>


        <AddExpenseModal
          open={expenseModalOpen}
          onOpenChange={setExpenseModalOpen}
          onSuccess={(newExp) => setExpenses([newExp, ...expenses])}
        />

        <PayoutRequestModal
          open={payoutModalOpen}
          onOpenChange={setPayoutModalOpen}
          availableBalance={financialSummary?.producerAmount || 0}
        />


      </div>
    </DashboardLayout>
  );
};

export default OrganizerFinancial;
