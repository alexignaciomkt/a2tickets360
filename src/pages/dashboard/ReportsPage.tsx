
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, FileText, Map, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockCityData = [
  { name: 'São José', value: 124 },
  { name: 'Florianópolis', value: 98 },
  { name: 'Palhoça', value: 65 },
  { name: 'Biguaçu', value: 42 },
  { name: 'Camboriú', value: 38 },
];

const mockEventTypeData = [
  { name: 'Shows', value: 145 },
  { name: 'Festas', value: 120 },
  { name: 'Corporativo', value: 60 },
  { name: 'Cultural', value: 45 },
  { name: 'Esportivo', value: 30 },
];

const mockMonthlyData = [
  { month: 'Jan', events: 12, revenue: 45000 },
  { month: 'Fev', events: 15, revenue: 52000 },
  { month: 'Mar', events: 18, revenue: 61000 },
  { month: 'Abr', events: 22, revenue: 78000 },
  { month: 'Mai', events: 28, revenue: 92000 },
  { month: 'Jun', events: 30, revenue: 105000 },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('city');
  const [dateRange, setDateRange] = useState('month');

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-gray-600">Visualize estatísticas e relatórios por cidade, data e tipo de evento</p>
        </div>
        
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Relatórios</CardTitle>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="flex items-center border rounded-md">
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
                <span className="hidden sm:inline">Filtrar</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="mb-6">
                <TabsTrigger value="city" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Por Cidade
                </TabsTrigger>
                <TabsTrigger value="eventType" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Por Tipo
                </TabsTrigger>
                <TabsTrigger value="date" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Por Data
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="city">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockCityData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Eventos" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Resumo por Cidade</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Cidade</th>
                          <th className="py-3 px-4 text-right">Total Eventos</th>
                          <th className="py-3 px-4 text-right">Total Ingressos</th>
                          <th className="py-3 px-4 text-right">Receita (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">São José</td>
                          <td className="py-3 px-4 text-right">124</td>
                          <td className="py-3 px-4 text-right">5,460</td>
                          <td className="py-3 px-4 text-right">164,800.00</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">Florianópolis</td>
                          <td className="py-3 px-4 text-right">98</td>
                          <td className="py-3 px-4 text-right">4,120</td>
                          <td className="py-3 px-4 text-right">133,500.00</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">Palhoça</td>
                          <td className="py-3 px-4 text-right">65</td>
                          <td className="py-3 px-4 text-right">2,840</td>
                          <td className="py-3 px-4 text-right">91,200.00</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">Biguaçu</td>
                          <td className="py-3 px-4 text-right">42</td>
                          <td className="py-3 px-4 text-right">1,680</td>
                          <td className="py-3 px-4 text-right">52,800.00</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="py-3 px-4">Total</td>
                          <td className="py-3 px-4 text-right">329</td>
                          <td className="py-3 px-4 text-right">14,100</td>
                          <td className="py-3 px-4 text-right">442,300.00</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="eventType">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockEventTypeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Eventos" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Resumo por Tipo de Evento</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Tipo de Evento</th>
                          <th className="py-3 px-4 text-right">Total Eventos</th>
                          <th className="py-3 px-4 text-right">Média de Ingressos</th>
                          <th className="py-3 px-4 text-right">Comissão (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">Shows</td>
                          <td className="py-3 px-4 text-right">145</td>
                          <td className="py-3 px-4 text-right">380</td>
                          <td className="py-3 px-4 text-right">86,200.00</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">Festas</td>
                          <td className="py-3 px-4 text-right">120</td>
                          <td className="py-3 px-4 text-right">275</td>
                          <td className="py-3 px-4 text-right">72,400.00</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">Corporativo</td>
                          <td className="py-3 px-4 text-right">60</td>
                          <td className="py-3 px-4 text-right">120</td>
                          <td className="py-3 px-4 text-right">28,600.00</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">Cultural</td>
                          <td className="py-3 px-4 text-right">45</td>
                          <td className="py-3 px-4 text-right">180</td>
                          <td className="py-3 px-4 text-right">20,800.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="date">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockMonthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="events" name="Eventos" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="revenue" name="Receita (R$)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
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

export default ReportsPage;
