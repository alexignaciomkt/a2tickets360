import { Calendar, MapPin, Ticket, Users, Tag } from 'lucide-react';
import { TicketTier } from './TicketBuilder';

interface EventPreviewCardProps {
    data: {
        eventType: 'paid' | 'free';
        category: string;
        title: string;
        description: string;
        imageUrl: string;
        date: string;
        time: string;
        duration: string;
        locationName: string;
        locationAddress: string;
        locationCity: string;
        locationState: string;
        capacity: number;
        tickets: TicketTier[];
    };
}

const EventPreviewCard = ({ data }: EventPreviewCardProps) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const totalTickets = data.tickets.reduce((sum, t) => sum + t.quantity, 0);
    const minPrice = data.eventType === 'free'
        ? 0
        : Math.min(...data.tickets.map(t => t.price).filter(p => p > 0), Infinity);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg max-w-2xl mx-auto">
            {/* Banner */}
            <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100">
                {data.imageUrl ? (
                    <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Sem imagem</span>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${data.eventType === 'free'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }
          `}>
                        {data.eventType === 'free' ? 'Gratuito' : 'Pago'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-xs text-indigo-600 font-medium uppercase tracking-wider">
                            {data.category || 'Sem categoria'}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{data.title || 'Nome do Evento'}</h3>
                    {data.description && (
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{data.description}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-900">{formatDate(data.date)}</p>
                            <p className="text-xs text-gray-500">
                                {data.time || '—'} {data.duration ? `• ${data.duration}` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-900">{data.locationName || '—'}</p>
                            <p className="text-xs text-gray-500">
                                {[data.locationCity, data.locationState].filter(Boolean).join(', ') || '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tickets Summary */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {data.eventType === 'free' ? (
                                <Users className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Ticket className="h-4 w-4 text-indigo-500" />
                            )}
                            <span className="text-sm text-gray-500">
                                {data.eventType === 'free'
                                    ? `${totalTickets} vagas disponíveis`
                                    : `${data.tickets.length} tipo(s) de ingresso • ${totalTickets} total`
                                }
                            </span>
                        </div>
                        <div className="text-right">
                            {data.eventType === 'free' ? (
                                <span className="text-lg font-bold text-emerald-600">Grátis</span>
                            ) : (
                                <div>
                                    <span className="text-xs text-gray-400">a partir de</span>
                                    <span className="text-lg font-bold text-gray-900 ml-1">
                                        {minPrice === Infinity ? 'R$ 0' : `R$ ${minPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventPreviewCard;
