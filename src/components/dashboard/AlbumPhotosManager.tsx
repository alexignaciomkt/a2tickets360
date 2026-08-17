import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, UploadCloud, Loader2, AlertCircle, Image as ImageIcon, Trash2, Check, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { albumService, ProducerAlbum, AlbumDetails, ProducerAlbumPhoto } from '@/services/albumService';

interface AlbumPhotosManagerProps {
  isOpen: boolean;
  onClose: () => void;
  albumId: string;
}

type UploadState = 'queued' | 'uploading' | 'success' | 'error';

interface UploadItem {
  id: string;
  file: File;
  state: UploadState;
  error?: string;
  photo?: ProducerAlbumPhoto;
}

export const AlbumPhotosManager: React.FC<AlbumPhotosManagerProps> = ({ isOpen, onClose, albumId }) => {
  const { toast } = useToast();
  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState('');
  
  // Use a ref to track the active uploads to enforce concurrency limit (max 3)
  const activeUploadsCount = useRef(0);
  const maxConcurrent = 3;

  const fetchAlbum = useCallback(async () => {
    try {
      const data = await albumService.getAlbumDetails(albumId);
      setAlbum(data);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o álbum.' });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [albumId, onClose, toast]);

  useEffect(() => {
    if (isOpen && albumId) {
      setIsLoading(true);
      fetchAlbum();
      setUploads([]);
    }
  }, [isOpen, albumId, fetchAlbum]);

  useEffect(() => {
    const processQueue = async () => {
      if (!isOpen) return;

      const queuedItems = uploads.filter(u => u.state === 'queued');
      if (queuedItems.length === 0) return;

      const availableSlots = maxConcurrent - activeUploadsCount.current;
      if (availableSlots <= 0) return;

      const itemsToStart = queuedItems.slice(0, availableSlots);
      if (itemsToStart.length === 0) return;

      // Mark items as uploading immediately and reserve slots
      activeUploadsCount.current += itemsToStart.length;
      
      setUploads(prev => prev.map(u => 
        itemsToStart.some(it => it.id === u.id) ? { ...u, state: 'uploading' } : u
      ));

      // Process each item asynchronously
      itemsToStart.forEach(async (item) => {
        try {
          const presignRes = await albumService.getPresignedUrl(item.file.name, item.file.type || 'image/jpeg', item.file.size, albumId);
          
          const uploadResponse = await fetch(presignRes.presignedUrl, {
            method: 'PUT',
            body: item.file,
            headers: { 'Content-Type': item.file.type || 'image/jpeg' }
          });

          if (!uploadResponse.ok) {
            throw new Error(`Storage upload failed with status ${uploadResponse.status}`);
          }

          const photo = await albumService.registerPhoto(albumId, presignRes.objectKey);
          
          // Trigger success state, this will cause useEffect to re-run and pick the next queued item
          setUploads(prev => prev.map(u => u.id === item.id ? { ...u, state: 'success', photo } : u));
          fetchAlbum();
        } catch (err: any) {
          console.error('Upload error', err);
          // Trigger error state, this will also cause useEffect to re-run
          setUploads(prev => prev.map(u => u.id === item.id ? { ...u, state: 'error', error: err.message || 'Erro no envio' } : u));
        } finally {
          activeUploadsCount.current -= 1;
        }
      });
    };

    processQueue();
  }, [uploads, isOpen, albumId, fetchAlbum]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    if (files.length > 20) {
      toast({ variant: 'destructive', title: 'Aviso', description: 'Selecione no máximo 20 fotos por vez.' });
      return;
    }

    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      state: 'queued' as UploadState
    }));

    setUploads(prev => [...prev, ...newUploads]);
    e.target.value = '';
  };

  const handleRetry = (id: string) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, state: 'queued', error: undefined } : u));
  };

  const removeUploadItem = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Deseja excluir esta foto?')) return;
    try {
      await albumService.deletePhoto(albumId, photoId);
      toast({ title: 'Foto excluída.' });
      fetchAlbum();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao excluir foto.' });
    }
  };

  const handleSetCover = async (photoId: string) => {
    try {
      await albumService.updateAlbum(albumId, { coverPhotoId: photoId });
      toast({ title: 'Capa atualizada!' });
      fetchAlbum();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao definir capa.' });
    }
  };

  const saveCaption = async (photoId: string) => {
    if (captionValue.length > 150) {
      toast({ variant: 'destructive', title: 'Aviso', description: 'Legenda muito longa.' });
      return;
    }
    try {
      await albumService.updatePhoto(albumId, photoId, { caption: captionValue });
      toast({ title: 'Legenda salva.' });
      setEditingCaptionId(null);
      fetchAlbum();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao salvar legenda.' });
    }
  };

  const movePhoto = async (photo: ProducerAlbumPhoto, direction: 'left' | 'right') => {
    if (!album) return;
    const currentIndex = album.photos.findIndex(p => p.id === photo.id);
    if (direction === 'left' && currentIndex === 0) return;
    if (direction === 'right' && currentIndex === album.photos.length - 1) return;

    const swapIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    const swapPhoto = album.photos[swapIndex];

    try {
      // Optistic local update
      const newPhotos = [...album.photos];
      const tempOrder = newPhotos[currentIndex].sortOrder;
      newPhotos[currentIndex].sortOrder = newPhotos[swapIndex].sortOrder;
      newPhotos[swapIndex].sortOrder = tempOrder;
      
      // Sort array
      newPhotos.sort((a, b) => a.sortOrder - b.sortOrder);
      setAlbum({ ...album, photos: newPhotos });

      // Persist
      await albumService.updatePhoto(albumId, photo.id, { sortOrder: newPhotos[swapIndex].sortOrder }); // The photo now has swapIndex's old order
      await albumService.updatePhoto(albumId, swapPhoto.id, { sortOrder: tempOrder });

    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao reordenar.' });
      fetchAlbum(); // revert local state on error
    }
  };

  const toggleStatus = async () => {
    if (!album) return;
    
    if (album.status !== 'PUBLISHED') {
      if (album.photos.length === 0) {
        toast({ variant: 'destructive', title: 'Não é possível publicar', description: 'Adicione pelo menos uma foto antes de publicar.' });
        return;
      }
      if (!album.title) {
        toast({ variant: 'destructive', title: 'Não é possível publicar', description: 'O álbum precisa ter um título.' });
        return;
      }
    }

    const newStatus = album.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    setIsPublishing(true);
    try {
      const updated = await albumService.updateAlbum(albumId, { status: newStatus });
      setAlbum({ ...album, status: updated.status });
      toast({ title: newStatus === 'PUBLISHED' ? 'Álbum Publicado!' : 'Álbum Ocultado!' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message || 'Erro ao alterar status.' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 md:p-6 animate-in fade-in">
      <div className="bg-white md:rounded-[2rem] w-full h-full md:max-w-6xl overflow-hidden shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-white">
          <div>
            <h2 className="font-black text-lg uppercase tracking-tight text-gray-900 truncate max-w-[200px] md:max-w-md">
              {album?.title || 'Carregando...'}
            </h2>
            {album && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  album.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                  album.status === 'HIDDEN' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {album.status === 'PUBLISHED' ? 'Publicado' : album.status === 'HIDDEN' ? 'Oculto' : 'Rascunho'}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {album.photos?.length || 0} Fotos
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {album && (
              <Button 
                onClick={toggleStatus} 
                disabled={isPublishing}
                variant={album.status === 'PUBLISHED' ? 'outline' : 'default'}
                className={`hidden md:flex rounded-xl font-black uppercase text-[10px] tracking-widest ${album.status !== 'PUBLISHED' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {isPublishing && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                {album.status === 'PUBLISHED' ? 'Ocultar Álbum' : 'Publicar Álbum'}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-gray-100 hover:bg-gray-200 ml-2">
              <X className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 space-y-8">
            
            {/* UPLOAD AREA */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-gray-900">Adicionar Fotos</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Até 20 fotos por vez. JPEG, PNG, WEBP (Max 10MB)</p>
                </div>
                <input id="album-multi-upload" type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
                <Button asChild className="rounded-xl font-black uppercase text-[10px] tracking-widest">
                  <label htmlFor="album-multi-upload" className="cursor-pointer">
                    <UploadCloud className="w-4 h-4 mr-2" /> Selecionar Arquivos
                  </label>
                </Button>
              </div>

              {/* UPLOAD QUEUE */}
              {uploads.length > 0 && (
                <div className="space-y-3 mt-4 border-t border-gray-50 pt-4">
                  {uploads.map(upload => (
                    <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          upload.state === 'success' ? 'bg-green-100 text-green-600' :
                          upload.state === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          {upload.state === 'success' ? <Check className="w-5 h-5" /> :
                           upload.state === 'error' ? <AlertCircle className="w-5 h-5" /> :
                           <ImageIcon className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{upload.file.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {upload.state === 'queued' && <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Aguardando...</span>}
                            {upload.state === 'uploading' && <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Enviando...</span>}
                            {upload.state === 'success' && <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Concluído</span>}
                            {upload.state === 'error' && <span className="text-[10px] font-black uppercase tracking-widest text-red-600 truncate">{upload.error}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {upload.state === 'error' && (
                          <Button variant="outline" size="sm" onClick={() => handleRetry(upload.id)} className="text-[10px] h-7 rounded-lg">Tentar Novamente</Button>
                        )}
                        {(upload.state === 'success' || upload.state === 'error') && (
                          <Button variant="ghost" size="icon" onClick={() => removeUploadItem(upload.id)} className="h-7 w-7 text-gray-400">
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {uploads.every(u => u.state === 'success') && (
                    <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase tracking-widest font-bold text-gray-400" onClick={() => setUploads([])}>
                      Limpar Histórico de Uploads
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* PHOTOS GRID */}
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-gray-900 mb-4">Fotos do Álbum</h3>
              
              {(!album?.photos || album.photos.length === 0) ? (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 border-dashed">
                  <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Nenhuma foto no álbum</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {album.photos.map((photo, index) => {
                    const isCover = photo.id === album.coverPhotoId;
                    return (
                      <div key={photo.id} className={`group relative bg-white rounded-2xl overflow-hidden border-2 transition-all ${isCover ? 'border-primary shadow-md' : 'border-gray-100'}`}>
                        {/* Imagem */}
                        <div className="aspect-square relative bg-gray-100">
                          <img src={photo.imageUrl} alt="Foto" className="w-full h-full object-cover" />
                          {isCover && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center shadow-md">
                              <Star className="w-3 h-3 mr-1 fill-white" /> Capa
                            </div>
                          )}
                          
                          {/* Hover Actions (Desktop) / Always semi-visible on Mobile */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg" onClick={() => handleDeletePhoto(photo.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Controles Inferiores */}
                        <div className="p-3 bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-gray-400 hover:text-gray-900" disabled={index === 0} onClick={() => movePhoto(photo, 'left')}>
                                <ArrowLeft className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-gray-400 hover:text-gray-900" disabled={index === album.photos.length - 1} onClick={() => movePhoto(photo, 'right')}>
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </div>
                            {!isCover && (
                              <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase tracking-widest font-black text-gray-400 hover:text-primary px-2" onClick={() => handleSetCover(photo.id)}>
                                Fazer Capa
                              </Button>
                            )}
                          </div>
                          
                          {editingCaptionId === photo.id ? (
                            <div className="space-y-2">
                              <textarea 
                                className="w-full text-xs p-2 bg-gray-50 rounded border-none focus:ring-1 resize-none font-medium"
                                rows={2}
                                value={captionValue}
                                onChange={e => setCaptionValue(e.target.value)}
                                placeholder="Legenda da foto..."
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button size="sm" variant="default" className="flex-1 h-6 text-[9px] rounded-lg" onClick={() => saveCaption(photo.id)}>Salvar</Button>
                                <Button size="sm" variant="ghost" className="flex-1 h-6 text-[9px] rounded-lg" onClick={() => setEditingCaptionId(null)}>Canc.</Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="text-xs text-gray-600 font-medium truncate cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                              onClick={() => { setEditingCaptionId(photo.id); setCaptionValue(photo.caption || ''); }}
                              title="Clique para editar legenda"
                            >
                              {photo.caption || <span className="text-gray-400 italic">Sem legenda...</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Publish Button */}
            <div className="md:hidden pt-4 pb-8">
              {album && (
                <Button 
                  onClick={toggleStatus} 
                  disabled={isPublishing}
                  variant={album.status === 'PUBLISHED' ? 'outline' : 'default'}
                  className={`w-full rounded-xl font-black uppercase text-xs tracking-widest h-12 ${album.status !== 'PUBLISHED' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {album.status === 'PUBLISHED' ? 'Ocultar Álbum' : 'Publicar Álbum'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
