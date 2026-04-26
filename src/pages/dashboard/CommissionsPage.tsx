import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Calendar, TrendingUp, Download, Filter, PieChart, ChevronRight, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  { name: 'SHOWS', value: 35 },
  { name: 'FESTAS', value: 25 },
  { name: 'CORPORATIVO', value: 18 },
  { name: 'CULTURAL', value: 12 },
  { name: 'ESPORTIVO', value: 10 },
];

const COLORS = ['#0f172a', '#4f46e5', '#10b981', '#f59e0b', '#f43f5e'];

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
      <div className="space-y-10 animate-in fade-in duration-700 pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Comissões & Receitas</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Monitoramento de taxas, transações e liquidez da plataforma.
              </p>
           </div>
           <div className="flex items-center gap-4">
              <Button variant="outline" className="h-8 rounded-md border-slate-200 text-xs font-medium px-3 shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                  <Download className="w-3 h-3 mr-1.5" /> Exportar Relatório
              </Button>
           </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { l: 'Receita Bruta (GMV)', v: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, t: '+12.4%', i: DollarSign, c: 'bg-slate-900', tc: 'text-white' },
             { l: 'Comissão Acumulada', v: `R$ ${totalCommission.toLocaleString('pt-BR')}`, t: '+8.2%', i: Zap, c: 'bg-indigo-50', tc: 'text-indigo-600' },
             { l: 'Taxa Operacional', v: '10.0%', t: 'Padrão', i: Target, c: 'bg-emerald-50', tc: 'text-emerald-600' },
             { l: 'Performance de Ativos', v: '329', t: '+15%', i: Calendar, c: 'bg-rose-50', tc: 'text-rose-600' },
           ].map((stat, i) => (
             <Card key={i} className="rounded-[2.2rem] border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-700">
               <CardContent className="p-7">
                 <div className="flex items-center justify-between mb-6">
                   <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border border-white/10 ${stat.c} ${stat.tc} group-hover:scale-110 transition-transform`}>
                     <stat.i className="w-5 h-5" />
                   </div>
                   <Badge className={`text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5 rounded-md ${stat.t.startsWith('+') ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-slate-400'}`}>
                     {stat.t}
                   </Badge>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">{stat.l}</p>
                   <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">{stat.v}</h3>
                 </div>
               </CardContent>
             </Card>
           ))}
        </div>
        
        {/* Analytics Section */}
        <Card className="rounded-[2.5rem] border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center px-10 pt-10">
            <div className="space-y-1">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nó de Insights Financeiros</CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Análise de fluxos transacionais e distribuição de nó.</CardDescription>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="flex bg-gray-50 p-1 rounded-full border border-gray-100">
                 {['week', 'month', 'year'].map((range) => (
                   <button 
                     key={range}
                     className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                     onClick={() => setTimeRange(range)}
                   >
                     {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
                   </button>
                 ))}
               </div>
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-300 hover:bg-gray-100 hover:text-slate-900"><Filter className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            <Tabs defaultValue="revenue" className="space-y-10">
              <TabsList className="bg-transparent h-auto p-0 gap-10 border-b border-gray-100 w-full rounded-none justify-start">
                {[
                  { v: 'revenue', l: 'Índice de Performance' },
                  { v: 'categories', l: 'Densidade de Categorias' },
                  { v: 'organizers', l: 'Registro de Produtores' },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.v}
                    value={tab.v} 
                    className="pb-5 rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 bg-transparent text-[10px] font-black uppercase tracking-widest opacity-40 data-[state=active]:opacity-100 transition-all"
                  >
                    {tab.l}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="revenue" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="h-[400px] bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockMonthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', padding: '16px' }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                      <Line type="monotone" dataKey="revenue" name="Receita" stroke="#0f172a" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: '#0f172a' }} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} />
                      <Line type="monotone" dataKey="commission" name="Comissão" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart>
                      <Pie
                        data={mockCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', padding: '16px' }} />
                    </RechartsChart>
                  </ResponsiveContainer>
                  
                  <div className="flex flex-col justify-center space-y-6 pr-10">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Distribuição de Densidade da Matriz</h3>
                    <div className="space-y-4">
                      {mockCategoryData.map((category, index) => (
                        <div key={category.name} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-lg group-hover:scale-125 transition-transform shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{category.name}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900 tabular-nums">{category.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="organizers" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="py-6 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Nó de Produtor</th>
                        <th className="py-6 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Eventos</th>
                        <th className="py-6 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Bruto (R$)</th>
                        <th className="py-6 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Comissão (R$)</th>
                        <th className="py-6 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Cluster %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {mockOrganizersData.map((organizer) => (
                        <tr key={organizer.id} className="hover:bg-gray-50/30 transition-all group cursor-pointer">
                          <td className="py-6 px-8 flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-110 transition-transform">{organizer.name.charAt(0)}</div>
                             <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none mb-1">{organizer.name}</p>
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">ID do Nó #{organizer.id}</p>
                             </div>
                          </td>
                          <td className="py-6 px-8 text-right text-[12px] font-black text-slate-700 tabular-nums">{organizer.events}</td>
                          <td className="py-6 px-8 text-right text-[12px] font-black text-slate-700 tabular-nums">{organizer.revenue.toLocaleString('pt-BR')}</td>
                          <td className="py-6 px-8 text-right text-[12px] font-black text-slate-900 tabular-nums">{organizer.commission.toLocaleString('pt-BR')}</td>
                          <td className="py-6 px-8 text-right">
                             <Badge className="bg-gray-50 text-slate-500 border-none font-black text-[9px] px-3 py-1 rounded-full tabular-nums">
                                {((organizer.revenue / totalRevenue) * 100).toFixed(1)}%
                             </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white">
                      <tr className="font-semibold">
                        <td className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em]">Agregado Total</td>
                        <td className="py-6 px-8 text-right text-[12px] font-black tabular-nums">{mockOrganizersData.reduce((sum, org) => sum + org.events, 0)} Unidades</td>
                        <td className="py-6 px-8 text-right text-[12px] font-black tabular-nums">R$ {mockOrganizersData.reduce((sum, org) => sum + org.revenue, 0).toLocaleString('pt-BR')}</td>
                        <td className="py-6 px-8 text-right text-[12px] font-black tabular-nums">R$ {mockOrganizersData.reduce((sum, org) => sum + org.commission, 0).toLocaleString('pt-BR')}</td>
                        <td className="py-6 px-8 text-right text-[10px] font-black uppercase">100.0%</td>
                      </tr>
                    </tfoot>
                  </table>
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
