
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, CheckCircle, XCircle, MoreHorizontal, Plus, Edit, Trash2, ShieldAlert, AlertTriangle, MessageSquare, Eye, Phone, MapPin, ExternalLink, FileText, User, Search, Loader2, ArrowRight, ShieldCheck, Zap, ChevronRight, Target, Database, Cpu, Mail } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { masterService } from '@/services/masterService';
import { Organizer } from '@/interfaces/organizer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const OrganizersManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);
  const [newOrg, setNewOrg] = useState({ name: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orgToDeleteId, setOrgToDeleteId] = useState<string | null>(null);

  const loadOrganizers = async () => {
    try {
      setIsLoading(true);
      const data = await masterService.getOrganizers();
      setOrganizers(data);
    } catch (error) {
      toast({ title: 'Sync Error', description: 'Não foi possível buscar a base de parceiros do cluster.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizers();
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.organizer' }, () => loadOrganizers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredOrganizers = activeTab === 'all' ? organizers :
    activeTab === 'active' ? organizers.filter(org => org.status === 'approved' && org.profileComplete === true) :
    activeTab === 'pending' ? organizers.filter(org => org.status === 'pending' && org.profileComplete === true) :
    organizers.filter(org => org.profileComplete !== true);

  const stats = {
    pending: organizers.filter(org => org.status === 'pending' && org.profileComplete === true).length,
    incomplete: organizers.filter(org => org.profileComplete !== true).length,
    active: organizers.filter(org => org.status === 'approved' && org.profileComplete === true).length
  };

  const handleShowReport = (org: Organizer) => { setSelectedOrg(org); setIsReportModalOpen(true); };

  const handleApprove = async (id: string) => {
    try {
      await masterService.approveOrganizerManually(id);
      loadOrganizers();
      toast({ title: 'Authority Activated', description: 'O acesso ao painel foi liberado sistematicamente.' });
    } catch (error) {
      toast({ title: 'Approval Failed', variant: 'destructive' });
    }
  };

  const handleCreateOrganizer = async () => {
    try {
      if (!newOrg.name || !newOrg.email || !newOrg.password) {
        toast({ title: 'Missing Metadata', variant: 'warning' } as any);
        return;
      }
      await masterService.createOrganizer(newOrg);
      setIsModalOpen(false);
      setNewOrg({ name: '', email: '', password: '' });
      loadOrganizers();
      toast({ title: 'New Node Provisioned', description: 'O organizador foi registrado no cluster com sucesso.' });
    } catch (error: any) {
      toast({ title: 'Provisioning Error', description: error.response?.data?.error || 'Tente novamente.', variant: 'destructive' });
    }
  };

  const handleEdit = (org: Organizer) => {
    setSelectedOrg(org);
    setEditForm({ name: org.name, email: org.email });
    setIsEditModalOpen(true);
  };

  const handleUpdateOrganizer = async () => {
    if (!selectedOrg) return;
    try {
      await masterService.updateOrganizer(selectedOrg.id, editForm, selectedOrg.userId);
      setIsEditModalOpen(false);
      loadOrganizers();
      toast({ title: 'Metadata Synced', description: 'As alterações foram persistidas no kernel.' });
    } catch (error) {
      toast({ title: 'Update Failed', variant: 'destructive' });
    }
  };

  const handleApproveManually = async (org: Organizer) => {
    try {
      setIsApproving(true);
      await masterService.approveOrganizerManually(org.id);
      setIsReportModalOpen(false);
      loadOrganizers();
      toast({ title: 'KYC Validated', description: `O perfil de ${org.name} foi autenticado manualmente.` });
    } catch (error) {
      toast({ title: 'Validation Failed', variant: 'destructive' });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeleteClick = (id: string) => { setOrgToDeleteId(id); setIsDeleteDialogOpen(true); };

  const handleDelete = async () => {
    if (!orgToDeleteId) return;
    try {
      await masterService.deleteOrganizer(orgToDeleteId);
      loadOrganizers();
      toast({ title: 'Node Pruned', description: 'O parceiro foi desconectado do cluster.' });
    } catch (error: any) {
      toast({ title: 'Pruning Failed', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrgToDeleteId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
        
        {/* Organizers Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Produtores & Organizadores</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Gestão de parceiros, aprovação de contas e monitoramento.
              </p>
           </div>
           
           <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-8 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium px-3 shadow-sm transition-all rounded-md"
           >
            <Plus className="mr-1.5 h-3 w-3" /> Adicionar Produtor
           </Button>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" /> Diretório de Produtores
                </CardTitle>
                <div className="flex bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                  {[
                    { id: 'all', label: 'Todos', count: null },
                    { id: 'active', label: 'Aprovados', count: stats.active, color: 'indigo' },
                    { id: 'pending', label: 'Para Analisar', count: stats.pending, color: 'emerald' },
                    { id: 'incomplete', label: 'Em Onboarding', count: stats.incomplete, color: 'amber' },
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      {tab.label}
                      {tab.count !== null && tab.count > 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' :
                          'bg-slate-100 text-slate-500'
                        }`}>{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-left">Produtor / E-mail</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-left">Empresa</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-center">Receita (GMV)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-left">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-left">KYC</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
                           <span className="text-xs font-medium text-slate-400">Sincronizando parceiros...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrganizers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-16 py-48 text-center">
                         <div className="w-32 h-32 rounded-[3.5rem] bg-gray-50 flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-2xl transition-transform hover:scale-110">
                            <Users className="w-12 h-12 text-slate-200" />
                         </div>
                         <p className="text-[12px] font-black uppercase text-slate-400 tracking-[0.3em]">Zero Node Registries in Current Matrix Hub.</p>
                      </td>
                    </tr>
                  ) : filteredOrganizers.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleShowReport(org)}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{org.name}</span>
                          <span className="text-xs text-slate-500">{org.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{org.companyName || '—'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 text-center tabular-nums">R$ 0,00</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          org.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          org.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                          'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {org.status === 'approved' ? 'Aprovado' : org.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                          {org.profileComplete ? (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs font-medium px-2 py-0.5 rounded-md">OK</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs font-medium px-2 py-0.5 rounded-md">Pendente</Badge>
                          )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-3">
                           <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShowReport(org)}
                              className="h-8 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium px-3 transition-all"
                            >
                              Analisar
                            </Button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" className="h-8 w-8 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all p-0">
                                 <MoreHorizontal className="h-4 w-4" />
                               </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="bg-white rounded-lg shadow-lg min-w-[200px] border border-slate-200">
                               <DropdownMenuLabel className="text-xs font-semibold text-slate-500 px-3 py-2">Ações</DropdownMenuLabel>
                               <DropdownMenuSeparator className="bg-slate-100" />
                               <DropdownMenuItem className="focus:bg-slate-50 focus:text-slate-900 cursor-pointer text-sm font-medium px-3 py-2 transition-all" onClick={() => handleEdit(org)}>
                                 <Edit className="mr-2 h-4 w-4 text-slate-400" /> Editar Dados
                               </DropdownMenuItem>
                               <DropdownMenuItem className="focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer text-sm font-medium px-3 py-2 transition-all" onClick={() => handleApprove(org.id)}>
                                 <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" /> Aprovar Conta
                               </DropdownMenuItem>
                               <DropdownMenuSeparator className="bg-slate-100" />
                               <DropdownMenuItem className="focus:bg-rose-50 focus:text-rose-700 text-rose-600 cursor-pointer text-sm font-medium px-3 py-2 transition-all" onClick={() => handleDeleteClick(org.id)}>
                                 <Trash2 className="mr-2 h-4 w-4 text-rose-500" /> Excluir Produtor
                               </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-none text-slate-900 rounded-lg shadow-xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
               <Plus className="w-5 h-5 text-indigo-600" />
               Adicionar Produtor
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 mt-2">
               Cadastre um novo organizador para permitir acesso ao painel de produtores.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 ml-1">Razão Social / Nome</Label>
              <Input
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                placeholder="Ex: Produtora Eventos LTDA"
                className="h-10 rounded-md border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all px-3"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 ml-1">E-mail de Acesso</Label>
              <Input
                type="email"
                value={newOrg.email}
                onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                placeholder="contato@produtora.com"
                className="h-10 rounded-md border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all px-3"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 ml-1">Senha Inicial</Label>
              <Input
                type="password"
                value={newOrg.password}
                onChange={(e) => setNewOrg({ ...newOrg, password: e.target.value })}
                placeholder="••••••••"
                className="h-10 rounded-md border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all px-3"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-9 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200">Cancelar</Button>
            <Button onClick={handleCreateOrganizer} className="h-9 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all">
               Salvar Produtor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white border-none text-slate-900 rounded-lg shadow-xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
               <Edit className="w-5 h-5 text-indigo-600" />
               Editar Produtor
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 mt-2">Atualize as informações básicas de acesso do produtor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 ml-1">Razão Social / Nome</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-10 rounded-md border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all px-3"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 ml-1">E-mail de Acesso</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="h-10 rounded-md border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all px-3"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="h-9 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200">Cancelar</Button>
            <Button onClick={handleUpdateOrganizer} className="h-9 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all">
               Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="bg-white border-none text-slate-900 max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-0 scrollbar-hide">
          <div className="p-8 space-y-8">
            <DialogHeader>
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 tracking-tight">
                      <ShieldCheck className="h-6 w-6 text-indigo-600" />
                      Dossiê do Produtor
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500">
                      Análise de dados de onboarding e compliance de <strong>{selectedOrg?.name}</strong>.
                    </DialogDescription>
                 </div>
                 <Button variant="ghost" className="h-8 w-8 rounded-md p-0 text-slate-400 hover:text-slate-900 transition-all" onClick={() => setIsReportModalOpen(false)}>
                    <XCircle className="w-5 h-5" />
                 </Button>
              </div>
            </DialogHeader>

            {selectedOrg && (
              <div className="space-y-8">
                <div className="relative h-48 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shadow-md">
                  {selectedOrg.bannerUrl || selectedOrg.banner_url ? (
                    <img src={selectedOrg.bannerUrl || selectedOrg.banner_url} className="w-full h-full object-cover opacity-80" alt="Banner" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-700 font-medium text-sm">Sem capa informada</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg border-2 border-white shadow-lg overflow-hidden bg-white shrink-0">
                       {selectedOrg.logoUrl || selectedOrg.logo_url ? <img src={selectedOrg.logoUrl || selectedOrg.logo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-900 font-bold text-3xl">{(selectedOrg.companyName || selectedOrg.name || 'P').charAt(0)}</div>}
                    </div>
                    <div className="text-white space-y-1 relative z-10">
                       <h3 className="text-2xl font-bold tracking-tight">{selectedOrg.companyName || selectedOrg.name}</h3>
                       <div className="flex items-center gap-3">
                          <p className="text-xs font-medium text-white/70">Membro desde {selectedOrg.createdAt ? new Date(selectedOrg.createdAt).getFullYear() : '2025'}</p>
                          <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">ID: {selectedOrg.id?.slice(0,8).toUpperCase()}</Badge>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                  <div className="space-y-6">
                    {[
                      { l: 'Razão Social', v: selectedOrg.name || '---' },
                      { l: 'E-mail', v: selectedOrg.email || '---', lowercase: true },
                      { l: 'Telefone', v: selectedOrg.phone || '---' },
                      { l: 'Página Pública', v: selectedOrg.slug ? `ticketera.com.br/p/${selectedOrg.slug}` : '---', lowercase: true, color: 'indigo' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">{item.l}</p>
                        <p className={`text-sm font-medium ${item.lowercase ? 'lowercase' : ''} ${item.color === 'indigo' ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-900'}`}>{item.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    {[
                      { l: 'CPF do Titular', v: selectedOrg.cpf || 'Não informado' },
                      { l: 'CNPJ', v: selectedOrg.cnpj || 'Não informado' },
                      { l: 'Status da Conta', v: selectedOrg.status || 'Pendente', badge: true },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">{item.l}</p>
                        {item.badge ? (
                          <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 rounded-md ${selectedOrg.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{item.v === 'approved' ? 'Aprovado' : 'Pendente'}</Badge>
                        ) : (
                          <p className="text-sm font-medium text-slate-900">{item.v}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2 pt-6 border-t border-slate-100 bg-slate-50 p-6 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> Endereço Sede</p>
                    <p className="text-sm font-medium text-slate-900">{selectedOrg.address ? `${selectedOrg.address}, ${selectedOrg.city} - ${selectedOrg.state} | CEP: ${selectedOrg.postalCode}` : 'Endereço não cadastrado.'}</p>
                  </div>
                </div>

                <div className="space-y-6 pt-6 px-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500"/> Documentos de Identificação
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { l: 'RG / CNH (Frente)', v: selectedOrg.documentFrontUrl || selectedOrg.document_front_url },
                      { l: 'RG / CNH (Verso)', v: selectedOrg.documentBackUrl || selectedOrg.document_back_url }
                    ].map((doc, i) => (
                      <div key={i} className="space-y-3">
                        <p className="text-xs font-semibold text-slate-500">{doc.l}</p>
                        {doc.v ? (
                          <a href={doc.v} target="_blank" rel="noreferrer" className="block relative rounded-lg overflow-hidden border border-slate-200 shadow-sm group/doc">
                            <img src={doc.v} className="w-full h-48 object-cover" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/doc:opacity-100 transition-all flex items-center justify-center">
                               <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md">
                                  <ExternalLink className="w-4 h-4" />
                               </div>
                            </div>
                          </a>
                        ) : (
                          <div className="w-full h-48 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-6">
                             <FileText className="w-8 h-8 opacity-20 mb-3" />
                             <p className="text-xs font-medium text-slate-400">Documento não enviado</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100 bg-slate-50 p-6 rounded-b-2xl">
              <Button variant="ghost" onClick={() => setIsReportModalOpen(false)} className="flex-1 h-10 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200">Fechar</Button>
              
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
                onClick={() => selectedOrg && window.open(`https://wa.me/${selectedOrg?.phone?.replace(/\D/g, '')}`, '_blank')}
              >
                <MessageSquare className="mr-2 h-4 w-4 text-emerald-500" /> WhatsApp
              </Button>

              <Button
                className="flex-1 h-10 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm"
                onClick={() => selectedOrg && handleApproveManually(selectedOrg)}
                disabled={isApproving || selectedOrg?.status === 'approved'}
              >
                {isApproving ? <Loader2 className="animate-spin h-4 w-4" /> : (
                  <span className="flex items-center justify-center gap-2">
                     <CheckCircle className={`w-4 h-4`} />
                     {selectedOrg?.status === 'approved' ? 'Aprovado' : 'Aprovar Produtor'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-none rounded-lg shadow-xl p-6 max-w-sm">
          <div className="flex flex-col items-center text-center gap-4">
             <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-rose-500" />
             </div>
             <div className="space-y-2">
                <AlertDialogTitle className="text-lg font-bold text-slate-900 tracking-tight">Excluir Produtor?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                  Esta ação é irreversível. O produtor e todos os seus dados e acessos serão removidos do sistema.
                </AlertDialogDescription>
             </div>
             <div className="flex gap-3 w-full pt-4">
                <AlertDialogCancel className="flex-1 h-10 rounded-md border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all m-0">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="flex-1 h-10 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-sm m-0"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
             </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default OrganizersManagement;
