import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Star, CheckCircle } from 'lucide-react';
import { serviceCreditsService, FeaturedCreditStatus } from '@/services/serviceCreditsService';
import { useToast } from '@/hooks/use-toast';
import { FeaturedCreditsPurchaseModal } from '@/components/modals/FeaturedCreditsPurchaseModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrganizerEventHighlightBoxProps {
    eventId: string;
}

export const OrganizerEventHighlightBox = ({ eventId }: OrganizerEventHighlightBoxProps) => {
    const { toast } = useToast();
    const [status, setStatus] = useState<FeaturedCreditStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    const loadStatus = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const data = await serviceCreditsService.getFeaturedCreditStatus(eventId);
            setStatus(data);
        } catch (error) {
            console.error('Error loading highlight status:', error);
            setError('Não foi possível carregar o status do destaque');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, [eventId]);

    const handleActivate = async () => {
        try {
            setIsActionLoading(true);
            await serviceCreditsService.activateFeaturedCredit(eventId);
            toast({ title: 'Sucesso', description: 'Destaque ativado com sucesso!' });
            await loadStatus();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || error.message || 'Falha ao ativar destaque.' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRelease = async () => {
        try {
            setIsActionLoading(true);
            await serviceCreditsService.releaseFeaturedCredit(eventId);
            toast({ title: 'Sucesso', description: 'Reserva cancelada. O crédito voltou a ficar disponível.' });
            await loadStatus();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.response?.data?.error || error.message || 'Falha ao cancelar reserva.' });
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        );
    }

    if (error || !status) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center gap-3">
                <p className="text-sm font-medium text-red-600">{error || 'Não foi possível carregar o status do destaque'}</p>
                <Button variant="outline" size="sm" onClick={loadStatus} className="text-red-700 border-red-300 hover:bg-red-100 rounded-full uppercase text-xs font-bold">
                    Tentar novamente
                </Button>
            </div>
        );
    }

    // Estado 1: Destaque Ativo
    if (status?.activeHighlight) {
        const featuredUntilDate = new Date(status.activeHighlight.featuredUntil);
        return (
            <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 bg-indigo-500 text-white rounded-bl-3xl animate-in zoom-in duration-300">
                    <Star className="w-6 h-6 fill-current" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 bg-indigo-600 text-white drop-shadow-xl">
                        <Star className="w-8 h-8 fill-current" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-indigo-900 uppercase tracking-tight mb-1">Evento em Destaque</h4>
                        <p className="text-sm text-indigo-600/80 font-medium">
                            Ativo até {format(featuredUntilDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Estado 2: Crédito Reservado (Aguardando Ativação)
    if (status?.reservedCredit) {
        return (
            <div className="bg-amber-50/50 border border-amber-200/50 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 bg-amber-500 text-white drop-shadow-xl">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight mb-1">Aguardando Ativação</h4>
                        <p className="text-sm text-amber-700/80 font-medium">
                            1 Crédito de Destaque reservado para este evento.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <Button 
                            onClick={handleActivate} 
                            disabled={isActionLoading}
                            className="rounded-full font-bold uppercase text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20"
                        >
                            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                            Ativar Destaque
                        </Button>
                        <Button 
                            onClick={handleRelease} 
                            disabled={isActionLoading}
                            variant="outline"
                            className="rounded-full font-bold uppercase text-xs text-amber-700 border-amber-300 hover:bg-amber-100"
                        >
                            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Cancelar Reserva
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Estado 3: Possui créditos disponíveis
    if (status.hasAvailableCredits) {
        return (
            <div className="bg-white border-2 border-indigo-100 hover:border-indigo-200 transition-colors p-6 rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                        <Star className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">Destacar Evento</h4>
                        <p className="text-sm text-slate-500 font-medium">
                            Você possui <span className="font-bold text-indigo-600">{status.availableCount}</span> {status.availableCount === 1 ? 'Crédito' : 'Créditos'} de Destaque disponíveis.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <Button 
                            onClick={handleActivate} 
                            disabled={isActionLoading}
                            className="rounded-full px-6 font-bold uppercase tracking-wide text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                        >
                            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                            USAR 1 CRÉDITO NESTE EVENTO
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Estado 4: Não possui créditos
    return (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 bg-slate-200 text-slate-400">
                    <Star className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-black text-slate-700 uppercase tracking-tight mb-1">Destacar Evento</h4>
                    <p className="text-sm text-slate-500 font-medium">
                        Você não possui créditos disponíveis no momento.
                    </p>
                </div>
                <div className="shrink-0">
                    <Button 
                        onClick={() => setIsPurchaseModalOpen(true)}
                        variant="outline"
                        className="rounded-full font-bold uppercase text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                        Comprar Créditos
                    </Button>
                </div>
            </div>
            <FeaturedCreditsPurchaseModal 
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                onSuccess={loadStatus}
                originEventId={eventId}
            />
        </div>
    );
};
