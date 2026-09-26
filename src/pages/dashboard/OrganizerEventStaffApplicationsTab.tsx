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
    Users,
    DollarSign,
    Check
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function OrganizerEventStaffApplicationsTab({ eventId, eventStartDate }: { eventId: string, eventStartDate?: string }) {
    const { toast } = useToast();

    // Candidaturas
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [functions, setFunctions] = useState<any[]>([]);
    const [availableRoles, setAvailableRoles] = useState<any[]>([]);

    // Vagas de Staff
    const [vacancies, setVacancies] = useState<any[]>([]);
    const [vacanciesLoading, setVacanciesLoading] = useState(true);
    const [professionalCatalog, setProfessionalCatalog] = useState<any[]>([]);
    const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
    const [editVacancyModalOpen, setEditVacancyModalOpen] = useState(false);

    const defaultNewVacancy = {
        professionalFunctionId: '',
        quantity: 1,
        status: 'OPEN',
        workDate: eventStartDate ? eventStartDate.split('T')[0] : '',
        startTime: '08:00',
        expectedEndTime: '18:00',
        compensationAmount: '',
        compensationType: 'DAILY',
        currency: 'BRL',
        publicNotes: ''
    };

    const [newVacancyData, setNewVacancyData] = useState(defaultNewVacancy);
    const [editingVacancy, setEditingVacancy] = useState<any | null>(null);
    const [savingVacancy, setSavingVacancy] = useState(false);

    // Modal de Perfil do Candidato
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [currentAppId, setCurrentAppId] = useState<string | null>(null);

    // Modal de Aprovação / Proposta
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [approvalData, setApprovalData] = useState({
        staffFunctionId: '',
        contractType: 'daily',
        compensationAmount: '',
        compensationType: 'DAILY',
        currency: 'BRL',
        shiftDate: '',
        shiftStart: '',
        shiftEnd: '',
        breakDuration: 60,
        systemRoleIds: [] as string[]
    });
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
            const [appsData, funcsData, rolesData] = await Promise.all([
                staffService.getEventApplications(eventId),
                staffService.getFunctions(),
                staffService.getRoles()
            ]);
            setApplications(appsData);
            setFunctions(funcsData);
            setAvailableRoles(rolesData || []);
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
        if (!newVacancyData.workDate) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Informe a data do trabalho.' });
        }
        if (!newVacancyData.startTime) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Informe o horário de início.' });
        }
        if (!newVacancyData.expectedEndTime) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Informe o término previsto.' });
        }
        if (!newVacancyData.compensationAmount) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Informe o valor da remuneração.' });
        }

        try {
            setSavingVacancy(true);
            await staffService.createEventVacancy(eventId, {
                professionalFunctionId: newVacancyData.professionalFunctionId,
                quantity: Number(newVacancyData.quantity),
                status: newVacancyData.status as any,
                workDate: newVacancyData.workDate,
                startTime: newVacancyData.startTime,
                expectedEndTime: newVacancyData.expectedEndTime,
                compensationAmount: Number(newVacancyData.compensationAmount),
                compensationType: newVacancyData.compensationType,
                currency: 'BRL',
                publicNotes: newVacancyData.publicNotes || null
            });
            toast({ title: 'Sucesso', description: 'Vaga adicionada com sucesso!' });
            setVacancyModalOpen(false);
            setNewVacancyData(defaultNewVacancy);
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
                status: editingVacancy.status,
                workDate: editingVacancy.workDate || null,
                startTime: editingVacancy.startTime || null,
                expectedEndTime: editingVacancy.expectedEndTime || null,
                compensationAmount: editingVacancy.compensationAmount ? Number(editingVacancy.compensationAmount) : null,
                compensationType: editingVacancy.compensationType || 'DAILY',
                currency: 'BRL',
                publicNotes: editingVacancy.publicNotes || null
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
        const app = applications.find(a => a.applicationId === appId);
        const matchedVacancy = vacancies.find(v => v.id === app?.vacancyId) || app?.vacancy;

        const defDate = matchedVacancy?.workDate || (eventStartDate ? eventStartDate.split('T')[0] : new Date().toISOString().split('T')[0]);
        const defStart = matchedVacancy?.startTime ? matchedVacancy.startTime.substring(0, 5) : '08:00';
        const defEnd = matchedVacancy?.expectedEndTime ? matchedVacancy.expectedEndTime.substring(0, 5) : '18:00';
        const defCompAmount = matchedVacancy?.compensationAmount ? String(matchedVacancy.compensationAmount) : '';
        const defCompType = matchedVacancy?.compensationType || 'DAILY';

        let defContractType = 'daily';
        if (defCompType === 'HOURLY') defContractType = 'freelance';
        else if (defCompType === 'DAILY') defContractType = 'daily';
        else if (defCompType === 'EVENT' || defCompType === 'FIXED') defContractType = 'freelance';

        setApprovalData({
            staffFunctionId: '',
            contractType: defContractType,
            compensationAmount: defCompAmount,
            compensationType: defCompType,
            currency: matchedVacancy?.currency || 'BRL',
            shiftDate: defDate,
            shiftStart: defStart,
            shiftEnd: defEnd,
            breakDuration: 60,
            systemRoleIds: []
        });
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
            contractType: eventStaffRecord.contractType || 'daily',
            compensationAmount: eventStaffRecord.compensationAmount ? String(eventStaffRecord.compensationAmount) : '',
            compensationType: eventStaffRecord.compensationType || 'DAILY',
            currency: eventStaffRecord.currency || 'BRL',
            shiftDate: sDate,
            shiftStart: sTime,
            shiftEnd: eTime,
            breakDuration: 60,
            systemRoleIds: eventStaffRecord.systemRoleIds || []
        });
        setApprovalModalOpen(true);
    };

    const handleApprove = async () => {
        if (!currentAppId) return;
        if (!approvalData.staffFunctionId) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Selecione a função operacional.' });
        }
        if (!approvalData.contractType) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Selecione o tipo de contrato.' });
        }
        if (!approvalData.compensationAmount) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Informe o valor da remuneração.' });
        }
        if (!approvalData.shiftDate) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Selecione a data do primeiro turno.' });
        }
        if (!approvalData.shiftStart || !approvalData.shiftEnd) {
            return toast({ variant: 'destructive', title: 'Erro', description: 'Informe o início e fim do turno.' });
        }

        try {
            setProcessing(true);
            const payload: any = {
                staffFunctionId: approvalData.staffFunctionId,
                contractType: approvalData.contractType,
                compensationAmount: Number(approvalData.compensationAmount),
                compensationType: approvalData.compensationType,
                currency: approvalData.currency || 'BRL',
                shiftDate: approvalData.shiftDate,
                shiftStart: approvalData.shiftStart,
                shiftEnd: approvalData.shiftEnd,
                breakDuration: Number(approvalData.breakDuration) || 0,
                systemRoleIds: approvalData.systemRoleIds
            };

            if (isEditingProposal) {
                await staffService.updateApplicationProposal(eventId, currentAppId, payload);
                toast({ title: 'Sucesso', description: 'Proposta atualizada!' });
            } else {
                await staffService.approveApplication(eventId, currentAppId, payload);
                toast({ title: 'Sucesso', description: 'Candidatura aprovada! Proposta enviada.' });
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
                                <CardContent className="p-4 space-y-3">
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex items-center justify-between text-slate-600">
                                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {v.workDate ? new Date(v.workDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Data a definir'}
                                            </span>
                                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {v.startTime && v.expectedEndTime
                                                    ? `${v.startTime.substring(0, 5)} → ${v.expectedEndTime.substring(0, 5)}`
                                                    : (v.startTime ? `Início: ${v.startTime.substring(0, 5)}` : 'Horário a definir')}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1.5 px-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remuneração</span>
                                            <span className="font-bold text-slate-900">
                                                {v.compensationAmount ? (
                                                    <>
                                                        <span className="text-emerald-700 font-black">
                                                            R$ {Number(v.compensationAmount).toFixed(2).replace('.', ',')}
                                                        </span>
                                                        <span className="text-slate-500 font-medium text-[11px] ml-1">
                                                            / {v.compensationType === 'DAILY' ? 'diária' : v.compensationType === 'HOURLY' ? 'hora' : v.compensationType === 'EVENT' ? 'evento' : 'fixo'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">A combinar</span>
                                                )}
                                            </span>
                                        </div>

                                        {v.publicNotes && (
                                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic line-clamp-2">
                                                "{v.publicNotes}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50/80 rounded-lg border border-slate-100">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Vagas</p>
                                            <p className="text-base font-black text-slate-900">{v.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Confirmados</p>
                                            <p className="text-base font-black text-emerald-600">{v.confirmed}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Disponíveis</p>
                                            <p className="text-base font-black text-blue-600">{v.remaining}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-8 flex-1 font-semibold"
                                            onClick={() => {
                                                setEditingVacancy({
                                                    id: v.id,
                                                    functionName: v.functionName,
                                                    quantity: v.quantity,
                                                    status: v.status,
                                                    workDate: v.workDate || '',
                                                    startTime: v.startTime ? v.startTime.substring(0, 5) : '',
                                                    expectedEndTime: v.expectedEndTime ? v.expectedEndTime.substring(0, 5) : '',
                                                    compensationAmount: v.compensationAmount ? String(v.compensationAmount) : '',
                                                    compensationType: v.compensationType || 'DAILY',
                                                    currency: v.currency || 'BRL',
                                                    publicNotes: v.publicNotes || ''
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
            {/* ======================================================== */}
            {/* MODAL: ADICIONAR VAGA                                    */}
            {/* ======================================================== */}
            <Dialog open={vacancyModalOpen} onOpenChange={setVacancyModalOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Adicionar Vaga de Staff</DialogTitle>
                        <DialogDescription>
                            Configure a função profissional, escala prevista e termos financeiros da vaga.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-2">
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
                                    <p className="text-xs text-amber-600">Todas as funções do catálogo já possuem vagas cadastradas.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vacancy-qty">Qtd. Vagas <span className="text-red-500">*</span></Label>
                                <Input
                                    id="vacancy-qty"
                                    type="number"
                                    min={1}
                                    value={newVacancyData.quantity}
                                    onChange={(e) => setNewVacancyData({ ...newVacancyData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vacancy-work-date">Data do Trabalho <span className="text-red-500">*</span></Label>
                            <Input
                                id="vacancy-work-date"
                                type="date"
                                value={newVacancyData.workDate}
                                onChange={(e) => setNewVacancyData({ ...newVacancyData, workDate: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="vacancy-start-time">Horário de Início <span className="text-red-500">*</span></Label>
                                <Input
                                    id="vacancy-start-time"
                                    type="time"
                                    value={newVacancyData.startTime}
                                    onChange={(e) => setNewVacancyData({ ...newVacancyData, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vacancy-end-time">Término Previsto <span className="text-red-500">*</span></Label>
                                <Input
                                    id="vacancy-end-time"
                                    type="time"
                                    value={newVacancyData.expectedEndTime}
                                    onChange={(e) => setNewVacancyData({ ...newVacancyData, expectedEndTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="vacancy-comp-amount">Remuneração (R$) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="vacancy-comp-amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0,00"
                                    value={newVacancyData.compensationAmount}
                                    onChange={(e) => setNewVacancyData({ ...newVacancyData, compensationAmount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vacancy-comp-type">Pagamento por <span className="text-red-500">*</span></Label>
                                <Select
                                    value={newVacancyData.compensationType}
                                    onValueChange={(val) => setNewVacancyData({ ...newVacancyData, compensationType: val })}
                                >
                                    <SelectTrigger id="vacancy-comp-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Diária</SelectItem>
                                        <SelectItem value="HOURLY">Hora</SelectItem>
                                        <SelectItem value="EVENT">Evento</SelectItem>
                                        <SelectItem value="FIXED">Valor fixo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vacancy-notes">Informações para o Staff</Label>
                            <Textarea
                                id="vacancy-notes"
                                rows={3}
                                placeholder="Ex: Alimentação fornecida pela produção. Apresentação 30 minutos antes do início."
                                value={newVacancyData.publicNotes}
                                onChange={(e) => setNewVacancyData({ ...newVacancyData, publicNotes: e.target.value })}
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
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Vaga: {editingVacancy?.functionName}</DialogTitle>
                        <DialogDescription>
                            Ajuste os detalhes operacionais, remuneração e status da vaga.
                        </DialogDescription>
                    </DialogHeader>

                    {editingVacancy && (
                        <div className="space-y-4 py-3">
                            <div className="grid grid-cols-2 gap-3">
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

                            <div className="space-y-2">
                                <Label htmlFor="edit-vacancy-work-date">Data do Trabalho</Label>
                                <Input
                                    id="edit-vacancy-work-date"
                                    type="date"
                                    value={editingVacancy.workDate || ''}
                                    onChange={(e) => setEditingVacancy({ ...editingVacancy, workDate: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-vacancy-start-time">Horário de Início</Label>
                                    <Input
                                        id="edit-vacancy-start-time"
                                        type="time"
                                        value={editingVacancy.startTime || ''}
                                        onChange={(e) => setEditingVacancy({ ...editingVacancy, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-vacancy-end-time">Término Previsto</Label>
                                    <Input
                                        id="edit-vacancy-end-time"
                                        type="time"
                                        value={editingVacancy.expectedEndTime || ''}
                                        onChange={(e) => setEditingVacancy({ ...editingVacancy, expectedEndTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-vacancy-comp-amount">Remuneração (R$)</Label>
                                    <Input
                                        id="edit-vacancy-comp-amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={editingVacancy.compensationAmount || ''}
                                        onChange={(e) => setEditingVacancy({ ...editingVacancy, compensationAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-vacancy-comp-type">Pagamento por</Label>
                                    <Select
                                        value={editingVacancy.compensationType || 'DAILY'}
                                        onValueChange={(val) => setEditingVacancy({ ...editingVacancy, compensationType: val })}
                                    >
                                        <SelectTrigger id="edit-vacancy-comp-type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Diária</SelectItem>
                                            <SelectItem value="HOURLY">Hora</SelectItem>
                                            <SelectItem value="EVENT">Evento</SelectItem>
                                            <SelectItem value="FIXED">Valor fixo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-vacancy-notes">Informações para o Staff</Label>
                                <Textarea
                                    id="edit-vacancy-notes"
                                    rows={3}
                                    placeholder="Ex: Alimentação fornecida pela produção."
                                    value={editingVacancy.publicNotes || ''}
                                    onChange={(e) => setEditingVacancy({ ...editingVacancy, publicNotes: e.target.value })}
                                />
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
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditingProposal ? 'Editar Proposta de Contratação' : 'Aprovar Candidato e Enviar Proposta'}</DialogTitle>
                        <DialogDescription>
                            {isEditingProposal
                                ? 'Altere as condições de contratação ou turnos. O candidato precisará aceitar a proposta com os novos dados.'
                                : 'Defina os termos contratuais e escala. O vínculo ficará como PENDENTE DE ACEITE até a confirmação do candidato.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {/* Banner da Vaga Escolhida e Condições Anunciadas */}
                    {(() => {
                        const app = applications.find(a => a.applicationId === currentAppId);
                        const matchedVacancy = vacancies.find(v => v.id === app?.vacancyId) || app?.vacancy;
                        if (!matchedVacancy) return null;
                        return (
                            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs space-y-1.5">
                                <div className="flex items-center justify-between font-bold text-blue-900">
                                    <span>Vaga Escolhida: {matchedVacancy.functionName}</span>
                                    <Badge variant="outline" className="bg-blue-100/50 text-blue-800 border-blue-200">
                                        Anunciada
                                    </Badge>
                                </div>
                                <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                                    {matchedVacancy.workDate && (
                                        <span>Data: <strong>{new Date(matchedVacancy.workDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong></span>
                                    )}
                                    {matchedVacancy.startTime && matchedVacancy.expectedEndTime && (
                                        <span>Horário: <strong>{matchedVacancy.startTime.substring(0, 5)} → {matchedVacancy.expectedEndTime.substring(0, 5)}</strong></span>
                                    )}
                                    {matchedVacancy.compensationAmount && (
                                        <span>Remuneração: <strong>R$ {Number(matchedVacancy.compensationAmount).toFixed(2).replace('.', ',')} ({matchedVacancy.compensationType === 'DAILY' ? 'Diária' : matchedVacancy.compensationType === 'HOURLY' ? 'Hora' : matchedVacancy.compensationType === 'EVENT' ? 'Evento' : 'Fixo'})</strong></span>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Função Operacional no Evento <span className="text-red-500">*</span></Label>
                            <Select
                                value={approvalData.staffFunctionId}
                                onValueChange={(val) => setApprovalData({...approvalData, staffFunctionId: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a função operacional" />
                                </SelectTrigger>
                                <SelectContent>
                                    {functions.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-gray-500">Função específica de alocação nesta produção (ex: Caixa — Bar Principal).</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Contrato <span className="text-red-500">*</span></Label>
                                <Select
                                    value={approvalData.contractType}
                                    onValueChange={(val) => setApprovalData({...approvalData, contractType: val})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Diária</SelectItem>
                                        <SelectItem value="freelance">Freelance</SelectItem>
                                        <SelectItem value="clt">CLT</SelectItem>
                                        <SelectItem value="pj">PJ</SelectItem>
                                        <SelectItem value="temporary">Temporário</SelectItem>
                                        <SelectItem value="volunteer">Voluntário</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Pagamento por <span className="text-red-500">*</span></Label>
                                <Select
                                    value={approvalData.compensationType}
                                    onValueChange={(val) => setApprovalData({...approvalData, compensationType: val})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Diária</SelectItem>
                                        <SelectItem value="HOURLY">Hora</SelectItem>
                                        <SelectItem value="EVENT">Evento</SelectItem>
                                        <SelectItem value="FIXED">Valor fixo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Remuneração Proposta (R$) <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0,00"
                                value={approvalData.compensationAmount}
                                onChange={(e) => setApprovalData({...approvalData, compensationAmount: e.target.value})}
                            />
                        </div>

                        <div className="border-t pt-3 space-y-3">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Primeiro Turno da Escala</p>
                            <div className="space-y-2">
                                <Label>Data do Turno <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={approvalData.shiftDate}
                                    onChange={(e) => setApprovalData({...approvalData, shiftDate: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label>Início <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="time"
                                        value={approvalData.shiftStart}
                                        onChange={(e) => setApprovalData({...approvalData, shiftStart: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fim <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="time"
                                        value={approvalData.shiftEnd}
                                        onChange={(e) => setApprovalData({...approvalData, shiftEnd: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pausa (min)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="10"
                                        value={approvalData.breakDuration}
                                        onChange={(e) => setApprovalData({...approvalData, breakDuration: Number(e.target.value) || 0})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Permissões do Sistema */}
                        {availableRoles.length > 0 && (
                            <div className="border-t pt-3 space-y-2">
                                <Label>Permissões / Acessos no Sistema</Label>
                                <div className="flex flex-wrap gap-2">
                                    {availableRoles.map(role => {
                                        const isSelected = approvalData.systemRoleIds.includes(role.id);
                                        return (
                                            <Badge
                                                key={role.id}
                                                variant={isSelected ? 'default' : 'outline'}
                                                className={`cursor-pointer text-xs py-1 px-2.5 transition-colors ${
                                                    isSelected ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                                onClick={() => {
                                                    const updated = isSelected
                                                        ? approvalData.systemRoleIds.filter(id => id !== role.id)
                                                        : [...approvalData.systemRoleIds, role.id];
                                                    setApprovalData({...approvalData, systemRoleIds: updated});
                                                }}
                                            >
                                                {role.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApprovalModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleApprove} disabled={processing} className="bg-primary text-white font-bold">
                            {processing ? 'Salvando...' : (isEditingProposal ? 'Salvar Proposta' : 'Aprovar e Enviar Proposta')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
