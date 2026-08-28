import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { staffService } from '@/services/staffService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Building2, UserCircle, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const StaffEventsPage = () => {
    const { toast } = useToast();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [profileFunctions, setProfileFunctions] = useState<any[]>([]);
    const [functionsLoading, setFunctionsLoading] = useState(true);
    const [functionsError, setFunctionsError] = useState<string | null>(null);
    const [selectedFunctionIds, setSelectedFunctionIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadEvents();
        loadProfileFunctions();
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

    const loadProfileFunctions = async () => {
        try {
            setFunctionsLoading(true);
            setFunctionsError(null);
            const { api } = await import('@/services/api');
            const data = await api.get('/api/me/staff-profile');
            setProfileFunctions(data.professionalFunctions || []);
        } catch (error) {
            console.error(error);
            setFunctionsError('Não foi possível carregar suas áreas profissionais.');
        } finally {
            setFunctionsLoading(false);
        }
    };

    const handleApplyClick = (evt: any) => {
        setSelectedEvent(evt);
        setSelectedFunctionIds([]);
    };

    const submitApplication = async () => {
        if (!selectedEvent || selectedFunctionIds.length === 0) return;
        try {
            setSubmitting(true);
            await staffService.applyForEvent(selectedEvent.id, selectedFunctionIds);
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
                        <p className="text-slate-500 font-medium mt-1">Encontre eventos e demonstre seu interesse em fazer parte da equipe.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500 font-medium">Carregando eventos...</div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                        <h3 className="text-lg font-semibold text-red-700">Erro ao carregar</h3>
                        <p className="text-red-500 mt-1">{error}</p>
                        <Button variant="outline" className="mt-4 border-red-200 text-red-600 hover:bg-red-50" onClick={loadEvents}>Tentar novamente</Button>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-100">
                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700">Nenhum evento disponível</h3>
                        <p className="text-slate-500">Nenhum evento disponível no momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((evt) => (
                            <Card key={evt.id} className="overflow-hidden flex flex-col border-slate-200">
                                <div className="h-40 bg-slate-100 relative">
                                    {evt.bannerUrl ? (
                                        <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">Sem Imagem</div>
                                    )}
                                </div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-bold line-clamp-1">{evt.title}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                                        <UserCircle className="h-4 w-4" />
                                        <span className="truncate">{evt.organizerName || 'Produtor'}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 pb-4 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
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
                                        <Button variant="outline" className="w-full" disabled>Candidatura enviada</Button>
                                    ) : evt.applicationStatus === 'APPROVED' ? (
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled>Você foi selecionado</Button>
                                    ) : evt.applicationStatus === 'REJECTED' ? (
                                        <Button variant="outline" className="w-full text-red-600 border-red-200" disabled>Candidatura não aprovada</Button>
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

            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Quero trabalhar neste evento</DialogTitle>
                        <DialogDescription>
                            Selecione em quais funções você gostaria de trabalhar. Estas opções vêm do seu perfil profissional.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {functionsLoading ? (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                Carregando suas funções...
                            </div>
                        ) : functionsError ? (
                            <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm text-center">
                                <p>{functionsError}</p>
                                <Button variant="outline" size="sm" onClick={loadProfileFunctions} className="mt-3 text-red-600 border-red-200 hover:bg-red-50">
                                    Tentar novamente
                                </Button>
                            </div>
                        ) : profileFunctions.length === 0 ? (
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm text-center">
                                Você ainda não cadastrou nenhuma função no seu perfil profissional.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {profileFunctions.map(func => (
                                    <div key={func.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                                        <Checkbox 
                                            id={`func-${func.id}`}
                                            checked={selectedFunctionIds.includes(func.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedFunctionIds([...selectedFunctionIds, func.id]);
                                                } else {
                                                    setSelectedFunctionIds(selectedFunctionIds.filter(id => id !== func.id));
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`func-${func.id}`} className="flex-1 cursor-pointer font-medium">
                                            {func.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedEvent(null)}>Cancelar</Button>
                        <Button 
                            onClick={submitApplication} 
                            disabled={selectedFunctionIds.length === 0 || submitting}
                            className="bg-primary text-white"
                        >
                            {submitting ? 'Enviando...' : 'Enviar Interesse'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default StaffEventsPage;
