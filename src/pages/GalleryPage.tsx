
import { useState, useEffect } from 'react';
import { Search, Upload, Filter, Heart } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import { events, galleryPhotos, Photo } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const GalleryPage = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Combine all event gallery photos with additional gallery photos
    const allPhotos = [
      ...galleryPhotos,
      ...events.flatMap((event) => event.gallery),
    ];
    
    setPhotos(allPhotos);
  }, []);
  
  const filteredPhotos = selectedEvent === 'all'
    ? photos
    : photos.filter((photo) => photo.eventId === selectedEvent);
  
  const searchedPhotos = searchQuery 
    ? filteredPhotos.filter(photo => 
        photo.caption?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        photo.userName.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredPhotos;

  const handleLikePhoto = (photoId: string) => {
    // Simular curtida
    toast({
      title: "Foto curtida!",
      description: "Obrigado por interagir com nossa galeria",
      variant: "default",
    });
  };
  
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
    toast({
      title: "Envio de fotos",
      description: "Função será implementada em breve",
      variant: "default",
    });
  };
  
  return (
    <MainLayout>
      <div className="bg-page py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Galeria Social</h1>
            
            <Button 
              onClick={openUploadModal}
              className="w-full md:w-auto flex items-center gap-2"
            >
              <Upload size={18} />
              Enviar minha foto
            </Button>
          </div>
          
          {/* Filter Bar */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar fotos..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter size={20} className="text-gray-500" />
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="input-field py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-auto"
                  >
                    <option value="all">Todos os eventos</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Photos Grid with Interaction */}
          {searchedPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchedPhotos.map(photo => {
                const event = events.find(e => e.id === photo.eventId);
                return (
                  <div key={photo.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="relative">
                      <img 
                        src={photo.photoUrl} 
                        alt={photo.caption || 'Photo'} 
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <h3 className="text-white font-medium truncate">{photo.caption || 'Foto do evento'}</h3>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {event?.title || 'Evento não encontrado'}
                        </p>
                        
                        <button 
                          onClick={() => handleLikePhoto(photo.id)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {photo.userName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">Nenhuma foto encontrada</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Tente outro termo de busca ou filtro'
                  : 'Seja o primeiro a compartilhar suas fotos deste evento!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default GalleryPage;
