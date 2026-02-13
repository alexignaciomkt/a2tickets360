
import { useState, useEffect } from 'react';
import { 
  BarChart2, DollarSign, Calendar, AlertTriangle, 
  Download, Filter, CreditCard, ArrowDown, ArrowUp 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { financialService } from '@/services/financialService';
import { FinancialSummary } from '@/interfaces/financial';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const FinancialDashboard = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [cityData, setCityData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados financeiros
        const summaryData = await financialService.getFinancialSummary();
        setSummary(summaryData);
        
        // Carregar dados de receita por período
        const revenueByPeriod = await financialService.getRevenueByPeriod('monthly');
        setRevenueData(revenueByPeriod);
        
        // Carregar dados de receita por cidade
        const revenueByCity = await financialService.getRevenueByCity();
        setCityData(revenueByCity);
        
        // Carregar dados de receita por categoria
        const revenueByCategory = await financialService.getRevenueByCategory();
        setCategoryData(revenueByCategory);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados financeiros.',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const downloadReport = () => {
    toast({
      title: 'Relatório',
      description: 'O relatório financeiro será enviado para seu e-mail.',
    });
  };
  
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
            <p className="text-gray-600 mt-1">
              Visão geral das finanças da plataforma
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <div className="flex items-center border rounded-md bg-white">
              <button 
                className={`px-3 py-1 text-sm ${dateRange === 'week' ? 'bg-primary text-white' : ''}`}
                onClick={() => setDateRange('week')}
              >
                Semana
              </button>
              <button 
                className={`px-3 py-1 text-sm ${dateRange === 'month' ? 'bg-primary text-white' : ''}`}
                onClick={() => setDateRange('month')}
              >
                Mês
              </button>
              <button 
                className={`px-3 py-1 text-sm ${dateRange === 'year' ? 'bg-primary text-white' : ''}`}
                onClick={() => setDateRange('year')}
              >
                Ano
              </button>
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </Button>
            
            <Button onClick={downloadReport} size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
        
        {/* Indicadores Financeiros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                  <h3 className="text-2xl font-bold mt-1">{summary ? `R$ ${summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    12% desde o mês passado
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">Comissões da Plataforma</p>
                  <h3 className="text-2xl font-bold mt-1">{summary ? `R$ ${summary.platformRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    8% desde o mês passado
                  </p>
                </div>
                <div className="rounded-full p-3 bg-purple-100">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transações</p>
                  <h3 className="text-2xl font-bold mt-1">{summary ? summary.transactionsCount : '...'}</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    15% desde o mês passado
                  </p>
                </div>
                <div className="rounded-full p-3 bg-blue-100">
                  <BarChart2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</p>
                  <h3 className="text-2xl font-bold mt-1">{summary ? `R$ ${summary.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}</h3>
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    5% desde o mês passado
                  </p>
                </div>
                <div className="rounded-full p-3 bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs e Gráficos */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle>Análise Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="cities" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Por Cidade
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Por Categoria
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']} 
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" name="Receita (R$)" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="transactions" name="Transações" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Detalhamento Financeiro</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Período</th>
                          <th className="py-3 px-4 text-right">Total Transações</th>
                          <th className="py-3 px-4 text-right">Receita (R$)</th>
                          <th className="py-3 px-4 text-right">Comissão (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{item.period}</td>
                            <td className="py-3 px-4 text-right">{item.transactions}</td>
                            <td className="py-3 px-4 text-right">
                              {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {(item.revenue * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="py-3 px-4">Total</td>
                          <td className="py-3 px-4 text-right">
                            {revenueData.reduce((sum, item) => sum + item.transactions, 0)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {revenueData.reduce((sum, item) => sum + item.revenue, 0)
                              .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {revenueData.reduce((sum, item) => sum + (item.revenue * 0.1), 0)
                              .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cities">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={cityData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="city" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']} 
                          />
                          <Legend />
                          <Bar dataKey="revenue" name="Receita" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={cityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                            nameKey="city"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {cityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Detalhamento por Cidade</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Cidade</th>
                          <th className="py-3 px-4 text-right">Total Eventos</th>
                          <th className="py-3 px-4 text-right">Transações</th>
                          <th className="py-3 px-4 text-right">Receita (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cityData.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{item.city}</td>
                            <td className="py-3 px-4 text-right">{Math.floor(item.transactions / 10)}</td>
                            <td className="py-3 px-4 text-right">{item.transactions}</td>
                            <td className="py-3 px-4 text-right">
                              {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']} 
                          />
                          <Legend />
                          <Bar dataKey="revenue" name="Receita" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                            nameKey="category"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FinancialDashboard;
