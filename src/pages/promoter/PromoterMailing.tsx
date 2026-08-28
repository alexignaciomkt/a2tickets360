import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Filter, Calendar, MapPin, Mail, Phone, Ticket } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';

interface MailingSummary {
  uniqueCustomers: number;
  totalPurchases: number;
  totalRevenue: number;
}

interface MailingCustomer {
  saleId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  buyerCity: string | null;
  buyerState: string | null;
  eventId: string;
  eventTitle: string;
  eventDate: string | null;
  purchaseDate: string;
  grossAmount: number;
  credentialsCount: number;
}

interface MailingResponse {
  summary: MailingSummary;
  customers: MailingCustomer[];
}

const PromoterMailing = () => {
  const [data, setData] = useState<MailingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const res = await fetch(`${apiUrl}/api/promoter/mailing`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        if (!res.ok) {
          throw new Error('Erro ao carregar mailing.');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const uniqueEvents = useMemo(() => {
    if (!data?.customers) return [];
    const events = data.customers.map(c => ({ id: c.eventId, title: c.eventTitle }));
    const unique = [];
    const map = new Map();
    for (const item of events) {
        if (!map.has(item.id)) {
            map.set(item.id, true);
            unique.push(item);
        }
    }
    return unique;
  }, [data]);

  const filteredCustomers = useMemo(() => {
    if (!data?.customers) return [];
    return data.customers.filter(c => {
      // Event filter
      if (selectedEvent !== 'ALL' && c.eventId !== selectedEvent) return false;

      // Search query filter (name, email, phone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.buyerName.toLowerCase().includes(q);
        const matchesEmail = c.buyerEmail.toLowerCase().includes(q);
        const matchesPhone = c.buyerPhone?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchQuery, selectedEvent]);

  if (isLoading) {
    return (
      <DashboardLayout userType="promoter">
        <div className="flex items-center justify-center h-[60vh]">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="promoter">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
           {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="promoter">
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
         {/* Header */}
         <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">MINHA CARTEIRA DE CLIENTES</h1>
            <p className="text-zinc-500">Clientes que compraram através dos seus links de divulgação.</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Clientes Únicos</p>
                <p className="text-4xl font-black text-slate-900">{data?.summary.uniqueCustomers || 0}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Compras</p>
                <p className="text-4xl font-black text-slate-900">{data?.summary.totalPurchases || 0}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-800 mb-2">Receita Gerada</p>
                <p className="text-4xl font-black text-indigo-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.summary.totalRevenue || 0)}
                </p>
            </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
           {/* Toolbar */}
           <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
              <div className="relative w-full md:w-96">
                 <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   placeholder="Buscar por nome, e-mail ou telefone..." 
                   className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-slate-700"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className="w-full md:w-64 relative">
                 <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <select 
                   className="w-full pl-9 pr-4 py-3 bg-white border border-slate-300 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 font-medium"
                   value={selectedEvent}
                   onChange={(e) => setSelectedEvent(e.target.value)}
                 >
                   <option value="ALL">Todos os Eventos</option>
                   {uniqueEvents.map(e => (
                     <option key={e.id} value={e.id}>{e.title}</option>
                   ))}
                 </select>
              </div>
           </div>

           {/* Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Cliente</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Contato</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Evento</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Data</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap text-center">Compra</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap text-center">Credenciais</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap text-right">Valor</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                           Nenhum registro encontrado para os filtros atuais.
                        </td>
                      </tr>
                   ) : (
                      filteredCustomers.map(c => (
                        <tr key={c.saleId} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="py-4 px-6">
                              <p className="font-bold text-slate-900">{c.buyerName || '—'}</p>
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-1.5 text-slate-600">
                                   <Mail className="w-3.5 h-3.5" />
                                   <span className="text-sm">{c.buyerEmail || '—'}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-slate-600">
                                   <Phone className="w-3.5 h-3.5" />
                                   <span className="text-sm">{c.buyerPhone || '—'}</span>
                                 </div>
                                 {(c.buyerCity || c.buyerState) && (
                                   <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                                      <MapPin className="w-3 h-3" />
                                      <span className="text-xs">{[c.buyerCity, c.buyerState].filter(Boolean).join(' - ')}</span>
                                   </div>
                                 )}
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-4 h-4 text-slate-400" />
                                 <span className="font-medium text-slate-800 text-sm max-w-[150px] truncate" title={c.eventTitle}>{c.eventTitle}</span>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <span className="text-sm text-slate-600">
                                {new Date(c.purchaseDate).toLocaleDateString('pt-BR')}
                              </span>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                                1
                              </span>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                                <Ticket className="w-3.5 h-3.5" />
                                <span className="font-bold text-sm">{c.credentialsCount}</span>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-right">
                              <span className="font-bold text-slate-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.grossAmount)}
                              </span>
                           </td>
                        </tr>
                      ))
                   )}
                </tbody>
             </table>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default PromoterMailing;
