import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle, XCircle, AlertTriangle, MessageSquare, Calendar,
  User, Clock, Star, Eye, MapPin, Ticket, ExternalLink, FileText,
  Phone, DollarSign, Users, Image
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { masterService } from '@/services/masterService';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EventApprovalPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      // Fetch either pending or published events
      const data = activeTab === 'pending' 
        ? await masterService.getPendingEvents()
        : await masterService.getAllEventsWithOrganizers(); // New method needed or just filter manually
      
      // If using getAllEvents, we filter by published in UI or create specialized method
      setEvents(data.filter((e: any) => e.status === activeTab));
    } catch (error) {
      toast({ title: 'Erro ao carregar eventos', description: 'Não foi possível buscar os eventos.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, [activeTab]);

  const handleApprove = async (id: string) => {
    try {
      setIsApproving(true);
      await masterService.approveEvent(id);
      setIsModalOpen(false);
      loadEvents();
      toast({ title: '✅ Evento publicado!', description: 'O evento agora está visível para vendas.' });
    } catch (error: any) {
      toast({ 
        title: 'Erro ao aprovar', 
        description: error.message || 'Verifique se o produtor está aprovado antes de publicar.', 
        variant: 'destructive' 
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsApproving(true);
      await masterService.rejectEvent(id);
      setIsModalOpen(false);
      loadEvents();
      toast({ title: 'Evento rejeitado', description: 'O produtor será notificado.' });
    } catch (error) {
      toast({ title: 'Erro ao rejeitar', variant: 'destructive' });
    } finally {
      setIsApproving(false);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await masterService.toggleFeaturedEvent(id, !current);
      loadEvents();
      toast({ title: !current ? 'Evento em destaque!' : 'Removido dos destaques' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar destaque', variant: 'destructive' });
    }
  };

  const openModal = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
  };
  const formatTime = (d: string) => {
    if (!d) return '';
    try { return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };
  const formatCurrency = (v: number) => `R$ ${(v || 0).toFixed(2).replace('.', ',')}`;

  const ev = selectedEvent;
  const org = ev?.organizer || {};

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Aprovação de Eventos</h1>
            <p className="text-gray-600 font-medium">Revise submissões e valide a integridade antes da publicação.</p>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Total Pendente</span>
            <span className="text-2xl font-black text-indigo-600 leading-none">{events.length}</span>
          </div>
        </div>

        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Fila de Revisão</CardTitle>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Pendentes
                </button>
                <button 
                  onClick={() => setActiveTab('published')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'published' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Publicados
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <CheckCircle className="h-12 w-12 text-emerald-400 mb-2" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Tudo em dia!</h3>
                <p className="text-sm text-gray-500 max-w-xs">Não há eventos aguardando aprovação no momento.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-black text-gray-900 uppercase tracking-tighter">Evento</th>
                      <th className="px-6 py-4 text-left font-black text-gray-900 uppercase tracking-tighter">Organizador</th>
                      <th className="px-6 py-4 text-left font-black text-gray-900 uppercase tracking-tighter">Data/Hora</th>
                      <th className="px-6 py-4 text-left font-black text-gray-900 uppercase tracking-tighter">Ingressos</th>
                      <th className="px-6 py-4 text-left font-black text-gray-900 uppercase tracking-tighter">Destaque</th>
                      <th className="px-6 py-4 text-right font-black text-gray-900 uppercase tracking-tighter">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openModal(event)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                              {event.bannerUrl ? (
                                <img src={event.bannerUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Image className="w-5 h-5" /></div>
                              )}
                            </div>
                            <div>
                              <div className="font-black text-gray-900 uppercase tracking-tight">{event.title}</div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase">{event.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <div>
                              <span className="font-bold text-gray-700 block">{event.organizer?.companyName || event.organizer?.name || 'Produtor'}</span>
                              {event.organizer?.profileComplete ? (
                                <span className="text-[9px] font-bold text-emerald-500 uppercase">Verificado</span>
                              ) : (
                                <span className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Incompleto</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600 font-medium">
                            <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formatDate(event.startDate || event.start_date)}</div>
                            <div className="flex items-center gap-1.5 text-xs"><Clock className="w-3 h-3" /> {formatTime(event.startDate || event.start_date)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-700">{event.tickets?.length || 0} lotes</span>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant={event.is_featured ? "default" : "outline"}
                            onClick={() => handleToggleFeatured(event.id, !!event.is_featured)}
                            className={`h-8 rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 ${event.is_featured ? 'bg-indigo-600' : 'text-gray-400'}`}>
                            <Star className={`w-3 h-3 ${event.is_featured ? 'fill-current' : ''}`} />
                            {event.is_featured ? 'ON' : 'OFF'}
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openModal(event)}
                              className="text-indigo-600 hover:bg-indigo-50 font-bold uppercase text-[10px]">
                              <Eye className="w-4 h-4 mr-1" /> Revisar
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(event.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-tighter text-xs h-9 rounded-xl shadow-lg shadow-emerald-100">
                              Aprovar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══════ MODAL DE APROVAÇÃO COMPLETO ══════ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Eye className="h-5 w-5 text-indigo-500" /> Revisão do Evento
            </DialogTitle>
            <DialogDescription>
              Todos os dados do evento e do produtor para análise de aprovação.
            </DialogDescription>
          </DialogHeader>

          {ev && (
            <div className="space-y-6 py-2">
              {/* Banner do Evento */}
              <div className="relative h-48 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 overflow-hidden border border-gray-100">
                {ev.bannerUrl || ev.imageUrl ? (
                  <img src={ev.bannerUrl || ev.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 font-bold text-sm">Sem banner</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <Badge className="bg-indigo-600 border-none text-white mb-1">#{ev.category || 'Evento'}</Badge>
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-none drop-shadow-lg">{ev.title}</h3>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-500 border-none text-white font-black uppercase text-[10px]">
                    <Clock className="w-3 h-3 mr-1" /> Aguardando Aprovação
                  </Badge>
                </div>
              </div>

              {/* Tabs: Evento / Produtor */}
              <Tabs defaultValue="event" className="w-full">
                <TabsList className="mb-4 w-full grid grid-cols-2">
                  <TabsTrigger value="event" className="font-bold uppercase text-xs tracking-widest">Dados do Evento</TabsTrigger>
                  <TabsTrigger value="producer" className="font-bold uppercase text-xs tracking-widest">Dados do Produtor</TabsTrigger>
                </TabsList>

                {/* ── TAB: EVENTO ── */}
                <TabsContent value="event" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título</p>
                      <p className="font-semibold text-gray-900">{ev.title}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria</p>
                      <p className="font-semibold text-gray-900">{ev.category || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> Data</p>
                      <p className="font-semibold text-gray-900">{formatDate(ev.startDate || ev.start_date)}</p>
                      {formatTime(ev.startDate || ev.start_date) && <p className="text-xs text-gray-500">às {formatTime(ev.startDate || ev.start_date)}h</p>}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3" /> Local</p>
                      <p className="font-semibold text-gray-900">{ev.locationName || ev.location_name || '—'}</p>
                      <p className="text-xs text-gray-500">{[ev.locationAddress || ev.address, ev.locationCity || ev.city, ev.locationState || ev.state].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> Capacidade</p>
                      <p className="font-semibold text-gray-900">{ev.capacity || 0} pessoas</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</p>
                      <p className="font-semibold text-gray-900">{(ev.eventType || ev.event_type) === 'free' ? 'Gratuito' : 'Pago'}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{ev.description || '—'}</p>
                    </div>
                  </div>

                  {/* Ingressos */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Ticket className="h-4 w-4 text-indigo-500" /> Ingressos ({ev.tickets?.length || 0} lotes)</p>
                    {ev.tickets && ev.tickets.length > 0 ? (
                      <div className="space-y-2">
                        {ev.tickets.map((t: any, i: number) => (
                          <div key={t.id || i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                            <div>
                              <span className="font-bold text-gray-900">{t.name}</span>
                              <span className="text-[10px] text-gray-400 ml-2 uppercase font-bold">{t.category}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-indigo-600">{formatCurrency(t.price)}</span>
                              <span className="text-[10px] text-gray-400 ml-2 font-bold">× {t.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Nenhum ingresso configurado.</p>
                    )}
                  </div>
                </TabsContent>

                {/* ── TAB: PRODUTOR ── */}
                <TabsContent value="producer" className="space-y-4">
                  {/* Mini Header do Produtor */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} className="w-14 h-14 rounded-2xl border-2 border-white shadow-lg object-cover" alt="Logo" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl">
                        {(org.companyName || org.name || 'P').charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-gray-900 uppercase tracking-tight">{org.companyName || org.name || 'Produtor'}</h4>
                      <p className="text-xs text-gray-500 font-medium">{org.email}</p>
                      {org.profileComplete ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1 text-[9px] font-bold">Cadastro Completo</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 mt-1 text-[9px] font-bold"><AlertTriangle className="w-2.5 h-2.5 mr-1" /> Cadastro Incompleto</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF</p>
                      <p className="font-semibold text-gray-900">{org.cpf || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CNPJ</p>
                      <p className="font-semibold text-gray-900">{org.cnpj || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone</p>
                      <p className="font-semibold text-gray-900">{org.phone || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slug / URL</p>
                      <p className="font-semibold text-indigo-600">{org.slug ? `…/p/${org.slug}` : '—'}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3" /> Endereço</p>
                      <p className="font-semibold text-gray-900">{org.address ? `${org.address}, ${org.city} - ${org.state} | CEP: ${org.postalCode}` : '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">API Asaas</p>
                      <p className="font-semibold text-gray-900 font-mono text-xs">{org.asaasKey ? `${org.asaasKey.slice(0, 12)}…` : '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Conta</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        org.status === 'approved' ? 'bg-green-100 text-green-800' :
                        org.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>{org.status || 'pending'}</span>
                    </div>
                  </div>

                  {/* Documentos de Identidade */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-500" /> Documentos de Identidade</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Frente</p>
                        {org.documentFrontUrl ? (
                          <a href={org.documentFrontUrl} target="_blank" rel="noreferrer" className="block">
                            <img src={org.documentFrontUrl} className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" alt="Doc Frente" />
                            <p className="text-[10px] text-indigo-500 mt-1 flex items-center gap-1"><ExternalLink className="h-3 w-3" />Abrir</p>
                          </a>
                        ) : (
                          <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs font-bold">NÃO ENVIADO</div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Verso</p>
                        {org.documentBackUrl ? (
                          <a href={org.documentBackUrl} target="_blank" rel="noreferrer" className="block">
                            <img src={org.documentBackUrl} className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" alt="Doc Verso" />
                            <p className="text-[10px] text-indigo-500 mt-1 flex items-center gap-1"><ExternalLink className="h-3 w-3" />Abrir</p>
                          </a>
                        ) : (
                          <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs font-bold">NÃO ENVIADO</div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Footer com Ações */}
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Fechar</Button>
            
            <Button variant="outline" className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => navigate('/master/organizers')}>
              <Users className="mr-2 h-4 w-4" /> Gestão de Produtores
            </Button>

            <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => ev && handleReject(ev.id)} disabled={isApproving}>
              <XCircle className="mr-2 h-4 w-4" /> Rejeitar Evento
            </Button>

            {org.status === 'approved' ? (
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={() => ev && handleApprove(ev.id)} disabled={isApproving}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {isApproving ? 'Processando…' : 'Aprovar e Publicar'}
              </Button>
            ) : (
              <div className="flex-1 group relative">
                <Button className="w-full bg-gray-200 text-gray-400 font-bold cursor-not-allowed" disabled>
                  <AlertTriangle className="mr-2 h-4 w-4" /> Bloqueado
                </Button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-amber-600 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-[100] text-center uppercase tracking-widest leading-relaxed">
                  Aprove o cadastro do produtor antes de publicar este evento.
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EventApprovalPage;
