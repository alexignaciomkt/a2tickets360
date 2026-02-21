
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { eventService, Event } from '@/services/eventService';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  // Format date
  const formattedDate = format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 card-hover">
      <div className="relative">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-bold text-xl line-clamp-1">{event.title}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formattedDate}</span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {event.location.name}, {event.location.city} - {event.location.state}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-xs text-gray-500">A partir de</span>
            <p className="text-primary font-bold">
              {event.tickets.length > 0
                ? `R$ ${Math.min(...event.tickets.map((t) => t.price)).toFixed(2).replace('.', ',')}`
                : 'Grátis'}
            </p>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="btn-primary py-2 px-4 text-sm"
          >
            Ver evento
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
