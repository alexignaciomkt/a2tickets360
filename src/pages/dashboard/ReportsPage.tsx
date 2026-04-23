
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, FileText, Map, Calendar, Filter, ArrowDownToLine, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockCityData = [
  { name: 'SÃO JOSÉ', value: 124 },
  { name: 'FLORIANÓPOLIS', value: 98 },
  { name: 'PALHOÇA', value: 65 },
  { name: 'BIGUAÇU', value: 42 },
  { name: 'CAMBORIÚ', value: 38 },
];

const mockEventTypeData = [
  { name: 'SHOWS', value: 145 },
  { name: 'FESTAS', value: 120 },
  { name: 'CORP', value: 60 },
  { name: 'CULT', value: 45 },
  { name: 'ESPORT', value: 30 },
];

const mockMonthlyData = [
  { month: 'JAN', events: 12, revenue: 45000 },
  { month: 'FEV', events: 15, revenue: 52000 },
  { month: 'MAR', events: 18, revenue: 61000 },
  { month: 'ABR', events: 22, revenue: 78000 },
  { month: 'MAI', events: 28, revenue: 92000 },
  { month: 'JUN', events: 30, revenue: 105000 },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('city');
  const [dateRange, setDateRange] = useState('month');

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-10 animate-in fade-in duration-700 pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Intelligence Analytics</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Visualização de dados clusterizados por geolocalização, cronologia e categoria.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex bg-white p-1 rounded-full border border-gray-100 shadow-sm">
                 {['week', 'month', 'year'].map((range) => (
                   <button 
                     key={range}
                     className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${dateRange === range ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                     onClick={() => setDateRange(range)}
                   >
                     {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
                   </button>
                 ))}
               </div>
               <Button variant="outline" className="h-10 rounded-full border-gray-100 text-[9px] font-black uppercase tracking-widest px-8 shadow-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  Advanced Filtering
               </Button>
           </div>
        </div>
        
        <Card className="bg-white border-gray-100 shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/20 px-10 py-8">
            <div className="flex justify-between items-center w-full">
              <div className="space-y-1">
                 <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Dataset Visualization</CardTitle>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Synchronized Node Data</span>
                 </div>
              </div>
              <Button className="h-10 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-black px-8 shadow-xl shadow-slate-100 transition-all hover:scale-105 active:scale-95">
                 <ArrowDownToLine className="w-4 h-4 mr-2" />
                 Export Analysis (PDF)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 gap-12 mb-12 border-b border-gray-100 w-full rounded-none justify-start">
                {[
                  { v: 'city', l: 'Geo Cluster', i: Map },
                  { v: 'eventType', l: 'Category Matrix', i: Calendar },
                  { v: 'date', l: 'Temporal Flux', i: TrendingUp },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.v}
                    value={tab.v} 
                    className="pb-5 rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 bg-transparent text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 opacity-40 data-[state=active]:opacity-100 transition-all"
                  >
                    <tab.i className="h-4 w-4" />
                    {tab.l}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="city" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 h-[450px] bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-10 relative group">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockCityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(15, 23, 42, 0.02)' }}
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', padding: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                        />
                        <Bar dataKey="value" name="Volume" fill="#0f172a" radius={[12, 12, 0, 0]} barSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-10 right-10 flex items-center gap-3">
                       <Zap className="w-4 h-4 text-amber-500" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Live Geo-Data</span>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Summary: Region Performance</h3>
                    <div className="space-y-4">
                      {mockCityData.map((city, i) => (
                        <div key={i} className="flex justify-between items-center p-6 rounded-3xl bg-white border border-gray-100 shadow-sm transition-all hover:bg-gray-50 hover:scale-[1.03] cursor-pointer group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Map className="w-4 h-4" /></div>
                             <div>
                               <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{city.name}</p>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Santa Catarina Cluster</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-slate-900 leading-none tabular-nums">{city.value}</p>
                             <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1.5 leading-none">+12.4%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-16 overflow-hidden rounded-[2.2rem] border border-gray-100 shadow-sm bg-white">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">City Node</th>
                        <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Event Count</th>
                        <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Average Asset</th>
                        <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Gross Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { name: 'São José', events: 124, avg: 'R$ 45,00', revenue: 'R$ 164.800,00' },
                        { name: 'Florianópolis', events: 98, avg: 'R$ 62,00', revenue: 'R$ 133.500,00' },
                        { name: 'Palhoça', events: 65, avg: 'R$ 38,00', revenue: 'R$ 91.200,00' },
                        { name: 'Biguaçu', events: 42, avg: 'R$ 35,00', revenue: 'R$ 52.800,00' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/30 transition-colors group cursor-pointer">
                          <td className="px-10 py-6 text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{row.name}</td>
                          <td className="px-10 py-6 text-right text-[12px] font-black text-slate-700 tabular-nums">{row.events}</td>
                          <td className="px-10 py-6 text-right text-[12px] font-black text-slate-700 tabular-nums">{row.avg}</td>
                          <td className="px-10 py-6 text-right text-[12px] font-black text-slate-900 tabular-nums">{row.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white">
                      <tr>
                        <td className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Cluster Aggregate</td>
                        <td className="px-10 py-6 text-right text-[12px] font-black tabular-nums">329 Units</td>
                        <td className="px-10 py-6 text-right text-[12px] font-black tabular-nums">---</td>
                        <td className="px-10 py-6 text-right text-[12px] font-black tabular-nums">R$ 442.300,00</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="eventType" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   <div className="lg:col-span-2 h-[450px] bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockEventTypeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', padding: '16px' }} />
                        <Bar dataKey="value" name="Volume" fill="#10b981" radius={[12, 12, 0, 0]} barSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Matrix Density: Category</h3>
                    <div className="space-y-4">
                      {mockEventTypeData.map((type, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-between group hover:bg-gray-50 transition-all cursor-pointer">
                           <div className="space-y-2.5">
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-emerald-600 transition-colors">{type.name}</p>
                              <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                 <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${(type.value / 150) * 100}%` }} />
                              </div>
                           </div>
                           <span className="text-base font-black text-emerald-600 tabular-nums">{type.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="date" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-10">
                  <div className="h-[500px] bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-10 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockMonthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900', padding: '16px' }} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button className="h-12 rounded-full bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest px-10 shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Strategic Report Matrix
                    </Button>
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

export default ReportsPage;
