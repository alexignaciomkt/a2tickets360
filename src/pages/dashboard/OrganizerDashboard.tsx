import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Loader2, 
  Filter,
  ChevronRight,
  Target,
  PieChart as PieIcon,
  BarChart3,
  Download,
  Info,
  Activity,
  MapPin,
  CalendarDays,
  DollarSign,
  ChevronDown,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { organizerService } from '@/services/organizerService';
import { Event } from '@/interfaces/organizer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['all']);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [biData, setBiData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // UI States para os menus
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const organizerId = user?.id || '';

  useEffect(() => {
    // Definir período inicial: últimos 30 dias
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);

    if (!organizerId) return;
    const loadInitialData = async () => {
      try {
        const eventsData = await organizerService.getEvents(organizerId);
        setEvents(eventsData);
        await refreshStats(['all'], thirtyDaysAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [organizerId]);

  const refreshStats = async (evts: string[], start: string, end: string) => {
    setIsLoading(true);
    try {
      // API mockada pro MVP de vendas
      const stats = await organizerService.getBIStats(organizerId, evts[0] === 'all' ? 'all' : evts.join(','));
      setBiData(stats);

      // Dados REAIS de Analytics (Visitas)
      const analytics = await organizerService.getAnalyticsSummary(organizerId);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error refreshing BI stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportDashboard = async (format: 'pdf' | 'jpeg') => {
    if (!reportRef.current) return;
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      if (format === 'jpeg') {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Relatorio_Produtor_${new Date().toISOString().split('T')[0]}.jpg`;
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Relatorio_Produtor_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEventToggle = (eventId: string) => {
    if (eventId === 'all') {
      setSelectedEvents(['all']);
    } else {
      setSelectedEvents(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (newSelection.includes(eventId)) {
          return newSelection.filter(id => id !== eventId).length === 0 ? ['all'] : newSelection.filter(id => id !== eventId);
        } else {
          return [...newSelection, eventId];
        }
      });
    }
  };

  const handleApplyFilters = () => {
    refreshStats(selectedEvents, startDate, endDate);
  };

  const formatCurrency = (value: number) => {
    const safeValue = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeValue);
  };

  const QuickStat = ({ title, value, icon: Icon, color, suffix = '' }: any) => (
    <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all duration-500">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 leading-none">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none tabular-nums">
            {isLoading ? '---' : value}
            {suffix && <span className="text-sm font-bold text-slate-400 ml-1">{suffix}</span>}
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white transition-transform group-hover:scale-110 shadow-sm ${
          color === 'indigo' ? 'bg-indigo-600 text-white' : 
          color === 'emerald' ? 'bg-emerald-500 text-white' : 
          color === 'amber' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading && !biData) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Construindo seu centro de inteligência...</p>
        </div>
      </DashboardLayout>
    );
  }

  const kpis = biData?.kpis || { currentRevenue: 0, ticketsSold: 0, estimatedRevenue: 0, occupancyRate: 0 };
  const salesByEventData = biData?.charts?.salesByEvent || [];
  const genderData = biData?.charts?.salesByGender || [];
  const ageData = biData?.charts?.salesByAge || [];
  const performanceData = biData?.charts?.salesPerformance || [];
  const revenueData = biData?.charts?.revenueOverTime || [];
  const locationData = biData?.charts?.usersByLocation || [];

  return (
    <DashboardLayout userType="organizer">
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
        
        {/* CABEÇALHO DO DASHBOARD (Master Style) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 relative z-20">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
               <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Relatório Executivo</h1>
               <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-inner">Dashboard</Badge>
            </div>
            <p className="text-[11px] font-medium text-slate-500 tracking-tight leading-none">Visão consolidada do seu negócio em tempo real.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
            {/* Filtro de Eventos */}
            <div className="relative">
              <Button 
                variant="ghost" 
                onClick={() => setShowEventMenu(!showEventMenu)}
                className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50"
              >
                <Filter className="w-3 h-3 mr-1.5" />
                {selectedEvents.includes('all') ? 'Todos os Eventos' : `${selectedEvents.length} Eventos`}
                <ChevronDown className="w-3 h-3 ml-1.5 opacity-50" />
              </Button>
              {showEventMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50">
                  <div 
                    className={`text-[10px] font-bold uppercase tracking-wide cursor-pointer p-2 rounded-lg transition-colors ${selectedEvents.includes('all') ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
                    onClick={() => handleEventToggle('all')}
                  >
                    Todos os Eventos
                  </div>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {events.map(e => (
                      <div 
                        key={e.id}
                        className={`text-[10px] font-bold uppercase tracking-wide cursor-pointer p-2 rounded-lg transition-colors ${selectedEvents.includes(e.id) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
                        onClick={() => handleEventToggle(e.id)}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-gray-200" />

            {/* Filtro de Data */}
            <div className="flex items-center gap-1">
              <div className="flex items-center px-2">
                <CalendarDays className="w-3 h-3 text-slate-400 mr-1.5" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wide text-slate-700 focus:outline-none w-[90px]"
                />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Até</span>
              <div className="flex items-center px-2">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wide text-slate-700 focus:outline-none w-[90px]"
                />
              </div>
            </div>

            <Button 
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white h-8 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm px-3"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3 mr-1.5" />}
              {!isLoading && "Atualizar"}
            </Button>

            <div className="w-px h-4 bg-gray-200" />

            {/* Exportar */}
            <div className="relative">
              <Button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                variant="ghost"
                className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50"
              >
                {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Download className="h-3 w-3 mr-1.5" />}
                Exportar
                <ChevronDown className="w-3 h-3 ml-1.5 opacity-50" />
              </Button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-xl p-1 z-50 flex flex-col gap-1">
                  <Button variant="ghost" className="justify-start text-[10px] font-black uppercase tracking-wider text-slate-700 rounded-lg" onClick={() => exportDashboard('pdf')}>
                    <FileText className="w-3 h-3 mr-2 text-rose-500" /> PDF
                  </Button>
                  <Button variant="ghost" className="justify-start text-[10px] font-black uppercase tracking-wider text-slate-700 rounded-lg" onClick={() => exportDashboard('jpeg')}>
                    <ImageIcon className="w-3 h-3 mr-2 text-emerald-500" /> JPEG
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ÁREA DE RELATÓRIO PRINCIPAL (Ref para captura) */}
        <div className="space-y-6" ref={reportRef} style={{ backgroundColor: '#ffffff', padding: '2px', borderRadius: '8px' }}>
          
          {/* QUICK STATS MATRIX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStat title="Faturamento Líquido" value={formatCurrency(kpis.currentRevenue)} icon={DollarSign} color="emerald" />
            <QuickStat title="Ingressos Vendidos" value={kpis.ticketsSold} suffix="/ UN" icon={Target} color="indigo" />
            <QuickStat title="Eventos Ativos" value={events.length} icon={CalendarDays} color="amber" />
            <QuickStat title="Total de Visitas" value={analyticsData.length} icon={Users} color="rose" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. VENDAS POR EVENTO (Linha Empilhada/Area) */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group">
              <CardHeader className="p-5 pb-3 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Activity className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-wide text-slate-900 leading-none">
                    Top 10 Eventos (Vendas)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByEventData} layout="vertical" margin={{ left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} width={100} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="vendas" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} name="Vendas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 4. PERFORMANCE POR PERÍODO (Múltiplas Linhas para Eventos) */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group">
              <CardHeader className="p-5 pb-3 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-wide text-slate-900 leading-none">
                    Performance de Vendas (Evolução)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                      {/* Renderizando dinamicamente as linhas baseado nas chaves disponíveis, ignorando 'date' e 'revenue' */}
                      {Object.keys(performanceData[0] || {}).filter(k => k !== 'date' && k !== 'revenue').map((key, index) => (
                        <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={false} activeDot={{r: 6}} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 5. FATURAMENTO AO LONGO DO TEMPO */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group">
              <CardHeader className="p-5 pb-3 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-wide text-slate-900 leading-none">
                    Faturamento x Tempo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `R$${(val/1000)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} dot={{r: 2, fill: '#F59E0B'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 6. USUÁRIOS POR LOCALIDADE (Barras Horizontais) */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group">
              <CardHeader className="p-5 pb-3 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-wide text-slate-900 leading-none">
                    Público por Localidade
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationData} layout="vertical" margin={{ left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} width={120} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="value" fill="#EC4899" radius={[0, 4, 4, 0]} barSize={20} name="Pessoas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 2. DEMOGRAFIA GERAL: GÊNERO E IDADE */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group col-span-1 lg:col-span-2">
              <CardHeader className="p-5 pb-3 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-wide text-slate-900 leading-none">
                    Perfil Demográfico do Público
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row h-auto md:h-[250px] gap-8 pt-4">
                  
                  {/* Gráfico 2: Gênero (Pizza) */}
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Gênero</p>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                          >
                            {genderData.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="w-px bg-slate-100 hidden md:block" />

                  {/* Gráfico 3: Idade (Barras Verticais) */}
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Faixa Etária</p>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                          <YAxis hide />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                          <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={25} name="Pessoas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>

          {/* 7. ANALYTICS DE VISITAS (DADOS REAIS) */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group">
              <CardHeader className="p-5 pb-3 border-b border-gray-50 bg-gray-50/30 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-[11px] font-black uppercase tracking-wide text-slate-900 leading-none">
                      Tráfego das Páginas (Views Reais)
                    </CardTitle>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-inner">
                    Real-time
                  </Badge>
                </div>
                <CardDescription className="text-[10px] font-medium text-slate-500 tracking-tight leading-snug ml-11">
                  Contagem de acessos à sua vitrine e páginas de eventos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      // Processar analyticsData para o gráfico
                      const counts: any = {};
                      analyticsData.forEach(view => {
                        let label = 'Vitrine Produtor';
                        if (view.view_type === 'event_page' && view.event_id) {
                          const event = events.find(e => e.id === view.event_id);
                          label = event ? event.title : 'Evento Desconhecido';
                        }
                        counts[label] = (counts[label] || 0) + 1;
                      });
                      return Object.entries(counts).map(([name, views]) => ({ name, views }));
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        cursor={{fill: 'rgba(0,0,0,0.02)'}}
                      />
                      <Bar dataKey="views" fill="#7C3AED" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
