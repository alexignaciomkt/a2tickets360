import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { staffService } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import {
    Clock,
    UserCircle,
    Briefcase,
    Phone,
    Plus,
    Pencil,
    CheckCircle2,
    PauseCircle,
    XCircle,
    Calendar,
    Users
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function OrganizerEventStaffApplicationsTab({ eventId, eventStartDate }: { eventId: string, eventStartDate?: string }) {
    const { toast } = useToast();

    // Candidaturas
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [functions, setFunctions] = useState<any[]>([]);

    // Vagas de Staff
    const [vacancies, setVacancies] = useState<any[]>([]);
    const [vacanciesLoading, setVacanciesLoading] = useState(true);
    const [professionalCatalog, setProfessionalCatalog] = useState<any[]>([]);
    const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
    const [editVacancyModalOpen, setEditVacancyModalOpen] = useState(false);
    const [newVacancyData, setNewVacancyData] = useState({ professionalFunctionId: '', quantity: 1, status: 'OPEN' });
    const [editingVacancy, setEditingVacancy] = useState<any | null>(null);
    const [savingVacancy, setSavingVacancy] = useState(false);

    // Modal de Perfil do Candidato
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [currentAppId, setCurrentAppId] = useState<string | null>(null);

    // Modal de Aprovação / Proposta
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [approvalData, setApprovalData] = useState({ staffFunctionId: '', shiftDate: '', shiftStart: '', shiftEnd: '' });
    const [processing, setProcessing] = useState(false);
    const [isEditingProposal, setIsEditingProposal] = useState(false);

    useEffect(() => {
        if (eventId) {
            loadData();
            loadVacancies();
        }
    }, [eventId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [appsData, funcsData] = await Promise.all([
                staffService.getEventApplications(eventId),
                staffService.getFunctions()
            ]);
            setApplications(appsData);
            setFunctions(funcsData);
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar as candidaturas.');
            toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao carregar candidaturas.' });
        } finally {
            setLoading(false);
        }
    };

    const loadVacancies = async () => {
        try {
            setVacanciesLoading(true);
            const [vacData, catData] = await Promise.all([
                staffService.getEventVacancies(eventId),
                staffService.getProfessionalFunctions()
            ]);
            setVacancies(vacData);
            setProfessionalCatalog(catData);
        } catch (err) {
            console.error('Erro ao carregar vagas:', err);
        } finally {
            setVacanciesLoading(false);
        }
    };

    const handleCreateVacancy = async () => {
        if (!newVacancyData.professionalFunctionId) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Selecione uma função profissional.' });
        }
        if (!newVacancyData.quantity || newVacancyData.quantity <= 0) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Informe uma quantidade válida (maior que 0).' });
        }

        try {
            setSavingVacancy(true);
            await staffService.createEventVacancy(eventId, {
                professionalFunctionId: newVacancyData.professionalFunctionId,
                quantity: Number(newVacancyData.quantity),
                status: newVacancyData.status as any
            });
            toast({ title: 'Sucesso', description: 'Vaga adicionada com sucesso!' });
            setVacancyModalOpen(false);
            setNewVacancyData({ professionalFunctionId: '', quantity: 1, status: 'OPEN' });
            await loadVacancies();
        } catch (err: any) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Erro', description: err.response?.data?.error || 'Erro ao adicionar vaga.' });
        } finally {
            setSavingVacancy(false);
        }
    };

    const handleUpdateVacancy = async () => {
        if (!editingVacancy) return;
        if (!editingVacancy.quantity || editingVacancy.quantity <= 0) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Informe uma quantidade válida (maior que 0).' });
        }

        try {
            setSavingVacancy(true);
            await staffService.updateEventVacancy(eventId, editingVacancy.id, {
                quantity: Number(editingVacancy.quantity),
                status: editingVacancy.status
            });
            toast({ title: 'Sucesso', description: 'Vaga atualizada com sucesso!' });
            setEditVacancyModalOpen(false);
            setEditingVacancy(null);
            await loadVacancies();
        } catch (err: any) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Erro', description: err.response?.data?.error || 'Erro ao atualizar vaga.' });
        } finally {
            setSavingVacancy(false);
        }
    };

    const handleQuickStatusChange = async (vacancyId: string, newStatus: 'OPEN' | 'PAUSED' | 'CLOSED') => {
        try {
            await staffService.updateEventVacancy(eventId, vacancyId, { status: newStatus });
            toast({ title: 'Status Atualizado', description: `Vaga definida como ${newStatus}.` });
            await loadVacancies();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Erro', description: err.response?.data?.error || 'Erro ao alterar status da vaga.' });
        }
    };

    const handleViewProfile = async (appId: string) => {
        try {
            setCurrentAppId(appId);
            setProfileLoading(true);
            setProfileModalOpen(true);
            const profile = await staffService.getCandidateProfile(eventId, appId);
            setSelectedProfile(profile);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || 'Erro ao carregar perfil.' });
            setProfileModalOpen(false);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleReject = async (appId: string) => {
        if (!confirm('Tem certeza que deseja recusar este candidato?')) return;
        try {
            setProcessing(true);
            await staffService.rejectApplication(eventId, appId);
            toast({ title: 'Sucesso', description: 'Candidatura recusada.' });
            await loadData();
            if (currentAppId === appId) setProfileModalOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || 'Erro ao recusar.' });
        } finally {
            setProcessing(false);
        }
    };

    const openApprovalModal = (appId: string) => {
        setCurrentAppId(appId);
        setIsEditingProposal(false);
        const defaultDate = eventStartDate ? eventStartDate.split('T')[0] : new Date().toISOString().split('T')[0];
        setApprovalData({ staffFunctionId: '', shiftDate: defaultDate, shiftStart: '', shiftEnd: '' });
        setApprovalModalOpen(true);
    };

    const openEditProposalModal = async (appId: string, eventStaffRecord: any) => {
        setCurrentAppId(appId);
        setIsEditingProposal(true);
        const sDate = eventStaffRecord.shiftStart ? eventStaffRecord.shiftStart.split('T')[0] : '';
        const sTime = eventStaffRecord.shiftStart ? eventStaffRecord.shiftStart.split('T')[1].substring(0, 5) : '';
        const eTime = eventStaffRecord.shiftEnd ? eventStaffRecord.shiftEnd.split('T')[1].substring(0, 5) : '';
        setApprovalData({
            staffFunctionId: eventStaffRecord.staffFunctionId || '',
            shiftDate: sDate,
            shiftStart: sTime,
            shiftEnd: eTime
        });
        setApprovalModalOpen(true);
    };

    const handleApprove = async () => {
        if (!currentAppId) return;
        if (!approvalData.staffFunctionId) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Selecione uma função.' });
        }
        if (!approvalData.shiftDate) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Selecione a data do turno.' });
        }
        try {
            setProcessing(true);
            if (isEditingProposal) {
                await staffService.updateApplicationProposal(eventId, currentAppId, approvalData);
                toast({ title: 'Sucesso', description: 'Proposta atualizada!' });
            } else {
                await staffService.approveApplication(eventId, currentAppId, approvalData);
                toast({ title: 'Sucesso', description: 'Candidatura aprovada! Convite enviado.' });
            }
            setApprovalModalOpen(false);
            setProfileModalOpen(false);
            await loadData();
            await loadVacancies();
        } catch (error: any) {
            console.error('[PROPOSAL FRONT] ERROR', error);
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || 'Erro na operação.' });
        } finally {
            setProcessing(false);
        }
    };

    // Obter funções disponíveis para adicionar (não duplicadas)
    const existingFunctionIds = new Set(vacancies.map(v => v.professionalFunctionId));
    const availableCatalogFunctions = professionalCatalog.filter(f => !existingFunctionIds.has(f.id));

    return (
        <div className="space-y-10">
            {/* ======================================================== */}
            {/* SEÇÃO 1: VAGAS DE STAFF DO EVENTO                        */}
            {/* ======================================================== */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" />
                            Vagas de Staff do Evento
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Defina as necessidades de pessoal deste evento para abrir o recrutamento para os profissionais.
                        </p>
                    </div>
                    <Button
                        onClick={() => setVacancyModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase flex items-center gap-2 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Vaga
                    </Button>
                </div>

                {vacanciesLoading ? (
                    <div className="text-center py-10 text-slate-400 font-medium">Carregando vagas...</div>
                ) : vacancies.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700">Nenhuma vaga cadastrada</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                            Cadastre as vagas necessárias para que este evento apareça na lista de "Eventos para Trabalhar" dos profissionais.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVacancyModalOpen(true)}
                            className="font-semibold text-primary border-primary/30 hover:bg-primary/5"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Abrir primeira vaga
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vacancies.map((v) => (
                            <Card key={v.id} className="border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                                <CardHeader className="p-4 pb-3 bg-slate-50/50 border-b border-slate-100 flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-900">
                                            {v.functionName}
                                        </CardTitle>
                                        <span className="text-[11px] text-slate-500 font-medium">{v.functionCategory || 'Geral'}</span>
                                    </div>
                                    <div>
                                        {v.status === 'OPEN' && (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                                                ABERTA
                                            </Badge>
                                        )}
                                        {v.status === 'PAUSED' && (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[10px]">
                                                PAUSADA
                                            </Badge>
                                        )}
                                        {v.status === 'CLOSED' && (
                                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-bold text-[10px]">
                                                FECHADA
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Vagas</p>
                                            <p className="text-lg font-black text-slate-900">{v.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Confirmados</p>
                                            <p className="text-lg font-black text-emerald-600">{v.confirmed}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Disponíveis</p>
                                            <p className="text-lg font-black text-blue-600">{v.remaining}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-8 flex-1"
                                            onClick={() => {
                                                setEditingVacancy({
                                                    id: v.id,
                                                    functionName: v.functionName,
                                                    quantity: v.quantity,
                                                    status: v.status
                                                });
                                                setEditVacancyModalOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-3 h-3 mr-1 text-slate-500" />
                                            Editar
                                        </Button>

                                        {v.status === 'OPEN' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-8 text-amber-700 border-amber-200 hover:bg-amber-50"
                                                onClick={() => handleQuickStatusChange(v.id, 'PAUSED')}
                                            >
                                                <PauseCircle className="w-3.5 h-3.5 mr-1" />
                                                Pausar
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                                onClick={() => handleQuickStatusChange(v.id, 'OPEN')}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                Abrir
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* SEÇÃO 2: CANDIDATURAS RECEBIDAS                          */}
            {/* ======================================================== */}
            <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Candidaturas Recebidas
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Gerencie os profissionais que demonstraram interesse nas vagas deste evento.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">Carregando candidaturas...</div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                        <h3 className="text-lg font-semibold text-red-700">Erro ao carregar</h3>
                        <p className="text-red-500 mt-1">{error}</p>
                        <Button variant="outline" className="mt-4 text-red-600 border-red-200 hover:bg-red-50" onClick={loadData}>
                            Tentar novamente
                        </Button>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                        <UserCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700">Nenhuma candidatura recebida ainda</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                            Assim que profissionais se candidatarem para as vagas abertas, seus perfis aparecerão aqui para análise.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <Card key={app.applicationId} className="flex flex-col border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="pb-3 border-b border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={app.user.avatarUrl} />
                                                <AvatarFallback>{app.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-base font-bold text-slate-900">{app.user.name}</CardTitle>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {app.user.city ? `${app.user.city}/${app.user.state}` : 'Local não informado'}
                                                </p>
                                            </div>
                                        </div>
                                        {app.status === 'PENDING' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-[11px]">Em Análise</Badge>}
                                        {app.status === 'APPROVED' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[11px]">Aprovado</Badge>}
                                        {app.status === 'REJECTED' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-semibold text-[11px]">Recusado</Badge>}
                                        {app.status === 'CANCELLED' && <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold text-[11px]">Cancelado</Badge>}
                                    </div>
                                </CardHeader>
                                <CardContent className="py-4 flex-1">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Candidatou-se para:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {app.functions?.map((f: any) => (
                                                    <Badge key={f.id} variant="secondary" className="font-medium bg-slate-100 text-slate-800">{f.name}</Badge>
                                                ))}
                                                {(!app.functions || app.functions.length === 0) && <span className="text-sm text-gray-500">Vaga geral</span>}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 bg-gray-50 rounded-b-xl flex gap-2 p-4 mt-auto flex-wrap">
                                    <Button variant="outline" className="flex-1 min-w-[130px] font-semibold text-xs" onClick={() => handleViewProfile(app.applicationId)}>
                                        Ver Perfil
                                    </Button>
                                    {app.status === 'PENDING' && (
                                        <Button className="bg-primary hover:bg-primary/90 text-white flex-1 min-w-[130px] font-bold text-xs uppercase" onClick={() => openApprovalModal(app.applicationId)}>
                                            Aprovar
                                        </Button>
                                    )}
                                    {app.status === 'APPROVED' && app.eventStaffStatus === 'PENDING_ACCEPTANCE' && (
                                        <Button variant="outline" className="flex-1 min-w-[130px] border-primary text-primary hover:bg-primary/5 font-semibold text-xs" onClick={() => openEditProposalModal(app.applicationId, app.eventStaff)}>
                                            Editar Proposta
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODAL: ADICIONAR VAGA                                    */}
            {/* ======================================================== */}
            <Dialog open={vacancyModalOpen} onOpenChange={setVacancyModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adicionar Vaga de Staff</DialogTitle>
                        <DialogDescription>
                            Selecione a função profissional necessária e a quantidade de vagas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <div className="space-y-2">
                            <Label htmlFor="vacancy-function">Função Profissional <span className="text-red-500">*</span></Label>
                            <Select
                                value={newVacancyData.professionalFunctionId}
                                onValueChange={(val) => setNewVacancyData({ ...newVacancyData, professionalFunctionId: val })}
                            >
                                <SelectTrigger id="vacancy-function">
                                    <SelectValue placeholder="Selecione a função" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {availableCatalogFunctions.map(f => (
                                        <SelectItem key={f.id} value={f.id}>
                                            {f.name} ({f.category})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {availableCatalogFunctions.length === 0 && (
                                <p className="text-xs text-amber-600">Todas as funções do catálogo já possuem vagas cadastradas neste evento.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vacancy-qty">Quantidade de Vagas <span className="text-red-500">*</span></Label>
                            <Input
                                id="vacancy-qty"
                                type="number"
                                min={1}
                                value={newVacancyData.quantity}
                                onChange={(e) => setNewVacancyData({ ...newVacancyData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vacancy-status">Status Inicial</Label>
                            <Select
                                value={newVacancyData.status}
                                onValueChange={(val) => setNewVacancyData({ ...newVacancyData, status: val })}
                            >
                                <SelectTrigger id="vacancy-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPEN">Aberta (visível para candidatura)</SelectItem>
                                    <SelectItem value="PAUSED">Pausada</SelectItem>
                                    <SelectItem value="CLOSED">Fechada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVacancyModalOpen(false)} disabled={savingVacancy}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateVacancy} disabled={savingVacancy || !newVacancyData.professionalFunctionId} className="bg-primary text-white font-bold">
                            {savingVacancy ? 'Adicionando...' : 'Adicionar Vaga'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ======================================================== */}
            {/* MODAL: EDITAR VAGA                                       */}
            {/* ======================================================== */}
            <Dialog open={editVacancyModalOpen} onOpenChange={setEditVacancyModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Vaga: {editingVacancy?.functionName}</DialogTitle>
                        <DialogDescription>
                            Ajuste a quantidade necessária e o status da vaga.
                        </DialogDescription>
                    </DialogHeader>

                    {editingVacancy && (
                        <div className="space-y-4 py-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-vacancy-qty">Quantidade de Vagas <span className="text-red-500">*</span></Label>
                                <Input
                                    id="edit-vacancy-qty"
                                    type="number"
                                    min={1}
                                    value={editingVacancy.quantity}
                                    onChange={(e) => setEditingVacancy({ ...editingVacancy, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-vacancy-status">Status da Vaga</Label>
                                <Select
                                    value={editingVacancy.status}
                                    onValueChange={(val) => setEditingVacancy({ ...editingVacancy, status: val })}
                                >
                                    <SelectTrigger id="edit-vacancy-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Aberta</SelectItem>
                                        <SelectItem value="PAUSED">Pausada</SelectItem>
                                        <SelectItem value="CLOSED">Fechada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditVacancyModalOpen(false)} disabled={savingVacancy}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateVacancy} disabled={savingVacancy} className="bg-primary text-white font-bold">
                            {savingVacancy ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ======================================================== */}
            {/* MODAL: VER PERFIL DO CANDIDATO                           */}
            {/* ======================================================== */}
            <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Perfil do Candidato</DialogTitle>
                    </DialogHeader>
                    {profileLoading ? (
                        <div className="py-12 text-center text-slate-500 font-medium">Carregando dados do candidato...</div>
                    ) : selectedProfile ? (
                        <div className="space-y-6">
                            {/* Cabeçalho do Candidato */}
                            <div className="flex items-center gap-4 border-b pb-4">
                                <Avatar className="h-16 w-16 border">
                                    <AvatarImage src={selectedProfile.avatarUrl} />
                                    <AvatarFallback className="text-2xl font-bold bg-slate-100 text-slate-800">
                                        {(selectedProfile.name?.charAt(0) || '?').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900">{selectedProfile.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {selectedProfile.city ? `${selectedProfile.city}/${selectedProfile.state}` : 'Local não informado'}
                                    </p>
                                    {selectedProfile.status && (
                                        <div className="pt-0.5">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                                Status: {selectedProfile.status === 'PENDING' ? 'Em Análise' : selectedProfile.status}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contato Operacional */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contato Operacional (WhatsApp)</p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{selectedProfile.phone || 'Telefone não informado'}</span>
                                </div>
                            </div>

                            {/* Vaga Solicitada */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vaga Escolhida no Evento</p>
                                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                                    <p className="text-sm font-bold text-blue-900">
                                        {selectedProfile.vacancy?.functionName ||
                                         selectedProfile.applicationFunctions?.[0]?.name ||
                                         'Vaga Operacional'}
                                    </p>
                                </div>
                            </div>

                            {/* Apresentação / Bio */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apresentação / Bio</p>
                                <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                                    {selectedProfile.bio || 'O candidato não informou uma biografia.'}
                                </p>
                            </div>

                            {/* Funções do Perfil Profissional */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Funções Declaradas no Perfil</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProfile.professionalFunctions?.map((f: any) => (
                                        <Badge key={f.id} variant="secondary" className="font-medium bg-slate-100 text-slate-800">
                                            {f.name}
                                        </Badge>
                                    ))}
                                    {(!selectedProfile.professionalFunctions || selectedProfile.professionalFunctions.length === 0) && (
                                        <span className="text-sm text-slate-400">Nenhuma função declarada</span>
                                    )}
                                </div>
                            </div>

                            {/* Histórico na Plataforma A2Tickets360 */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Eventos Já Trabalhados na A2</p>
                                {selectedProfile.workedEvents && selectedProfile.workedEvents.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedProfile.workedEvents.map((evt: any) => (
                                            <div key={evt.eventId} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="font-semibold text-slate-800 truncate mr-2">{evt.title}</div>
                                                <Badge variant="outline" className="text-[11px] font-medium shrink-0 bg-white">
                                                    {evt.roleName || 'Staff'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 font-medium">
                                        Primeiro trabalho na plataforma A2Tickets360.
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="border-t pt-4">
                                {applications.find(a => a.applicationId === currentAppId)?.status === 'PENDING' && (
                                    <div className="flex w-full justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            onClick={() => handleReject(currentAppId!)}
                                            disabled={processing}
                                        >
                                            Recusar
                                        </Button>
                                        <Button
                                            className="bg-primary hover:bg-primary/90 text-white font-bold"
                                            onClick={() => openApprovalModal(currentAppId!)}
                                            disabled={processing}
                                        >
                                            Aprovar e Enviar Proposta
                                        </Button>
                                    </div>
                                )}
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="py-10 text-center text-red-500 font-medium">Erro ao carregar perfil do candidato.</div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ======================================================== */}
            {/* MODAL: APROVAÇÃO / EDITAR PROPOSTA                       */}
            {/* ======================================================== */}
            <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditingProposal ? 'Editar Proposta' : 'Aprovar Candidato'}</DialogTitle>
                        <DialogDescription>
                            {isEditingProposal
                                ? 'Altere a função ou os horários do turno. O candidato precisará aceitar a proposta com os novos dados.'
                                : 'Ao aprovar, o candidato receberá uma proposta com a função e horários que você definir abaixo. O vínculo só ficará "Ativo" após o aceite do candidato.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Função Operacional <span className="text-red-500">*</span></Label>
                            <Select
                                value={approvalData.staffFunctionId}
                                onValueChange={(val) => setApprovalData({...approvalData, staffFunctionId: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a função" />
                                </SelectTrigger>
                                <SelectContent>
                                    {functions.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">Selecione uma de suas funções operacionais cadastradas.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Data do Turno</Label>
                                <Input
                                    type="date"
                                    value={approvalData.shiftDate}
                                    onChange={(e) => setApprovalData({...approvalData, shiftDate: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Início do Turno</Label>
                                    <Input
                                        type="time"
                                        value={approvalData.shiftStart}
                                        onChange={(e) => setApprovalData({...approvalData, shiftStart: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fim do Turno</Label>
                                    <Input
                                        type="time"
                                        value={approvalData.shiftEnd}
                                        onChange={(e) => setApprovalData({...approvalData, shiftEnd: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApprovalModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleApprove} disabled={processing} className="bg-primary text-white font-bold">
                            {processing ? 'Salvando...' : (isEditingProposal ? 'Salvar Alterações' : 'Confirmar Aprovação')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
