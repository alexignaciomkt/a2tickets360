
import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Search, User, Zap, LogOut, Settings, LayoutDashboard } from 'lucide-react';
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
// ... imports

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Unified Logo */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>

        {/* Search Bar - Original Style */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar eventos, shows, produtores..."
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link to="/events" className="hidden lg:block text-gray-600 hover:text-indigo-600 font-bold text-sm uppercase tracking-wide transition-colors">
            Eventos
          </Link>

          <Link to="/para-produtores" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 animate-pulse">
            <Zap className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Área do Produtor</span>
            <span className="sm:hidden text-[10px]">Produtor</span>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition">
                  <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-indigo-600 shadow-sm" />
                  <span className="hidden md:block font-black text-xs text-gray-900 uppercase tracking-tighter">{user.name.split(' ')[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-gray-100">
                <DropdownMenuLabel className="px-4 py-3">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Minha Conta</p>
                  <p className="text-sm font-black text-gray-900 truncate mt-1">{user.email}</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">
                    {user.role === 'organizer' ? 'Produtor' : user.role === 'admin' || user.role === 'master' ? 'Administrador' : user.role === 'staff' ? 'Equipe' : 'Participante'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-50" />

                {/* ORGANIZER / ADMIN menu */}
                {(user.role === 'organizer' || user.role === 'admin' || user.role === 'master') ? (
                  <>
                    <DropdownMenuItem className="p-3 rounded-xl cursor-pointer hover:bg-indigo-50 group" asChild>
                      <Link to="/organizer/dashboard" className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <span className="font-black text-xs uppercase text-gray-700">Meu Painel</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl cursor-pointer hover:bg-indigo-50 group" asChild>
                      <Link to="/organizer/events" className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <span className="font-black text-xs uppercase text-gray-700">Meus Eventos</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {/* PARTICIPANT menu */}
                    <DropdownMenuItem className="p-3 rounded-xl cursor-pointer hover:bg-indigo-50 group" asChild>
                      <Link to="/dashboard/tickets" className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <span className="font-black text-xs uppercase text-gray-700">Meus Ingressos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl cursor-pointer hover:bg-indigo-50 group" asChild>
                      <Link to="/dashboard/settings" className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                          <Settings className="w-4 h-4" />
                        </div>
                        <span className="font-black text-xs uppercase text-gray-700">Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-gray-50" />
                <DropdownMenuItem onClick={logout} className="p-3 rounded-xl cursor-pointer hover:bg-red-50 text-red-600 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-600 group-hover:text-white transition">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-black text-xs uppercase">Sair</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              <User className="w-6 h-6" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
