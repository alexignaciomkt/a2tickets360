import { Check, ShieldCheck } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeTicketProps {
  ticket: any;
  userName?: string;
  userPhoto?: string;
}

const QRCodeTicket = ({ ticket, userName, userPhoto }: QRCodeTicketProps) => {
  // Garantir que temos um dado para o QR Code, mesmo que seja fallback
  const qrData = ticket.qr_code_data || ticket.qrCode || `TICKET-${ticket.id}`;

  return (
    <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
      <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-20 h-20" />
        </div>
        <h3 className="text-2xl font-black truncate uppercase tracking-tighter">{ticket.eventTitle || ticket.events?.title || 'Evento'}</h3>
        <p className="text-xs font-black uppercase tracking-widest opacity-80">{ticket.ticketName || ticket.tickets?.name || 'Ingresso Individual'}</p>
      </div>
      
      <div className="p-8 flex flex-col items-center">
        <div className="mb-6 text-center">
          <div className="relative inline-block">
              {userPhoto || ticket.photo_url ? (
                <img 
                  src={userPhoto || ticket.photo_url}
                  alt={userName}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-xl mx-auto mb-3">
                    <span className="text-2xl font-black text-indigo-300">{(userName || 'U')[0]}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
                  <Check className="w-3 h-3" strokeWidth={4} />
              </div>
          </div>
          {userName && <p className="font-black text-gray-900 uppercase tracking-tight">{userName}</p>}
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 italic">Titular Verificado</p>
        </div>
        
        <div className="p-4 bg-white border-2 border-gray-50 rounded-[2.5rem] shadow-inner mb-6 transition-all hover:scale-105 duration-300">
          <QRCodeCanvas 
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="text-center w-full">
          <div className={`inline-flex items-center justify-center w-full py-3 rounded-2xl text-sm font-black uppercase tracking-widest ${
            ticket.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
            ticket.status === 'used' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
            'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {ticket.status === 'active' && (
              <>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                Ingresso Válido
              </>
            )}
            {ticket.status === 'used' && 'Ingresso Utilizado'}
            {ticket.status === 'cancelled' && 'Ingresso Cancelado'}
          </div>
          <p className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
              Apresente este código na portaria.<br/>O uso é único e intransferível.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50/50 p-4 border-t border-dashed border-gray-200 flex justify-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">A2 Tickets 360 Security • {qrData}</p>
      </div>
    </div>
  );
};

export default QRCodeTicket;
