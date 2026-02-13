
import React from 'react';
import { Calendar, MapPin, Users, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ModernEventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    bannerUrl: string;
    date: string;
    location: string;
    attendees?: number;
    rating?: number;
    price?: string;
    category: string;
    isFree?: boolean;
    isPopular?: boolean;
    tags?: string[];
  };
  className?: string;
}

export const ModernEventCard = ({ event, className = '' }: ModernEventCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      year: date.getFullYear(),
    };
  };

  const dateInfo = formatDate(event.date);

  return (
    <div className={`card-event ${className}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Date Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 text-center min-w-[60px]">
          <div className="text-2xl font-bold text-primary">{dateInfo.day}</div>
          <div className="text-xs font-medium text-gray-600">{dateInfo.month}</div>
        </div>

        {/* Tags */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {event.isFree && (
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              GRÁTIS
            </span>
          )}
          {event.isPopular && (
            <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full transition-all duration-300 hover:bg-white hover:scale-110">
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-xl mb-2 text-text-primary line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{event.location}</span>
          </div>
          
          {event.attendees && (
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>{event.attendees} participantes</span>
            </div>
          )}

          {event.rating && (
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>{event.rating}/5</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-text-primary">
            {event.isFree ? (
              <span className="text-lg font-bold text-accent">GRÁTIS</span>
            ) : (
              <span className="text-lg font-bold">
                {event.price || 'A partir de R$ 25'}
              </span>
            )}
          </div>
          
          <Link to={`/events/${event.id}`}>
            <Button size="sm" className="btn-primary">
              Ver Evento
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModernEventCard;
