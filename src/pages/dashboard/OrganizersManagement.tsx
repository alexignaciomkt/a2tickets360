import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, CheckCircle, XCircle, MoreHorizontal, Plus, Edit, Trash2, ShieldAlert, AlertTriangle, MessageSquare, Eye, Phone, MapPin, ExternalLink, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { masterService } from '@/services/masterService';
import { Organizer } from '@/interfaces/organizer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// Mock data removido pois estamos usando o backend real

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

  useEffect(() => {
    loadOrganizers();

    // Configuração do Realtime para a tabela profiles
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.organizer' // Apenas mudanças de organizadores
        },
        (payload) => {
          console.log('⚡ [Realtime] Mudança detectada no banco:', payload.eventType);
          // Recarregamos a lista completa para garantir que os Joins (details) venham corretos
          loadOrganizers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadOrganizers = async () => {
    try {
      setIsLoading(true);
      const data = await masterService.getOrganizers();
      setOrganizers(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar organizadores',
        description: 'Não foi possível buscar os dados do servidor.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrganizers = activeTab === 'all'
    ? organizers
    : activeTab === 'active'
      ? organizers.filter(org => org.status === 'approved' && org.profileComplete === true)
      : activeTab === 'pending'
        ? organizers.filter(org => org.status === 'pending' && org.profileComplete === true)
        : organizers.filter(org => org.profileComplete !== true);

  const pendingCount = organizers.filter(org => org.status === 'pending' && org.profileComplete === true).length;
  const incompleteCount = organizers.filter(org => org.profileComplete !== true).length;
  const activeCount = organizers.filter(org => org.status === 'approved' && org.profileComplete === true).length;

  const generateProfileReport = (org: Organizer) => {
    let report = "### 📋 Pendências de Cadastro\n\n";
    report += `Olá **${org.name}**, detectamos que seu perfil ainda não está completo. Para que possamos aprovar seus eventos com agilidade, por favor complete os seguintes itens:\n\n`;

    const missing = [];
    if (!org.companyName) missing.push("- [ ] **Nome da Produtora**: Identificação comercial.");
    if (!org.phone) missing.push("- [ ] **Telefone de Contato**: Vital para suporte.");
    if (!org.address || !org.city) missing.push("- [ ] **Endereço Completo**: Necessário para registro.");
    if (!org.logoUrl || !org.bannerUrl) missing.push("- [ ] **Identidade Visual**: Logo e Banner da FanPage.");
    if (!org.bio) missing.push("- [ ] **Sobre a Produtora**: Descrição para o público.");

    const hasDoc = (org.cpf && org.rg) || org.cnpj;
    if (!hasDoc) missing.push("- [ ] **Documentação Principal**: CPF/RG ou CNPJ.");

    if (!org.documentFrontUrl || !org.documentBackUrl) {
      missing.push("- [ ] **Fotos do Documento**: Comprovação de identidade (Frente e Verso).");
    }

    if (!org.postalCode || !org.address || !org.city) {
      missing.push("- [ ] **Endereço Completo**: CEP, Logradouro e Cidade são obrigatórios.");
    }

    if (!org.birthDate || !org.cpf) {
      missing.push("- [ ] **Dados Sensíveis**: Data de Nascimento e CPF para faturamento.");
    }

    if (!org.asaasApiKey) {
      missing.push("- [ ] **Integração Financeira**: Chave API do Asaas para vendas.");
    }

    if (missing.length === 0) {
      report = "### ✅ Cadastro Completo!\n\nTodos os dados obrigatórios foram preenchidos. O administrador revisará seu perfil em breve.";
    } else {
      report += missing.join("\n");
      report += "\n\n> [!TIP]\n> Acesse 'Configurações' no seu painel para atualizar estes dados.";
    }

    return report;
  };

  const handleShowReport = (org: Organizer) => {
    setSelectedOrg(org);
    setIsReportModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await masterService.approveOrganizerManually(id);
      loadOrganizers();
      toast({
        title: 'Organizador aprovado',
        description: 'O organizador foi aprovado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao aprovar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateOrganizer = async () => {
    try {
      if (!newOrg.name || !newOrg.email || !newOrg.password) {
        toast({ title: 'Atenção', description: 'Preencha todos os campos.', variant: 'warning' } as any);
        return;
      }
      await masterService.createOrganizer(newOrg);
      setIsModalOpen(false);
      setNewOrg({ name: '', email: '', password: '' });
      loadOrganizers();
      toast({
        title: 'Organizador criado',
        description: 'O novo organizador foi cadastrado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.response?.data?.error || 'Tente novamente.',
        variant: 'destructive',
      });
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
      toast({
        title: 'Organizador atualizado',
        description: 'Os dados foram salvos com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleApproveManually = async (org: Organizer) => {
    try {
      setIsApproving(true);
      await masterService.approveOrganizerManually(org.id);
      setIsReportModalOpen(false);
      loadOrganizers();
      toast({
        title: 'Cadastro Aprovado',
        description: `O perfil de ${org.name} foi aprovado manualmente.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao aprovar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setOrgToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!orgToDeleteId) return;
    try {
      await masterService.deleteOrganizer(orgToDeleteId);
      loadOrganizers();
      toast({
        title: 'Organizador removido',
        description: 'O organizador foi removido com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message || 'Não foi possível remover o organizador.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrgToDeleteId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Organizadores</h1>
            <p className="text-gray-600 mt-1">
              Gerencie organizadores, aprove solicitações e monitore desempenho.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Organizador
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Organizadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  Ativos
                  {activeCount > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {activeCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  Prontos para Analisar
                  {pendingCount > 0 && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="incomplete" className="flex items-center gap-2">
                  Em Onboarding
                  {incompleteCount > 0 && (
                    <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {incompleteCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="m-0">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-black text-gray-900 uppercase tracking-tighter">Organizador</th>
                          <th className="px-4 py-3 text-left font-black text-gray-900 uppercase tracking-tighter">Empresa</th>
                          <th className="px-4 py-3 text-left font-black text-gray-900 uppercase tracking-tighter text-center">Eventos</th>
                          <th className="px-4 py-3 text-left font-black text-gray-900 uppercase tracking-tighter">Faturamento</th>
                          <th className="px-4 py-3 text-left font-black text-gray-900 uppercase tracking-tighter">Status</th>
                          <th className="px-4 py-3 text-left font-black text-gray-900 uppercase tracking-tighter">Cadastro</th>
                          <th className="px-4 py-3 text-right font-black text-gray-900 uppercase tracking-tighter">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-gray-800">
                        {isLoading ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              Carregando organizadores...
                            </td>
                          </tr>
                        ) : filteredOrganizers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              Nenhum organizador encontrado nesta categoria.
                            </td>
                          </tr>
                        ) : filteredOrganizers.map((org) => (
                          <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap cursor-pointer" onClick={() => handleShowReport(org)}>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3">
                                  {org.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-black text-gray-900 uppercase tracking-tight">{org.name}</div>
                                  <div className="text-gray-600 font-medium text-xs">{org.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-bold">{org.companyName || 'A2 Tickets'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-bold text-center">0</td>
                            <td className="px-4 py-3 whitespace-nowrap text-indigo-700 font-black">
                              R$ 0,00
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {org.status === 'approved' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Aprovado
                                </span>
                              ) : org.status === 'rejected' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Rejeitado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pendente
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div
                                className={`flex items-center gap-2 cursor-pointer hover:opacity-80`}
                                onClick={() => handleShowReport(org)}
                              >
                                {org.profileComplete ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Completo
                                  </span>
                                ) : (
                                  <>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                      Incompleto
                                    </span>
                                    <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              {!org.emailVerified ? (
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApprove(org.id)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  {org.status !== 'approved' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteClick(org.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Excluir (Onboarding/Pendente)"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-gray-400">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white border-gray-200 text-gray-900 shadow-xl">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer" onClick={() => handleEdit(org)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar Dados
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                                      <ShieldAlert className="mr-2 h-4 w-4" />
                                      Bloquear Acesso
                                    </DropdownMenuItem>
                                    {org.status !== 'approved' ? (
                                      <>
                                        <DropdownMenuSeparator className="bg-gray-100" />
                                        <DropdownMenuItem className="focus:bg-red-50 text-red-600 focus:text-red-600 cursor-pointer" onClick={() => handleDeleteClick(org.id)}>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </>
                                    ) : (
                                      <>
                                        <DropdownMenuSeparator className="bg-gray-100" />
                                        <DropdownMenuItem disabled className="text-gray-400 cursor-not-allowed">
                                          <ShieldAlert className="mr-2 h-4 w-4" />
                                          Exclusão Bloqueada (Conta Ativa)
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Novo Organizador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Empresa</Label>
              <Input
                id="name"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                placeholder="Ex: A2 Produções"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newOrg.email}
                onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                placeholder="contato@empresa.com"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha Temporária</Label>
              <Input
                id="password"
                type="password"
                value={newOrg.password}
                onChange={(e) => setNewOrg({ ...newOrg, password: e.target.value })}
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateOrganizer} className="bg-indigo-600 hover:bg-indigo-700">Criar Organizador</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold italic tracking-tight">EDITAR ORGANIZADOR</DialogTitle>
            <DialogDescription className="text-gray-400">
              Altere os dados básicos do organizador ou empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-400 uppercase text-[10px] font-bold tracking-widest pl-1">Nome / Empresa</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-zinc-800/50 border-white/5 rounded-xl h-12 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-gray-400 uppercase text-[10px] font-bold tracking-widest pl-1">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="bg-zinc-800/50 border-white/5 rounded-xl h-12 focus:ring-indigo-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-12">Cancelar</Button>
            <Button onClick={handleUpdateOrganizer} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 px-8 font-bold">SALVAR ALTERAÇÕES</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Perfil Completo do Produtor */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Eye className="h-5 w-5 text-indigo-500" />
              Perfil do Produtor
            </DialogTitle>
            <DialogDescription>
              Todos os dados enviados por <strong>{selectedOrg?.name}</strong> durante o onboarding.
            </DialogDescription>
          </DialogHeader>

          {selectedOrg && (
            <div className="space-y-6 py-2">

              {/* Header com logo e banner */}
              <div className="relative h-40 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 overflow-hidden border border-gray-100">
                {selectedOrg.banner_url ? (
                  <img src={selectedOrg.banner_url} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 font-bold text-sm">Sem banner</div>
                )}
                <div className="absolute bottom-4 left-4">
                  {selectedOrg.logo_url ? (
                    <img src={selectedOrg.logo_url} className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg object-cover" alt="Logo" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">SEM<br/>LOGO</div>
                  )}
                </div>
              </div>

              {/* Dados básicos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome/Empresa</p>
                  <p className="font-semibold text-gray-900">{selectedOrg.companyName || selectedOrg.name || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail</p>
                  <p className="font-semibold text-gray-900">{selectedOrg.email || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefone</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedOrg.phone || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slug / URL</p>
                  <p className="font-semibold text-indigo-600">{selectedOrg.slug ? `.../ p/${selectedOrg.slug}` : '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF</p>
                  <p className="font-semibold text-gray-900">{selectedOrg.cpf || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CNPJ</p>
                  <p className="font-semibold text-gray-900">{selectedOrg.cnpj || '—'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedOrg.address ? `${selectedOrg.address}, ${selectedOrg.city} - ${selectedOrg.state} | CEP: ${selectedOrg.postalCode}` : '—'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bio</p>
                  <p className="text-sm text-gray-600">{selectedOrg.bio || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">API Asaas</p>
                  <p className="font-semibold text-gray-900 font-mono text-xs break-all">{selectedOrg.asaas_key ? `${selectedOrg.asaas_key.slice(0, 12)}...` : '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedOrg.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedOrg.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>{selectedOrg.status}</span>
                </div>
              </div>

              {/* Documentos de identidade */}
              <div className="border-t pt-4">
                <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-500"/> Documentos de Identidade</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Frente do Documento</p>
                    {selectedOrg.documentFrontUrl || selectedOrg.document_front_url ? (
                      <a href={selectedOrg.documentFrontUrl || selectedOrg.document_front_url} target="_blank" rel="noreferrer" className="block">
                        <img src={selectedOrg.documentFrontUrl || selectedOrg.document_front_url} className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" alt="Documento Frente" />
                        <p className="text-[10px] text-indigo-500 mt-1 flex items-center gap-1"><ExternalLink className="h-3 w-3"/>Abrir em nova aba</p>
                      </a>
                    ) : (
                      <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs font-bold">NÃO ENVIADO</div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Verso do Documento</p>
                    {selectedOrg.documentBackUrl || selectedOrg.document_back_url ? (
                      <a href={selectedOrg.documentBackUrl || selectedOrg.document_back_url} target="_blank" rel="noreferrer" className="block">
                        <img src={selectedOrg.documentBackUrl || selectedOrg.document_back_url} className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" alt="Documento Verso" />
                        <p className="text-[10px] text-indigo-500 mt-1 flex items-center gap-1"><ExternalLink className="h-3 w-3"/>Abrir em nova aba</p>
                      </a>
                    ) : (
                      <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs font-bold">NÃO ENVIADO</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsReportModalOpen(false)}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => selectedOrg && window.open(`https://wa.me/${selectedOrg?.mobilePhone?.replace(/\D/g, '')}`, '_blank')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Notificar WhatsApp
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={() => selectedOrg && handleApproveManually(selectedOrg)}
              disabled={isApproving || selectedOrg?.status === 'approved'}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isApproving ? 'Aprovando...' : selectedOrg?.status === 'approved' ? 'Já Aprovado' : 'Aprovar Produtor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta de Confirmação de Exclusão (Premium) */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-2 border-red-50 rounded-[2.5rem] shadow-2xl p-0 overflow-hidden max-w-md">
          <AlertDialogHeader className="p-8 pb-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 flex items-center justify-center animate-in zoom-in duration-500">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <AlertDialogTitle className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                  Confirmar Exclusão?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 font-medium mt-2 leading-relaxed">
                  Esta ação é **irreversível**. Todos os dados do onboarding, documentos e rascunhos de eventos serão eliminados permanentemente.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-8 pt-4 flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="flex-1 h-14 rounded-2xl border-gray-100 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 m-0">
              Manter Cadastro
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-tighter shadow-lg shadow-red-100 m-0"
            >
              Sim, Excluir Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default OrganizersManagement;
