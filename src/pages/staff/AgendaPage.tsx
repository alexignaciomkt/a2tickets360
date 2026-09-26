import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    MapPin,
    Info,
    ChevronRight,
    FileCheck,
    Smartphone,
    Navigation,
    Loader2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { staffService } from '@/services/staffService';
import { useAuth } from '@/contexts/AuthContext';

const AgendaPage = () => {
    const { user } = useAuth();
    const [agendaItems, setAgendaItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadAgenda();
        }
    }, [user]);

    const loadAgenda = async () => {
        try {
            setLoading(true);
            const data = await staffService.getMyInvites();
            // Filter only active jobs for the agenda
            const activeJobs = data.filter(item => item.status === 'ACTIVE');
            const items: any[] = [];

            for (const job of activeJobs) {
                if (Array.isArray(job.shifts) && job.shifts.length > 0) {
                    for (const sh of job.shifts) {
                        const cleanDate = sh.shiftDate ? (sh.shiftDate.includes('T') ? sh.shiftDate.split('T')[0] : sh.shiftDate) : '';
                        const dateParts = cleanDate.split('-').map(Number);
                        const jsDate = dateParts.length === 3 ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) : null;

                        items.push({
                            ...job,
                            shiftId: sh.id,
                            shiftDate: cleanDate,
                            startTime: sh.startTime,
                            endTime: sh.endTime,
                            breakDurationMinutes: sh.breakDurationMinutes,
                            dateObj: jsDate,
                            sortKey: `${cleanDate}T${sh.startTime}`
                        });
                    }
                } else {
                    // Fallback legado para shiftStart / shiftEnd
                    const startDate = job.shiftStart ? new Date(job.shiftStart) : null;
                    const cleanDate = job.shiftStart ? job.shiftStart.split('T')[0] : '';
                    const startTimeClean = job.shiftStart && job.shiftStart.includes('T') ? job.shiftStart.split('T')[1]?.substring(0, 5) : '';
                    const endTimeClean = job.shiftEnd && job.shiftEnd.includes('T') ? job.shiftEnd.split('T')[1]?.substring(0, 5) : '';
                    items.push({
                        ...job,
                        shiftId: job.id,
                        shiftDate: cleanDate,
                        startTime: startTimeClean,
                        endTime: endTimeClean,
                        breakDurationMinutes: job.breakDuration || 0,
                        dateObj: startDate,
                        sortKey: job.shiftStart || ''
                    });
                }
            }

            items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
            setAgendaItems(items);
        } catch (error) {
            console.error('Failed to load agenda', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userType="customer">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-5xl mx-auto p-4 sm:p-6 font-sans">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Minha Escala</h1>
                        <p className="text-slate-500 font-medium">Seus próximos compromissos e instruções de trabalho.</p>
                    </div>
                    <Button variant="outline" className="border-gray-200 text-slate-700 font-bold uppercase text-[10px] h-10 px-6 rounded-xl hover:bg-slate-50">
                        Sincronizar com Calendário
                    </Button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Carregando sua escala...</p>
                    </div>
                ) : agendaItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white border border-gray-100 rounded-[2rem] shadow-sm text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nenhum evento na agenda</h3>
                        <p className="text-slate-500 font-medium mt-2 max-w-sm">Você ainda não possui eventos confirmados. Aceite convites no seu painel para adicioná-los aqui.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {agendaItems.map((item, index) => {
                            const dateObj = item.dateObj;
                            const dayNum = dateObj ? dateObj.getDate().toString().padStart(2, '0') : '--';
                            const weekdayStr = dateObj ? dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }) : '';
                            const timeStr = item.startTime && item.endTime
                                ? `${item.startTime} - ${item.endTime}`
                                : (item.startTime || 'A definir');

                            return (
                                <Card key={`${item.id}-${item.shiftId || index}`} className="bg-white border border-gray-100 shadow-sm rounded-[2rem] overflow-hidden relative group hover:shadow-md transition-shadow">
                                    <div className="absolute -left-1 top-0 bottom-0 w-2 bg-primary rounded-l-full group-hover:w-3 transition-all"></div>

                                    <CardContent className="p-6 sm:p-8 space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="space-y-2">
                                                {index === 0 && (
                                                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest mb-2">Próximo Turno</Badge>
                                                )}
                                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">{item.eventName || 'Evento'}</h2>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <FileCheck className="w-4 h-4 text-primary" /> Contratado por: <span className="text-slate-700">{item.organizerName || 'Organizador'}</span>
                                                </p>
                                            </div>

                                            <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 flex gap-6 shrink-0">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Horário</p>
                                                    <p className="text-base font-black text-slate-900">{timeStr}</p>
                                                    {item.breakDurationMinutes > 0 && (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">Pausa: {item.breakDurationMinutes}m</p>
                                                    )}
                                                </div>
                                                <div className="w-px bg-gray-200 h-10 self-center"></div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Posição</p>
                                                    <p className="text-base font-black text-primary uppercase">{item.role || 'Staff'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl">
                                                        {dayNum}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase text-lg leading-tight">{weekdayStr}</p>
                                                        <p className="text-xs text-slate-500 font-medium">Data confirmada em contrato</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 shrink-0">
                                                        <MapPin className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase text-sm sm:text-base leading-tight">Local a definir</p>
                                                        <Button variant="link" className="text-primary p-0 h-auto text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group mt-1">
                                                            Abrir no Waze <Navigation className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3 h-full flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1 mb-2">
                                                        <Info className="w-4 h-4" /> Instruções Importantes
                                                    </p>
                                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                        Chegue com 30 minutos de antecedência. Traga documento original com foto. O uniforme será entregue no local.
                                                    </p>
                                                </div>
                                                
                                                <div className="pt-4 mt-2 border-t border-gray-50">
                                                    <Button 
                                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl shadow-md"
                                                        onClick={() => window.open('https://portaria.a2tickets360.com.br', '_blank')}
                                                    >
                                                        Acessar Sistema de Portaria
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100 flex justify-between items-center gap-3">
                                            <Button
                                                onClick={() => window.location.href = '/dashboard/staff/credential'}
                                                className="flex-1 bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest text-xs h-12 rounded-xl shadow-md"
                                            >
                                                <Smartphone className="w-4 h-4 mr-2" /> Minha Credencial
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AgendaPage;
