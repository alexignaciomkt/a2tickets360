import React, { useState, useRef } from 'react';
import {
  Globe, HelpCircle, Image as ImageIcon, Plus, Trash2, Save,
  Loader2, Camera, Upload, ExternalLink, GripVertical, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { organizerService } from '@/services/organizerService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Faq { question: string; answer: string; }

const OrganizerEventInfoTab = ({ eventId }: { eventId: string }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [eventTitle, setEventTitle]   = useState('');
  const [bannerUrl, setBannerUrl]     = useState('');
  const [description, setDescription] = useState('');
  const [faqs, setFaqs]               = useState<Faq[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [slug, setSlug]               = useState('');

  const bannerInputRef  = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // ── Load event data ──────────────────────────────────────────
  React.useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('title, description, banner_url, gallery_urls, slug, event_faqs(*)')
        .eq('id', eventId)
        .single();

      if (data) {
        setEventTitle(data.title || '');
        setDescription(data.description || '');
        setBannerUrl(data.banner_url || '');
        setGalleryUrls(data.gallery_urls || []);
        setFaqs(data.event_faqs || []);
        setSlug(data.slug || '');
      } else {
        console.error('Error loading event:', error);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  // ── Upload banner ─────────────────────────────────────────────
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setBannerUploading(true);
    try {
      const { url } = await organizerService.uploadImage(file, user.id, user.name, `event-banner-${eventId}`, 'producer');
      setBannerUrl(url);
      toast({ title: 'Banner enviado!', description: 'Clique em "Salvar Alterações" para aplicar.' });
    } catch (err) {
      toast({ title: 'Erro no upload', description: 'Não foi possível enviar o banner.', variant: 'destructive' });
    } finally {
      setBannerUploading(false);
    }
  };

  // ── Upload gallery images ────────────────────────────────────
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user?.id) return;

    setGalleryUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const { url } = await organizerService.uploadImage(
          file, user.id, user.name,
          `event-gallery-${eventId}-${Date.now()}`,
          'producer'
        );
        uploaded.push(url);
      }
      setGalleryUrls(prev => [...prev, ...uploaded]);
      toast({ title: `${uploaded.length} foto(s) enviada(s)!`, description: 'Clique em "Salvar" para publicar.' });
    } catch (err) {
      toast({ title: 'Erro no upload da galeria', variant: 'destructive' });
    } finally {
      setGalleryUploading(false);
      // reset input
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // ── Save all ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Atualizar evento
      const { error: eventError } = await supabase
        .from('events')
        .update({
          description,
          banner_url: bannerUrl,
          gallery_urls: galleryUrls,
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      // 2. Sincronizar FAQs (Deletar e Inserir)
      await supabase.from('event_faqs').delete().eq('event_id', eventId);
      
      if (faqs.length > 0) {
        const faqsToInsert = faqs
          .filter(f => f.question.trim() && f.answer.trim())
          .map((f, i) => ({
            event_id: eventId,
            question: f.question,
            answer: f.answer,
            sort_order: i
          }));

        if (faqsToInsert.length > 0) {
          const { error: faqError } = await supabase.from('event_faqs').insert(faqsToInsert);
          if (faqError) throw faqError;
        }
      }

      toast({ title: '✅ Salvo com sucesso!', description: 'A página do evento foi atualizada.' });
    } catch (err) {
      toast({ title: 'Erro ao salvar', description: 'Verifique sua conexão e tente novamente.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── FAQ helpers ───────────────────────────────────────────────
  const addFaq = () => setFaqs(prev => [...prev, { question: '', answer: '' }]);
  const removeFaq = (i: number) => setFaqs(prev => prev.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: 'question' | 'answer', value: string) => {
    setFaqs(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-xs font-black uppercase tracking-widest">Carregando conteúdo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Preview link ────────────────────────────────── */}
      {slug && (
        <div className="flex items-center gap-3 px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl w-fit">
          <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="text-xs font-bold text-indigo-700">Prévia pública:</span>
          <a
            href={`/events/${eventId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"
          >
            Ver página do evento <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 1: CAPA DO EVENTO
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-gray-50">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-500" />
            Capa do Evento
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Dimensão recomendada: 1200 × 630px. Essa imagem aparece no topo da página e nas redes sociais.
          </p>
        </div>

        <div className="p-8 space-y-4">
          {/* Banner preview */}
          <div
            className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 group cursor-pointer"
            onClick={() => bannerInputRef.current?.click()}
          >
            {bannerUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Enviando banner...</p>
              </div>
            ) : bannerUrl ? (
              <img src={bannerUrl} alt="Banner do Evento" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                <ImageIcon className="w-16 h-16" />
                <p className="text-xs font-black uppercase tracking-widest">Clique para adicionar uma capa</p>
                <p className="text-[10px] font-medium">JPG, PNG ou WebP · Máx. 10 MB</p>
              </div>
            )}

            {/* Hover overlay */}
            {bannerUrl && !bannerUploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Camera className="w-8 h-8 text-white" />
                <p className="text-sm font-black text-white uppercase tracking-widest">Trocar Banner</p>
              </div>
            )}
          </div>

          <input
            ref={bannerInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleBannerUpload}
            disabled={bannerUploading}
          />

          <div className="flex gap-3">
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={bannerUploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-gray-200 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {bannerUploading ? 'Enviando...' : bannerUrl ? 'Trocar Imagem' : 'Fazer Upload'}
            </button>
            {bannerUrl && (
              <button
                onClick={() => setBannerUrl('')}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Remover
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 2: DESCRIÇÃO
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-gray-50">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            Descrição do Evento
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Aparece na seção "Sobre o Evento" da página pública. Seja detalhado para converter mais visitantes!
          </p>
        </div>

        <div className="p-8">
          <textarea
            className="w-full h-48 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all outline-none resize-none"
            placeholder="Descreva o evento com detalhes: atrações, dress code, programação, informações de acesso..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-[10px] text-gray-400 font-medium mt-2 text-right">
            {description.length} caracteres
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 3: GALERIA DO LOCAL
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-gray-50 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              Fotos do Local / Evento
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Adicione fotos da estrutura e do local para gerar credibilidade. Selecione múltiplas fotos de uma vez.
            </p>
          </div>
          <button
            onClick={() => galleryInputRef.current?.click()}
            disabled={galleryUploading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-200 disabled:opacity-60 flex-shrink-0"
          >
            {galleryUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {galleryUploading ? 'Enviando...' : 'Adicionar Fotos'}
          </button>
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleGalleryUpload}
          disabled={galleryUploading}
        />

        <div className="p-8">
          {galleryUrls.length === 0 && !galleryUploading ? (
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl py-16 flex flex-col items-center justify-center gap-3 text-gray-400 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
              onClick={() => galleryInputRef.current?.click()}
            >
              <ImageIcon className="w-12 h-12" />
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest">Arraste fotos aqui ou clique para selecionar</p>
                <p className="text-[10px] font-medium mt-1">JPG, PNG · Múltiplos arquivos suportados</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Upload placeholder while uploading */}
              {galleryUploading && (
                <div className="aspect-square rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-2 text-indigo-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Enviando...</span>
                </div>
              )}

              {galleryUrls.map((url, i) => (
                <div key={`${url}-${i}`} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group shadow-sm">
                  <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Galeria ${i + 1}`} />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <button
                      onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-2 bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                      title="Remover foto"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-black text-white">{i + 1}</span>
                  </div>
                </div>
              ))}

              {/* Add more button */}
              <div
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                onClick={() => galleryInputRef.current?.click()}
              >
                <Plus className="w-6 h-6" />
                <span className="text-[9px] font-black uppercase tracking-widest">Adicionar</span>
              </div>
            </div>
          )}

          {galleryUrls.length > 0 && (
            <p className="text-[10px] text-gray-400 font-medium mt-4">
              {galleryUrls.length} foto{galleryUrls.length !== 1 ? 's' : ''} adicionada{galleryUrls.length !== 1 ? 's' : ''}.
              Passe o mouse sobre uma foto para removê-la.
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 4: FAQ
      ══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-gray-50 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              FAQ — Dúvidas Frequentes
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Aparece na página do evento. Reduza os atendimentos no WhatsApp respondendo as dúvidas mais comuns.
            </p>
          </div>
          <button
            onClick={addFaq}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Pergunta
          </button>
        </div>

        <div className="p-8 space-y-4">
          {faqs.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl">
              <HelpCircle className="w-10 h-10" />
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Nenhuma pergunta adicionada</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Clique em "Nova Pergunta" para começar</p>
              </div>
            </div>
          ) : (
            faqs.map((faq, index) => (
              <div key={index} className="group relative bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden transition-all hover:border-indigo-200 hover:shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 pt-5 pb-2">
                  <div className="w-7 h-7 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black text-indigo-600">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none font-bold text-gray-900 placeholder:text-gray-400 text-sm"
                    placeholder="Pergunta (ex: Qual a classificação etária?)"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, 'question', e.target.value)}
                  />
                  <button
                    onClick={() => removeFaq(index)}
                    className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Divider */}
                <div className="mx-5 border-t border-gray-200" />
                {/* Answer */}
                <textarea
                  className="w-full bg-transparent border-none outline-none text-sm text-gray-600 placeholder:text-gray-400 px-5 py-3 resize-none min-h-[80px]"
                  placeholder="Resposta clara e objetiva para o seu público..."
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                />
              </div>
            ))
          )}

          {faqs.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 px-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {faqs.length} pergunta{faqs.length !== 1 ? 's' : ''}. Salve para publicar na página do evento.
            </div>
          )}
        </div>
      </div>

      {/* ── Save button (sticky bottom) ─────────────────── */}
      <div className="sticky bottom-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || bannerUploading || galleryUploading}
          className="flex items-center gap-3 px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-gray-900/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
          ) : (
            <><Save className="w-4 h-4" /> Salvar Alterações</>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrganizerEventInfoTab;
