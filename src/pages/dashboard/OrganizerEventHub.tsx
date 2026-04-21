
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
  Image as ImageIcon
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrganizerVisitors from './OrganizerVisitors';
import OrganizerPromotersTab from './OrganizerPromotersTab';
import OrganizerCouponsTab from './OrganizerCouponsTab';
import OrganizerRulesTab from './OrganizerRulesTab';
import OrganizerTicketDesignerTab from './OrganizerTicketDesignerTab';
import OrganizerEventInfoTab from './OrganizerEventInfoTab';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type TabType = 'overview' | 'visitors' | 'promoters' | 'coupons' | 'settings' | 'design' | 'info';

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

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      setLoading(true);

      // 1. Event Data with Tickets
      const { data: eventData } = await supabase
        .from('events')
        .select('*, tickets(*)')
        .eq('id', eventId)
        .single();
      
      if (eventData) {
        setEvent(eventData);
        const capacity = eventData.tickets?.reduce((acc: number, t: any) => acc + t.quantity, 0) || 0;
        
        // 2. Real-time stats from purchased_tickets
        const { data: sales } = await supabase
          .from('purchased_tickets')
          .select('id, status, validated_at, tickets(price)')
          .eq('event_id', eventId)
          .in('status', ['active', 'used', 'confirmed']);

        const sold = sales?.length || 0;
        const revenue = sales?.reduce((acc: number, s: any) => acc + (s.tickets?.price || 0), 0) || 0;
        const checkins = sales?.filter((s: any) => s.validated_at).length || 0;

        setStats({ sold, capacity, revenue, checkins });
      }
      setLoading(false);
    };
    fetchData();
  }, [eventId]);

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
                <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-green-100">
                  Evento Ativo
                </span>
                <span className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gray-100">
                  ID: {eventId?.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{event?.title}</h1>
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
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Ingressos Vendidos</p>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{stats.sold} / {stats.capacity}</h3>
                   <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${(stats.sold / (stats.capacity || 1)) * 100}%` }}></div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Receita Bruta</p>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                      R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </h3>
                   <p className="text-[10px] text-green-600 font-bold mt-2 uppercase">Líquido (90%): R$ {(stats.revenue * 0.9).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Check-ins Realizados</p>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                      {stats.sold > 0 ? Math.round((stats.checkins / stats.sold) * 100) : 0}%
                   </h3>
                   <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">
                      {stats.checkins} de {stats.sold} presentes
                   </p>
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

          {activeTab === 'info' && (
             <OrganizerEventInfoTab eventId={eventId || ''} />
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default OrganizerEventHub;
