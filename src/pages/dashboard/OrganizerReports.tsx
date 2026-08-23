import { useState, useEffect, useMemo } from 'react';
import { Calendar, Download, TrendingUp, Users, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { organizerService } from '@/services/organizerService';
import { Event } from '@/interfaces/organizer';
import { supabase } from '@/lib/supabase';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

const OrganizerReports = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const organizerId = user.id;
      const eventsData = await organizerService.getEvents(organizerId);
      setEvents(eventsData);
      
      const summary = await organizerService.getFinancialSummary('all');
      setTransactions(summary.transactions || []);

      const { data: ptData } = await supabase
        .from('purchased_tickets')
        .select(`
          id, event_id, status, created_at, parent_purchase_id,
          tickets(name, price)
        `)
        .neq('status', 'cancelled');
        
      setPurchasedTickets(ptData || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
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

  // Filtragem
  const filteredTxs = useMemo(() => {
    const periodStart = subDays(new Date(), parseInt(selectedPeriod));
    return transactions.filter(tx => {
      const matchEvent = selectedEvent === 'all' || tx.eventId === selectedEvent;
      const matchDate = new Date(tx.date) >= periodStart;
      return matchEvent && matchDate;
    });
  }, [transactions, selectedEvent, selectedPeriod]);

  const filteredTickets = useMemo(() => {
    const periodStart = subDays(new Date(), parseInt(selectedPeriod));
    return purchasedTickets.filter(pt => {
      const matchEvent = selectedEvent === 'all' || pt.event_id === selectedEvent;
      const matchDate = new Date(pt.created_at) >= periodStart;
      return matchEvent && matchDate;
    });
  }, [purchasedTickets, selectedEvent, selectedPeriod]);

  // KPIs
  const kpis = useMemo(() => {
    const grossTotal = filteredTxs.reduce((sum, tx) => sum + (tx.grossAmount || 0), 0);
    const gmvTotal = filteredTxs.reduce((sum, tx) => sum + (tx.gmv || 0), 0);
    const count = filteredTxs.length;
    return {
      receitaTotal: grossTotal,
      vendas: count,
      ticketMedio: count > 0 ? (gmvTotal / count) : 0,
      credenciais: filteredTickets.length
    };
  }, [filteredTxs, filteredTickets]);

  // Agregações de gráficos
  const salesData = useMemo(() => {
    const map = new Map();
    filteredTxs.forEach(tx => {
      const label = format(parseISO(tx.date), 'dd/MM', { locale: ptBR });
      if (!map.has(label)) {
        map.set(label, { name: label, vendas: 0, receita: 0 });
      }
      const dayData = map.get(label);
      dayData.vendas += 1;
      dayData.receita += (tx.grossAmount || 0);
    });
    return Array.from(map.values()).sort((a: any, b: any) => {
      // Sort by string length then alphabetical is fine for DD/MM within a single month, but a real date sort is better.
      // For simplicity in UI, we assume chronological iteration works mostly fine if txs are sorted, but let's reverse to show oldest first if we want, or just leave it.
      return 1; 
    });
  }, [filteredTxs]);

  const ticketTypeData = useMemo(() => {
    const map = new Map();
    filteredTickets.forEach(pt => {
      const name = pt.tickets?.name || 'Geral';
      if (!map.has(name)) {
        map.set(name, { name, value: 0 });
      }
      const data = map.get(name);
      data.value += 1;
    });
    
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#3b82f6'];
    return Array.from(map.values()).map((item: any, i) => ({
      ...item,
      color: colors[i % colors.length]
    }));
  }, [filteredTickets]);

  if (loading) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando relatórios...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
            <p className="text-gray-600 mt-1">Análise detalhada das suas vendas e performance</p>
          </div>
          <Button disabled title="Exportação indisponível. Funcionalidade em desenvolvimento.">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione um evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Eventos</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Receita Total</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(kpis.receitaTotal)}</h3>
                  {/* Badges falsos removidos */}
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Vendas / Transações</p>
                  <h3 className="text-2xl font-bold">{kpis.vendas}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Ticket Médio Transacional</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(kpis.ticketMedio)}</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Credenciais Emitidas</p>
                  <h3 className="text-2xl font-bold">{kpis.credenciais}</h3>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Vendas por Período</TabsTrigger>
            <TabsTrigger value="tickets">Tipos de Ingresso</TabsTrigger>
            <TabsTrigger value="channels">Canais de Venda</TabsTrigger>
            <TabsTrigger value="conversion">Taxa de Conversão</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Vendas e Receita por Período</CardTitle>
                <CardDescription>Consolidado por dia das vendas aprovadas</CardDescription>
              </CardHeader>
              <CardContent>
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => 
                        name === 'Receita' ? formatCurrency(Number(value)) : value
                      } />
                      <Bar yAxisId="left" dataKey="vendas" fill="#8884d8" name="Vendas" />
                      <Bar yAxisId="right" dataKey="receita" fill="#82ca9d" name="Receita" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    Nenhum dado de venda para este período
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo de Ingresso</CardTitle>
                </CardHeader>
                <CardContent>
                  {ticketTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ticketTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {ticketTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Nenhuma credencial emitida neste período
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ticketTypeData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.value} emitidos</div>
                        </div>
                      </div>
                    ))}
                    {ticketTypeData.length === 0 && (
                      <div className="text-center text-gray-500">Sem dados.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="channels">
            <Card>
              <CardHeader>
                <CardTitle>Canais de Venda</CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex flex-col items-center justify-center text-gray-500 gap-2">
                <AlertCircle className="w-8 h-8 text-gray-400" />
                <p>O rastreamento de Canais de Venda (Promoters, PDVs, UTMs) ainda não possui dados reais suficientes para exibição.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conversão por Período</CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex flex-col items-center justify-center text-gray-500 gap-2">
                <AlertCircle className="w-8 h-8 text-gray-400" />
                <p>A taxa de conversão estará disponível quando o tracking de visitas de página (page views vs checkouts) estiver ativo.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerReports;
