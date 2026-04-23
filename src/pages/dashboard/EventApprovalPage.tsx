
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle, XCircle, AlertTriangle, MessageSquare, Calendar,
  User, Clock, Star, Eye, MapPin, Ticket, ExternalLink, FileText,
  Phone, DollarSign, Users, Image as ImageIcon, ChevronRight, Zap, ShieldCheck, Loader2, Database, Target, Cpu, Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { masterService } from '@/services/masterService';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EventApprovalPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [featuredOnApprove, setFeaturedOnApprove] = useState(true);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await masterService.getAllEventsWithOrganizers();
      setEvents(data.filter((e: any) => e.status === activeTab));
    } catch (error) {
      toast({ title: 'Erro ao carregar', description: 'Não foi possível buscar os eventos.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, [activeTab]);

  const handleApprove = async (id: string, withFeatured?: boolean) => {
    try {
      setIsApproving(true);
      const featured = withFeatured !== undefined ? withFeatured : featuredOnApprove;
      await masterService.approveEvent(id, featured);
      setIsModalOpen(false);
      setFeaturedOnApprove(true);
      loadEvents();
      toast({ title: 'Evento Aprovado', description: featured ? 'Evento publicado e exibido no carrossel da home.' : 'Evento publicado com sucesso.' });
    } catch (error: any) {
      toast({ 
        title: 'Erro na Aprovação', 
        description: error.message || 'Verifique o status do produtor.', 
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
      toast({ title: 'Evento Rejeitado', description: 'O produtor foi notificado.' });
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
      toast({ title: !current ? 'Destaque Ativado' : 'Destaque Removido' });
    } catch (error) {
      toast({ title: 'Erro ao alterar destaque', variant: 'destructive' });
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
  const formatCurrency = (v: number) => `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const ev = selectedEvent;
  const org = ev?.organizer || {};

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
        
        {/* Event Approval Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
           <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Aprovação de Eventos</h1>
              <p className="text-xs font-medium text-slate-500 max-w-2xl">
                Análise de submissões de eventos, auditoria de conteúdo e publicação.
              </p>
           </div>
           
           <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <Ticket className="w-4 h-4" />
              </div>
              <div>
                 <p className="text-[10px] font-semibold text-slate-500 uppercase">Eventos Pendentes</p>
                 <p className="text-sm font-bold text-slate-900 leading-none">{events.length}</p>
              </div>
           </div>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-slate-500" /> Aprovação de Eventos
              </CardTitle>
              <div className="flex bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'pending' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Pendentes
                </button>
                <button 
                  onClick={() => setActiveTab('published')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'published' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Publicados
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-xs font-semibold text-slate-500">Carregando eventos...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                   <ShieldCheck className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Tudo Limpo!</h3>
                <p className="text-xs text-slate-500 mt-2">Não há eventos pendentes de aprovação no momento.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500">Evento / Categoria</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500">Produtor</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500">Data / Hora</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500">Destaque</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => openModal(event)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 shadow-sm">
                              {event.bannerUrl ? (
                                <img src={event.bannerUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-6 h-6" /></div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-slate-900 leading-tight">{event.title}</div>
                              <div className="text-xs text-slate-500 font-medium">{event.category?.split(' / ')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-slate-900 block">{event.organizer?.companyName || event.organizer?.name || 'Não Informado'}</span>
                            {event.organizer?.profileComplete ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">Perfil Completo</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">Incompleto</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-900"><Calendar className="w-4 h-4 text-slate-400" /> {formatDate(event.startDate || event.start_date)}</div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><Clock className="w-4 h-4 text-slate-400" /> {formatTime(event.startDate || event.start_date)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <Button 
                             size="sm" 
                             variant="ghost"
                             onClick={(e) => { e.stopPropagation(); handleToggleFeatured(event.id, !!event.is_featured); }}
                             className={`h-8 rounded-md text-xs font-semibold gap-2 transition-all border ${event.is_featured ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-50'}`}
                           >
                             <Star className={`w-3.5 h-3.5 ${event.is_featured ? 'fill-current' : ''}`} />
                             {event.is_featured ? 'Em Destaque' : 'Normal'}
                           </Button>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openModal(event)}
                              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold h-8 px-3 rounded-md transition-all">
                              Visualizar
                            </Button>
                            {activeTab === 'pending' && (
                              <Button size="sm" onClick={() => handleApprove(event.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8 px-4 rounded-md shadow-sm transition-all">
                                Aprovar
                              </Button>
                            )}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-none text-slate-900 max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-0 scrollbar-hide">
          <div className="p-8 space-y-8">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 tracking-tight">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                    Detalhes do Evento
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500">
                    Análise do conteúdo, ingressos e dados do produtor antes da publicação.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {ev && (
              <div className="space-y-8">
                <div className="relative h-56 rounded-lg bg-slate-100 overflow-hidden shadow-sm">
                  {ev.bannerUrl || ev.imageUrl ? (
                    <img src={ev.bannerUrl || ev.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">Nenhum banner enviado</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white space-y-1">
                    <Badge variant="outline" className="bg-white/20 backdrop-blur border-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-md">{ev.category || 'Evento'}</Badge>
                    <h3 className="text-xl font-bold leading-tight">{ev.title}</h3>
                  </div>
                </div>

                <Tabs defaultValue="event" className="w-full space-y-6">
                  <div className="bg-slate-50 p-1 rounded-md border border-slate-200 inline-flex">
                    <TabsList className="bg-transparent h-auto p-0 gap-1">
                      <TabsTrigger value="event" className="rounded px-4 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all shadow-none">Dados do Evento</TabsTrigger>
                      <TabsTrigger value="producer" className="rounded px-4 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all shadow-none">Dados do Produtor</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="event" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">Título</p>
                        <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">Categoria</p>
                        <p className="text-sm font-medium text-slate-900">{ev.category || 'Não definida'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">Data / Hora</p>
                        <p className="text-sm font-medium text-slate-900">{formatDate(ev.startDate || ev.start_date)} • {formatTime(ev.startDate || ev.start_date)}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-xs font-semibold text-slate-500">Local</p>
                        <p className="text-sm font-medium text-slate-900">{ev.locationName || ev.location_name || 'Não informado'}</p>
                        <p className="text-xs text-slate-500">{[ev.locationAddress || ev.address, ev.locationCity || ev.city].filter(Boolean).join(', ')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">Capacidade</p>
                        <p className="text-sm font-medium text-slate-900">{ev.capacity || 0} pessoas</p>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-6">
                       <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-slate-500" /> Ingressos ({ev.tickets?.length || 0})
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {ev.tickets?.map((t: any, i: number) => (
                            <div key={t.id || i} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all">
                               <div className="space-y-0.5">
                                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                                  <p className="text-xs text-slate-500">{t.category}</p>
                               </div>
                               <div className="text-right space-y-0.5">
                                  <p className="text-sm font-bold text-slate-900">{formatCurrency(t.price)}</p>
                                  <p className="text-xs text-slate-500">Qtd: {t.quantity}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="producer" className="mt-0 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                        {org.logoUrl ? <img src={org.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-lg">{(org.companyName || 'P').charAt(0)}</div>}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-slate-900">{org.companyName || org.name || 'Produtor'}</h4>
                        <p className="text-xs text-slate-500">{org.email}</p>
                        <div className="mt-1">
                           {org.profileComplete ? <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">Perfil Completo</Badge> : <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">Perfil Incompleto</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                       {[
                         { l: 'CPF do Titular', v: org.cpf || 'Não informado' },
                         { l: 'CNPJ', v: org.cnpj || 'Não informado' },
                         { l: 'Telefone', v: org.phone || 'Não informado' },
                         { l: 'Chave Asaas', v: org.asaasKey ? `${org.asaasKey.slice(0,24)}…` : 'Não vinculada', mono: true },
                         { l: 'Página Pública', v: org.slug || 'Não definido' },
                         { l: 'Status', v: org.status || 'Pendente', badge: true },
                       ].map((item, i) => (
                         <div key={i} className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500">{item.l}</p>
                            {item.badge ? (
                              <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 rounded-md ${item.v === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{item.v === 'approved' ? 'Aprovado' : 'Pendente'}</Badge>
                            ) : (
                              <p className={`text-sm font-medium text-slate-900 ${item.mono ? 'font-mono text-xs text-slate-500' : ''} truncate`}>{item.v}</p>
                            )}
                         </div>
                       ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4 rounded-b-2xl">
              {org.status === 'approved' && activeTab === 'pending' && (
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={featuredOnApprove} 
                    onChange={(e) => setFeaturedOnApprove(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Exibir banner no carrossel da Home
                    </span>
                    <span className="text-xs text-slate-500 block">O banner deste evento aparecerá no carrossel principal da página inicial.</span>
                  </div>
                </label>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 h-10 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200">Fechar</Button>
                
                <Button variant="outline" className="flex-1 h-10 rounded-md border border-rose-200 bg-white text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-all"
                  onClick={() => ev && handleReject(ev.id)} disabled={isApproving}>
                  Rejeitar Evento
                </Button>

                {org.status === 'approved' ? (
                  <Button className="flex-[1.5] h-10 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                    onClick={() => ev && handleApprove(ev.id)} disabled={isApproving}>
                    {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <span className="flex items-center justify-center gap-2">
                         <ShieldCheck className="w-4 h-4" />
                         Aprovar e Publicar
                      </span>
                    )}
                  </Button>
                ) : (
                  <div className="flex-[1.5] relative group">
                     <Button className="w-full h-10 rounded-md bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed" disabled>
                        <ShieldCheck className="w-4 h-4 mr-2 opacity-40" />
                        Produtor não aprovado
                     </Button>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-lg z-[100] text-center">
                       Aprove o produtor antes de publicar este evento.
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EventApprovalPage;
