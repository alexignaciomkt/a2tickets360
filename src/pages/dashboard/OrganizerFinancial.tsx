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
import { AsaasOnboardingModal } from '@/components/modals/AsaasOnboardingModal';

const OrganizerFinancial = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [asaasModalOpen, setAsaasModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([
    { id: '1', date: '2025-01-10', description: 'Aluguel de Som', amount: 5000, supplier: 'Mega Som & Luz', status: 'paid' },
    { id: '2', date: '2025-01-12', description: 'Cenografia Palco Principal', amount: 12000, supplier: 'CenoArt Montagens', status: 'pending' },
  ]);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const organizerId = user?.id || '1';
      
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

  // Mock data para transações e repasses
  const transactions = [
    {
      id: '1',
      date: '2025-01-15',
      description: 'Venda de ingressos - Festival de Música',
      amount: 2500,
      status: 'completed',
      type: 'credit'
    },
    {
      id: '2',
      date: '2025-01-14',
      description: 'Taxa da plataforma',
      amount: -125,
      status: 'completed',
      type: 'debit'
    },
  ];

  const payouts = [
    {
      id: '1',
      date: '2025-01-10',
      amount: 8500,
      status: 'completed',
      events: ['Festival de Música', 'Show Acústico']
    },
    {
      id: '2',
      date: '2025-01-01',
      amount: 5200,
      status: 'pending',
      events: ['Festa de Ano Novo']
    },
  ];

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
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Receita Total</p>
              <h3 className="text-xl font-black text-gray-900">
                {financialSummary ? formatCurrency(financialSummary.totalRevenue) : 'R$ 0'}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl"><CreditCard className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Valor Líquido</p>
              <h3 className="text-xl font-black text-gray-900">
                {financialSummary ? formatCurrency(financialSummary.netRevenue) : 'R$ 0'}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-xl"><Landmark className="w-6 h-6 text-orange-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Taxas Pagas</p>
              <h3 className="text-xl font-black text-gray-900">
                {financialSummary ? formatCurrency(financialSummary.totalFees) : 'R$ 0'}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl"><DollarSign className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Pendente Repasse</p>
              <h3 className="text-xl font-black text-gray-900">R$ 5.200</h3>
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
                    {transactions.map((transaction) => (
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
                    ))}
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
                    {expenses.map((expense) => (
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
                    ))}
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
                    {payouts.map((payout) => (
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
                    ))}
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
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Vendas</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Receita Bruta</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Taxas</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Receita Líquida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => {
                      const revenue = event.tickets.reduce((sum, ticket) => {
                        const sold = ticket.quantity - ticket.remaining;
                        return sum + (sold * ticket.price);
                      }, 0);
                      const fees = revenue * 0.05; // 5% de taxa
                      const netRevenue = revenue - fees;

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
                            {event.tickets.reduce((sum, ticket) => sum + (ticket.quantity - ticket.remaining), 0)}
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(revenue)}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(fees)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(netRevenue)}
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
          availableBalance={5200.00}
        />

        {/* Asaas Integration Info */}
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-slate-50 border-blue-100 mt-6">
          <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4 px-6 pt-6 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-blue-800 font-black text-lg uppercase tracking-tight">
              <Landmark className="h-5 w-5 mr-2" />
              Integração Financeira Asaas
            </CardTitle>
            {profile && !profile.asaasId && (
              <Button 
                onClick={() => setAsaasModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Ativar Conta de Recebimento
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {profile && !profile.asaasId ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mt-4">
                <p className="font-bold mb-1">Atenção: Sua conta não está habilitada para receber pagamentos.</p>
                <p className="text-sm">Clique no botão acima para criar sua subconta e começar a vender ingressos via PIX e Cartão de Crédito.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4 mt-4">
                  Sua conta está integrada com o <strong>Asaas</strong>. 
                  Todos os recebimentos cairão automaticamente na sua carteira virtual (Wallet ID: <code>{profile?.walletId || '---'}</code>).
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">Status: Conectado</span>
                  <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">Split Automático Ativo</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {profile && (
          <AsaasOnboardingModal
            open={asaasModalOpen}
            onOpenChange={setAsaasModalOpen}
            organizerId={user?.id || '1'}
            onSuccess={(updated) => setProfile(updated)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrganizerFinancial;
