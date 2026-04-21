import React, { useState } from 'react';
import { Globe, HelpCircle, Image as ImageIcon, Plus, Trash2, Save, MapPin, Calendar, Info, Loader2 } from 'lucide-react';
import { organizerService } from '@/services/organizerService';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const OrganizerEventInfoTab = ({ eventId }: { eventId: string }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  React.useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('description, gallery_urls, settings')
        .eq('id', eventId)
        .single();
      
      if (data) {
        setDescription(data.description || '');
        setGalleryUrls(data.gallery_urls || []);
        setFaqs(data.settings?.faqs || []);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          description,
          gallery_urls: galleryUrls,
          settings: { faqs }
        })
        .eq('id', eventId);

      if (error) throw error;
      toast({ title: 'Sucesso!', description: 'Informações do evento atualizadas.' });
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao salvar informações.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Basic Info & SEO ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
               <Info className="w-5 h-5 text-primary" /> Descrição do Evento
            </h3>
            <textarea 
               className="w-full h-48 bg-gray-50 border-0 rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
               placeholder="Conte tudo sobre o seu evento para atrair o público..."
               value={description}
               onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> FAQ (Dúvidas Frequentes)
              </h3>
              <button 
                onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                className="bg-gray-50 text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar Pergunta
              </button>
            </div>
            
            <div className="space-y-4">
               {faqs.map((faq, index) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-2xl relative group">
                     <button 
                       onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                       className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                     <input 
                       type="text" 
                       className="w-full bg-transparent border-0 font-bold text-gray-900 placeholder:text-gray-400 mb-2 outline-none"
                       placeholder="Pergunta (ex: Qual a classificação etária?)"
                       value={faq.question}
                       onChange={(e) => {
                         const newFaqs = [...faqs];
                         newFaqs[index].question = e.target.value;
                         setFaqs(newFaqs);
                       }}
                     />
                     <textarea 
                       className="w-full bg-transparent border-0 text-sm text-gray-600 placeholder:text-gray-400 outline-none resize-none"
                       placeholder="Resposta clara e objetiva..."
                       value={faq.answer}
                       onChange={(e) => {
                         const newFaqs = [...faqs];
                         newFaqs[index].answer = e.target.value;
                         setFaqs(newFaqs);
                       }}
                     ></textarea>
                  </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
               <ImageIcon className="w-5 h-5 text-primary" /> Galeria de Fotos
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-all cursor-pointer">
                 <Plus className="w-6 h-6 mb-2" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Enviar Foto</span>
              </div>
              {galleryUrls.map((url, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
                   <img src={url} className="w-full h-full object-cover" alt={`Galeria ${i}`} />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <Trash2 
                        className="w-5 h-5 text-white cursor-pointer" 
                        onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))}
                      />
                   </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">As fotos aparecerão na página pública do evento.</p>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizerEventInfoTab;
