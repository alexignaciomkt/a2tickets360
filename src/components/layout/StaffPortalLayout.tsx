
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Users,
    Calendar,
    Wallet,
    Award,
    LogOut,
    Menu,
    X,
    Bell,
    User,
    LayoutDashboard,
    Briefcase
} from 'lucide-react';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

interface StaffPortalLayoutProps {
    children: React.ReactNode;
}

const StaffPortalLayout = ({ children }: StaffPortalLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/staff/portal' },
        { name: 'Minhas Propostas', icon: Briefcase, path: '/staff/portal/proposals' },
        { name: 'Minha Agenda', icon: Calendar, path: '/staff/portal/agenda' },
        { name: 'Financeiro', icon: Wallet, path: '/staff/portal/financial' },
        { name: 'Meu Perfil', icon: User, path: '/staff/portal/profile' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-primary selection:text-white">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-[#0A0A0A] border-b border-white/5 sticky top-0 z-50">
                <Logo variant="compact" showText={true} className="text-white" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-white hover:bg-white/10"
                >
                    {isSidebarOpen ? <X /> : <Menu />}
                </Button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#0A0A0A] border-r border-white/5 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
                    <div className="h-full flex flex-col p-6">
                        <div className="mb-10 px-2 hidden lg:block">
                            <Logo variant="default" showText={true} className="text-white" />
                        </div>

                        <nav className="flex-1 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group
                    ${isActive(item.path)
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-4">
                            <div className="bg-[#111] p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white">
                                        JP
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tighter">João Porto</p>
                                        <div className="flex items-center gap-1 text-[10px] text-yellow-500">
                                            <Award className="w-3 h-3 fill-current" />
                                            <span>4.9 Star Staff</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Sair</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <header className="hidden lg:flex h-20 items-center justify-between px-8 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
                            {navItems.find(i => isActive(i.path))?.name || 'Portal do Staff'}
                        </h2>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-white/5 rounded-full">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#050505]"></span>
                            </Button>
                            <div className="h-8 w-px bg-white/5 mx-2"></div>
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <div className="text-right">
                                    <p className="text-xs font-black text-white group-hover:text-primary transition-colors italic">JOÃO PORTO</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Candidato Premium</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/5 group-hover:ring-primary/50 transition-all">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default StaffPortalLayout;
