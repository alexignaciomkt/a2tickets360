
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Tag, 
  Settings as SettingsIcon, 
  ChevronLeft,
  Calendar,
  MapPin,
  Loader2,
  TrendingUp,
  Download,
  Percent,
  CircleDollarSign,
  Globe,
  Palette,
  HelpCircle,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrganizerVisitors from './OrganizerVisitors';
import OrganizerPromotersTab from './OrganizerPromotersTab';
import OrganizerCouponsTab from './OrganizerCouponsTab';
import OrganizerRulesTab from './OrganizerRulesTab';
import OrganizerTicketDesignerTab from './OrganizerTicketDesignerTab';
import OrganizerEventInfoTab from './OrganizerEventInfoTab';
import OrganizerEventStaffApplicationsTab from './OrganizerEventStaffApplicationsTab';
import { OrganizerEventHighlightBox } from '@/components/dashboard/OrganizerEventHighlightBox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { getEventTemporalStatus } from '@/utils/eventDateTime';

type TabType = 'overview' | 'visitors' | 'promoters' | 'coupons' | 'settings' | 'design' | 'info' | 'staff_applications';

const OrganizerEventHub = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sold: 0,
    capacity: 0,
    revenue: 0,
    checkins: 0
  });

  const [eventTemporalStatus, setEventTemporalStatus] = useState<'FUTURO' | 'EM ANDAMENTO' | 'ENCERRADO'>('FUTURO');

  // State isActivatingSports is defined closer to its handler
  const { toast } = useToast();

  const fetchEventData = async () => {
    if (!eventId) return;
    // 1. Event Data with Tickets
    const { data: eventData } = await supabase
      .from('events')
      .select('*, tickets(*)')
      .eq('id', eventId)
      .single();
    
    if (eventData) {
      setEvent(eventData);
      setEventTemporalStatus(getEventTemporalStatus(eventData.startDate || eventData.start_date, eventData.endDate || eventData.end_date));
      const capacity = eventData.tickets?.reduce((acc: number, t: any) => acc + t.quantity, 0) || 0;
      
      // 2. Real-time stats from purchased_tickets (Credentials/Participants)
      const { data: credentials } = await supabase
        .from('purchased_tickets')
        .select('id, status, validated_at')
        .eq('event_id', eventId)
        .in('status', ['active', 'used', 'confirmed']);

      const sold = credentials?.length || 0;
      const checkins = credentials?.filter((s: any) => s.validated_at).length || 0;

      // 3. Receita Real from sales paid
      const { data: salesData } = await supabase
        .from('sales')
        .select('gross_amount, payment_status')
        .eq('event_id', eventId)
        .eq('payment_status', 'paid');
        
      const revenue = salesData?.reduce((acc: number, s: any) => acc + Number(s.gross_amount || 0), 0) || 0;

      setStats({ sold, capacity, revenue, checkins });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchEventData();
      setLoading(false);
    };
    fetchData();
  }, [eventId]);

  const [isActivatingSports, setIsActivatingSports] = useState(false);
  const [isOpeningSports, setIsOpeningSports] = useState(false);
  const [isSyncingRegistrations, setIsSyncingRegistrations] = useState(false);

  const handleActivateSports = async () => {
    if (!eventId) return;
    setIsActivatingSports(true);
    try {
      await api.post('/api/integrations/sports/provision-event', { event_id: eventId });
      toast({ title: 'Sucesso', description: 'Ativação esportiva concluída.' });
      await fetchEventData();
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Não foi possível ativar a A2Sports360 agora.', 
        description: 'Tente novamente em alguns instantes.' 
      });
      await fetchEventData();
    } finally {
      setIsActivatingSports(false);
    }
  };

  const handleOpenSports = async () => {
    if (!eventId) return;
    setIsOpeningSports(true);
    try {
      const response = await api.post<{ ssoUrl: string }>('/api/integrations/sports/open', { event_id: eventId });
      if (response && response.ssoUrl) {
        window.open(response.ssoUrl, '_blank');
      } else {
        throw new Error('SSO URL is empty');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível acessar a A2Sports360 agora.',
        description: 'Tente novamente em alguns instantes.'
      });
    } finally {
      setIsOpeningSports(false);
    }
  };

  const [isTogglingOperation, setIsTogglingOperation] = useState(false);
  const handleToggleOperationStatus = async (newStatus: 'open' | 'closed') => {
    if (!eventId) return;
    setIsTogglingOperation(true);
    try {
      await api.patch(`/api/organizer/events/${eventId}/access-operation`, { operationStatus: newStatus });
      toast({
        title: newStatus === 'open' ? 'Operação Liberada' : 'Operação Fechada',
        description: newStatus === 'open' ? 'O Scanner de ingressos agora está disponível para a equipe.' : 'O acesso ao Scanner de ingressos foi bloqueado.'
      });
      await fetchEventData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar status da operação',
        description: err.message || 'Tente novamente mais tarde.'
      });
    } finally {
      setIsTogglingOperation(false);
    }
  };

  const handleSyncRegistrations = async () => {
    if (!eventId) return;
    setIsSyncingRegistrations(true);
    try {
      const result = await api.post<{
        success: boolean;
        total: number;
        synced: number;
        failed: number;
        failures: Array<{ registrationId: string; error: string }>;
      }>('/api/integrations/sports/sync-registrations', { event_id: eventId });

      if (result.failed > 0) {
        toast({
          variant: 'destructive',
          title: 'Sincronização concluída parcialmente',
          description: `${result.synced} enviada(s), ${result.failed} com falha.`,
        });
      } else if (result.synced > 0) {
        toast({
          title: 'Sincronização concluída',
          description: `${result.synced} inscrição(ões) enviada(s) para a A2Sports360.`,
        });
      } else {
        toast({
          title: 'Tudo sincronizado',
          description: 'Todas as inscrições já estão sincronizadas.',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível sincronizar as inscrições agora.',
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsSyncingRegistrations(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="organizer">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'staff_applications', label: 'Candidaturas Staff', icon: Users },
    { id: 'visitors', label: 'Mailing / Visitantes', icon: Users },
    { id: 'promoters', label: 'Promoters', icon: CircleDollarSign },
    { id: 'coupons', label: 'Cupons & Cortesias', icon: Tag },
    { id: 'settings', label: 'Regras & Limites', icon: SettingsIcon },
    { id: 'design', label: 'Designer do Ingresso', icon: Palette },
    { id: 'info', label: 'Conteúdo da Página', icon: Globe },
  ];

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6 pb-20">
        
        {/* ── Breadcrumb & Back ─────────────────────────── */}
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Link to="/organizer/dashboard" className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-black uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Voltar ao Painel
          </Link>
        </div>

        {/* ── Event Header ───────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <TrendingUp className="w-32 h-32 text-primary" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {eventTemporalStatus === 'FUTURO' && (
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-blue-100">
                    Evento Futuro
                  </span>
                )}
                {eventTemporalStatus === 'EM ANDAMENTO' && (
                  <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-green-100">
                    Em Andamento
                  </span>
                )}
                {eventTemporalStatus === 'ENCERRADO' && (
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-gray-200">
                    Evento Encerrado
                  </span>
                )}
                <span className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gray-100">
                  ID: {eventId?.slice(0, 8)}
                </span>
                

              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">{event?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  {event?.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {event?.city}, {event?.state}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to={`/events/${eventId}`} target="_blank" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2">
                <Globe className="w-4 h-4" /> Visualizar Página
              </Link>
              <Link to={`/organizer/events/edit/${eventId}`} className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                Editar Evento
              </Link>
            </div>
          </div>
        </div>

        {/* ── Access Control Operation Block ──────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase mb-1 flex items-center gap-2">
              Controle de Acesso
              {event?.operation_status === 'open' ? (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Status atual: {event?.operation_status === 'open' ? (
                <span className="text-green-600 font-bold uppercase tracking-wider">Operação Liberada</span>
              ) : (
                <span className="text-red-600 font-bold uppercase tracking-wider">Operação Fechada</span>
              )}
            </p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-lg">
              {event?.operation_status === 'open' 
                ? 'O Scanner está ativo. O acesso do Staff depende de suas escalas individuais (shift_start / shift_end).'
                : 'O Scanner está inativo. Nenhum Staff conseguirá acessar a portaria do evento até que a operação seja liberada.'}
            </p>
          </div>
          <button
            onClick={() => handleToggleOperationStatus(event?.operation_status === 'open' ? 'closed' : 'open')}
            disabled={isTogglingOperation}
            className={`
              px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shrink-0
              ${isTogglingOperation ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
              ${event?.operation_status === 'open' 
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600'}
            `}
          >
            {isTogglingOperation ? 'Aguarde...' : event?.operation_status === 'open' ? 'Encerrar Controle de Acesso' : 'Liberar Controle de Acesso'}
          </button>
        </div>

        {/* ── Tab Navigation ────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ───────────────────────────────── */}
        <div className="min-h-[400px] animate-in fade-in duration-500">
          {activeTab === 'overview' && (
             <div className="space-y-6">
               {event?.status === 'published' && (
                 event?.category_code?.startsWith('SPORT_') || 
                 event?.external_championship_id || 
                 event?.tickets?.some((t: any) => t.ticket_purpose === 'REGISTRATION' || t.ticket_purpose === 'REPECHAGE')
               ) && (
                 <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-indigo-950">
                   <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                     <TrendingUp className="w-48 h-48" />
                   </div>
                   <div className="relative z-10 flex-1">
                     <div className="flex items-center gap-3 mb-2">
                       <h2 className="text-2xl font-black uppercase tracking-tight text-white">A2SPORTS360</h2>
                       {event.external_championship_id ? (
                         <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> ATIVO
                         </span>
                       ) : (
                         <span className="bg-indigo-800 text-indigo-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-700">
                           Disponível
                         </span>
                       )}
                     </div>
                     <p className="text-indigo-200 font-medium max-w-lg mb-1 leading-relaxed">
                       {event.external_championship_id 
                         ? "Seu torneio está conectado à A2Sports360."
                         : "Leve este campeonato para a A2Sports360. Organize duplas, chaves, locais de jogo, placares e toda a operação do torneio em um só lugar."}
                     </p>
                   </div>
                   <div className="relative z-10 shrink-0 w-full md:w-auto flex flex-col gap-3">
                     {event.external_championship_id ? (
                        <>
                         <button
                           onClick={handleOpenSports}
                           disabled={isOpeningSports}
                           className="flex items-center justify-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-75 w-full"
                         >
                           {isOpeningSports ? (
                             <>
                               <Loader2 className="w-4 h-4 animate-spin text-indigo-900" />
                               ABRINDO A2SPORTS360...
                             </>
                           ) : (
                             "ABRIR A2SPORTS360"
                           )}
                         </button>
                         <button
                           onClick={handleSyncRegistrations}
                           disabled={isSyncingRegistrations}
                           className="flex items-center justify-center gap-2 bg-transparent text-indigo-200 border border-indigo-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-800 hover:text-white transition-all active:scale-95 disabled:opacity-60 disabled:hover:bg-transparent w-full"
                         >
                           {isSyncingRegistrations ? (
                             <>
                               <Loader2 className="w-3.5 h-3.5 animate-spin" />
                               SINCRONIZANDO...
                             </>
                           ) : (
                             <>
                               <RefreshCw className="w-3.5 h-3.5" />
                               SINCRONIZAR INSCRIÇÕES
                             </>
                           )}
                         </button>
                        </>
                     ) : (
                       <button
                         onClick={handleActivateSports}
                         disabled={isActivatingSports}
                         className="flex items-center justify-center gap-2 bg-indigo-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 w-full border-2 border-indigo-400"
                       >
                         {isActivatingSports ? (
                           <>
                             <Loader2 className="w-4 h-4 animate-spin" />
                             <div className="text-left">
                               <div className="leading-tight">PREPARANDO...</div>
                               <div className="text-[8px] font-medium text-indigo-200 lowercase tracking-normal leading-tight">isso leva só alguns segundos</div>
                             </div>
                           </>
                         ) : (
                           "ATIVAR A2SPORTS360"
                         )}
                       </button>
                     )}
                   </div>
                 </div>
               )}

                {eventTemporalStatus !== 'ENCERRADO' && (
                  <OrganizerEventHighlightBox eventId={eventId} />
                )}

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Credenciais Emitidas</p>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.sold} / {stats.capacity}</h3>
                   <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${(stats.sold / (stats.capacity || 1)) * 100}%` }}></div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Receita Bruta</p>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                      R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Check-ins Realizados</p>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                      {stats.sold > 0 ? Math.round((stats.checkins / stats.sold) * 100) : 0}%
                   </h3>
                   <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">
                      {stats.checkins} de {stats.sold} presentes
                   </p>
                </div>
             </div>
             </div>
          )}

          {activeTab === 'visitors' && (
             <OrganizerVisitors overrideEventId={eventId} hideHeader />
          )}

          {activeTab === 'promoters' && (
             <OrganizerPromotersTab eventId={eventId || ''} />
          )}

          {activeTab === 'coupons' && (
             <OrganizerCouponsTab eventId={eventId || ''} />
          )}

          {activeTab === 'settings' && (
             <OrganizerRulesTab eventId={eventId || ''} initialSettings={event?.settings} />
          )}

          {activeTab === 'design' && (
             <OrganizerTicketDesignerTab eventId={eventId || ''} />
          )}

          {activeTab === 'staff_applications' && (
            <OrganizerEventStaffApplicationsTab eventId={eventId || ''} eventStartDate={event?.startDate || event?.start_date} />
          )}

          {activeTab === 'info' && (
             <OrganizerEventInfoTab eventId={eventId || ''} />
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default OrganizerEventHub;
