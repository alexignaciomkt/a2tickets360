
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Plus, 
  Globe, 
  Loader2, 
  AlertCircle, 
  Filter,
  ChevronRight,
  Target,
  PieChart as PieIcon,
  BarChart3,
  Download,
  Info,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { organizerService } from '@/services/organizerService';
import { Event } from '@/interfaces/organizer';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeModal from '@/components/modals/WelcomeModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdBanner from '@/components/ui/AdBanner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [biData, setBiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasPostsWithoutCaption, setHasPostsWithoutCaption] = useState(false);

  const organizerId = user?.id || '';

  useEffect(() => {
    if (!organizerId) return;

    const loadInitialData = async () => {
      try {
        const [eventsData, posts] = await Promise.all([
          organizerService.getEvents(organizerId),
          organizerService.getPosts(organizerId)
        ]);
        setEvents(eventsData);
        
        // Check for missing captions
        const missing = posts.some(p => !p.caption || p.caption.trim() === '');
        setHasPostsWithoutCaption(missing);

        await refreshStats('all', '30');
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Check for welcome flag
    const welcomeFlag = localStorage.getItem('A2Tickets_showWelcome');
    if (welcomeFlag === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('A2Tickets_showWelcome');
    }
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      refreshStats(selectedEvent, selectedPeriod);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [organizerId, selectedEvent, selectedPeriod]);

  const refreshStats = async (evtId: string, period: string) => {
    setIsLoading(true);
    try {
      const stats = await organizerService.getBIStats(organizerId, evtId);
      setBiData(stats);
    } catch (error) {
      console.error('Error refreshing BI stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventChange = (val: string) => {
    setSelectedEvent(val);
    refreshStats(val, selectedPeriod);
  };

  const formatCurrency = (value: number) => {
    const safeValue = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(safeValue);
  };

  if (!biData && isLoading) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-gray-500 font-medium animate-pulse">Construindo seu centro de inteligência...</p>
        </div>
      </DashboardLayout>
    );
  }

  const { kpis, charts } = biData || { 
    kpis: { 
      totalEvents: 0, 
      ticketsGenerated: 0, 
      ticketsSold: 0, 
      currentRevenue: 0, 
      estimatedRevenue: 0, 
      occupancyRate: 0 
    }, 
    charts: { 
      salesByPeriod: [], 
      salesByGender: [], 
      salesByAge: [] 
    } 
  };

  const revenueProgress = kpis.estimatedRevenue > 0 ? Math.min(100, (kpis.currentRevenue / kpis.estimatedRevenue) * 100) : 0;
  const occupancyRate = kpis.occupancyRate || 0;

  return (
    <DashboardLayout userType="organizer">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full lg:w-72 space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-800">Filtros de BI</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Selecionar Evento</label>
                <Select value={selectedEvent} onValueChange={handleEventChange}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800 focus:ring-indigo-500">
                    <SelectValue placeholder="Todos os eventos" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    <SelectItem value="all">Todos os Eventos</SelectItem>
                    {events.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Período de Análise</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800 focus:ring-indigo-500">
                    <SelectValue placeholder="Últimos 30 dias" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 3 meses</SelectItem>
                    <SelectItem value="all">Todo o histórico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button 
                  onClick={() => refreshStats(selectedEvent, selectedPeriod)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full text-slate-700 font-semibold"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
                  Atualizar Dados
                </Button>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-3">
                  <Download className="h-4 w-4 mr-2" /> Exportar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Link to="/organizer/events/create" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-600 transition-colors">
                  <Plus className="h-4 w-4 text-indigo-600 group-hover:text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Novo Evento</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link to="/organizer/visitors" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-600 transition-colors">
                  <Users className="h-4 w-4 text-emerald-600 group-hover:text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Mailing de Clientes</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </aside>

        {/* MAIN DASHBOARD AREA */}
        <main className="flex-1 space-y-6">
          
          {/* TOP KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="h-12 w-12 text-indigo-600" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-slate-500 mb-1">Receita Atual</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(kpis.currentRevenue)}</h3>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${revenueProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">{revenueProgress.toFixed(1)}% da meta</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="h-12 w-12 text-emerald-600" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-slate-500 mb-1">Receita Estimada</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {kpis.estimatedRevenue > 0 ? formatCurrency(kpis.estimatedRevenue) : 'Grátis / --'}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-2">Potencial total de vendas</p>
              </CardContent>
            </Card>
          </div>

          {/* MAIN SALES CHART */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tighter">Performance de Vendas</CardTitle>
                <CardDescription>Volume de ingressos e receita por período</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Receita</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Vendas</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80 w-full">
                {charts?.salesByPeriod?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.salesByPeriod}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                        tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        labelStyle={{fontWeight: 900, textTransform: 'uppercase', color: '#1e293b'}}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#4F46E5" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        name="Receita (R$)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        fill="transparent" 
                        name="Qtd. Vendas"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <BarChart3 className="h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Nenhum dado de venda no período</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* DEMOGRAPHICS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GENDER CHART */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PieIcon className="h-4 w-4 text-indigo-600" />
                  <CardTitle className="text-sm font-bold text-slate-800">Público por Sexo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts?.salesByGender || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(charts?.salesByGender || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-3">
                    {(charts?.salesByGender || []).map((item: any, index: number) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                          <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AGE CHART */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <CardTitle className="text-sm font-bold text-slate-800">Faixa Etária</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts?.salesByAge || []}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#4F46E5" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                        name="Compradores"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* INSIGHTS / ALERT */}
          {hasPostsWithoutCaption && (
            <Card className="border-none bg-amber-50 shadow-sm border-l-4 border-amber-400">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-900">Insight de Engajamento</h4>
                    <p className="text-[10px] text-amber-800 font-bold uppercase opacity-70">Você tem fotos sem legenda no feed. Isso reduz sua conversão!</p>
                  </div>
                </div>
                <Link 
                  to="/organizer/feed" 
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all"
                >
                  Corrigir Agora
                </Link>
              </CardContent>
            </Card>
          )}

        </main>
      </div>
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
