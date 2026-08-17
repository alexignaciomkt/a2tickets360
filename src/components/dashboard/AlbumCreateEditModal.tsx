import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { albumService, ProducerAlbum } from '@/services/albumService';
import { useToast } from '@/components/ui/use-toast';
import { Event } from '@/interfaces/organizer';
import { organizerService } from '@/services/organizerService';
import { useAuth } from '@/contexts/AuthContext';

interface AlbumCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  album?: ProducerAlbum | null;
  onSaved: (album: ProducerAlbum) => void;
}

export const AlbumCreateEditModal: React.FC<AlbumCreateEditModalProps> = ({ isOpen, onClose, album, onSaved }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (album) {
        setTitle(album.title);
        setDescription(album.description || '');
        setEventId(album.eventId || '');
        setEventDate(album.eventDate ? new Date(album.eventDate).toISOString().split('T')[0] : '');
      } else {
        setTitle('');
        setDescription('');
        setEventId('');
        setEventDate('');
      }

      if (user?.id) {
        organizerService.getEvents(user.id).then(fetchedEvents => {
          setEvents(fetchedEvents);
        });
      }
    }
  }, [isOpen, album, user]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Aviso', description: 'O título é obrigatório.' });
      return;
    }
    
    setIsSaving(true);
    try {
      const data = {
        title,
        description: description || undefined,
        eventId: eventId || undefined,
        eventDate: eventDate || undefined,
      };

      let savedAlbum: ProducerAlbum;
      if (album) {
        savedAlbum = await albumService.updateAlbum(album.id, data);
        toast({ title: 'Sucesso', description: 'Álbum atualizado.' });
      } else {
        savedAlbum = await albumService.createAlbum(data);
        toast({ title: 'Sucesso', description: 'Álbum criado com sucesso.' });
      }
      onSaved(savedAlbum);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message || 'Falha ao salvar álbum.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="font-black text-lg uppercase tracking-tight text-gray-900">
            {album ? 'Editar Álbum' : 'Criar Novo Álbum'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Título do Álbum *</label>
              <span className="text-[10px] text-gray-400 font-bold">{title.length}/100</span>
            </div>
            <input
              type="text"
              maxLength={100}
              placeholder="Ex: Baile do Hawaii 2026"
              className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner text-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Descrição (Opcional)</label>
              <span className="text-[10px] text-gray-400 font-bold">{description.length}/150</span>
            </div>
            <textarea
              maxLength={150}
              rows={3}
              placeholder="Uma breve descrição sobre os momentos."
              className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner text-sm resize-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Evento Relacionado (Opcional)
            </label>
            <select
              className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm shadow-inner"
              value={eventId}
              onChange={e => setEventId(e.target.value)}
            >
              <option value="">Nenhum evento selecionado</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Data do Álbum (Opcional)
            </label>
            <input
              type="date"
              className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary shadow-inner text-sm text-gray-700"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 mt-auto">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-black uppercase text-[10px] tracking-widest">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-black uppercase text-[10px] tracking-widest">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {album ? 'Salvar Alterações' : 'Criar Álbum'}
          </Button>
        </div>
      </div>
    </div>
  );
};
