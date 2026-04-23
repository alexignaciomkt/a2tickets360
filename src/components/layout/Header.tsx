
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, Search, User, Zap, LogOut, Settings, LayoutDashboard, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from '@/components/ui/logo';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${isHome ? 'bg-black/20 backdrop-blur-xl border-b border-white/5' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <Link to="/" className="hover:scale-105 transition-transform">
            <Logo variant="default" className={isHome ? 'brightness-200' : ''} />
          </Link>

          {/* Minimal Search (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
             <Link to="/events" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isHome ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-indigo-600'}`}>
                Explorar Eventos
             </Link>
             <Link to="/blog" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isHome ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-indigo-600'}`}>
                Conteúdo
             </Link>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* Universal Search Icon */}
          <button className={`p-2 rounded-full transition-colors ${isHome ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Search className="w-5 h-5" />
          </button>

          {/* Area do Produtor (High Impact) */}
          <Link to="/para-produtores" className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-2xl shadow-indigo-500/20 active:scale-95 group">
            <Zap className="w-4 h-4 fill-current group-hover:animate-bounce" />
            Área do Produtor
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1 pl-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition group">
                  <span className={`hidden md:block font-black text-[10px] uppercase tracking-widest ${isHome ? 'text-white' : 'text-gray-900'}`}>{user.name.split(' ')[0]}</span>
                  <img src={user.photoUrl || "https://i.pravatar.cc/100"} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-indigo-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-3 rounded-[2rem] shadow-2xl border-white/5 bg-[#0f1218] text-white">
                <DropdownMenuLabel className="px-4 py-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Minha Conta</p>
                  <p className="text-lg font-black truncate mt-1">{user.name}</p>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">
                    {user.role === 'master' ? '👑 Master Admin' : user.role === 'organizer' ? '🚀 Produtor' : '⚡ Participante'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 mx-2" />

                <div className="py-2 space-y-1">
                  {(user.role === 'master' || user.role === 'admin') && (
                    <DropdownMenuItem className="p-3 rounded-2xl cursor-pointer hover:bg-white/5 group" asChild>
                      <Link to="/master" className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                          <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-widest">Painel de Controle</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'organizer' && (
                    <DropdownMenuItem className="p-3 rounded-2xl cursor-pointer hover:bg-white/5 group" asChild>
                      <Link to="/organizer/dashboard" className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                          <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-widest">Painel Produtor</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem className="p-3 rounded-2xl cursor-pointer hover:bg-white/5 group" asChild>
                    <Link to="/dashboard/tickets" className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-widest">Meus Ingressos</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="p-3 rounded-2xl cursor-pointer hover:bg-white/5 group" asChild>
                    <Link to="/dashboard/settings" className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition">
                        <Settings className="w-5 h-5" />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-widest">Perfil & Segurança</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                <DropdownMenuItem onClick={logout} className="p-3 rounded-2xl cursor-pointer hover:bg-red-500/10 text-red-500 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest">Encerrar Sessão</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full border transition-all ${isHome ? 'text-white border-white/20 hover:bg-white hover:text-black' : 'text-gray-900 border-gray-200 hover:bg-gray-900 hover:text-white'}`}>
                Entrar
              </Link>
            </div>
          )}

          {/* Mobile Menu Icon */}
          <button className={`lg:hidden p-2 transition-colors ${isHome ? 'text-white' : 'text-gray-900'}`}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
