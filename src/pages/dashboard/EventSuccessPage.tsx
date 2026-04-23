import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, Clock, Calendar, MapPin, 
    ArrowRight, Share2, PanelLeft, ExternalLink, 
    Sparkles, ShieldCheck, Ticket, MessageCircle, Bell
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { organizerService } from '@/services/organizerService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const EventSuccessPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const data = await organizerService.getEvent(id);
                setEvent(data);
            } catch (err) {
                console.error('Erro ao buscar evento:', err);
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os detalhes do evento.' });
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleShare = () => {
        if (!event) return;
        const producerSlug = user?.slug || 'p';
        const eventSlug = event.slug || event.id;
        const shareUrl = `${window.location.origin}/p/${producerSlug}/e/${eventSlug}`;
        const text = `Confira meu novo evento ${event.title}! Garanta seu ingresso aqui: ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleCopyLink = () => {
        if (!event) return;
        const producerSlug = user?.slug || 'p';
        const eventSlug = event.slug || event.id;
        const shareUrl = `${window.location.origin}/p/${producerSlug}/e/${eventSlug}`;
        
        navigator.clipboard.writeText(shareUrl);
        toast({
            title: '📎 Link copiado!',
            description: 'O link curto do evento já está na sua área de transferência.',
        });
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'Data a definir';
        try {
            return new Date(dateStr).toLocaleDateString('pt-BR', { 
                day: '2-digit', month: 'long', year: 'numeric' 
            });
        } catch { return dateStr; }
    };

    const formatTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', minute: '2-digit' 
            });
        } catch { return ''; }
    };

    if (loading) {
        return (
            <DashboardLayout userType="organizer">
                <div className="h-[60vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!event) {
        return (
            <DashboardLayout userType="organizer">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold">Evento não encontrado</h2>
                    <Button onClick={() => navigate('/organizer/events')} className="mt-4">Voltar para Eventos</Button>
                </div>
            </DashboardLayout>
        );
    }

    // Resolve field names from both camelCase and snake_case (Supabase returns snake_case)
    const bannerImage = event.banner_url || event.bannerUrl || event.imageUrl || event.image_url;
    const startDate = event.start_date || event.startDate || event.date;
    const locationName = event.location_name || event.locationName || 'Local a confirmar';
    const locationAddress = event.address || event.locationAddress || '';
    const locationCity = event.city || event.locationCity || '';
    const eventCategory = event.category || 'Evento';
    const eventCapacity = event.capacity || 0;
    const eventTickets = event.tickets || [];

    return (
        <DashboardLayout userType="organizer">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {/* Header Success */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-[2rem] text-emerald-600 shadow-xl shadow-emerald-100/50 animate-bounce">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Status & Message Area */}
                    <div className="md:col-span-12 space-y-4 text-center">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase relative">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-600">
                               {event.status === 'published' ? 'Evento Publicado!' : 'Evento Enviado para Análise!'}
                            </span>
                        </h1>
                        <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto italic">
                             {event.status === 'published' 
                                ? '"Seu evento já está disponível para o público e pronto para vender!"'
                                : '"Seu evento foi registrado com sucesso e entrou na fila de revisão da nossa equipe."'}
                        </p>
                    </div>

                    {/* Pending Analysis Box - ONLY SHOW IF NOT PUBLISHED */}
                    {event.status !== 'published' && (
                        <div className="md:col-span-12">
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
                                <div className="absolute top-0 right-0 p-8 text-amber-200/50 -mr-4 -mt-4 transform rotate-12 group-hover:rotate-0 transition-transform">
                                    <Clock className="w-32 h-32" />
                                </div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                    <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/50">
                                        <Clock className="w-10 h-10 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-amber-900 uppercase tracking-tight mb-2">PRAZO DE ANÁLISE: ATÉ 30 MINUTOS</h2>
                                        <p className="text-amber-800/80 font-medium leading-relaxed">
                                            Nossa equipe está revisando as diretrizes, categorias e integridade do seu evento. 
                                            {user?.status !== 'approved' 
                                                ? " Como seu cadastro ainda está em análise, seu evento será publicado automaticamente assim que sua conta for aprovada."
                                                : " Em instantes seu evento estará disponível para venda em toda a plataforma."}
                                        </p>
                                    </div>
                                </div>

                                {/* WhatsApp Notification Banner */}
                                <div className="relative z-10 mt-6 flex items-center gap-4 bg-emerald-100/80 border border-emerald-200 rounded-2xl p-4 md:p-5">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight flex items-center gap-2">
                                            <Bell className="w-4 h-4" /> Você será notificado via WhatsApp
                                        </h4>
                                        <p className="text-xs text-emerald-700/80 font-medium mt-0.5">
                                            Assim que seu evento for aprovado e publicado, enviaremos uma mensagem no seu WhatsApp confirmando a publicação. Fique tranquilo!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Summary Card */}
                    <div className="md:col-span-7">
                        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white hover:shadow-indigo-100/50 transition-shadow">
                            <div className="h-48 relative">
                                {bannerImage ? (
                                    <img src={bannerImage} className="w-full h-full object-cover" alt="Event Banner" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                                        <Sparkles className="w-16 h-16 text-white/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <Badge className="bg-indigo-600 mb-2 border-none text-white">#{eventCategory}</Badge>
                                    <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{event.title}</h3>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                {/* Event Details Summary */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Data & Horário
                                        </p>
                                        <p className="font-bold text-gray-800 uppercase tracking-tight">
                                            {formatDate(startDate)}
                                        </p>
                                        {formatTime(startDate) && (
                                            <p className="text-sm text-gray-500 font-medium">
                                                às {formatTime(startDate)}h
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Localização
                                        </p>
                                        <p className="font-bold text-gray-800 uppercase tracking-tight line-clamp-1">
                                            {locationName}
                                        </p>
                                        {locationCity && (
                                            <p className="text-sm text-gray-500 font-medium">{locationCity}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {event.description && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição</p>
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{event.description}</p>
                                    </div>
                                )}

                                {/* Capacity & Tickets */}
                                <div className="pt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                            <Ticket className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-gray-500 uppercase tracking-widest">
                                                {eventTickets.length} {eventTickets.length === 1 ? 'Lote Criado' : 'Lotes Criados'}
                                            </span>
                                            {eventCapacity > 0 && (
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                    Capacidade: {eventCapacity} pessoas
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Atual</p>
                                         <span className={`text-xs font-black uppercase ${
                                            event.status === 'published' ? 'text-emerald-600' :
                                            event.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                                         }`}>
                                            {event.status === 'published' ? 'Publicado' : 
                                             event.status === 'rejected' ? 'Rejeitado' : 'Aguardando Revisão'}
                                         </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Access / Share */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200">
                            <Sparkles className="w-8 h-8 mb-4 text-indigo-100" />
                            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Aumente suas vendas</h3>
                            <p className="text-indigo-100/80 text-sm font-medium mb-8 leading-relaxed">
                                Comece a divulgar seu link agora mesmo! O checkout estará ativo assim que a análise for concluída.
                            </p>
                            <div className="space-y-3">
                                <Button onClick={handleShare} className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black uppercase text-xs tracking-widest h-14 rounded-2xl shadow-lg shadow-black/10 gap-2">
                                    <Share2 className="w-4 h-4" /> Compartilhar no Zap
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={handleCopyLink}
                                    className="w-full text-indigo-100 hover:text-white hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest h-12 rounded-2xl gap-2"
                                >
                                     Copiar Link Curto
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gray-100 rounded-[2.5rem] p-8 border border-gray-200 group">
                             <div className="flex items-center gap-4 mb-6">
                                 <div className="p-3 bg-white rounded-2xl text-gray-400 group-hover:text-indigo-600 transition-colors">
                                     <PanelLeft className="w-5 h-5" />
                                 </div>
                                 <h4 className="font-black text-gray-900 uppercase tracking-tighter">Próximos Passos</h4>
                             </div>
                             <ul className="space-y-4">
                                 {[
                                     { label: 'Completar Perfil Fiscais', link: '/organizer/onboarding' },
                                     { label: 'Gerenciar Meus Eventos', link: '/organizer/events' },
                                     { label: 'Configurar Loja Online', link: '/organizer/store' }
                                 ].map((item, idx) => (
                                     <li key={idx} className="flex items-center justify-between group/item">
                                         <Link to={item.link} className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                                             {item.label}
                                         </Link>
                                         <ArrowRight className="w-3 h-3 text-gray-300 group-hover/item:translate-x-1 transition-transform" />
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="md:col-span-12 flex justify-center pt-8">
                         <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm">
                             <ShieldCheck className="w-5 h-5 text-indigo-600" />
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plataforma Segura & Auditada A2 Tickets 2026</span>
                         </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EventSuccessPage;
