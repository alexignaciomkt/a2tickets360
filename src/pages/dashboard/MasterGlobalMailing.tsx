
import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Download, Loader2, MapPin, Mail, Phone, Calendar, CreditCard, Filter, ChevronRight, User, Hash, Zap, Database, ShieldCheck, Target, ShieldAlert, Activity } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { masterService } from '@/services/masterService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
      <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
        
        {/* Master Mailing Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Mailing Global</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Base centralizada de clientes e usuários cadastrados na plataforma.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                className="h-8 text-xs font-medium px-3 shadow-sm transition-all rounded-md"
              >
                <Filter className="w-3 h-3 mr-1.5" />
                Filtros
              </Button>
              <Button 
                onClick={exportCSV}
                disabled={loading || customers.length === 0}
                className="h-8 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium px-3 shadow-sm transition-all rounded-md"
              >
                <Download className="w-3 h-3 mr-1.5" /> Exportar CSV
              </Button>
           </div>
        </div>

        {/* Intelligence Units */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1000 group border-2">
             <CardContent className="p-10 flex items-center gap-8">
                <div className="w-16 h-16 rounded-[1.8rem] bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform">
                   <Database className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 leading-none mb-2">Lead Matrix Nodes</p>
                   <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">{loading ? '---' : customers.length.toLocaleString('pt-BR')}</p>
                </div>
             </CardContent>
          </Card>
          
          <div className="md:col-span-3">
             <div className="relative group h-full">
                <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200 group-focus-within:text-slate-900 transition-all duration-700" />
                <Input 
                  placeholder="Escaneando base protocolar por nome, e-mail ou hash de documento (CPF)..."
                  className="w-full h-full pl-24 pr-12 bg-white border-2 border-gray-100 rounded-[3rem] shadow-sm text-[13px] font-black uppercase tracking-tight focus:ring-[12px] focus:ring-slate-50 focus:border-slate-900 transition-all placeholder:text-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4">
                   <Badge className="bg-gray-50 text-slate-400 border-none font-black text-[9px] uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-inner">INDEXED_CLUSTER_ALPHA</Badge>
                   <div className="w-px h-8 bg-gray-100" />
                   <Zap className="w-5 h-5 text-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                </div>
             </div>
          </div>
        </div>

        {/* Matrix Registry Table */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-[4rem] overflow-hidden group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1000 border-2">
          <CardHeader className="pb-6 border-b border-gray-50 bg-gray-50/20 px-16 py-12">
             <div className="flex items-center justify-between">
                <CardTitle className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-5">
                   <ShieldCheck className="w-6 h-6 text-slate-900" /> Master Mailing Registry
                </CardTitle>
                <div className="flex items-center gap-4 bg-white/50 px-6 py-2.5 rounded-full border border-gray-100">
                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Live Matrix Streaming</span>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="hover:bg-transparent border-none">
                    <th className="px-16 py-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Authorized Node / Identity Matrix</th>
                    <th className="px-16 py-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Comm Endpoint Protocol</th>
                    <th className="px-16 py-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Geo-Location Hub</th>
                    <th className="px-16 py-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">KYC Attributes Hub</th>
                    <th className="px-16 py-10 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Action Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-48 text-center">
                        <div className="flex flex-col items-center gap-8">
                           <Loader2 className="w-12 h-12 animate-spin text-slate-900" />
                           <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-300">Sincronizando Clusters Globais de Ativos...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-48 text-center">
                         <div className="w-32 h-32 rounded-[4rem] bg-gray-50 flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-2xl">
                            <Users className="w-12 h-12 text-slate-200" />
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Zero Matrix Registries</h3>
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ajuste a busca para localizar ativos autorizados.</p>
                      </td>
                    </tr>
                  ) : filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/30 transition-all duration-700 group cursor-pointer border-b border-transparent hover:border-gray-100">
                      <td className="px-16 py-10">
                        <div className="flex items-center gap-8">
                          <div className="w-16 h-16 rounded-[1.6rem] bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-2xl border-4 border-white group-hover:scale-110 group-hover:rotate-6 transition-transform">
                            {c.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-slate-900 transition-colors">{c.name || 'Anonymous Alpha Node'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] tabular-nums">NODE_HASH: {c.id?.slice(0,16).toUpperCase() || 'ROOT_EMPTY'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-16 py-10">
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-4 text-[12px] font-black text-slate-900 lowercase leading-none">
                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                               <Mail className="w-4 h-4" />
                            </div>
                            {c.email}
                          </div>
                          <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none tabular-nums">
                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-slate-900 group-hover:text-white transition-all opacity-40 group-hover:opacity-100">
                               <Phone className="w-4 h-4" />
                            </div>
                            {c.phone || 'PROTOCOL_PENDING'}
                          </div>
                        </div>
                      </td>
                      <td className="px-16 py-10">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-[1.2rem] bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border-2 border-rose-100 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm group-hover:rotate-12 group-hover:scale-110"><MapPin className="w-6 h-6" /></div>
                          <div className="space-y-1.5">
                            <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{c.city || 'UNDEFINED'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{c.state || 'GLOBAL_ZONE'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-16 py-10">
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-4 text-[12px] font-black text-slate-900 tabular-nums leading-none">
                             <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <CreditCard className="w-4 h-4" />
                             </div>
                             {c.cpf || 'KYC_PENDING_AUDIT'}
                          </div>
                          <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none tabular-nums">
                             <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-slate-900 group-hover:text-white transition-all opacity-40 group-hover:opacity-100">
                                <Calendar className="w-4 h-4" />
                             </div>
                             {c.birth_date ? new Date(c.birth_date).toLocaleDateString('pt-BR') : 'REGISTRY_EMPTY'}
                          </div>
                        </div>
                      </td>
                      <td className="px-16 py-10 text-right" onClick={(e) => e.stopPropagation()}>
                         <Button variant="ghost" size="sm" className="h-14 w-14 rounded-full text-slate-200 hover:text-slate-900 hover:bg-gray-100 p-0 transition-all hover:scale-110 active:scale-90 group/audit">
                            <ChevronRight className="w-8 h-8 group-hover/audit:translate-x-1 transition-transform" />
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MasterGlobalMailing;
