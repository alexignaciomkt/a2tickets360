
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share, Upload, Calendar, History, Image, ExternalLink, Download } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { users, events, PurchasedTicket } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import NFTTicket from '@/components/tickets/NFTTicket';

const ParticipantPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ticket');
  const [participant, setParticipant] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<PurchasedTicket | null>(null);
  
  useEffect(() => {
    // Simular busca do usuário pelo ID
    // No caso de mock, vamos usar o primeiro usuário disponível
    const mockUser = users[0];
    setParticipant(mockUser);
    
    if (mockUser && mockUser.tickets && mockUser.tickets.length > 0) {
      setSelectedTicket(mockUser.tickets[0]);
    }
  }, [userId]);
  
  const handleShare = () => {
    toast({
      title: "Link copiado!",
      description: "Link para compartilhamento copiado para a área de transferência.",
    });
  };
  
  const handleImageUpload = () => {
    toast({
      title: "Upload de imagem",
      description: "Funcionalidade de upload em desenvolvimento.",
    });
  };

  const handleDownloadTicket = () => {
    toast({
      title: "Download iniciado",
      description: "Seu ingresso NFT está sendo gerado para download.",
    });
    // Em uma aplicação real, isto geraria um PDF ou imagem do ingresso
    setTimeout(() => {
      toast({
        title: "Download concluído",
        description: "Ingresso salvo com sucesso!",
      });
    }, 1500);
  };
  
  if (!participant) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Carregando informações...</h2>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="bg-page min-h-[80vh] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Participant Profile Card */}
            <Card className="mb-8">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
                  <div className="absolute left-6 transform -translate-y-1/2 flex items-end">
                    <img 
                      src={participant.photoUrl} 
                      alt={participant.name} 
                      className="w-24 h-24 rounded-full border-4 border-white object-cover"
                    />
                  </div>
                </div>
                
                <div className="pt-16 pb-6 px-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold">{participant.name}</h1>
                      <p className="text-gray-600">{participant.email}</p>
                      <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Participante
                      </div>
                    </div>
                    
                    <Button onClick={handleShare} className="flex items-center gap-2">
                      <Share className="w-4 h-4" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tabs for Ticket/History/Photos */}
            <Tabs defaultValue="ticket" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="ticket" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ingresso
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Fotos
                </TabsTrigger>
              </TabsList>
              
              {/* NFT Ticket View */}
              <TabsContent value="ticket" className="m-0">
                {selectedTicket ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-2">Meu Ingresso NFT</h2>
                      <p className="text-gray-600">
                        Este é seu ingresso exclusivo para o evento. Compartilhe-o com seus amigos!
                      </p>
                    </div>
                    
                    <div className="rounded-lg overflow-hidden bg-white shadow-lg mb-8">
                      <NFTTicket 
                        ticket={selectedTicket}
                        userName={participant.name}
                        userPhoto={participant.photoUrl}
                        shareUrl={`https://sanjapass.com/participant/${participant.id}/ticket/${selectedTicket.id}`}
                      />
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button variant="outline" onClick={handleDownloadTicket} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Baixar Ingresso
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Compartilhar Experiência
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-lg font-semibold mb-2">Nenhum ingresso encontrado</h3>
                    <p className="text-gray-500 mb-4">
                      Você ainda não tem ingressos para eventos.
                    </p>
                    <Link to="/events">
                      <Button>Ver eventos</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              {/* Event History */}
              <TabsContent value="history" className="m-0">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">Histórico de Eventos</h2>
                  <p className="text-gray-600">
                    Eventos que você participou ou tem ingressos comprados.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {participant.tickets && participant.tickets.length > 0 ? (
                    participant.tickets.map((ticket: PurchasedTicket) => {
                      const event = events.find(e => e.id === ticket.eventId);
                      return (
                        <Card key={ticket.id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row h-full">
                            <div className="md:w-1/4 bg-center bg-cover" 
                                style={{backgroundImage: `url(${event?.bannerUrl})`}}>
                              <div className="h-32 md:h-full"></div>
                            </div>
                            <div className="p-6 md:w-3/4">
                              <h3 className="font-semibold text-lg mb-1">{event?.title}</h3>
                              <p className="text-sm text-gray-500 mb-2">
                                {new Date(event?.date || '').toLocaleDateString('pt-BR')} • {event?.location.city}
                              </p>
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                                  ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {ticket.status === 'active' ? 'Válido' :
                                  ticket.status === 'used' ? 'Utilizado' : 'Cancelado'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {ticket.ticketName}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  R$ {ticket.price.toFixed(2).replace('.', ',')}
                                </span>
                                <Link to={`/dashboard/tickets/${ticket.id}`}>
                                  <Button variant="outline" size="sm">Ver Ingresso</Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-16">
                      <h3 className="text-lg font-semibold mb-2">Nenhum histórico encontrado</h3>
                      <p className="text-gray-500">
                        Você ainda não participou de nenhum evento.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Photo Upload */}
              <TabsContent value="photos" className="m-0">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">Minhas Fotos</h2>
                  <p className="text-gray-600">
                    Compartilhe fotos dos eventos que você participou.
                  </p>
                </div>
                
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Arraste e solte suas fotos aqui</h3>
                      <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                        Compartilhe suas memórias do evento. Você pode fazer upload de imagens no formato JPG ou PNG.
                      </p>
                      <Button onClick={handleImageUpload}>
                        Selecionar Fotos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Sem fotos ainda</h3>
                  <p className="text-gray-500 mb-4">
                    Você ainda não compartilhou nenhuma foto dos eventos.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ParticipantPage;
