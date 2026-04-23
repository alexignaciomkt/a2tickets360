
import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
  DollarSign,
  Palette,
  UserCheck,
  User,
  ShieldCheck,
  MapPin,
  Store,
  TrendingUp,
  Truck,
  Handshake,
  Share2,
  Activity,
  LayoutDashboard,
  Zap,
  Target,
  Database,
  ShieldAlert,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import SupportBot from './SupportBot';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'customer' | 'organizer' | 'admin';
}

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Define navigation items based on user type
  const getNavItems = () => {
    switch (userType) {
      case 'customer':
        return [
          {
            category: 'Geral',
            items: [
              { name: 'Início', path: '/dashboard', icon: Home },
              { name: 'Meus Ingressos', path: '/dashboard/tickets', icon: Calendar },
              { name: 'Configurações', path: '/dashboard/settings', icon: Settings },
            ]
          }
        ];
      case 'organizer':
        return [
          {
            category: 'Geral',
            icon: Home,
            items: [
              { name: 'Dashboard BI', path: '/organizer/dashboard', icon: LayoutDashboard },
              { name: 'Meu Perfil (Público)', path: '/organizer/settings', icon: User },
              { name: 'Meus Eventos', path: '/organizer/events', icon: Calendar },
            ]
          },
          {
            category: 'Operações & Staff',
            icon: Users,
            items: [
              { name: 'Mailing Gold', path: '/organizer/visitors', icon: Users },
              { name: 'Gestão de Staff', path: '/organizer/staff', icon: UserCheck },
              { name: 'Check-in', path: '/organizer/checkin', icon: ChevronRight },
            ]
          },
          {
            category: 'Logística & Fornecedores',
            icon: Truck,
            items: [
              { name: 'Gestão de Fornecedores', path: '/organizer/suppliers', icon: Truck },
              { name: 'Painel do Expositor', path: '/organizer/exhibitor', icon: Store },
              { name: 'Pontos de Venda', path: '/organizer/sales-points', icon: MapPin },
            ]
          },
          {
            category: 'Vendas & Branding',
            icon: Palette,
            items: [
              { name: 'Gestão de Stands', path: '/organizer/stands', icon: Store },
              { name: 'Gestão de Patrocinadores', path: '/organizer/sponsors', icon: Handshake },
              { name: 'Loja/FanPage', path: '/organizer/store', icon: Store },
              { name: 'Designer de Ingressos', path: '/organizer/ticket-designer', icon: Palette },
              { name: 'Validação de Ingressos', path: '/organizer/ticket-validation', icon: ShieldCheck },
            ]
          },
          {
            category: 'BI & Financeiro',
            icon: DollarSign,
            items: [
              { name: 'Financeiro', path: '/organizer/financial', icon: DollarSign },
              { name: 'Relatórios', path: '/organizer/reports', icon: ChevronRight },
              { name: 'Relatórios Financeiros', path: '/organizer/staff/financial', icon: TrendingUp },
            ]
          },
          {
            category: 'Sistema',
            icon: Settings,
            items: [
              { name: 'Configurações', path: '/organizer/settings', icon: Settings },
            ]
          }
        ];
      case 'admin':
        return [
          {
            category: 'Principal',
            icon: Home,
            items: [
              { name: 'Dashboard', path: '/master', icon: Home },
              { name: 'Gerenciar Organizadores', path: '/master/organizers', icon: Users },
              { name: 'Aprovar Eventos', path: '/master/approve', icon: Calendar },
            ]
          },
          {
            category: 'Financeiro',
            icon: DollarSign,
            items: [
              { name: 'Dashboard Financeiro', path: '/master/financial', icon: DollarSign },
              { name: 'Transações', path: '/master/transactions', icon: DollarSign },
              { name: 'Repasses', path: '/master/payouts', icon: DollarSign },
              { name: 'Comissões', path: '/master/commissions', icon: DollarSign },
            ]
          },
          {
            category: 'Monitoramento',
            icon: ChevronRight,
            items: [
              { name: 'Mailing Global (Leads)', path: '/master/mailing', icon: Users },
              { name: 'Alertas', path: '/master/alerts', icon: ChevronRight },
              { name: 'Relatórios', path: '/master/reports', icon: ChevronRight },
            ]
          },
          {
            category: 'Gestão do Site',
            icon: LayoutDashboard,
            items: [
              { name: 'Banners da Home', path: '/master/banners', icon: ImageIcon },
              { name: 'Gestão de FAQ', path: '/master/faq', icon: HelpCircle },
              { name: 'Gestão do Site (CMS)', path: '/master/site-management', icon: LayoutDashboard },
              { name: 'Configurações Globais', path: '/master/settings', icon: Settings },
              { name: 'Webhooks & Integrações', path: '/master/webhooks', icon: Share2 },
            ]
          }
        ];
      default:
        return [];
    }
  };

  const categories = getNavItems();

  // Initialize state from localStorage if available
  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('A2 Tickets 360_sidebar_categories');
    return saved ? JSON.parse(saved) : (userType === 'admin' ? ['Principal'] : ['Geral']);
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('A2 Tickets 360_sidebar_categories', JSON.stringify(openCategories));
  }, [openCategories]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Helper function to determine active route
  const isActive = (path: string) => location.pathname === path;

  // Dashboard title based on user type
  const getDashboardTitle = () => {
    switch (userType) {
      case 'customer':
        return 'Minha Conta';
      case 'organizer':
        return 'Painel do Produtor';
      case 'admin':
        return 'Painel Master';
      default:
        return 'Painel';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 rounded-xl bg-white shadow-md text-slate-900 border border-slate-200 active:scale-95 transition-all"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 fixed md:relative z-40 w-72 transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } shadow-sm`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-white">
            <Link to="/" className="block transition-opacity hover:opacity-80">
               <Logo variant="default" showText={true} />
            </Link>
            <div className="mt-6 flex items-center gap-2">
               <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
               <p className="text-xs text-slate-500 font-semibold">{getDashboardTitle()}</p>
            </div>
          </div>

          <nav className="py-6 flex-grow overflow-y-auto custom-scrollbar px-4 space-y-4">
            {categories.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {cat.icon && <cat.icon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                    <span className="truncate">{cat.category}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 opacity-50 group-hover:opacity-100 ${openCategories.includes(cat.category) ? 'rotate-90 text-slate-900' : ''}`} />
                </button>

                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${openCategories.includes(cat.category) ? 'max-h-[600px] opacity-100 py-1' : 'max-h-0 opacity-0'}`}>
                  {cat.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-colors relative group ${active
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
                        )}
                        <item.icon className={`h-4 w-4 mr-3 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <Link
              to="/"
              className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair do Sistema
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 z-10 px-8 py-5 flex items-center justify-between">
            <div className="flex flex-col">
               <h2 className="text-xl font-bold text-slate-800">{getDashboardTitle()}</h2>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <p className="text-xs font-medium text-slate-500">Sistema Online</p>
               </div>
            </div>

            {/* Topbar Actions */}
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-semibold text-slate-600">Serviços Estáveis</span>
               </div>
               <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
               </div>
            </div>
        </header>

        {/* Info Banner for Organizer Onboarding */}
        {userType === 'organizer' && user && user.status === 'pending' && user.profileComplete && (
          <div className="bg-indigo-600 border-b border-indigo-700 px-8 py-4 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-white max-w-3xl">
                Sua conta está em análise. Você pode começar a cadastrar eventos, mas a publicação dependerá da aprovação da equipe técnica.
              </p>
            </div>
            <Button variant="secondary" className="font-semibold text-indigo-700">
               Verificar Status
            </Button>
          </div>
        )}

        {/* Global Producer Context Bar */}
        {userType === 'organizer' && user && (
          <div className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : (user.companyName || user.name || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <h1 className="text-lg font-bold text-slate-800">
                     {user.companyName || user.name || 'Produtor'}
                   </h1>
                   {userType !== 'admin' && (
                     (user.status === 'approved' && user.profileComplete) ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Aprovado</Badge>
                     ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Em Análise</Badge>
                     )
                   )}
                </div>
                {userType !== 'admin' && (
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <p>
                      ID: <span className="font-medium text-slate-700">{user.id.slice(0, 8)}</span>
                    </p>
                    <span>&bull;</span>
                    <p>
                      Membro desde: <span className="font-medium text-slate-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '---'}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
               {userType !== 'admin' && (
                 <div className="hidden lg:flex items-center gap-6 px-6 border-r border-slate-200">
                    <div className="text-right">
                       <p className="text-xs font-semibold text-slate-500 mb-0.5">Saldo Disponível</p>
                       <p className="text-sm font-bold text-slate-800">R$ 0,00</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-semibold text-slate-500 mb-0.5">Eventos</p>
                       <p className="text-sm font-bold text-slate-800">0</p>
                    </div>
                 </div>
               )}
               
               <Link to={userType === 'admin' ? '/master/settings' : '/organizer/settings'} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                 <Settings className="w-5 h-5" />
               </Link>
               
               {userType !== 'admin' && (
                 <Button className="font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6">
                    Ir para Loja <ChevronRight className="w-4 h-4 ml-2" />
                 </Button>
               )}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-10 bg-white">
          {children}
        </main>
        <SupportBot />
      </div>
    </div>
  );
};

export default DashboardLayout;
