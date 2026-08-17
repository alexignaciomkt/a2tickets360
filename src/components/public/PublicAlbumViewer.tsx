import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Image as ImageIcon, Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

interface PublicAlbumViewerProps {
  albumId: string;
  slug: string;
  onClose: () => void;
  primaryColor?: string;
}

export const PublicAlbumViewer: React.FC<PublicAlbumViewerProps> = ({ albumId, slug, onClose, primaryColor = '#7C3AED' }) => {
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/public/producers/${slug}/albums/${albumId}`);
        setAlbum(data);
      } catch (err) {
        console.error('Error fetching album:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [albumId, slug]);

  // Handle ESC key to close lightbox or album
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhotoIndex !== null) {
          setSelectedPhotoIndex(null);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowRight' && selectedPhotoIndex !== null) {
        handleNext();
      }
      if (e.key === 'ArrowLeft' && selectedPhotoIndex !== null) {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, onClose, album?.photos?.length]);

  const handleNext = () => {
    if (!album?.photos) return;
    setSelectedPhotoIndex((prev) => (prev !== null && prev < album.photos.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    if (!album?.photos) return;
    setSelectedPhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  };

  const downloadImage = async (photo: any, index: number) => {
    try {
      setIsDownloading(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Load main image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        // avoid cache issues with tainted canvas
        img.src = photo.imageUrl + '?t=' + new Date().getTime(); 
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw producer watermark if exists
      if (photo.producerWatermarkUrl) {
        try {
          const wImg = new Image();
          wImg.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            wImg.onload = resolve;
            wImg.onerror = reject;
            wImg.src = photo.producerWatermarkUrl + '?t=' + new Date().getTime();
          });
          
          // Size: 15% of width
          const wWidth = canvas.width * 0.15;
          const wHeight = (wImg.height / wImg.width) * wWidth;
          const padding = canvas.width * 0.02; // 2% padding
          
          // Bottom Left
          const x = padding;
          const y = canvas.height - wHeight - padding;
          
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.drawImage(wImg, x, y, wWidth, wHeight);
          ctx.restore();
        } catch (e) {
          console.error('Failed to load producer watermark', e);
        }
      }

      // Draw A2Tickets logo (Bottom Right)
      try {
        const a2Img = new Image();
        a2Img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          a2Img.onload = resolve;
          a2Img.onerror = reject;
          a2Img.src = '/assets/logo.png'; // Assuming logo.png is in public folder
        });
        
        const a2Width = canvas.width * 0.12;
        const a2Height = (a2Img.height / a2Img.width) * a2Width;
        const padding = canvas.width * 0.02;
        
        const x = canvas.width - a2Width - padding;
        const y = canvas.height - a2Height - padding;
        
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.drawImage(a2Img, x, y, a2Width, a2Height);
        ctx.restore();
      } catch (e) {
        console.error('Failed to load A2Tickets watermark', e);
      }

      // Export
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob creation failed');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}-foto-${index + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      }, 'image/jpeg', 0.95);

    } catch (err) {
      console.error('Error downloading image', err);
      alert('Erro ao baixar imagem. Tente novamente.');
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 md:p-8 animate-in fade-in">
      <div className="bg-zinc-950 w-full h-full md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border border-white/5 relative">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl absolute top-0 left-0 right-0 z-10">
          <div>
            {loading ? (
              <div className="h-6 w-48 bg-zinc-800 animate-pulse rounded" />
            ) : (
              <h2 className="font-black text-lg md:text-xl uppercase tracking-tight text-white line-clamp-1">
                {album?.title}
              </h2>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-black/20 hover:bg-black/50 text-white">
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto pt-24 pb-8 px-4 md:px-8 hide-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-zinc-500" />
            </div>
          ) : !album ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-black uppercase tracking-widest">Álbum não encontrado</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8">
              {(album.description || album.eventDate) && (
                <div className="text-center max-w-2xl mx-auto space-y-4">
                  {album.eventDate && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 font-bold text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(album.eventDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {album.description && (
                    <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                      {album.description}
                    </p>
                  )}
                </div>
              )}

              {album.photos?.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5">
                  <p className="text-zinc-600 font-black uppercase tracking-widest">Nenhuma foto neste álbum</p>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                  {album.photos?.map((photo: any, idx: number) => (
                    <div 
                      key={photo.id} 
                      className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer"
                      onClick={() => setSelectedPhotoIndex(idx)}
                    >
                      <img src={photo.imageUrl} alt={photo.caption || 'Foto'} className="w-full h-auto object-cover" loading="lazy" />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white font-medium text-sm">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX */}
      {selectedPhotoIndex !== null && album?.photos?.[selectedPhotoIndex] && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Lightbox Toolbar */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white/60 font-black uppercase tracking-widest text-xs">
              {selectedPhotoIndex + 1} / {album.photos.length}
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadImage(album.photos[selectedPhotoIndex], selectedPhotoIndex)}
                disabled={isDownloading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full font-black uppercase tracking-widest text-[10px]"
              >
                {isDownloading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-2" />}
                Baixar Foto
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPhotoIndex(null)} className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Previous Button */}
          {selectedPhotoIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next Button */}
          {selectedPhotoIndex < album.photos.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image Container */}
          <div className="flex-1 relative flex items-center justify-center p-4 md:p-12" onClick={() => setSelectedPhotoIndex(null)}>
            <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
              <img 
                src={album.photos[selectedPhotoIndex].imageUrl} 
                className="max-w-full max-h-[85vh] object-contain select-none"
                alt="Foto em tela cheia"
              />
              
              {/* CSS Watermarks */}
              {album.photos[selectedPhotoIndex].producerWatermarkUrl && (
                <img 
                  src={album.photos[selectedPhotoIndex].producerWatermarkUrl} 
                  className="absolute bottom-4 left-4 w-[15%] max-w-[120px] object-contain pointer-events-none drop-shadow-md opacity-40"
                  alt="Producer Watermark"
                />
              )}
              <img 
                src="/assets/logo.png" 
                className="absolute bottom-4 right-4 w-[12%] max-w-[100px] object-contain pointer-events-none drop-shadow-md opacity-40"
                alt="A2Tickets"
              />
            </div>
          </div>

          {/* Caption */}
          {album.photos[selectedPhotoIndex].caption && (
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center pointer-events-none">
              <p className="text-white text-base md:text-lg font-medium text-center max-w-2xl">
                {album.photos[selectedPhotoIndex].caption}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
