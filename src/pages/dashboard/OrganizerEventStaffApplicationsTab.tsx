import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { staffService } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import { Clock, UserCircle, Briefcase, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function OrganizerEventStaffApplicationsTab({ eventId, eventStartDate }: { eventId: string, eventStartDate?: string }) {
    const { toast } = useToast();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [functions, setFunctions] = useState<any[]>([]);

    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [currentAppId, setCurrentAppId] = useState<string | null>(null);

    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [approvalData, setApprovalData] = useState({ staffFunctionId: '', shiftDate: '', shiftStart: '', shiftEnd: '' });
    const [processing, setProcessing] = useState(false);
    const [isEditingProposal, setIsEditingProposal] = useState(false);

    useEffect(() => {
        if (eventId) {
            loadData();
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
        console.log('[PROPOSAL FRONT] START', {
            isEditingProposal,
            currentAppId,
            eventId,
            approvalData
        });
        
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
                console.log('[PROPOSAL FRONT] BEFORE SERVICE');
                const result = await staffService.updateApplicationProposal(eventId, currentAppId, approvalData);
                console.log('[PROPOSAL FRONT] SERVICE OK', result);
                toast({ title: 'Sucesso', description: 'Proposta atualizada!' });
            } else {
                await staffService.approveApplication(eventId, currentAppId, approvalData);
                toast({ title: 'Sucesso', description: 'Candidatura aprovada! Convite enviado.' });
            }
            setApprovalModalOpen(false);
            setProfileModalOpen(false);
            await loadData();
        } catch (error: any) {
            console.error('[PROPOSAL FRONT] ERROR', {
                name: error?.name,
                message: error?.message,
                stack: error?.stack,
                response: error?.response,
                request: error?.request
            });
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || 'Erro na operação.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold">Candidaturas de Staff</h2>
                    <p className="text-gray-500 text-sm">Gerencie quem demonstrou interesse em trabalhar no seu evento.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Carregando...</div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                    <h3 className="text-lg font-semibold text-red-700">Erro ao carregar</h3>
                    <p className="text-red-500 mt-1">{error}</p>
                    <Button variant="outline" className="mt-4 text-red-600 border-red-200 hover:bg-red-50" onClick={loadData}>
                        Tentar novamente
                    </Button>
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-100">
                    <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">Nenhuma candidatura recebida ainda</h3>
                    <p className="text-slate-500">Os membros da plataforma ainda não se candidataram para o seu evento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app) => (
                        <Card key={app.applicationId} className="flex flex-col">
                            <CardHeader className="pb-3 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={app.user.avatarUrl} />
                                            <AvatarFallback>{app.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base">{app.user.name}</CardTitle>
                                            <p className="text-xs text-gray-500">
                                                {app.user.city ? `${app.user.city}/${app.user.state}` : 'Local não informado'}
                                            </p>
                                        </div>
                                    </div>
                                    {app.status === 'PENDING' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Em Análise</Badge>}
                                    {app.status === 'APPROVED' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Aprovado</Badge>}
                                    {app.status === 'REJECTED' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Recusado</Badge>}
                                    {app.status === 'CANCELLED' && <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Cancelado</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="py-4 flex-1">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Interesse em:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {app.functions?.map((f: any) => (
                                                <Badge key={f.id} variant="secondary" className="font-normal">{f.name}</Badge>
                                            ))}
                                            {app.functions?.length === 0 && <span className="text-sm text-gray-500">Não informado</span>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 bg-gray-50 rounded-b-xl flex gap-2 p-4 mt-auto flex-wrap">
                                <Button variant="outline" className="flex-1 min-w-[140px]" onClick={() => handleViewProfile(app.applicationId)}>
                                    Ver Perfil
                                </Button>
                                {app.status === 'PENDING' && (
                                    <Button className="bg-primary hover:bg-primary/90 text-white flex-1 min-w-[140px]" onClick={() => openApprovalModal(app.applicationId)}>
                                        Aprovar
                                    </Button>
                                )}
                                {app.status === 'APPROVED' && app.eventStaffStatus === 'PENDING_ACCEPTANCE' && (
                                    <Button variant="outline" className="flex-1 min-w-[140px] border-primary text-primary hover:bg-primary/5" onClick={() => openEditProposalModal(app.applicationId, app.eventStaff)}>
                                        Editar Proposta
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Profile Modal */}
            <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Perfil Profissional</DialogTitle>
                    </DialogHeader>
                    {profileLoading ? (
                        <div className="py-10 text-center">Carregando perfil...</div>
                    ) : selectedProfile ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 border-b pb-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={selectedProfile.avatarUrl} />
                                    <AvatarFallback className="text-2xl">{(selectedProfile.name?.charAt(0) || '?').toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedProfile.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedProfile.city ? `${selectedProfile.city}/${selectedProfile.state}` : 'Local não informado'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">Contato (Telefone/WhatsApp)</p>
                                    <p className="text-sm mt-1">{selectedProfile.phone || 'Não informado'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Resumo / Bio</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                    {selectedProfile.bio || 'O candidato não preencheu uma bio.'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Todas as funções operacionais do perfil</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProfile.professionalFunctions?.map((f: any) => (
                                        <Badge key={f.id} variant="secondary">{f.name}</Badge>
                                    ))}
                                </div>
                            </div>

                            {selectedProfile.applicationFunctions && selectedProfile.applicationFunctions.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Interesse neste evento</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProfile.applicationFunctions.map((f: any) => (
                                            <Badge key={f.id} className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">{f.name}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="border-t pt-4">
                                {applications.find(a => a.applicationId === currentAppId)?.status === 'PENDING' && (
                                    <>
                                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleReject(currentAppId!)} disabled={processing}>
                                            Recusar
                                        </Button>
                                        <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => openApprovalModal(currentAppId!)} disabled={processing}>
                                            Aprovar e Enviar Proposta
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="py-10 text-center text-red-500">Erro ao carregar perfil.</div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approval / Edit Proposal Modal */}
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
                            <p className="text-xs text-gray-500">Selecione uma de suas funções operacionais personalizadas.</p>
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
                        <Button onClick={handleApprove} disabled={processing} className="bg-primary text-white">
                            {processing ? 'Salvando...' : (isEditingProposal ? 'Salvar Alterações' : 'Confirmar Aprovação')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
