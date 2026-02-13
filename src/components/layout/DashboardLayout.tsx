
import { ReactNode, useState } from 'react';
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
  TrendingUp
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
          { name: 'Início', path: '/dashboard', icon: Home },
          { name: 'Meus Ingressos', path: '/dashboard/tickets', icon: Calendar },
          { name: 'Fotos', path: '/dashboard/photos', icon: Users },
          { name: 'Configurações', path: '/dashboard/settings', icon: Settings },
        ];
      case 'organizer':
        return [
          { name: 'Dashboard', path: '/organizer', icon: Home },
          { name: 'Meus Eventos', path: '/organizer/events', icon: Calendar },
          { name: 'Participantes', path: '/organizer/attendees', icon: Users },
          { name: 'Gestão de Staff', path: '/organizer/staff', icon: UserCheck },
          { name: 'Cargos e Permissões', path: '/organizer/staff/roles', icon: ShieldCheck },
          { name: 'Relatórios Financeiros', path: '/organizer/staff/financial', icon: TrendingUp },
          { name: 'Banco de Talentos', path: '/organizer/staff/talent-pool', icon: Users },
          { name: 'Loja/FanPage', path: '/organizer/store', icon: Store },
          { name: 'Designer de Ingressos', path: '/organizer/ticket-designer', icon: Palette },
          { name: 'Validação de Ingressos', path: '/organizer/ticket-validation', icon: ShieldCheck },
          { name: 'Pontos de Venda', path: '/organizer/sales-points', icon: MapPin },
          { name: 'Relatórios', path: '/organizer/reports', icon: ChevronRight },
          { name: 'Financeiro', path: '/organizer/financial', icon: DollarSign },
          { name: 'Check-in', path: '/organizer/checkin', icon: ChevronRight },
          { name: 'Configurações', path: '/organizer/settings', icon: Settings },
        ];
      case 'admin':
        return [
          // Páginas Principais
          { name: 'Dashboard', path: '/master', icon: Home },
          { name: 'Gerenciar Organizadores', path: '/master/organizers', icon: Users },
          { name: 'Aprovar Eventos', path: '/master/approve', icon: Calendar },
          { name: 'Alertas', path: '/master/alerts', icon: ChevronRight },
          { name: 'Relatórios', path: '/master/reports', icon: ChevronRight },

          // Páginas Financeiras
          { name: 'Dashboard Financeiro', path: '/master/financial', icon: DollarSign },
          { name: 'Transações', path: '/master/transactions', icon: DollarSign },
          { name: 'Repasses', path: '/master/payouts', icon: DollarSign },
          { name: 'Comissões', path: '/master/commissions', icon: DollarSign },

          // Configurações
          { name: 'Configurações', path: '/master/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

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
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Logo variant="default" showText={true} />
            <p className="text-sm text-gray-500 mt-1">{getDashboardTitle()}</p>
          </div>

          <nav className="py-6 flex-grow overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-6 py-3 text-sm ${active
                        ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                      {active && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-6 border-t">
            <Link
              to="/"
              className="flex items-center text-sm text-gray-600 hover:text-primary"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
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
