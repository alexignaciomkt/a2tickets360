import React, { useState, useEffect, useRef } from 'react';
import { Globe, Lock, CheckCircle2, AlertCircle, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { normalizeSlug, validateSlug, isReservedSlug } from '@/lib/slugUtils';
import { api } from '@/services/api';

export type SlugAvailabilityState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'invalid'
  | 'reserved'
  | 'error';

interface EventSlugFieldProps {
  title: string;
  slug: string;
  onChange: (newSlug: string, isCustom?: boolean) => void;
  isCustomSlug?: boolean;
  eventId?: string;
  status?: string;
  isTakenConflict?: boolean;
}

export const EventSlugField: React.FC<EventSlugFieldProps> = ({
  title,
  slug,
  onChange,
  isCustomSlug = false,
  eventId,
  status,
  isTakenConflict = false,
}) => {
  // Estado de bloqueio: apenas 'draft' (ou novo rascunho sem status) é livremente editável
  const isLocked = Boolean(status && status !== 'draft');

  const normalizedTitle = normalizeSlug(title || '');
  // Título longo (>40 caracteres) não é "inválido", é um estado especial que requer personalização
  const isTitleTooLong = !isLocked && !isCustomSlug && normalizedTitle.length > 40;

  // Estados do campo principal
  const [availability, setAvailability] = useState<SlugAvailabilityState>('idle');
  const checkDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Estados do Modal de personalização
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modalSlugInput, setModalSlugInput] = useState('');
  const [modalAvailability, setModalAvailability] = useState<SlugAvailabilityState>('idle');
  const modalDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Sincronização automática com o Título quando NÃO personalizado
  useEffect(() => {
    if (isLocked || isCustomSlug) return;

    if (normalizedTitle.length > 40) {
      // Título longo: não definimos slug automático acima de 40 caracteres
      if (slug !== '') {
        onChange('', false);
      }
    } else {
      if (normalizedTitle !== slug) {
        onChange(normalizedTitle, false);
      }
    }
  }, [normalizedTitle, isCustomSlug, isLocked, slug, onChange]);

  // Se o backend retornou 409 durante o save, refletir taken imediatamente
  useEffect(() => {
    if (isTakenConflict) {
      setAvailability('taken');
    }
  }, [isTakenConflict]);

  // 2. Check de Disponibilidade Debounced (500ms) para o slug atual (<= 40 chars)
  useEffect(() => {
    if (checkDebounceRef.current) {
      clearTimeout(checkDebounceRef.current);
    }

    if (!slug || slug.trim().length === 0) {
      setAvailability('idle');
      return;
    }

    // Se estiver bloqueado (já publicado/em análise), não precisa consultar
    if (isLocked) {
      setAvailability('available');
      return;
    }

    // Validações locais antes de bater na API (regra estrita 3-40)
    if (!validateSlug(slug)) {
      setAvailability('invalid');
      return;
    }

    if (isReservedSlug(slug)) {
      setAvailability('reserved');
      return;
    }

    setAvailability('checking');

    checkDebounceRef.current = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams({
          type: 'evento',
          slug: slug.trim()
        });
        if (eventId) {
          queryParams.append('excludeId', eventId);
        }

        const res: any = await api.get(`/api/public/slugs/check?${queryParams.toString()}`);
        const data = res.data || res;

        if (data.available) {
          setAvailability('available');
        } else if (data.reason === 'taken') {
          setAvailability('taken');
        } else if (data.reason === 'reserved') {
          setAvailability('reserved');
        } else if (data.reason === 'invalid') {
          setAvailability('invalid');
        } else {
          setAvailability('error');
        }
      } catch (err) {
        console.error('Erro ao verificar disponibilidade do endereço:', err);
        setAvailability('error');
      }
    }, 500);

    return () => {
      if (checkDebounceRef.current) {
        clearTimeout(checkDebounceRef.current);
      }
    };
  }, [slug, eventId, isLocked]);

  // 3. Check de Disponibilidade dentro do Modal de Personalização
  const checkModalSlug = (candidate: string) => {
    if (modalDebounceRef.current) {
      clearTimeout(modalDebounceRef.current);
    }

    const normalized = normalizeSlug(candidate);
    setModalSlugInput(normalized);

    if (!normalized || normalized.trim().length === 0) {
      setModalAvailability('idle');
      return;
    }

    if (normalized.length < 3 || normalized.length > 40 || !validateSlug(normalized)) {
      setModalAvailability('invalid');
      return;
    }

    if (isReservedSlug(normalized)) {
      setModalAvailability('reserved');
      return;
    }

    setModalAvailability('checking');

    modalDebounceRef.current = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams({
          type: 'evento',
          slug: normalized
        });
        if (eventId) {
          queryParams.append('excludeId', eventId);
        }

        const res: any = await api.get(`/api/public/slugs/check?${queryParams.toString()}`);
        const data = res.data || res;

        if (data.available) {
          setModalAvailability('available');
        } else if (data.reason === 'taken') {
          setModalAvailability('taken');
        } else if (data.reason === 'reserved') {
          setModalAvailability('reserved');
        } else if (data.reason === 'invalid') {
          setModalAvailability('invalid');
        } else {
          setModalAvailability('error');
        }
      } catch (err) {
        console.error('Erro ao verificar endereço no modal:', err);
        setModalAvailability('error');
      }
    }, 400);
  };

  const handleOpenDialog = () => {
    const initialVal = slug || normalizeSlug(title);
    setModalSlugInput(initialVal);
    setModalAvailability('idle');
    setIsDialogOpen(true);
    if (initialVal) {
      checkModalSlug(initialVal);
    }
  };

  const handleConfirmCustomSlug = () => {
    if (
      modalAvailability === 'available' &&
      modalSlugInput &&
      modalSlugInput.length >= 3 &&
      modalSlugInput.length <= 40 &&
      validateSlug(modalSlugInput)
    ) {
      onChange(modalSlugInput, true);
      setIsDialogOpen(false);
    }
  };

  const isModalConfirmEnabled =
    modalAvailability === 'available' &&
    Boolean(modalSlugInput) &&
    modalSlugInput.length >= 3 &&
    modalSlugInput.length <= 40 &&
    validateSlug(modalSlugInput) &&
    !isReservedSlug(modalSlugInput);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">
        Endereço do seu evento
      </label>

      {/* ESTADO ESPECIAL: TÍTULO LONGO (>40 caracteres) */}
      {isTitleTooLong ? (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-white border border-slate-200/60 shadow-sm shrink-0 mt-0.5 sm:mt-0">
                <Globe className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Escolha um endereço curto para seu evento.
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  O nome do evento é longo. Escolha um endereço mais curto para facilitar a divulgação.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenDialog}
                className="h-8 px-3 text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg gap-1.5"
              >
                <Pencil className="h-3 w-3" />
                Alterar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ESTADO PADRÃO: <= 40 CARACTERES OU PERSONALIZADO OU BLOQUEADO */
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Lado Esquerdo: Identidade da URL */}
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-white border border-slate-200/60 shadow-sm shrink-0 mt-0.5 sm:mt-0">
                {isLocked ? (
                  <Lock className="h-5 w-5 text-slate-500" />
                ) : (
                  <Globe className="h-5 w-5 text-indigo-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-400 block leading-tight">
                  a2tickets360.com.br/evento/
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 break-all leading-snug">
                  {slug || <span className="text-slate-300 font-normal">seu-evento-aqui</span>}
                </span>
              </div>
            </div>

            {/* Lado Direito: Status e Ação */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              {/* Feedback de Estado */}
              {isLocked ? (
                <Badge variant="secondary" className="bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider px-2.5 py-1">
                  {status === 'pending' ? 'Em Análise' : 'Publicado'}
                </Badge>
              ) : availability === 'checking' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                  Verificando...
                </span>
              ) : availability === 'available' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Disponível
                </span>
              ) : availability === 'taken' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Já em uso
                </span>
              ) : availability === 'reserved' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                  Reservado
                </span>
              ) : availability === 'invalid' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Inválido
                </span>
              ) : null}

              {/* Botão Alterar (Apenas se não bloqueado) */}
              {!isLocked && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenDialog}
                  className="h-8 px-3 text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg gap-1.5"
                >
                  <Pencil className="h-3 w-3" />
                  Alterar
                </Button>
              )}
            </div>
          </div>

          {/* Texto descritivo de produto */}
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/60 leading-relaxed">
            {isLocked
              ? 'Este é o endereço público permanente deste evento.'
              : 'Este será o endereço público usado para divulgar e compartilhar seu evento.'}
          </p>
        </div>
      )}

      {/* Modal de Personalização */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Personalize o endereço do seu evento
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Escolha um endereço curto e fácil de compartilhar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                Endereço público
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <span className="px-3 py-2 text-xs font-medium text-slate-400 bg-slate-50 sm:border-r border-b sm:border-b-0 border-slate-200 select-none whitespace-nowrap">
                  a2tickets360.com.br/evento/
                </span>
                <Input
                  value={modalSlugInput}
                  onChange={(e) => checkModalSlug(e.target.value)}
                  placeholder="nome-do-evento"
                  className="border-0 shadow-none focus-visible:ring-0 text-sm font-semibold text-slate-900 h-10 px-3"
                  autoFocus
                />
              </div>
            </div>

            {/* Mensagens de Feedback em tempo real */}
            <div className="min-h-[24px]">
              {modalAvailability === 'checking' && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                  Verificando endereço...
                </p>
              )}
              {modalAvailability === 'available' && (
                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Este endereço está disponível
                </p>
              )}
              {modalAvailability === 'taken' && (
                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Este endereço já está em uso.
                </p>
              )}
              {modalAvailability === 'reserved' && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Este endereço é reservado pelo sistema.
                </p>
              )}
              {(modalAvailability === 'invalid' || (modalSlugInput && (modalSlugInput.length < 3 || modalSlugInput.length > 40))) && (
                <p className="text-xs font-medium text-amber-600 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Use entre 3 e 40 caracteres.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!isModalConfirmEnabled}
              onClick={handleConfirmCustomSlug}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Usar este endereço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventSlugField;
