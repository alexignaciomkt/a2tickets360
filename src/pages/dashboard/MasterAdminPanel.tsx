import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, DollarSign, CheckCircle, FileText,
  AlertTriangle, BarChart2, Calendar, Loader2, Share2, Settings,
  Activity, ArrowRight, ShieldCheck, Zap, Newspaper, Target,
  Layout, Bell, Search, History, ChevronRight, Database, Cpu, ShieldAlert, User, Check
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import masterService from '@/services/masterService';
import AdBanner from '@/components/ui/AdBanner';

const MasterAdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await masterService.getStats();
        setStats(data);
      } catch (err: any) {
        console.error('Erro ao buscar estatísticas do master:', err);
        setError(err.message || 'Erro ao carregar dados do painel central.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const QuickStat = ({ title, value, icon: Icon, color }: any) => (
    <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all duration-500">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 leading-none">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">{isLoading ? '---' : value}</h3>
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

  const ModuleCard = ({ title, description, icon: Icon, stats: moduleStats, buttonText, onClick, color = "indigo" }: any) => (
    <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden flex flex-col h-full group hover:shadow-lg transition-all duration-500">
      <CardHeader className="p-5 pb-3 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-3 mb-2">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-white ${
              color === 'indigo' ? 'bg-indigo-600 text-white' : 
              color === 'emerald' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
           }`}>
             <Icon className="w-4 h-4" />
           </div>
           <CardTitle className="text-[11px] font-black uppercase tracking-wide text-slate-900 leading-none">{title}</CardTitle>
        </div>
        <p className="text-[10px] font-medium text-slate-500 tracking-tight leading-snug">{description}</p>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div className="flex flex-col gap-2 mb-6">
          {moduleStats.map((s: any, i: number) => (
            <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{s.label}</span>
              <span className="text-sm font-black text-slate-900 tracking-tight tabular-nums">{isLoading ? '---' : s.value}</span>
            </div>
          ))}
        </div>
        <Button onClick={onClick} className="w-full bg-slate-900 text-white hover:bg-slate-800 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all group-hover:shadow-md">
          {buttonText} <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );

  if (error && !stats) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center py-48 space-y-6 animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Erro de Sincronização</h2>
            <p className="text-xs font-medium text-slate-500 max-w-sm">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="h-8 text-xs font-medium px-4 rounded-md bg-slate-800 text-white hover:bg-slate-900 shadow-sm transition-all">
            Tentar Novamente
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
        
        {/* Master Command Center Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                 <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">Visão Geral do Sistema</h1>
                 <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-inner">Root</Badge>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-tight leading-none">
                Bem-vindo ao painel central, <span className="font-bold text-slate-700">{user?.name || 'Administrador'}</span>.
              </p>
           </div>
           
           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Status Cluster</p>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-wide">Operacional</span>
              </div>
           </div>
        </div>

        {/* Dynamic Matrix Stats Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat title="Total de Usuários" value={(stats?.totalUsers || 0).toLocaleString('pt-BR')} icon={Users} color="indigo" />
          <QuickStat title="Produtores Ativos" value={stats?.activeOrganizers || 0} icon={ShieldCheck} color="emerald" />
          <QuickStat title="Eventos Pendentes" value={stats?.pendingEvents || 0} icon={Activity} color="amber" />
          <QuickStat title="Eventos no Mês" value={stats?.eventsThisMonth || 0} icon={Calendar} color="rose" />
        </div>

        {/* Master Operational Units Hierarchy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ModuleCard 
            title="Gestão de Produtores"
            description="Aprovação de contas KYC e gestão operacional."
            icon={Users}
            color="indigo"
            stats={[
              { label: "Total Registrado", value: stats?.totalOrganizers || 0 },
              { label: "Aguardando Análise", value: stats?.pendingOrganizers || 0 },
              { label: "Ativos na Plataforma", value: stats?.activeOrganizers || 0 },
            ]}
            buttonText="Gerenciar Produtores"
            onClick={() => navigate('/master/organizers')}
          />
          <ModuleCard 
            title="Gestão Financeira"
            description="Controle de vendas, recebimentos e repasses."
            icon={DollarSign}
            color="emerald"
            stats={[
              { label: "Volume Transacionado (GMV)", value: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { label: "Lucro Retido", value: `R$ ${(stats?.totalCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { label: "Saques na Fila", value: stats?.totalPayouts || 0 },
            ]}
            buttonText="Painel Financeiro"
            onClick={() => navigate('/master/financial')}
          />
          <ModuleCard 
            title="Gestão de Eventos"
            description="Moderação de catálogo e publicações."
            icon={CheckCircle}
            color="slate"
            stats={[
              { label: "Na Fila de Moderação", value: stats?.pendingEvents || 0 },
              { label: "Publicados Ativos", value: stats?.totalEvents || 0 },
            ]}
            buttonText="Aprovar Eventos"
            onClick={() => navigate('/master/approve')}
          />
        </div>

        {/* Advanced Tooling Grid Matrix */}
           <div className="lg:col-span-4">
              <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden h-full">
                 <CardHeader className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                    <CardTitle className="text-[11px] font-black uppercase tracking-wide text-slate-900 flex items-center gap-2">
                       <Zap className="w-4 h-4 text-indigo-600" /> Ferramentas do Sistema
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {[
                         { title: 'Mailing Global', icon: Users, url: '/master/mailing', desc: 'Analytics e Base KYC' },
                         { title: 'Gestão CMS', icon: Layout, url: '/master/site-management', desc: 'Banners e Interface' },
                         { title: 'Webhooks API', icon: Share2, url: '/master/webhooks', desc: 'Integrações Externas' },
                         { title: 'Relatórios', icon: BarChart2, url: '/master/reports', desc: 'Dashboards BI' },

                         { title: 'Configurações', icon: Settings, url: '/master/settings', desc: 'Parâmetros Globais' },
                       ].map((tool, i) => (
                         <Link key={i} to={tool.url} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-300 flex items-center gap-4 group/tool">
                            <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 border border-gray-100 group-hover/tool:bg-indigo-600 group-hover/tool:border-indigo-600 group-hover/tool:text-white transition-all shadow-sm">
                               <tool.icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{tool.title}</h4>
                              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight leading-none">{tool.desc}</p>
                            </div>
                         </Link>
                       ))}
                    </div>
                 </CardContent>
              </Card>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default MasterAdminPanel;
