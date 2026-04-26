import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, FileText, Map, Calendar, Filter, ArrowDownToLine, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import masterService from '@/services/masterService';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('city');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await masterService.getReportsAnalytics();
        setReportData(data);
      } catch (error) {
        console.error('Erro ao buscar dados do relatório:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [dateRange]);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8 animate-in fade-in duration-700 pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-1">
           <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Analytics de Inteligência</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Visualização de dados clusterizados por geolocalização, cronologia e categoria.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                 {['week', 'month', 'year'].map((range) => (
                   <button 
                     key={range}
                     className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${dateRange === range ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                     onClick={() => setDateRange(range)}
                   >
                     {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
                   </button>
                 ))}
               </div>
               <Button variant="outline" className="h-10 rounded-xl border-gray-100 text-[9px] font-black uppercase tracking-widest px-8 shadow-sm hover:bg-gray-50">
                  <Filter className="w-3 h-3 mr-2 text-slate-400" />
                  Filtros Avançados
               </Button>
           </div>
        </div>
        
        <Card className="bg-white border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <div className="flex justify-between items-center w-full">
              <div className="space-y-1">
                 <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Visualização de Conjunto de Dados Master</CardTitle>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Sincronização em Tempo Real</span>
                 </div>
              </div>
              <Button className="h-9 rounded-lg text-[9px] font-black uppercase tracking-wide bg-slate-900 text-white hover:bg-slate-800 px-6 shadow-sm transition-all active:scale-95">
                 <ArrowDownToLine className="w-3 h-3 mr-2" />
                 Exportar (PDF)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 gap-8 mb-8 border-b border-gray-100 w-full rounded-none justify-start">
                {[
                  { v: 'city', l: 'Cluster Geográfico', i: Map },
                  { v: 'eventType', l: 'Matriz de Categorias', i: Calendar },
                  { v: 'date', l: 'Fluxo Temporal', i: TrendingUp },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.v}
                    value={tab.v} 
                    className="pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 bg-transparent text-[10px] font-black uppercase tracking-wide flex items-center gap-2 opacity-40 data-[state=active]:opacity-100 transition-all"
                  >
                    <tab.i className="h-3 w-3" />
                    {tab.l}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                </div>
              ) : (
                <>
                  <TabsContent value="city" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 h-[400px] bg-slate-50/50 rounded-xl border border-gray-100 p-6 relative group">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportData?.cityData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                            <Tooltip 
                              cursor={{ fill: 'rgba(15, 23, 42, 0.02)' }}
                              contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold', padding: '12px', textTransform: 'uppercase' }} 
                            />
                            <Bar dataKey="value" name="Eventos" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="absolute top-6 right-6 flex items-center gap-2">
                           <Zap className="w-3 h-3 text-amber-500" />
                           <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Geodados em Tempo Real</span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-wide text-slate-400">Resumo: Performance Regional</h3>
                        <div className="space-y-3">
                          {reportData?.cityData?.slice(0, 5).map((city: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer group">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0"><Map className="w-3 h-3" /></div>
                                 <div>
                                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{city.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Nó Global</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-sm font-black text-slate-900 leading-none tabular-nums">{city.value}</p>
                                 <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider mt-1 leading-none">Vendas: R$ {city.revenue.toLocaleString('pt-BR')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Nó de Cidade</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">Contagem de Eventos</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">Ticket Médio</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">Receita Bruta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {reportData?.cityData?.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-tight">{row.name}</td>
                              <td className="px-6 py-4 text-right text-[11px] font-black text-slate-700 tabular-nums">{row.value}</td>
                              <td className="px-6 py-4 text-right text-[11px] font-black text-slate-700 tabular-nums">R$ {row.avg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-4 text-right text-[11px] font-black text-slate-900 tabular-nums">R$ {row.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                          <tr>
                            <td className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Agregado do Cluster</td>
                            <td className="px-6 py-4 text-right text-[11px] font-black tabular-nums">{reportData?.totals?.events || 0} Unidades</td>
                            <td className="px-6 py-4 text-right text-[11px] font-black tabular-nums">---</td>
                            <td className="px-6 py-4 text-right text-[11px] font-black tabular-nums">R$ {(reportData?.totals?.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="eventType" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 h-[400px] bg-slate-50/50 rounded-xl border border-gray-100 p-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportData?.categoryData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold', padding: '12px' }} />
                            <Bar dataKey="value" name="Volume" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-wide text-slate-400">Densidade da Matriz: Categoria</h3>
                        <div className="space-y-3">
                          {reportData?.categoryData?.map((type: any, i: number) => {
                            const max = reportData.categoryData[0]?.value || 1;
                            const percent = (type.value / max) * 100;
                            return (
                              <div key={i} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-between group hover:bg-slate-50 transition-all cursor-pointer">
                                 <div className="space-y-2 flex-1 mr-4">
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-emerald-600 transition-colors">{type.name}</p>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                                    </div>
                                 </div>
                                 <span className="text-sm font-black text-emerald-600 tabular-nums shrink-0">{type.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="date" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-8">
                      <div className="h-[450px] bg-slate-50/50 rounded-xl border border-gray-100 p-6 shadow-sm">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={reportData?.monthlyData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold', padding: '12px' }} />
                            <Area type="monotone" dataKey="revenue" name="Receita" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <Button className="h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wide px-8 shadow-sm transition-all active:scale-95">
                          <FileText className="w-3 h-3 mr-2" />
                          Gerar Relatório Estratégico
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
