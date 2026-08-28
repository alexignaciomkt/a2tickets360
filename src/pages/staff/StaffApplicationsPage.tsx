import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { staffService } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Inbox, Clock, XCircle, CheckCircle, FileText } from 'lucide-react';
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

const StaffApplicationsPage = () => {
    const { toast } = useToast();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelAppId, setCancelAppId] = useState<string | null>(null);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const data = await staffService.getMyApplications();
            setApplications(data);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar suas candidaturas.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelApplication = async () => {
        if (!cancelAppId) return;
        try {
            await staffService.cancelApplication(cancelAppId);
            toast({ title: 'Sucesso', description: 'Candidatura cancelada.' });
            await loadApplications();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || 'Erro ao cancelar candidatura' });
        } finally {
            setCancelAppId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Em Análise</Badge>;
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle className="w-3 h-3 mr-1" /> Selecionado</Badge>;
            case 'REJECTED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Não Aprovado</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout userType="customer">
            <div className="max-w-[1000px] mx-auto p-4 sm:p-6 space-y-8 pb-20 font-sans">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Minhas Candidaturas</h1>
                        <p className="text-slate-500 font-medium mt-1">Acompanhe o status do seu interesse em eventos.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">Carregando candidaturas...</div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-100">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700">Nenhuma candidatura</h3>
                        <p className="text-slate-500">Você ainda não demonstrou interesse em trabalhar em nenhum evento.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <Card key={app.id} className="overflow-hidden border-slate-200">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="sm:w-48 h-32 sm:h-auto bg-slate-100 relative shrink-0">
                                        {app.eventBanner ? (
                                            <img src={app.eventBanner} alt={app.eventTitle} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Sem Imagem</div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-center space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{app.eventTitle}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(app.eventStartDate).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                            <div>{getStatusBadge(app.status)}</div>
                                        </div>
                                    </div>
                                    <div className="p-5 sm:border-l sm:border-t-0 border-t flex flex-col justify-center items-center bg-slate-50 min-w-[150px]">
                                        {app.status === 'PENDING' ? (
                                            <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setCancelAppId(app.id)}>
                                                Cancelar
                                            </Button>
                                        ) : app.status === 'APPROVED' ? (
                                            <span className="text-xs text-center text-emerald-700 font-medium">Verifique a aba de Convites</span>
                                        ) : (
                                            <span className="text-xs text-slate-500">—</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={!!cancelAppId} onOpenChange={(open) => !open && setCancelAppId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar Candidatura</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja cancelar sua candidatura para este evento? Você poderá se candidatar novamente depois se quiser.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Não, manter</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelApplication} className="bg-red-600 hover:bg-red-700 text-white">
                            Sim, cancelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default StaffApplicationsPage;
