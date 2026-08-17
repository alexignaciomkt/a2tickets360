import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, Calendar, Edit, Settings, EyeOff, Trash2 } from 'lucide-react';
import { albumService, ProducerAlbum } from '@/services/albumService';
import { useToast } from '@/components/ui/use-toast';
import { AlbumCreateEditModal } from './AlbumCreateEditModal';
import { AlbumPhotosManager } from './AlbumPhotosManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrganizerAlbumsTabProps {
  profileData: any;
}

const OrganizerAlbumsTab: React.FC<OrganizerAlbumsTabProps> = ({ profileData }) => {
  const { toast } = useToast();
  const [albums, setAlbums] = useState<ProducerAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<ProducerAlbum | null>(null);
  
  const [managingAlbumId, setManagingAlbumId] = useState<string | null>(null);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const data = await albumService.getAlbums();
      setAlbums(data);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar álbuns.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const confirmDelete = async () => {
    if (!albumToDelete) return;
    setIsDeleting(true);
    try {
      await albumService.deleteAlbum(albumToDelete);
      toast({ title: 'Álbum excluído com sucesso.' });
      fetchAlbums();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao excluir o álbum.' });
    } finally {
      setIsDeleting(false);
      setAlbumToDelete(null);
    }
  };

  const handleAlbumSaved = (savedAlbum: ProducerAlbum) => {
    setIsCreateModalOpen(false);
    setEditingAlbum(null);
    fetchAlbums();
    
    // Se foi uma criação (novo álbum), abrir o gerenciador imediatamente
    if (!editingAlbum) {
      setManagingAlbumId(savedAlbum.id);
    }
  };

  const legacyGallery: string[] = profileData?.settings?.gallery || [];

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 pt-8 px-8 border-b border-gray-50 bg-white">
          <div>
            <CardTitle className="font-black text-2xl uppercase tracking-tight text-gray-900">MOMENTOS INESQUECÍVEIS</CardTitle>
            <CardDescription className="font-medium text-gray-500">
              Organize fotos dos seus eventos em álbuns e destaque os melhores momentos da sua produtora.
            </CardDescription>
          </div>
          <Button 
            className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 shadow-md"
            onClick={() => { setEditingAlbum(null); setIsCreateModalOpen(true); }}
          >
            + Criar Novo Álbum
          </Button>
        </CardHeader>
        <CardContent className="p-8 bg-gray-50/50">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <ImageIcon className="w-16 h-16 text-indigo-100 mx-auto mb-4" />
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-widest mb-2">Você ainda não criou nenhum álbum.</h3>
              <p className="text-gray-500 font-medium max-w-md mx-auto mb-6 text-sm">
                Organize as fotos dos seus eventos e transforme sua página em uma vitrine viva da sua história.
              </p>
              <Button 
                className="rounded-xl font-black uppercase text-[10px] tracking-widest"
                onClick={() => { setEditingAlbum(null); setIsCreateModalOpen(true); }}
              >
                Criar Primeiro Álbum
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <div key={album.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group flex flex-col">
                  <div 
                    className="aspect-video bg-gray-100 relative cursor-pointer"
                    onClick={() => setManagingAlbumId(album.id)}
                  >
                    {album.coverPhoto ? (
                      <img src={album.coverPhoto.imageUrl} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm text-white ${
                        album.status === 'PUBLISHED' ? 'bg-green-500' :
                        album.status === 'HIDDEN' ? 'bg-amber-500' :
                        'bg-gray-500'
                      }`}>
                        {album.status === 'PUBLISHED' ? 'Publicado' : album.status === 'HIDDEN' ? 'Oculto' : 'Rascunho'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg flex items-center">
                      <ImageIcon className="w-3 h-3 mr-1" /> {album.photoCount}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="font-black text-sm uppercase tracking-widest text-gray-900 mb-1 line-clamp-1" title={album.title}>{album.title}</h4>
                    {album.description && (
                      <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-3">{album.description}</p>
                    )}
                    {album.eventDate && (
                      <div className="flex items-center text-xs text-gray-400 font-bold mb-3 mt-auto">
                        <Calendar className="w-3 h-3 mr-1" /> {new Date(album.eventDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" className="flex-1 text-[10px] uppercase font-black tracking-widest h-8 rounded-xl" onClick={() => setManagingAlbumId(album.id)}>
                        <Settings className="w-3 h-3 mr-1" /> Fotos
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-gray-50 text-gray-600 hover:text-primary" onClick={() => { setEditingAlbum(album); setIsCreateModalOpen(true); }} title="Editar Metadados">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600" onClick={() => setAlbumToDelete(album.id)} title="Excluir Álbum">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GALERIA LEGADA */}
      {legacyGallery.length > 0 && (
        <Card className="border-none shadow-sm rounded-[2rem] bg-gray-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="font-black text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <EyeOff className="w-4 h-4" /> Galeria Anterior (Legado)
            </CardTitle>
            <CardDescription className="text-xs">As imagens antigas estão preservadas aqui, apenas para leitura.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {legacyGallery.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                  <img src={url} alt={`Legado ${i}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AlbumCreateEditModal 
        isOpen={isCreateModalOpen} 
        onClose={() => { setIsCreateModalOpen(false); setEditingAlbum(null); }} 
        album={editingAlbum}
        onSaved={handleAlbumSaved}
      />

      {managingAlbumId && (
        <AlbumPhotosManager 
          isOpen={true} 
          onClose={() => {
            setManagingAlbumId(null);
            fetchAlbums(); // refresh list on close to update photoCount and cover
          }}
          albumId={managingAlbumId}
        />
      )}

      {/* CONFIRM DELETE DIALOG */}
      <AlertDialog open={!!albumToDelete} onOpenChange={(open) => !open && setAlbumToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight text-xl text-gray-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Excluir Álbum?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-gray-500 text-sm mt-2">
              Esta ação não pode ser desfeita. Todas as fotos deste álbum também serão removidas definitivamente do nosso servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
            <AlertDialogCancel 
              className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-gray-50 hover:bg-gray-100 border-none text-gray-600"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-600 hover:bg-red-700 text-white shadow-md border-none"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrganizerAlbumsTab;
