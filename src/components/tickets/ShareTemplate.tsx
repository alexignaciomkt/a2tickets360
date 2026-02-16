
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShareTemplateProps {
  eventTitle: string;
  eventDate: string;
  eventBanner: string;
  ticketType: string;
  onClose?: () => void;
}

const ShareTemplate = ({
  eventTitle,
  eventDate,
  eventBanner,
  ticketType,
  onClose
}: ShareTemplateProps) => {
  const { toast } = useToast();

  const handleShare = () => {
    // Em uma aplicação real, isto iria gerar uma imagem para compartilhamento
    toast({
      title: "Compartilhamento",
      description: "Template copiado para compartilhamento nas redes sociais!",
    });

    if (onClose) {
      setTimeout(onClose, 2000);
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download",
      description: "Baixando template para compartilhamento...",
    });

    // Em uma aplicação real, isto iria gerar um download da imagem
    setTimeout(() => {
      toast({
        title: "Download concluído",
        description: "Imagem salva com sucesso!",
      });
    }, 1500);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="overflow-hidden">
        {/* Template Header */}
        <div className="relative">
          <img
            src={eventBanner}
            alt={eventTitle}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-xl">{eventTitle}</h3>
            <p className="text-white/80 text-sm">{eventDate}</p>
          </div>
        </div>

        {/* Template Content */}
        <div className="p-4 text-center">
          <div className="my-3 py-3 px-4 bg-primary/10 rounded-lg">
            <p className="text-primary font-medium mb-1">INGRESSO COMPRADO</p>
            <p className="text-gray-700">{ticketType}</p>
          </div>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-sm text-gray-500">
                Compartilhe sua experiência
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white font-bold text-xl rounded-lg my-4 uppercase">
            EU VOU COM A A2 TICKETS 360!
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <Button onClick={handleShare} className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Baixar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ShareTemplate;
