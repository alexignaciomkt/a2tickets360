import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { staffService } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, UserCircle, Briefcase, CheckCircle2, Clock, DollarSign, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const StaffEventsPage = () => {
    const { toast } = useToast();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal de Vagas do Evento
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [eventVacancies, setEventVacancies] = useState<any[]>([]);
    const [vacanciesLoading, setVacanciesLoading] = useState(false);
    const [vacanciesError, setVacanciesError] = useState<string | null>(null);
    const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await staffService.getAvailableEvents();
            setEvents(data);
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar os eventos.');
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os eventos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = async (evt: any) => {
        setSelectedEvent(evt);
        setSelectedVacancyId(null);
        setVacanciesLoading(true);
        setVacanciesError(null);

        try {
            const data = await staffService.getEventOpenVacancies(evt.id);
            setEventVacancies(data);
            if (data.length === 1) {
                // Se houver apenas 1 vaga aberta, já pré-seleciona para agilizar
                setSelectedVacancyId(data[0].id);
            }
        } catch (err) {
            console.error(err);
            setVacanciesError('Não foi possível carregar as vagas abertas deste evento.');
        } finally {
            setVacanciesLoading(false);
        }
    };

    const submitApplication = async () => {
        if (!selectedEvent || !selectedVacancyId) return;
        try {
            setSubmitting(true);
            await staffService.applyForEvent(selectedEvent.id, selectedVacancyId);
            toast({ title: 'Sucesso', description: 'Candidatura enviada com sucesso!' });
            setSelectedEvent(null);
            await loadEvents();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || 'Erro ao enviar candidatura' });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <DashboardLayout userType="customer">
            <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-8 pb-20 font-sans">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Eventos para Trabalhar</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Confira os eventos que estão recrutando equipe e candidate-se para as vagas abertas.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500 font-medium">Carregando eventos em recrutamento...</div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                        <h3 className="text-lg font-semibold text-red-700">Erro ao carregar</h3>
                        <p className="text-red-500 mt-1">{error}</p>
                        <Button variant="outline" className="mt-4 border-red-200 text-red-600 hover:bg-red-50" onClick={loadEvents}>
                            Tentar novamente
                        </Button>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Nenhum evento com vagas abertas no momento</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-1">
                            Novas oportunidades surgirão assim que os produtores abrirem vagas de Staff para seus eventos.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((evt) => (
                            <Card key={evt.id} className="overflow-hidden flex flex-col border-slate-200 shadow-sm rounded-2xl hover:border-slate-300 transition-colors">
                                <div className="h-44 bg-slate-100 relative">
                                    {evt.bannerUrl ? (
                                        <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Sem Imagem</div>
                                    )}
                                </div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{evt.title}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 font-medium">
                                        <UserCircle className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{evt.organizerName || 'Produtor'}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 pb-4 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>{formatDate(evt.startDate)}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-slate-600">
                                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">
                                            {evt.locationName || 'Local não definido'}
                                            {evt.city && ` - ${evt.city}/${evt.state}`}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 pb-6 px-6">
                                    {evt.applicationStatus === 'PENDING' ? (
                                        <Button variant="outline" className="w-full bg-amber-50 text-amber-700 border-amber-200 font-semibold" disabled>
                                            Candidatura enviada
                                        </Button>
                                    ) : evt.applicationStatus === 'APPROVED' ? (
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold" disabled>
                                            Proposta recebida
                                        </Button>
                                    ) : evt.applicationStatus === 'REJECTED' ? (
                                        <Button variant="outline" className="w-full text-red-600 border-red-200 font-semibold" disabled>
                                            Candidatura não selecionada
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90 text-white uppercase text-xs font-bold"
                                            onClick={() => handleApplyClick(evt)}
                                        >
                                            {evt.applicationStatus === 'CANCELLED' ? 'Demonstrar interesse novamente' : 'Quero trabalhar neste evento'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL: ESCOLHER VAGA DO EVENTO */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 font-bold">Oportunidades no Evento</DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.title ? `Selecione a vaga desejada para ${selectedEvent.title}.` : 'Escolha a vaga para a qual deseja se candidatar.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {vacanciesLoading ? (
                            <div className="text-center py-8 text-slate-500 text-sm font-medium">
                                Carregando vagas abertas...
                            </div>
                        ) : vacanciesError ? (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                                <p>{vacanciesError}</p>
                                <Button variant="outline" size="sm" onClick={() => selectedEvent && handleApplyClick(selectedEvent)} className="mt-3 text-red-600 border-red-200 hover:bg-red-50">
                                    Tentar novamente
                                </Button>
                            </div>
                        ) : eventVacancies.length === 0 ? (
                            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm text-center font-medium">
                                Não há vagas abertas para este evento no momento.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {eventVacancies.map(vac => {
                                    const isSelected = selectedVacancyId === vac.id;
                                    const formatDate = (dateStr?: string) => {
                                        if (!dateStr) return null;
                                        const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
                                        const parts = clean.split('-').map(Number);
                                        if (parts.length !== 3) return dateStr;
                                        const [y, m, d] = parts;
                                        return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                                    };

                                    const modalityLabel = (() => {
                                        switch (vac.compensationType) {
                                            case 'HOURLY': return 'hora';
                                            case 'EVENT': return 'evento';
                                            case 'FIXED': return 'fixo';
                                            case 'DAILY':
                                            default: return 'diária';
                                        }
                                    })();

                                    const availableCount = vac.remaining !== undefined ? vac.remaining : vac.quantity;

                                    return (
                                        <div
                                            key={vac.id}
                                            onClick={() => setSelectedVacancyId(vac.id)}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                                                isSelected
                                                    ? 'border-primary bg-primary/[0.03] ring-2 ring-primary/20 shadow-sm'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                                                        isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300'
                                                    }`}>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                                                            {vac.functionName}
                                                        </h4>
                                                        <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                                                            {availableCount} {availableCount === 1 ? 'vaga disponível' : 'vagas disponíveis'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200 shrink-0">
                                                    ABERTA
                                                </Badge>
                                            </div>

                                            {/* Informações Operacionais & Financeiras */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                                                {vac.workDate && (
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{formatDate(vac.workDate)}</span>
                                                    </div>
                                                )}
                                                {vac.startTime && vac.expectedEndTime && (
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{vac.startTime.substring(0, 5)} às {vac.expectedEndTime.substring(0, 5)}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-slate-900 font-semibold sm:col-span-2">
                                                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                    {vac.compensationAmount ? (
                                                        <span>
                                                            R$ {Number(vac.compensationAmount).toFixed(2).replace('.', ',')} / {modalityLabel}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500 font-normal">Remuneração a combinar</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Informações adicionais / Notas públicas */}
                                            {vac.publicNotes && (
                                                <div className="text-xs text-slate-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/60 leading-relaxed whitespace-pre-wrap">
                                                    <div className="flex items-center gap-1 font-bold text-amber-800 mb-0.5 text-[11px]">
                                                        <Info className="w-3 h-3" />
                                                        <span>Informações da Produção:</span>
                                                    </div>
                                                    {vac.publicNotes}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setSelectedEvent(null)} disabled={submitting}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={submitApplication}
                            disabled={!selectedVacancyId || submitting || vacanciesLoading || eventVacancies.length === 0}
                            className="bg-primary hover:bg-primary/90 text-white font-bold"
                        >
                            {submitting ? 'Enviando...' : 'Candidatar-me'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default StaffEventsPage;
