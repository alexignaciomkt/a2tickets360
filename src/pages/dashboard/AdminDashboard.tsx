
import { Users, Calendar, DollarSign, ShieldCheck, FileText, Save, ChevronRight, Clock, Target, Activity, Zap, ShieldAlert, CheckCircle, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { events } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import masterService from '@/services/masterService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [legalContent, setLegalContent] = useState({
    privacy: { title: '', content: '' },
    terms: { title: '', content: '' }
  });
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalOrganizers: 0,
    pendingEvents: 0,
    totalRevenue: 0
  });
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    loadLegalPages();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData, allEvents] = await Promise.all([
        masterService.getStats(),
        masterService.getPendingEvents(),
        masterService.getEvents()
      ]);
      setStats(statsData);
      setPendingList(pendingData);
      setRecentEvents(allEvents);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLegalPages = async () => {
    try {
      const privacy = await api.get<any>('/api/legal/privacy');
      const terms = await api.get<any>('/api/legal/terms');
      setLegalContent({
        privacy: { title: privacy.title, content: privacy.content },
        terms: { title: terms.title, content: terms.content }
      });
    } catch (error) {
      console.error('Error loading legal pages:', error);
    }
  };

  const handleUpdateLegal = async (slug: 'privacy' | 'terms') => {
    try {
      setLoading(true);
      await api.put(`/api/legal/${slug}`, legalContent[slug]);
      toast({
        title: 'Status Synchronized',
        description: `${slug === 'privacy' ? 'Política' : 'Termos'} atualizados no kernel.`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cluster Error',
        description: 'Não foi possível salvar as alterações no nó.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (id: string) => {
    try {
      await masterService.approveEvent(id);
      toast({ title: 'Success', description: 'Ativo autorizado com sucesso.' });
      loadDashboardData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Erro ao autorizar ativo.' });
    }
  };

  const QuickStat = ({ title, value, icon: Icon, color }: any) => (
    <Card className="rounded-[2.2rem] border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-700">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 leading-none">{title}</p>
          <h3 className="text-2xl font-black tracking-tighter text-slate-900 leading-none tabular-nums">{loading ? '---' : value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all group-hover:scale-110 shadow-lg border border-white/10 ${
          color === 'indigo' ? 'bg-slate-900 text-white' : 
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
          color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-12 pb-16 animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
           <div className="space-y-1.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Kernel Operation Dashboard</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                Bem-vindo ao centro de comando administrativo do <span className="text-slate-900">A2 Tickets 360 Ecosystem</span>.
              </p>
           </div>
           
           <div className="flex bg-gray-100/50 p-1.5 rounded-full border border-gray-100 shadow-inner">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-transparent h-auto p-0 gap-1.5">
                <TabsTrigger value="overview" className="rounded-full px-8 py-3 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xl transition-all shadow-none">
                  <Activity className="w-3.5 h-3.5 mr-2" /> Global Overview
                </TabsTrigger>
                <TabsTrigger value="legal" className="rounded-full px-8 py-3 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xl transition-all shadow-none">
                  <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Protocol Nodes
                </TabsTrigger>
              </TabsList>
            </Tabs>
           </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="overview" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <QuickStat title="Total Assets Issued" value={stats.totalEvents} icon={Calendar} color="indigo" />
              <QuickStat title="Authorized Nodes" value={stats.totalOrganizers} icon={Users} color="emerald" />
              <QuickStat title="Net Revenue Pool" value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="amber" />
              <QuickStat title="Waitlist Backlog" value={stats.pendingEvents} icon={ShieldAlert} color="rose" />
            </div>

            {/* Pending Events */}
            <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
              <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
                  <Clock className="w-5 h-5 text-slate-900" /> Waitlist Asset Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Asset Unit</th>
                        <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Authorized Node</th>
                        <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Temporal Node</th>
                        <th className="px-12 py-8 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Audit Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-12 py-24 text-center">
                            <div className="flex flex-col items-center gap-6">
                               <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                                  <ShieldCheck className="h-8 w-8 text-slate-200" />
                               </div>
                               <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Zero critical assets pending review.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pendingList.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-50/30 transition-all duration-500 group/item cursor-pointer">
                            <td className="px-12 py-8">
                              <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none group-hover/item:text-slate-900 transition-colors">{event.title}</div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{event.locationCity || 'UNDEFINED_GEO'}</div>
                              </div>
                            </td>
                            <td className="px-12 py-8">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg border border-white/10 group-hover/item:scale-110 transition-transform"><Users className="w-3.5 h-3.5" /></div>
                                 <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{event.organizer?.name || 'ROOT_ACCESS'}</div>
                              </div>
                            </td>
                            <td className="px-12 py-8">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums leading-none flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {event.date}</div>
                            </td>
                            <td className="px-12 py-8 text-right space-x-4">
                              <Button
                                onClick={() => handleApproveEvent(event.id)}
                                className="h-10 rounded-full bg-slate-900 text-white hover:bg-black font-black uppercase text-[9px] tracking-widest px-6 transition-all"
                              >
                                Authorize
                              </Button>
                              <Button variant="ghost" className="h-10 rounded-full text-rose-500 hover:bg-rose-50 font-black uppercase text-[9px] tracking-widest px-6 transition-all">
                                Reject
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
              <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
                  <Database className="w-5 h-5 text-slate-900" /> Recent Asset Flux
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Asset Identity</th>
                        <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Authorized Node</th>
                        <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Yield Performance</th>
                        <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-12 py-8 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentEvents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-12 py-24 text-center">
                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Zero asset registries identified in kernel.</p>
                          </td>
                        </tr>
                      ) : (
                        recentEvents.map((event) => {
                          const ticketsSold = event.tickets?.reduce(
                            (sum: number, ticket: any) => sum + (ticket.quantity - ticket.remaining),
                            0
                          ) || 0;
                          const totalTickets = event.tickets?.reduce(
                            (sum: number, ticket: any) => sum + ticket.quantity,
                            0
                          ) || 1;

                          return (
                            <tr key={event.id} className="hover:bg-gray-50/30 transition-all duration-500 group/item cursor-pointer">
                              <td className="px-12 py-8">
                                <div className="space-y-1">
                                  <div className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{event.title}</div>
                                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{event.locationCity}, {event.locationState}</div>
                                </div>
                              </td>
                              <td className="px-12 py-8">
                                <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{event.organizer?.name}</div>
                              </td>
                              <td className="px-12 py-8">
                                <div className="space-y-3 w-48">
                                  <div className="flex justify-between items-end text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
                                    <span className="tabular-nums">{ticketsSold} / {totalTickets}</span>
                                    <span className="text-slate-300 tabular-nums">{Math.floor((ticketsSold / totalTickets) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                                    <div
                                      className="bg-slate-900 h-1.5 rounded-full shadow-[0_0_10px_rgba(15,23,42,0.2)] transition-all duration-1000"
                                      style={{ width: `${Math.min((ticketsSold / totalTickets) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-12 py-8">
                                <Badge className={`text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none shadow-sm ${
                                  event.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-slate-400'
                                }`}>
                                  {event.status === 'published' ? 'LIVE_NODE' : 'IDLE_ASSET'}
                                </Badge>
                              </td>
                              <td className="px-12 py-8 text-right">
                                <Button variant="ghost" className="h-10 w-10 rounded-full p-0 text-slate-200 hover:text-slate-900 hover:bg-gray-100 transition-all">
                                   <ChevronRight className="w-5 h-5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="rounded-[4rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
              <CardHeader className="p-16 border-b border-gray-50 bg-gray-50/20">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Legal Protocol Nodes</CardTitle>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Gestão de termos de uso e políticas de compliance do ecossistema.</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  {/* Privacy Card */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">Privacy Governance</h3>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Protocolo de proteção de dados.</p>
                      </div>
                      <Button
                        onClick={() => handleUpdateLegal('privacy')}
                        disabled={loading}
                        className="h-11 rounded-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-slate-100 active:scale-95 group/btn"
                      >
                        <Save className="h-4 w-4 mr-3 group-hover/btn:scale-125 transition-transform" /> Commit Node
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Identity Title</Label>
                      <Input
                        value={legalContent.privacy.title}
                        onChange={(e) => setLegalContent(prev => ({ ...prev, privacy: { ...prev.privacy, title: e.target.value } }))}
                        placeholder="Privacy Policy Node Title"
                        className="h-14 rounded-[1.5rem] border-gray-100 bg-gray-50/50 text-[12px] font-black uppercase tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Content Registry (Markdown Supported)</Label>
                      <Textarea
                        value={legalContent.privacy.content}
                        onChange={(e) => setLegalContent(prev => ({ ...prev, privacy: { ...prev.privacy, content: e.target.value } }))}
                        placeholder="Protocol content body..."
                        className="min-h-[500px] rounded-[2.5rem] border-gray-100 bg-gray-50/50 text-[12px] font-bold text-slate-400 focus:ring-8 focus:ring-slate-50 p-10 leading-relaxed border-2"
                      />
                    </div>
                  </div>

                  {/* Terms Card */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">Terms of Service Node</h3>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Protocolo de governança transacional.</p>
                      </div>
                      <Button
                        onClick={() => handleUpdateLegal('terms')}
                        disabled={loading}
                        className="h-11 rounded-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-slate-100 active:scale-95 group/btn"
                      >
                        <Save className="h-4 w-4 mr-3 group-hover/btn:scale-125 transition-transform" /> Commit Node
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Identity Title</Label>
                      <Input
                        value={legalContent.terms.title}
                        onChange={(e) => setLegalContent(prev => ({ ...prev, terms: { ...prev.terms, title: e.target.value } }))}
                        placeholder="Terms of Service Node Title"
                        className="h-14 rounded-[1.5rem] border-gray-100 bg-gray-50/50 text-[12px] font-black uppercase tracking-tight focus:ring-8 focus:ring-slate-50 transition-all border-2 px-8"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Content Registry (Markdown Supported)</Label>
                      <Textarea
                        value={legalContent.terms.content}
                        onChange={(e) => setLegalContent(prev => ({ ...prev, terms: { ...prev.terms, content: e.target.value } }))}
                        placeholder="Protocol content body..."
                        className="min-h-[500px] rounded-[2.5rem] border-gray-100 bg-gray-50/50 text-[12px] font-bold text-slate-400 focus:ring-8 focus:ring-slate-50 p-10 leading-relaxed border-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
