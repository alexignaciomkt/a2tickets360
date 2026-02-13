
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Calendar, TrendingUp, Download, Filter, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps } from 'recharts';

const mockMonthlyData = [
  { month: 'Jan', revenue: 45000, commission: 4500 },
  { month: 'Fev', revenue: 52000, commission: 5200 },
  { month: 'Mar', revenue: 61000, commission: 6100 },
  { month: 'Abr', revenue: 78000, commission: 7800 },
  { month: 'Mai', revenue: 92000, commission: 9200 },
  { month: 'Jun', revenue: 105000, commission: 10500 },
];

const mockCategoryData = [
  { name: 'Shows', value: 35 },
  { name: 'Festas', value: 25 },
  { name: 'Corporativo', value: 18 },
  { name: 'Cultural', value: 12 },
  { name: 'Esportivo', value: 10 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

const mockOrganizersData = [
  { id: "1", name: "Festas Premium", revenue: 125000, commission: 12500, events: 8 },
  { id: "2", name: "EventPro", revenue: 98500, commission: 9850, events: 6 },
  { id: "3", name: "Arena Shows", revenue: 87000, commission: 8700, events: 5 },
  { id: "4", name: "Cultural Eventos", revenue: 65000, commission: 6500, events: 4 },
  { id: "5", name: "Esportes & Cia", revenue: 42000, commission: 4200, events: 3 },
];

const CommissionsPage = () => {
  const [timeRange, setTimeRange] = useState('month');

  const totalRevenue = mockMonthlyData.reduce((acc, item) => acc + item.revenue, 0);
  const totalCommission = mockMonthlyData.reduce((acc, item) => acc + item.commission, 0);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Comissões e Transações</h1>
          <p className="text-gray-600">Acompanhe as comissões e transações financeiras da plataforma</p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Receita Total</p>
                  <h3 className="text-2xl font-bold">R$ {(totalRevenue).toLocaleString('pt-BR')}</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% neste mês
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Comissão Total</p>
                  <h3 className="text-2xl font-bold">R$ {(totalCommission).toLocaleString('pt-BR')}</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% neste mês
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Taxa Média</p>
                  <h3 className="text-2xl font-bold">10%</h3>
                  <p className="text-xs text-gray-500 mt-1">Padrão para eventos</p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-full">
                  <PieChart className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Eventos Realizados</p>
                  <h3 className="text-2xl font-bold">329</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% neste mês
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Charts */}
        <Card>
          <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle>Visão Geral</CardTitle>
              <CardDescription>Análise de receitas e comissões</CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="flex items-center border rounded-md">
                <button 
                  className={`px-3 py-1 text-sm ${timeRange === 'week' ? 'bg-primary text-white' : ''}`}
                  onClick={() => setTimeRange('week')}
                >
                  Semana
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${timeRange === 'month' ? 'bg-primary text-white' : ''}`}
                  onClick={() => setTimeRange('month')}
                >
                  Mês
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${timeRange === 'year' ? 'bg-primary text-white' : ''}`}
                  onClick={() => setTimeRange('year')}
                >
                  Ano
                </button>
              </div>
              
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Receita</TabsTrigger>
                <TabsTrigger value="categories">Categorias</TabsTrigger>
                <TabsTrigger value="organizers">Organizadores</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockMonthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Receita (R$)" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="commission" name="Comissão (R$)" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Dados
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="categories">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart>
                      <Pie
                        data={mockCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </RechartsChart>
                  </ResponsiveContainer>
                  
                  <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-medium mb-4">Distribuição por Categoria</h3>
                    <div className="space-y-3">
                      {mockCategoryData.map((category, index) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span>{category.name}</span>
                          </div>
                          <span className="font-medium">{category.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="organizers">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Organizador</th>
                        <th className="py-3 px-4 text-right">Eventos</th>
                        <th className="py-3 px-4 text-right">Receita (R$)</th>
                        <th className="py-3 px-4 text-right">Comissão (R$)</th>
                        <th className="py-3 px-4 text-right">% da Plataforma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOrganizersData.map((organizer) => (
                        <tr key={organizer.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{organizer.name}</td>
                          <td className="py-3 px-4 text-right">{organizer.events}</td>
                          <td className="py-3 px-4 text-right">{organizer.revenue.toLocaleString('pt-BR')}</td>
                          <td className="py-3 px-4 text-right">{organizer.commission.toLocaleString('pt-BR')}</td>
                          <td className="py-3 px-4 text-right">
                            {((organizer.revenue / totalRevenue) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold">
                        <td className="py-3 px-4">Total</td>
                        <td className="py-3 px-4 text-right">
                          {mockOrganizersData.reduce((sum, org) => sum + org.events, 0)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {mockOrganizersData.reduce((sum, org) => sum + org.revenue, 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {mockOrganizersData.reduce((sum, org) => sum + org.commission, 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex justify-end mt-6">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Relatório
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CommissionsPage;
