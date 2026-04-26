
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Event } from '@/services/eventService';

interface SocialShareCardProps {
  event: Event;
  cardRef?: React.RefObject<HTMLDivElement>;
}

const SocialShareCard: React.FC<SocialShareCardProps> = ({ event, cardRef }) => {
  const shareUrl = `${window.location.origin}/events/${event.id}`;

  return (
    <div 
      ref={cardRef}
      className="relative w-[360px] h-[640px] bg-slate-900 overflow-hidden shadow-2xl rounded-[2.5rem] flex flex-col"
    >
      {/* Background Poster (Blurred) */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 scale-110"
        style={{ backgroundImage: `url(${event.heroImageUrl || event.bannerUrl})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/80 to-slate-950"></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full p-8 justify-between">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
            T
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Ticketera 360</span>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center py-6 h-full max-h-[300px]">
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 transform rotate-1 bg-black/20 flex items-center justify-center">
             <img 
               src={event.heroImageUrl || event.bannerUrl} 
               className="w-full h-full object-cover" 
               alt={event.title} 
             />
             <div className="absolute top-4 right-4">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg shadow-lg">
                   <Ticket className="w-4 h-4" />
                </div>
             </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
              {event.title}
            </h2>
            <div className="flex flex-wrap gap-4 text-indigo-300 font-bold uppercase text-[10px] tracking-widest">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>{new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{event.location.city}</span>
              </div>
            </div>
          </div>

          {/* Footer with QR Code */}
          <div className="bg-white rounded-[2rem] p-6 flex items-center justify-between shadow-2xl">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Scaneie para</p>
              <p className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight">Garantir Seu Ingresso</p>
              <div className="pt-2">
                 <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Vendas Abertas</span>
              </div>
            </div>
            <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <QRCodeSVG 
                value={shareUrl} 
                size={70}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -right-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default SocialShareCard;
