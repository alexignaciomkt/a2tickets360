import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Briefcase,
    CheckCircle,
    Inbox,
    UserCircle,
    ShieldCheck
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { staffService } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const StaffPortalDashboard = () => {
    const { toast } = useToast();
    const { user, refreshCapabilities } = useAuth();
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadProposals();
    }, [user]);

    const loadProposals = async () => {
        try {
            setLoading(true);
            const data = await staffService.getMyInvites();
            setProposals(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        try {
            await staffService.acceptInvite(id);
            toast({ title: 'Sucesso', description: 'Convite aceito com sucesso!' });
            await loadProposals();
            if (refreshCapabilities) await refreshCapabilities();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || 'Erro ao aceitar convite' });
        }
    };

    const handleDecline = async (id: string) => {
        try {
            await staffService.declineInvite(id);
            toast({ title: 'Sucesso', description: 'Convite recusado.' });
            await loadProposals();
            if (refreshCapabilities) await refreshCapabilities();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || 'Erro ao recusar convite' });
        }
    };

    // Filtros
    const pendingInvites = proposals.filter(p => p.status === 'PENDING_ACCEPTANCE');
    const activeJobs = proposals.filter(p => p.status === 'ACTIVE');
    
    // Ordena os trabalhos ativos por data (mais próximo primeiro)
    const sortedActiveJobs = [...activeJobs].sort((a, b) => {
        if (!a.shiftStart) return 1;
        if (!b.shiftStart) return -1;
        return new Date(a.shiftStart).getTime() - new Date(b.shiftStart).getTime();
    });

    const nextJob = sortedActiveJobs.length > 0 ? sortedActiveJobs[0] : null;

    // Função de formatação de data curta
    const formatDateShort = (dateString?: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
    };

    return (
        <DashboardLayout userType="customer">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-8 pb-20 font-sans">
                {/* 1. CABEÇALHO */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                            Trabalho em Eventos
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            {user?.name ? `Olá, ${user.name.split(' ')[0]}. ` : ''} 
                            Organize seus convites e próximos trabalhos.
                        </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-bold uppercase text-xs px-6 rounded-lg shadow-sm">
                            Disponível para Trabalho
                        </Button>
                    </div>
                </div>

                {/* 2. RESUMO OPERACIONAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                        <CardContent className="p-5 flex flex-col justify-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Convites Pendentes</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-amber-500">{pendingInvites.length}</h3>
                                <div className="p-3 bg-amber-50 rounded-xl">
                                    <Inbox className="w-6 h-6 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                        <CardContent className="p-5 flex flex-col justify-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Próximo Trabalho</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-slate-900">{formatDateShort(nextJob?.shiftStart)}</h3>
                                <div className="p-3 bg-slate-100 rounded-xl">
                                    <Calendar className="w-6 h-6 text-slate-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
                        <CardContent className="p-5 flex flex-col justify-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Trabalhos Ativos</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-emerald-600">{activeJobs.length}</h3>
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* HIERARQUIA VISUAL 70/30 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COLUNA ESQUERDA (70%) */}
                    <div className="lg:col-span-2 space-y-10">
                        
                        {/* CONVITES PARA TRABALHAR */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-amber-500" />
                                Convites para Trabalhar
                            </h2>

                            {loading ? (
                                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                                    <p className="text-slate-500 font-medium">Carregando convites...</p>
                                </div>
                            ) : pendingInvites.length === 0 ? (
                                <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                        <Inbox className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800">Nenhum convite pendente</h3>
                                    <p className="text-sm text-slate-500 max-w-sm">
                                        Quando um produtor convidar você para trabalhar em um evento, o convite aparecerá aqui.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingInvites.map((prop) => (
                                        <Card key={prop.id} className="bg-white border-l-4 border-l-amber-500 border-y border-r border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                            <CardContent className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{prop.eventName || 'Evento'}</h3>
                                                        <p className="text-sm text-slate-500 font-semibold">{prop.organizerName}</p>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-x-6 gap-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Função</span>
                                                            <span className="text-sm font-semibold text-slate-700">{prop.role}</span>
                                                        </div>
                                                        {prop.shiftStart && (
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Data</span>
                                                                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                                    {new Date(prop.shiftStart).toLocaleDateString('pt-BR')}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {prop.shiftStart && prop.shiftEnd && (
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Horário</span>
                                                                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                                    {new Date(prop.shiftStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {new Date(prop.shiftEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row md:flex-col items-center sm:justify-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold uppercase text-[10px] mb-2 self-start md:self-end">
                                                        Aguardando sua resposta
                                                    </Badge>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <Button 
                                                            onClick={() => handleDecline(prop.id)} 
                                                            variant="outline" 
                                                            className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold uppercase text-xs"
                                                        >
                                                            Recusar
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleAccept(prop.id)} 
                                                            className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white font-bold uppercase text-xs"
                                                        >
                                                            Aceitar Convite
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* MEUS PRÓXIMOS TRABALHOS (ACTIVE) */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                Meus Próximos Trabalhos
                            </h2>

                            {!loading && activeJobs.length === 0 && (
                                <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                                    <p className="text-slate-500 text-sm font-medium">Nenhum trabalho confirmado no momento.</p>
                                </div>
                            )}

                            {!loading && activeJobs.length > 0 && (
                                <div className="space-y-4">
                                    {sortedActiveJobs.map((prop) => (
                                        <Card key={prop.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                            <CardContent className="p-5 md:p-6 space-y-4">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div>
                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold uppercase text-[10px] mb-3">
                                                            Confirmado
                                                        </Badge>
                                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{prop.eventName || 'Evento'}</h3>
                                                        <p className="text-sm text-slate-500 font-semibold">{prop.organizerName}</p>
                                                    </div>
                                                    
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0 min-w-[200px]">
                                                        <div className="flex flex-col space-y-2">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Função</span>
                                                            <span className="text-sm font-semibold text-slate-700">{prop.role}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                    {prop.shiftStart && (
                                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                            <Calendar className="w-4 h-4 text-slate-400" />
                                                            {new Date(prop.shiftStart).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    )}
                                                    {prop.shiftStart && prop.shiftEnd && (
                                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            {new Date(prop.shiftStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {new Date(prop.shiftEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                    {prop.location && (
                                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                            <span className="text-slate-400">📍</span>
                                                            {prop.location}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ACESSO OPERACIONAL (Estrutura Preparada) */}
                                                {/* Se a flag "hasOperationalAccess" existir e for true, mostramos. */}
                                                {prop.hasOperationalAccess && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 border border-primary/10 rounded-xl p-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-slate-900">Acesso Operacional Liberado</h4>
                                                                    <p className="text-xs text-slate-600 mt-1">Você possui acesso ao Controle de Acesso deste evento.</p>
                                                                </div>
                                                            </div>
                                                            <Button className="bg-primary hover:bg-primary/90 text-white font-bold uppercase text-xs shrink-0">
                                                                Acessar Ferramenta
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* COLUNA DIREITA (30%) */}
                    <div className="space-y-6">
                        
                        {/* PRÓXIMO TRABALHO */}
                        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    Próximo Trabalho
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                {nextJob ? (
                                    <div className="space-y-4">
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold uppercase text-[10px]">
                                            Confirmado
                                        </Badge>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">
                                                {nextJob.eventName || 'Evento'}
                                            </h4>
                                            <p className="text-sm font-semibold text-slate-500 mt-1">{nextJob.role}</p>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-slate-100">
                                            {nextJob.shiftStart && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span>{new Date(nextJob.shiftStart).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            )}
                                            {nextJob.shiftStart && nextJob.shiftEnd && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span>{new Date(nextJob.shiftStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {new Date(nextJob.shiftEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="outline" className="w-full text-xs font-bold uppercase border-slate-200 mt-2">
                                            Ver Detalhes
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center space-y-2">
                                        <p className="text-sm font-medium text-slate-900">Nenhum trabalho confirmado.</p>
                                        <p className="text-xs text-slate-500">Aceite um convite para adicioná-lo à sua escala.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* PERFIL PROFISSIONAL */}
                        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <UserCircle className="w-4 h-4 text-slate-500" />
                                    Seu Perfil Profissional
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 text-center space-y-4">
                                <p className="text-sm text-slate-600 font-medium">
                                    Complete seu perfil profissional para estar preparado para novas oportunidades.
                                </p>
                                <Link to="/dashboard/staff/profile" className="block">
                                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-xs">
                                        Completar Perfil
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StaffPortalDashboard;
