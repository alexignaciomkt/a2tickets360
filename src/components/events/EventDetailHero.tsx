
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Event } from '@/data/mockData';

interface EventDetailHeroProps {
  event: Event;
}

const EventDetailHero = ({ event }: EventDetailHeroProps) => {
  // Format date
  const formattedDate = format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="relative">
      {/* Banner Image with Gradient Overlay */}
      <div className="relative h-80 md:h-96">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>
      
      {/* Event Details Overlay */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-32 bg-white rounded-t-3xl p-6 md:p-8 shadow-lg animate-slideUp">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            {event.category === 'music' 
              ? 'Música'
              : event.category === 'business'
              ? 'Negócios'
              : event.category === 'comedy'
              ? 'Comédia'
              : 'Evento'}
          </span>
          
          <h1 className="text-2xl md:text-4xl font-bold mb-4">{event.title}</h1>
          
          <div className="flex flex-col gap-3 mb-6 text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <span>
                {event.startTime} - {event.endTime}
              </span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <span>
                {event.location.name} - {event.location.address}, {event.location.city}/{event.location.state}
              </span>
            </div>
          </div>
          
          <div className="bg-page px-4 py-3 rounded-lg text-sm">
            <span className="font-medium">Organizado por:</span> {event.organizer.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailHero;
