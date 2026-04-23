
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
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{isLoading ? '---' : value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
          color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
          color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
  const ModuleCard = ({ title, description, icon: Icon, stats: moduleStats, buttonText, onClick, color = "indigo" }: any) => (
    <Card className="border-none shadow-sm bg-white overflow-hidden flex flex-col h-full group hover:shadow-md transition-all">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm ${
           color === 'indigo' ? 'bg-indigo-600 text-white' : 
           color === 'emerald' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
        <p className="text-sm font-medium text-slate-500 mt-2">{description}</p>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4 mb-8">
          {moduleStats.map((s: any, i: number) => (
            <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
              <span className="text-sm font-semibold text-slate-500">{s.label}</span>
              <span className="text-sm font-bold text-slate-900">{isLoading ? '---' : s.value}</span>
            </div>
          ))}
        </div>
        <Button onClick={onClick} className="w-full bg-slate-800 text-white hover:bg-slate-900 h-8 text-xs font-medium rounded-md shadow-sm transition-all">
          {buttonText} <ChevronRight className="w-3 h-3 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );;

  if (error && !stats) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center py-48 space-y-8 animate-in fade-in duration-1000">
          <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 shadow-sm">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>
          <div className="text-center space-y-2">
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
      <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
        
        {/* Master Command Center Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <h1 className="text-lg font-bold text-slate-800 tracking-tight">Visão Geral do Sistema</h1>
                 <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none text-[10px] py-0.5">Acesso Root</Badge>
              </div>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Bem-vindo ao painel central, <span className="font-semibold text-slate-700">{user?.name || 'Administrador'}</span>. Monitore produtores, vendas e eventos da Ticketera.
              </p>
           </div>
           
           <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="hidden sm:block text-right">
                 <p className="text-xs font-semibold text-slate-500">Status Geral</p>
                 <div className="flex items-center justify-end gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-bold text-slate-800">Operacional</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Dynamic Matrix Stats Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickStat title="Total de Usuários" value={(stats?.totalUsers || 0).toLocaleString('pt-BR')} icon={Users} color="indigo" />
          <QuickStat title="Produtores Ativos" value={stats?.activeOrganizers || 0} icon={ShieldCheck} color="emerald" />
          <QuickStat title="Eventos Pendentes" value={stats?.pendingEvents || 0} icon={Activity} color="amber" />
          <QuickStat title="Eventos no Mês" value={stats?.eventsThisMonth || 0} icon={Calendar} color="rose" />
        </div>

        {/* Master Operational Units Hierarchy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModuleCard 
            title="Gestão de Produtores"
            description="Aprovação de contas KYC, documentos e gestão de organizadores da plataforma."
            icon={Users}
            color="indigo"
            stats={[
              { label: "Total de Produtores", value: stats?.totalOrganizers || 0 },
              { label: "Análises Pendentes", value: stats?.pendingOrganizers || 0 },
              { label: "Produtores Ativos", value: stats?.activeOrganizers || 0 },
            ]}
            buttonText="Gerenciar Produtores"
            onClick={() => navigate('/master/organizers')}
          />
          <ModuleCard 
            title="Gestão Financeira"
            description="Controle de vendas, recebimentos, comissões da plataforma e repasses."
            icon={DollarSign}
            color="emerald"
            stats={[
              { label: "Volume Total (GMV)", value: `R$ ${(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { label: "Lucro da Plataforma", value: `R$ ${(stats?.totalCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { label: "Saques Pendentes", value: stats?.totalPayouts || 0 },
            ]}
            buttonText="Painel Financeiro"
            onClick={() => navigate('/master/financial')}
          />
          <ModuleCard 
            title="Gestão de Eventos"
            description="Moderação de catálogo, aprovação de eventos e acompanhamento de publicações."
            icon={CheckCircle}
            color="slate"
            stats={[
              { label: "Aguardando Moderação", value: stats?.pendingEvents || 0 },
              { label: "Eventos Publicados", value: stats?.totalEvents || 0 },
            ]}
            buttonText="Aprovar Eventos"
            onClick={() => navigate('/master/approve')}
          />
        </div>

        {/* Advanced Tooling Grid Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="lg:col-span-3">
              <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
                 <CardHeader className="p-6 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
                       <Zap className="w-5 h-5 text-indigo-600" /> Ferramentas Adicionais
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {[
                         { title: 'Mailing de Leads', icon: Users, url: '/master/mailing', desc: 'Base de clientes' },
                         { title: 'Gestão CMS', icon: Layout, url: '/master/site-management', desc: 'Banners e Site' },
                         { title: 'Integrações', icon: Share2, url: '/master/webhooks', desc: 'Webhooks' },
                         { title: 'Relatórios', icon: BarChart2, url: '/master/reports', desc: 'BI & Analytics' },
                         { title: 'Alertas', icon: Bell, url: '/master/alerts', desc: 'Avisos e Segurança' },
                         { title: 'Configurações', icon: Settings, url: '/master/settings', desc: 'Taxas globais' },
                       ].map((tool, i) => (
                         <Link key={i} to={tool.url} className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all flex items-start gap-4 group">
                            <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                               <tool.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{tool.title}</h4>
                              <p className="text-xs font-medium text-slate-500 mt-1">{tool.desc}</p>
                            </div>
                         </Link>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>
           
           <div className="flex flex-col gap-6">
              <Card className="border-none bg-rose-50 border border-rose-100 shadow-sm flex-1">
                 <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-sm font-bold text-rose-700 flex items-center gap-2">
                       <ShieldAlert className="w-5 h-5" /> Alertas Recentes
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-4">
                       {[
                         { t: 'Tentativa de Fraude', d: 'Múltiplos cartões detectados' }, 
                         { t: 'Evento Suspeito', d: 'Novo evento aguardando análise' }
                       ].map((a, i) => (
                         <div key={i} className="space-y-1 border-l-2 border-rose-400 pl-3">
                            <p className="text-xs font-bold text-slate-800">{a.t}</p>
                            <p className="text-xs text-slate-600">{a.d}</p>
                         </div>
                       ))}
                       <Button onClick={() => navigate('/master/alerts')} variant="outline" className="w-full mt-6 text-xs text-rose-600 border-rose-200 hover:bg-rose-100">
                          Ver todos alertas
                       </Button>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MasterAdminPanel;
