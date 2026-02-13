
import { Check } from 'lucide-react';
import { PurchasedTicket } from '@/data/mockData';
import { generateQRCode } from '@/data/mockData';

interface QRCodeTicketProps {
  ticket: PurchasedTicket;
  userName?: string;
  userPhoto?: string;
}

const QRCodeTicket = ({ ticket, userName, userPhoto }: QRCodeTicketProps) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-primary p-4 text-white">
        <h3 className="text-xl font-bold truncate">{ticket.eventTitle}</h3>
        <p className="text-sm opacity-90">{ticket.ticketName}</p>
      </div>
      
      <div className="p-6 flex flex-col items-center">
        <div className="mb-4 text-center">
          {userPhoto && (
            <img 
              src={userPhoto}
              alt={userName}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md mx-auto mb-2"
            />
          )}
          {userName && <p className="font-medium text-gray-800">{userName}</p>}
        </div>
        
        <div className="p-2 border-2 border-gray-200 rounded-lg mb-4">
          <img 
            src={generateQRCode(ticket.qrCode)}
            alt="QR Code do ingresso"
            className="w-52 h-52"
          />
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            ticket.status === 'active' ? 'bg-green-100 text-green-800' :
            ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {ticket.status === 'active' && (
              <>
                <Check className="w-4 h-4 mr-1" />
                Válido
              </>
            )}
            {ticket.status === 'used' && 'Utilizado'}
            {ticket.status === 'cancelled' && 'Cancelado'}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-500">Compartilhe seu ingresso</p>
          <button className="mt-2 inline-flex items-center bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors">
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeTicket;
