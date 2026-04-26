import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Download, Loader2, MapPin, Mail, Phone, Calendar, CreditCard, ChevronRight, Database, ShieldCheck, Zap, BarChart3, User, Activity } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { masterService } from '@/services/masterService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

// Progress Bar Custom Component (Minimalismo Autoritário)
const ProgressBar = ({ label, value, max, color = 'bg-slate-900' }: { label: string, value: number, max: number, color?: string }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1 mb-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
        <span className="text-[12px] font-black text-slate-900 tabular-nums">{value.toLocaleString('pt-BR')}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const MasterGlobalMailing = () => {
  const [data, setData] = useState<any>({ customers: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await masterService.getMailingAnalytics();
        setData(result);
      } catch (error) {
        console.error('Erro ao buscar analytics de mailing:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const customers = data?.customers || [];
  const stats = data?.stats;

  const filtered = useMemo(() => {
    if (!searchTerm) return customers;
    const low = searchTerm.toLowerCase();
    return customers.filter((c: any) => 
      c.name?.toLowerCase().includes(low) || 
      c.email?.toLowerCase().includes(low) ||
      c.cpf?.includes(low) ||
      c.origin_producer?.toLowerCase().includes(low) ||
      c.city?.toLowerCase().includes(low)
    );
  }, [customers, searchTerm]);

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'CPF', 'Telefone', 'Cidade', 'Estado', 'Data de Nascimento', 'Produtor Origem', 'Criado em'];
    const rows = filtered.map((c: any) => [
      c.name || 'Sem Nome',
      c.email || 'Sem Email',
      c.cpf || '—',
      c.phone || '—',
      c.city || '—',
      c.state || '—',
      c.birth_date || '—',
      c.origin_producer || '—',
      c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mailing-global-ticketera.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const openDossier = (user: any) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  // Find max values for BI Charts
  const maxProducers = stats?.topProducers?.[0]?.count || 1;
  const maxCities = stats?.cities?.[0]?.count || 1;
  const maxGenders = stats?.genders?.[0]?.count || 1;
  const maxAges = stats?.ages?.reduce((max: number, item: any) => item.count > max ? item.count : max, 1) || 1;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
        
        {/* Master Mailing Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Mailing Global Analytics</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Base centralizada de inteligência demográfica e aquisição de clientes.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <Button 
                onClick={exportCSV}
                disabled={loading || customers.length === 0}
                className="h-8 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium px-4 shadow-sm transition-all rounded-md"
              >
                <Download className="w-3 h-3 mr-2" /> Exportar CSV
              </Button>
           </div>
        </div>

        {/* BI Dashboards */}
        {loading ? (
           <div className="h-64 flex items-center justify-center border-2 border-gray-100 rounded-[3rem] bg-white">
              <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Top Producers */}
              <Card className="md:col-span-2 rounded-[3rem] border-2 border-gray-100 shadow-sm bg-white overflow-hidden">
                 <CardHeader className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                       <BarChart3 className="w-4 h-4 text-slate-900" /> Top 10 Produtores (Aquisição)
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    {stats?.topProducers?.length > 0 ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                          {stats.topProducers.map((p: any, i: number) => (
                             <ProgressBar key={p.name} label={`${i+1}. ${p.name}`} value={p.count} max={maxProducers} color="bg-indigo-600" />
                          ))}
                       </div>
                    ) : (
                       <p className="text-xs text-slate-400 text-center py-8">Dados insuficientes</p>
                    )}
                 </CardContent>
              </Card>

              {/* Demographics */}
              <Card className="rounded-[3rem] border-2 border-gray-100 shadow-sm bg-white overflow-hidden">
                 <CardHeader className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                       <Users className="w-4 h-4 text-slate-900" /> Faixa Etária
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    {stats?.ages?.filter((a: any) => a.count > 0).map((a: any) => (
                       <ProgressBar key={a.range} label={a.range} value={a.count} max={maxAges} color="bg-emerald-500" />
                    ))}
                 </CardContent>
              </Card>

              {/* Demographics - Gender & Location */}
              <div className="space-y-4">
                 <Card className="rounded-[2rem] border-2 border-gray-100 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/30 px-5 py-3">
                       <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                          <Activity className="w-3 h-3 text-slate-900" /> Gênero
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                       {stats?.genders?.slice(0, 3).map((g: any) => (
                          <ProgressBar key={g.name} label={g.name} value={g.count} max={maxGenders} color="bg-amber-500" />
                       ))}
                    </CardContent>
                 </Card>
                 <Card className="rounded-[2rem] border-2 border-gray-100 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/30 px-5 py-3">
                       <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                          <MapPin className="w-3 h-3 text-slate-900" /> Cidades
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                       {stats?.cities?.slice(0, 3).map((c: any) => (
                          <ProgressBar key={c.name} label={c.name} value={c.count} max={maxCities} color="bg-rose-500" />
                       ))}
                    </CardContent>
                 </Card>
              </div>

           </div>
        )}

        {/* Matrix Registry Table with Search and Scroll */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-[3rem] overflow-hidden group border-2 flex flex-col h-[600px]">
          <CardHeader className="pb-6 border-b border-gray-50 bg-gray-50/20 px-10 py-8 shrink-0">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                      <Database className="w-5 h-5" />
                   </div>
                   <div>
                      <CardTitle className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-900">
                         Mailing Detalhado
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">
                         {filtered.length} Registros Indexados
                      </p>
                   </div>
                </div>

                <div className="relative w-full md:w-[400px]">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <Input 
                     placeholder="Buscar por nome, email ou cidade..."
                     className="w-full pl-12 pr-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm text-xs font-medium focus:ring-slate-900 focus:border-slate-900"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>
          </CardHeader>
          
          <CardContent className="p-0 overflow-y-auto flex-1">
            <table className="w-full text-left relative">
              <thead className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cliente</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Localização</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Produtor de Origem</th>
                  <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                       <p className="text-sm font-medium text-slate-400">Nenhum registro encontrado para sua busca.</p>
                    </td>
                  </tr>
                ) : filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => openDossier(c)}>
                    <td className="px-10 py-5">
                       <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{c.name || 'Sem Nome'}</p>
                       <p className="text-[10px] font-bold text-slate-400">{c.email}</p>
                    </td>
                    <td className="px-10 py-5">
                       <p className="text-[12px] font-bold text-slate-700 uppercase">{c.city || '—'}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">{c.state || '—'}</p>
                    </td>
                    <td className="px-10 py-5">
                       <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border-indigo-100">
                          {c.origin_producer}
                       </Badge>
                    </td>
                    <td className="px-10 py-5 text-right">
                       <Button variant="ghost" size="sm" className="rounded-full text-slate-400 hover:text-slate-900 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); openDossier(c); }}>
                          Ver Dossiê <ChevronRight className="w-4 h-4 ml-1" />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Modal/Sheet de Dossiê */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
           <SheetContent className="sm:max-w-[500px] border-l-0 rounded-l-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.2)] bg-white p-0 overflow-y-auto">
              {selectedUser && (
                 <div className="flex flex-col h-full relative">
                    <div className="absolute top-0 left-0 w-full h-40 bg-slate-900 rounded-bl-[4rem]" />
                    
                    <div className="relative z-10 px-10 pt-20 pb-10">
                       <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white text-3xl font-black text-slate-900 mb-6">
                          {selectedUser.name?.charAt(0).toUpperCase() || '?'}
                       </div>
                       
                       <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">{selectedUser.name || 'Sem Nome'}</h2>
                       <Badge className="bg-indigo-50 text-indigo-600 border-none text-[9px] font-black uppercase tracking-widest mt-2 px-3 py-1">
                          Trouxe por: {selectedUser.origin_producer}
                       </Badge>

                       <div className="mt-10 space-y-8">
                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 border-b border-gray-100 pb-2">Contatos</h4>
                             <div className="space-y-4">
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
                                   <Mail className="w-4 h-4 text-slate-400" /> {selectedUser.email}
                                </div>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
                                   <Phone className="w-4 h-4 text-slate-400" /> {selectedUser.phone || 'Não informado'}
                                </div>
                             </div>
                          </div>

                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 border-b border-gray-100 pb-2">Dados KYC</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase">CPF</span>
                                   <p className="text-sm font-black text-slate-800">{selectedUser.cpf || 'Não informado'}</p>
                                </div>
                                <div className="space-y-1">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase">Nascimento</span>
                                   <p className="text-sm font-black text-slate-800">{selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                                </div>
                                <div className="space-y-1">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase">Gênero</span>
                                   <p className="text-sm font-black text-slate-800">{selectedUser.gender || 'Não informado'}</p>
                                </div>
                                <div className="space-y-1">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase">Registro</span>
                                   <p className="text-sm font-black text-slate-800">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>
                             </div>
                          </div>

                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 border-b border-gray-100 pb-2">Localização</h4>
                             <div className="space-y-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-sm font-black text-slate-800 uppercase">{selectedUser.city || 'Não informada'} - {selectedUser.state}</p>
                                <p className="text-[11px] font-medium text-slate-500">{selectedUser.address || 'Endereço completo não cadastrado'}</p>
                             </div>
                          </div>

                       </div>
                    </div>
                 </div>
              )}
           </SheetContent>
        </Sheet>

      </div>
    </DashboardLayout>
  );
};

export default MasterGlobalMailing;
