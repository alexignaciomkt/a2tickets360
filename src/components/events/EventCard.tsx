
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

  // Status Tags Logic
  const now = new Date();
  
  // Se a data já contiver o 'T' (ISO string do Supabase), usamos direto. 
  // Caso contrário, montamos com o time.
  const eventDateRaw = event.date.includes('T') 
    ? new Date(event.date) 
    : new Date(`${event.date}T${event.time || '00:00'}`);
    
  const durationHours = parseInt(event.duration || '4');
  const eventEndDate = new Date(eventDateRaw.getTime() + durationHours * 60 * 60 * 1000);

  const isHappening = now >= eventDateRaw && now <= eventEndDate;
  const isEnded = now > eventEndDate;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 card-hover">
      <div className="relative">
        <img
          src={event.bannerUrl || event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Status Tags */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {isHappening && (
            <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 animate-pulse shadow-lg uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Acontecendo
            </div>
          )}
          {isEnded && (
            <div className="bg-gray-800/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg uppercase tracking-tighter">
              🏁 Encerrado
            </div>
          )}
        </div>

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
