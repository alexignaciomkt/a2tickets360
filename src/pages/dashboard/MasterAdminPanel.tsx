
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, CheckCircle, FileText, 
  AlertTriangle, BarChart2, Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeaderSection from '@/components/dashboard/AdminHeaderSection';
import StatCard from '@/components/dashboard/StatCard';
import FunctionCard from '@/components/dashboard/FunctionCard';
import SystemCard from '@/components/dashboard/SystemCard';
import AlertCard from '@/components/dashboard/AlertCard';

const MasterAdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estatísticas mock para o dashboard
  const stats = {
    totalUsers: 8562,
    activeOrganizers: 124,
    pendingApprovals: 37,
    totalRevenue: 284750.56,
    commissions: 28475.05,
    alertsCount: 5,
    eventsThisMonth: 42
  };

  // Alertas mock para o dashboard
  const alerts = [
    {
      title: "Transações suspeitas detectadas",
      description: "Múltiplas compras de ingressos com o mesmo cartão em eventos diferentes",
      severity: "high" as const,
    },
    {
      title: "Evento com descrição questionável",
      description: "Evento \"Festa Secreta\" contém detalhes imprecisos e potencialmente suspeitos",
      severity: "medium" as const,
    },
    {
      title: "Organizador com reportes negativos",
      description: "3 usuários reportaram problemas com o organizador \"Festas Elite\"",
      severity: "low" as const,
    }
  ];

  // Configuração dos cards de funções
  const functionCards = [
    {
      title: "Gerenciar Organizadores",
      icon: Users,
      description: "Aprovar novos organizadores, visualizar estatísticas e gerenciar permissões.",
      stats: [
        { label: "Total de Organizadores", value: stats.activeOrganizers },
        { label: "Aguardando Aprovação", value: 8 },
        { label: "Novos no Último Mês", value: 24 },
      ],
      buttonText: "Ver Todos",
      onButtonClick: () => navigate('/master/organizers'),
    },
    {
      title: "Comissões e Financeiro",
      icon: DollarSign,
      description: "Acompanhe receitas, comissões e transações financeiras da plataforma.",
      stats: [
        { label: "Faturamento Total", value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { label: "Comissões", value: `R$ ${stats.commissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { label: "Repasses (Mês)", value: 32 },
      ],
      buttonText: "Ver Dashboard",
      onButtonClick: () => navigate('/master/financial'),
    },
    {
      title: "Aprovar Eventos",
      icon: CheckCircle,
      description: "Revisar e aprovar novos eventos submetidos pelos organizadores.",
      stats: [
        { label: "Aguardando Aprovação", value: stats.pendingApprovals },
        { label: "Aprovados Hoje", value: 12 },
        { label: "Rejeitados (Semana)", value: 5 },
      ],
      buttonText: "Ver Pendentes",
      onButtonClick: () => navigate('/master/approve'),
    },
  ];

  // Configuração dos cards de sistema
  const systemCards = [
    {
      title: "Sistema Financeiro",
      icon: DollarSign,
      modules: [
        {
          title: "Dashboard Financeiro",
          icon: BarChart2,
          description: "Visão geral das finanças, gráficos e métricas importantes.",
          url: "/master/financial",
          onNavigate: (url: string) => navigate(url),
        },
        {
          title: "Transações",
          icon: DollarSign,
          description: "Gerenciar todas as transações financeiras realizadas na plataforma.",
          url: "/master/transactions",
          onNavigate: (url: string) => navigate(url),
        },
        {
          title: "Repasses aos Organizadores",
          icon: FileText,
          description: "Gerenciar pagamentos e repasses financeiros para organizadores.",
          url: "/master/payouts",
          onNavigate: (url: string) => navigate(url),
        },
      ],
    },
    {
      title: "Relatórios e Análises",
      icon: FileText,
      modules: [
        {
          title: "Relatórios por Cidade",
          icon: BarChart2,
          description: "Visualize estatísticas e performance por cidade e região.",
          url: "/master/reports?filter=city",
          onNavigate: (url: string) => navigate(url),
        },
        {
          title: "Relatórios por Data",
          icon: Calendar,
          description: "Analise tendências por período e sazonalidade.",
          url: "/master/reports?filter=date",
          onNavigate: (url: string) => navigate(url),
        },
        {
          title: "Relatórios por Tipo de Evento",
          icon: FileText,
          description: "Compare performance entre categorias e tipos de eventos.",
          url: "/master/reports?filter=type",
          onNavigate: (url: string) => navigate(url),
        },
      ],
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <AdminHeaderSection 
          title="Painel Administrativo Master"
          subtitle="Bem-vindo(a),"
          userName={user?.name || 'Administrador'}
          photoUrl={user?.photoUrl || 'https://i.pravatar.cc/150'}
        />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Usuários Totais" 
            value={stats.totalUsers.toLocaleString('pt-BR')}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          
          <StatCard 
            title="Organizadores Ativos" 
            value={stats.activeOrganizers}
            icon={Users}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          
          <StatCard 
            title="Eventos Aguardando" 
            value={stats.pendingApprovals}
            icon={CheckCircle}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          
          <StatCard 
            title="Eventos este Mês" 
            value={stats.eventsThisMonth}
            icon={Calendar}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>
        
        {/* Main Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {functionCards.map((card, index) => (
            <FunctionCard 
              key={index}
              title={card.title}
              icon={card.icon}
              description={card.description}
              stats={card.stats}
              buttonText={card.buttonText}
              onButtonClick={card.onButtonClick}
            />
          ))}
          
          {systemCards.map((card, index) => (
            <SystemCard 
              key={index}
              title={card.title}
              icon={card.icon}
              modules={card.modules}
            />
          ))}
          
          {/* Alerts Card */}
          <AlertCard 
            alertCount={stats.alertsCount} 
            alerts={alerts}
            onViewAllClick={() => navigate('/master/alerts')}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MasterAdminPanel;
