
import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Download, Loader2, MapPin, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import masterService from '@/services/masterService';

const MasterGlobalMailing = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await masterService.getAllCustomers();
        setCustomers(data || []);
      } catch (error) {
        console.error('Erro ao buscar mailing global:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return customers;
    const low = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.name?.toLowerCase().includes(low) || 
      c.email?.toLowerCase().includes(low) ||
      c.cpf?.includes(low)
    );
  }, [customers, searchTerm]);

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'CPF', 'Telefone', 'Cidade', 'Estado', 'Data de Nascimento', 'Criado em'];
    const rows = filtered.map(c => [
      c.name || 'Sem Nome',
      c.email || 'Sem Email',
      c.cpf || '—',
      c.phone || '—',
      c.city || '—',
      c.state || '—',
      c.birth_date || '—',
      c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mailing-global-ticketera.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Users className="w-32 h-32 text-indigo-600" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Mailing Global (Leads)</h1>
            <p className="text-gray-500 font-medium max-w-lg">Base de inteligência completa com todos os clientes cadastrados na plataforma. Use para ações de tráfego e marketing global.</p>
          </div>
          <button 
            onClick={exportCSV}
            disabled={loading || customers.length === 0}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-xl shadow-gray-200"
          >
            <Download className="w-4 h-4" /> Exportar Base Full
          </button>
        </div>

        {/* Stats & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all">
             <div className="bg-indigo-50 p-4 rounded-2xl group-hover:bg-indigo-600 transition-colors">
               <Users className="w-6 h-6 text-indigo-600 group-hover:text-white" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total de Leads</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{loading ? '...' : customers.length}</p>
             </div>
          </div>
          <div className="md:col-span-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center">
             <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Pesquisar por nome, email ou CPF na base global..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Cliente / Lead</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Contato Direto</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Localização</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Documentação</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Data de Entrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">Carregando mailing global...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <div className="max-w-xs mx-auto">
                         <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                         <p className="text-gray-900 font-black uppercase tracking-tighter text-lg">Nenhum lead encontrado</p>
                         <p className="text-gray-400 text-sm mt-1">Tente ajustar seus termos de busca ou filtros.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-200">
                          {c.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-none text-sm group-hover:text-indigo-600 transition-colors">{c.name || 'Sem Nome'}</p>
                          <p className="text-[10px] text-gray-400 mt-1.5 uppercase font-black tracking-tighter">ID: {c.id?.slice(0,8) || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" /> {c.email}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                          <Phone className="w-3.5 h-3.5 text-gray-300" /> {c.phone || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{c.city || '—'}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{c.state || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> {c.cpf || '—'}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-300" /> {c.birth_date ? new Date(c.birth_date).toLocaleDateString('pt-BR') : '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="inline-block text-left">
                        <p className="text-xs font-black text-gray-900 uppercase">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}
                        </p>
                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter text-right">Cadastrado</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MasterGlobalMailing;
