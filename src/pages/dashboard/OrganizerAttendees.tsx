import { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, Clock, Users, XCircle, QrCode, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Attendee {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_cpf: string;
  buyer_city: string;
  buyer_state: string;
  buyer_photo: string;
  event_title: string;
  event_id: string;
  ticket_name: string;
  ticket_id: string;
  qr_code_data: string;
  status: 'active' | 'used' | 'cancelled';
  validated_at: string | null;
  created_at: string;
}

interface EventOption {
  id: string;
  title: string;
}

const OrganizerAttendees = () => {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used'>('all');
  const [loading, setLoading] = useState(true);

  // Load organizer's events first
  useEffect(() => {
    if (!user?.id) return;
    const loadEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        setEvents(data);
        // Auto-select first event if only one
        if (data.length === 1) setSelectedEventId(data[0].id);
      }
    };
    loadEvents();
  }, [user?.id]);

  // Load attendees for the selected event (or all events)
  useEffect(() => {
    if (!user?.id) return;
    loadAttendees();
  }, [user?.id, selectedEventId]);

  const loadAttendees = async () => {
    setLoading(true);
    try {
      // First get event IDs belonging to this organizer
      let eventIds: string[] = [];
      if (selectedEventId === 'all') {
        const { data: eventsData } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', user!.id);
        eventIds = (eventsData || []).map((e: any) => e.id);
      } else {
        eventIds = [selectedEventId];
      }

      if (eventIds.length === 0) {
        setAttendees([]);
        setLoading(false);
        return;
      }

      // Fetch purchased tickets with related profile and event/ticket info
      const { data, error } = await supabase
        .from('purchased_tickets')
        .select(`
          id,
          qr_code_data,
          status,
          validated_at,
          created_at,
          photo_url,
          event_id,
          ticket_id,
          events:event_id (title),
          tickets:ticket_id (name),
          profiles!purchased_tickets_user_id_fkey (name, email, phone, cpf, city, state)
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback: try without FK hint
        const { data: fallback, error: fallbackError } = await supabase
          .from('purchased_tickets')
          .select(`
            id,
            qr_code_data,
            status,
            validated_at,
            created_at,
            photo_url,
            event_id,
            ticket_id,
            user_id
          `)
          .in('event_id', eventIds)
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;

        // Enrich with profile + ticket + event data
        const enriched = await Promise.all((fallback || []).map(async (pt: any) => {
          const [{ data: profile }, { data: event }, { data: ticket }] = await Promise.all([
            supabase.from('profiles').select('name, email, phone, cpf, city, state').eq('user_id', pt.user_id).single(),
            supabase.from('events').select('title').eq('id', pt.event_id).single(),
            pt.ticket_id ? supabase.from('tickets').select('name').eq('id', pt.ticket_id).single() : { data: null },
          ]);
          return {
            id: pt.id,
            buyer_name: profile?.name || 'Sem nome',
            buyer_email: profile?.email || '-',
            buyer_phone: profile?.phone || '-',
            buyer_cpf: profile?.cpf || '-',
            buyer_city: profile?.city || '-',
            buyer_state: profile?.state || '-',
            buyer_photo: pt.photo_url || '',
            event_title: event?.title || 'Evento',
            event_id: pt.event_id,
            ticket_name: ticket?.name || 'Cadeiras',
            ticket_id: pt.ticket_id || '',
            qr_code_data: pt.qr_code_data || '',
            status: pt.status,
            validated_at: pt.validated_at,
            created_at: pt.created_at,
          } as Attendee;
        }));
        setAttendees(enriched);
      } else {
        const mapped = (data || []).map((pt: any) => ({
          id: pt.id,
          buyer_name: pt.profiles?.name || 'Sem nome',
          buyer_email: pt.profiles?.email || '-',
          buyer_phone: pt.profiles?.phone || '-',
          buyer_cpf: pt.profiles?.cpf || '-',
          buyer_city: pt.profiles?.city || '-',
          buyer_state: pt.profiles?.state || '-',
          buyer_photo: pt.photo_url || '',
          event_title: pt.events?.title || 'Evento',
          event_id: pt.event_id,
          ticket_name: pt.tickets?.name || 'Cadeiras',
          ticket_id: pt.ticket_id || '',
          qr_code_data: pt.qr_code_data || '',
          status: pt.status,
          validated_at: pt.validated_at,
          created_at: pt.created_at,
        })) as Attendee[];
        setAttendees(mapped);
      }
    } catch (err) {
      console.error('[ATTENDEES] Erro ao carregar visitantes:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Computed stats ---
  const totalCount = attendees.length;
  const checkedIn = attendees.filter(a => a.status === 'used').length;
  const pending = attendees.filter(a => a.status === 'active').length;

  // --- Filtered list ---
  const filtered = attendees.filter(a => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      a.buyer_name.toLowerCase().includes(search) ||
      a.buyer_email.toLowerCase().includes(search) ||
      a.buyer_cpf.toLowerCase().includes(search) ||
      a.qr_code_data.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Helpers ---
  const formatDate = (d: string | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'CPF', 'Telefone', 'Cidade', 'Estado', 'Evento', 'Ingresso', 'QR Code', 'Status', 'Check-in em', 'Inscrito em'];
    const rows = filtered.map(a => [
      a.buyer_name, a.buyer_email, a.buyer_cpf, a.buyer_phone,
      a.buyer_city, a.buyer_state, a.event_title, a.ticket_name,
      a.qr_code_data,
      a.status === 'used' ? 'Check-in Feito' : a.status === 'active' ? 'Aguardando' : 'Cancelado',
      a.validated_at ? formatDate(a.validated_at) : '-',
      formatDate(a.created_at)
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'visitantes.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Gestão de Visitantes</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Todos os inscritos que geraram QR Code nos seus eventos.</p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-gray-700 transition-colors shadow"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* Event Selector */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
          <label className="text-xs font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">Evento:</label>
          <select
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="all">Todos os Eventos</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total de Inscritos</p>
              <p className="text-3xl font-black text-gray-900">{loading ? '…' : totalCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Check-ins Realizados</p>
              <p className="text-3xl font-black text-green-700">{loading ? '…' : checkedIn}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pendentes</p>
              <p className="text-3xl font-black text-amber-700">{loading ? '…' : pending}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Aguardando Check-in</option>
            <option value="used">Check-in Feito</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm text-gray-400 italic">Nenhum visitante encontrado para os critérios.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Visitante</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Localização</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Inscrição</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">QR Code</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Check-in em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {a.buyer_photo ? (
                            <img
                              src={a.buyer_photo}
                              alt={a.buyer_name}
                              className="w-10 h-10 rounded-xl object-cover border-2 border-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600 font-black text-sm">{a.buyer_name?.charAt(0)?.toUpperCase() || '?'}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-black text-sm text-gray-900">{a.buyer_name}</p>
                            <p className="text-xs text-gray-400">{a.buyer_email}</p>
                            <p className="text-xs text-gray-300 font-mono">{a.buyer_cpf}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-700">{a.buyer_city && a.buyer_city !== '-' ? `${a.buyer_city}, ${a.buyer_state}` : '-'}</p>
                      </td>
                      <td className="px-4 py-4">
                        {a.status === 'used' ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Check-in Feito
                          </span>
                        ) : a.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            Aguardando
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Cancelado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-bold text-gray-700">{a.ticket_name}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(a.created_at)}</p>
                      </td>
                      <td className="px-4 py-4">
                        {a.qr_code_data ? (
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-[10px] font-mono text-gray-500 truncate max-w-[100px]">{a.qr_code_data}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-500">
                          {a.validated_at ? (
                            <span className="font-medium text-green-600">{formatDate(a.validated_at)}</span>
                          ) : (
                            <span className="text-gray-300 italic">Não validado</span>
                          )}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">
                Mostrando <strong className="text-gray-700">{filtered.length}</strong> de <strong className="text-gray-700">{totalCount}</strong> visitantes
              </p>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <span className="text-green-600">{checkedIn} check-ins</span>
                <span className="text-amber-500">{pending} pendentes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerAttendees;
