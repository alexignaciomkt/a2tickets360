
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
  ShieldCheck,
  MapPin,
  Store,
  TrendingUp,
  Truck,
  Handshake
} from 'lucide-react';
import Logo from '@/components/ui/logo';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'customer' | 'organizer' | 'admin';
}

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
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
              { name: 'Dashboard', path: '/organizer', icon: Home },
              { name: 'Meus Eventos', path: '/organizer/events', icon: Calendar },
              { name: 'Participantes', path: '/organizer/attendees', icon: Users },
            ]
          },
          {
            category: 'Operações & Staff',
            icon: Users,
            items: [
              { name: 'Gestão de Staff', path: '/organizer/staff', icon: UserCheck },
              { name: 'Cargos e Permissões', path: '/organizer/staff/roles', icon: ShieldCheck },
              { name: 'Banco de Talentos', path: '/organizer/staff/talent-pool', icon: Users },
              { name: 'Gestão de Visitantes', path: '/organizer/visitors', icon: Users },
              { name: 'Check-in', path: '/organizer/checkin', icon: ChevronRight },
            ]
          },
          {
            category: 'Logística & Fornecedores',
            icon: Truck,
            items: [
              { name: 'Gestão de Fornecedores', path: '/organizer/suppliers', icon: Truck },
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
              { name: 'Alertas', path: '/master/alerts', icon: ChevronRight },
              { name: 'Relatórios', path: '/master/reports', icon: ChevronRight },
            ]
          },
          {
            category: 'Configurações',
            icon: Settings,
            items: [
              { name: 'Configurações', path: '/master/settings', icon: Settings },
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
            <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-widest">{getDashboardTitle()}</p>
          </div>

          <nav className="py-4 flex-grow overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.category} className="px-3">
                  <button
                    onClick={() => toggleCategory(cat.category)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors group text-left"
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
                            : 'text-gray-500 hover:bg-gray-50'
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
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold">{getDashboardTitle()}</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
