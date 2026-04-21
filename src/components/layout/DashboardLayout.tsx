
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
  LayoutDashboard
} from 'lucide-react';
import Logo from '@/components/ui/logo';
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
            category: 'Configurações',
            icon: Settings,
            items: [
              { name: 'Configurações', path: '/master/settings', icon: Settings },
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
        return 'Painel do Organizador';
      case 'admin':
        return 'Painel Administrativo Master';
      default:
        return 'Painel';
    }
  };

  return (
    <div className="flex h-screen bg-page">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-full bg-white shadow-md text-text"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white shadow-md fixed md:relative z-40 w-64 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full uppercase">
          <div className="p-6 border-b">
            <Logo variant="default" showText={true} />
            <p className="text-[10px] text-gray-600 font-black mt-1 uppercase tracking-widest">{getDashboardTitle()}</p>
          </div>

          <nav className="py-4 flex-grow overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.category} className="px-3">
                  <button
                    onClick={() => toggleCategory(cat.category)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-primary transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 font-black">
                      {cat.icon && <cat.icon className="w-3.5 h-3.5 group-hover:text-primary shrink-0" />}
                      <span className="truncate">{cat.category}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ml-2 ${openCategories.includes(cat.category) ? 'rotate-90 text-primary' : ''}`} />
                  </button>

                  <div className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ${openCategories.includes(cat.category) ? 'max-h-[500px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                    {cat.items.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center px-6 py-2 rounded-xl text-[11px] font-black transition-all ${active
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className="h-4 w-4 mr-3 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-xs font-black text-red-600 hover:bg-red-50 rounded-xl transition-all uppercase tracking-tighter"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair do Sistema
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">{getDashboardTitle()}</h2>

            {/* Simplified Header Icons */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {userType === 'organizer' && user && user.status === 'pending' && user.profileComplete && (
          <div className="bg-amber-100 border-b border-amber-200 px-6 py-3 flex items-center justify-center gap-3">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">
              Sua conta está em análise! Você já pode navegar e criar eventos (em modo rascunho), mas não poderá publicar até a aprovação.
            </p>
          </div>
        )}

        {userType === 'organizer' && user && (
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
                {(user.companyName || user.name || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                  {user.companyName || user.name || 'Produtor Ticketera'}
                </h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Membro desde {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '---'}
                  </p>
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    ID: {user.id.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(user.status === 'approved' && user.profileComplete) ? (
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cadastro Verificado</span>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {user.profileComplete ? 'Em Análise' : 'Perfil Incompleto'}
                  </span>
                </div>
              )}
              
              <Link to="/organizer/settings" className="p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                <Settings className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        <SupportBot />
      </div>
    </div>
  );
};

export default DashboardLayout;
