import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, MoreHorizontal, Plus, Edit, Trash2, ShieldAlert, AlertTriangle, MessageSquare } from 'lucide-react';
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

  useEffect(() => {
    loadOrganizers();
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
      ? organizers.filter(org => org.emailVerified && org.profileComplete)
      : organizers.filter(org => !org.emailVerified || !org.profileComplete);

  const pendingCount = organizers.filter(org => !org.emailVerified || !org.profileComplete).length;

  const generateProfileReport = (org: Organizer) => {
    let report = "### 📋 Pendências de Cadastro\n\n";
    report += `Olá **${org.name}**, detectamos que seu perfil ainda não está completo. Para que possamos aprovar seus eventos com agilidade, por favor complete os seguintes itens:\n\n`;

    const missing = [];
    if (!org.cnpj) missing.push("- [ ] **CNPJ ou CPF**: Documentação fiscal obrigatória.");
    if (!org.companyAddress) missing.push("- [ ] **Endereço Completo**: Necessário para contratos e notas.");
    if (!org.mobilePhone) missing.push("- [ ] **Telefone de Contato**: Vital para suporte durante eventos.");
    if (!org.logoUrl) missing.push("- [ ] **Logo da Empresa/Produtor**: Exibição na página do evento.");
    if (!org.bio) missing.push("- [ ] **Bio/Descrição**: Conte um pouco sobre sua produtora.");

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
      await masterService.updateOrganizer(id, { emailVerified: true });
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
      await masterService.updateOrganizer(selectedOrg.id, editForm);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este organizador?')) return;
    try {
      await masterService.deleteOrganizer(id);
      loadOrganizers();
      toast({
        title: 'Organizador removido',
        description: 'O organizador foi removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o organizador.',
        variant: 'destructive',
      });
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
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  Pendentes
                  {pendingCount > 0 && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {pendingCount}
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
                            <td className="px-4 py-3 whitespace-nowrap cursor-pointer" onClick={() => !org.profileComplete && handleShowReport(org)}>
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
                              {org.emailVerified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pendente
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div
                                className={`flex items-center gap-2 ${!org.profileComplete ? 'cursor-pointer hover:opacity-80' : ''}`}
                                onClick={() => !org.profileComplete && handleShowReport(org)}
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
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(org.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <DropdownMenuItem className="focus:bg-red-50 text-red-600 focus:text-red-600 cursor-pointer" onClick={() => handleDelete(org.id)}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
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
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
              Relatório de Validação
            </DialogTitle>
            <DialogDescription>
              Confira os dados que faltam para o perfil de **{selectedOrg?.name}**.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 px-4 bg-gray-50 rounded-xl border border-gray-100 font-mono text-sm whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
            {selectedOrg && generateProfileReport(selectedOrg)}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
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
                onClick={() => selectedOrg && handleApproveManually(selectedOrg)}
                disabled={isApproving}
              >
                {isApproving ? 'Aprovando...' : 'Aprovar Manualmente'}
              </Button>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex-1 font-bold"
              onClick={() => window.open(`https://wa.me/${selectedOrg?.mobilePhone?.replace(/\D/g, '')}`, '_blank')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Notificar via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default OrganizersManagement;
