
import { Check, Share2 } from 'lucide-react';
import { PurchasedTicket } from '@/data/mockData';
import { generateQRCode } from '@/data/mockData';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface NFTTicketProps {
  ticket: PurchasedTicket;
  userName?: string;
  userPhoto?: string;
  shareUrl?: string;
}

const NFTTicket = ({ ticket, userName, userPhoto, shareUrl }: NFTTicketProps) => {
  const { toast } = useToast();
  const [isGlowing, setIsGlowing] = useState(false);
  
  const handleShare = () => {
    if (shareUrl) {
      // Simulating sharing functionality
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copiado!",
          description: "Link para compartilhamento copiado para a área de transferência.",
        });
      });
    }
  };
  
  // Glow animation on hover
  const toggleGlow = () => {
    setIsGlowing(prev => !prev);
  };

  return (
    <div 
      className={`relative transition-all duration-500 ${isGlowing ? 'shadow-[0_0_30px_rgba(247,147,30,0.6)]' : ''}`}
      onMouseEnter={toggleGlow}
      onMouseLeave={toggleGlow}
    >
      {/* NFT Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-gradient-to-r from-purple-500 to-primary px-2 py-1 rounded-md text-xs text-white font-bold shadow-lg">
          NFT TICKET
        </div>
      </div>
      
      {/* Top Section - Event Info */}
      <div className="relative">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1 truncate">{ticket.eventTitle}</h3>
              <p className="text-sm opacity-90">{ticket.ticketName}</p>
              <p className="text-xs opacity-80 mt-2">#{ticket.qrCode.substring(0, 8)}</p>
            </div>
            
            {/* Price Tag */}
            <div className="flex flex-col items-end">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                R$ {ticket.price.toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="absolute -bottom-10 left-6 ring-4 ring-white rounded-full">
          {userPhoto && (
            <img 
              src={userPhoto}
              alt={userName}
              className="w-20 h-20 rounded-full object-cover shadow-md"
            />
          )}
        </div>
      </div>
      
      {/* QR Code Section */}
      <div className="pt-12 pb-6 px-6 bg-white">
        <div className="flex justify-end mb-2">
          <span className="text-sm text-gray-500">Proprietário: {userName}</span>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 border-2 border-dashed border-gray-200 rounded-lg mb-3 bg-gray-50">
            <img 
              src={generateQRCode(ticket.qrCode)}
              alt="QR Code do ingresso"
              className="w-48 h-48"
            />
          </div>
          
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
      
      {/* Footer */}
      <div className="bg-gray-100 p-4 border-t flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">ID: {ticket.id}</p>
        </div>
        
        <Button onClick={handleShare} size="sm" variant="ghost" className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
};

export default NFTTicket;
