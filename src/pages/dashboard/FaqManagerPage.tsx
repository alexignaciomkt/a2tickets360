
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Check,
  MoveUp,
  MoveDown,
  Search,
  MessageSquare
} from 'lucide-react';
import { cmsService, FAQ } from '@/services/cmsService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const FaqManagerPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getFAQs();
      setFaqs(data);
    } catch (error) {
      toast.error('Erro ao carregar FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.question || !formData.answer) {
      toast.error('Preencha a pergunta e a resposta');
      return;
    }

    try {
      await cmsService.createFAQ(formData);
      toast.success('Pergunta adicionada com sucesso');
      setFormData({ question: '', answer: '' });
      setIsCreating(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar FAQ');
    }
  };

  const handleUpdate = async (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;

    try {
      await cmsService.updateFAQ(id, {
        question: faq.question,
        answer: faq.answer,
        is_active: faq.is_active
      });
      toast.success('FAQ atualizada');
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta pergunta?')) return;
    try {
      await cmsService.deleteFAQ(id);
      toast.success('Pergunta removida');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir FAQ');
    }
  };

  const handleToggleStatus = async (faq: FAQ) => {
    try {
      await cmsService.updateFAQ(faq.id, { is_active: !faq.is_active });
      fetchData();
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newFaqs.length) return;

    [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
    
    try {
      setFaqs(newFaqs);
      await cmsService.reorderFAQs(newFaqs.map(f => f.id));
      toast.success('Ordem atualizada');
    } catch (error) {
      toast.error('Erro ao reordenar');
      fetchData();
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Gestão de FAQ</h1>
            <p className="text-slate-500 font-medium">Configure as perguntas frequentes que aparecem na Index.</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-xs h-12"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Pergunta
          </Button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="border-2 border-indigo-600 shadow-2xl shadow-indigo-100 rounded-[2rem] overflow-hidden animate-in slide-in-from-top duration-300">
            <CardHeader className="bg-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black uppercase">Adicionar Nova FAQ</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pergunta</label>
                  <Input 
                    placeholder="Ex: Como faço para comprar ingressos?"
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="rounded-xl border-slate-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resposta</label>
                  <textarea 
                    placeholder="Escreva a resposta detalhada aqui..."
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    className="w-full min-h-[120px] rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setIsCreating(false)} className="rounded-xl font-black uppercase text-[10px]">Cancelar</Button>
                <Button onClick={handleCreate} className="bg-indigo-600 text-white rounded-xl px-8 font-black uppercase tracking-widest text-[10px]">Salvar Pergunta</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <Card key={faq.id} className={`border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group transition-all ${editingId === faq.id ? 'ring-2 ring-indigo-600' : ''}`}>
                <div className="flex flex-col md:flex-row">
                  {/* Handle & Ordering */}
                  <div className="bg-slate-50 p-4 flex md:flex-col items-center justify-center gap-2 border-r border-slate-100">
                    <Button 
                      size="icon" variant="ghost" 
                      disabled={index === 0}
                      onClick={() => handleReorder(index, 'up')}
                      className="rounded-full hover:bg-white"
                    >
                      <MoveUp className="w-4 h-4 text-slate-400" />
                    </Button>
                    <span className="text-xs font-black text-slate-300">#{index + 1}</span>
                    <Button 
                      size="icon" variant="ghost" 
                      disabled={index === faqs.length - 1}
                      onClick={() => handleReorder(index, 'down')}
                      className="rounded-full hover:bg-white"
                    >
                      <MoveDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>

                  <div className="flex-grow p-6 md:p-8">
                    {editingId === faq.id ? (
                      <div className="space-y-4">
                        <Input 
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            newFaqs[index].question = e.target.value;
                            setFaqs(newFaqs);
                          }}
                          className="font-bold text-lg rounded-xl border-indigo-200"
                        />
                        <textarea 
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            newFaqs[index].answer = e.target.value;
                            setFaqs(newFaqs);
                          }}
                          className="w-full min-h-[100px] rounded-xl border border-indigo-200 p-4 focus:outline-none text-sm font-medium"
                        />
                        <div className="flex justify-end gap-2">
                           <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="rounded-full uppercase text-[10px] font-black">Cancelar</Button>
                           <Button size="sm" onClick={() => handleUpdate(faq.id)} className="bg-emerald-500 text-white rounded-full uppercase text-[10px] font-black px-6">Salvar</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge className={`${faq.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'} border-none text-[8px] font-black uppercase tracking-widest`}>
                              {faq.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">{faq.question}</h3>
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button size="icon" variant="ghost" onClick={() => handleToggleStatus(faq)} className="rounded-full hover:bg-indigo-50 hover:text-indigo-600">
                             <Check className={`w-4 h-4 ${faq.is_active ? 'text-emerald-500' : ''}`} />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(faq.id)} className="rounded-full hover:bg-amber-50 hover:text-amber-600">
                             <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(faq.id)} className="rounded-full hover:bg-rose-50 hover:text-rose-600">
                             <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
              <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h2 className="text-2xl font-black uppercase text-slate-400">Nenhuma FAQ cadastrada</h2>
              <p className="text-slate-400 font-medium italic mt-2">Clique em "Nova Pergunta" para começar.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FaqManagerPage;
