import { useState, useEffect, useMemo } from 'react';
import { Search, Download, CheckCircle, Clock, Users, XCircle, QrCode, Loader2, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Visitor {
  // Ingresso
  ticket_purchase_id: string;
  qr_code_data: string;
  ticket_status: 'active' | 'used' | 'cancelled';
  ticket_name: string;
  event_title: string;
  event_id: string;
  purchase_date: string;
  validated_at: string | null;
  ticket_photo: string; // foto salva no ingresso

  // Dados do cliente (profiles)
  user_id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  birth_date: string;
  profile_photo: string;
  is_courtesy: boolean;
}

interface EventOption {
  id: string;
  title: string;
}

interface OrganizerVisitorsProps {
  overrideEventId?: string;
  hideHeader?: boolean;
}

const OrganizerVisitors = ({ overrideEventId, hideHeader }: OrganizerVisitorsProps) => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(overrideEventId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used'>('all');
  const [courtesyFilter, setCourtesyFilter] = useState<'all' | 'sale' | 'courtesy'>('all');
  const [loading, setLoading] = useState(true);

  // Load organizer's events
  useEffect(() => {
    if (!user?.id || overrideEventId) return;
    supabase
      .from('events')
      .select('id, title')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setEvents(data);
          if (data.length === 1) setSelectedEventId(data[0].id);
        }
      });
  }, [user?.id]);

  // Load visitors when event selection changes
  useEffect(() => {
    if (!user?.id) return;
    loadVisitors();
  }, [user?.id, selectedEventId, overrideEventId]);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      // 1. Get event IDs for this organizer
      let eventIds: string[] = [];
      if (selectedEventId === 'all') {
        const { data } = await supabase.from('events').select('id').eq('organizer_id', user!.id);
        eventIds = (data || []).map((e: any) => e.id);
      } else {
        eventIds = [selectedEventId];
      }

      if (eventIds.length === 0) { setVisitors([]); setLoading(false); return; }

      // 2. Raw purchased_tickets (no FK join to avoid policy issues)
      const { data: raw, error } = await supabase
        .from('purchased_tickets')
        .select('id, user_id, event_id, ticket_id, qr_code_data, status, photo_url, created_at, validated_at, is_courtesy')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!raw || raw.length === 0) { setVisitors([]); setLoading(false); return; }

      // 3. Batch fetch related data
      const userIds   = [...new Set(raw.map((r: any) => r.user_id).filter(Boolean))];
      const ticketIds = [...new Set(raw.map((r: any) => r.ticket_id).filter(Boolean))];

      const [{ data: profiles }, { data: eventsData }, { data: ticketsData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, name, email, cpf, phone, city, state, address, birth_date, photo_url')
          .in('user_id', userIds),
        supabase.from('events').select('id, title').in('id', eventIds),
        ticketIds.length > 0
          ? supabase.from('tickets').select('id, name').in('id', ticketIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.user_id, p]));
      const eventMap   = Object.fromEntries((eventsData || []).map((e: any) => [e.id, e]));
      const ticketMap  = Object.fromEntries((ticketsData || []).map((t: any) => [t.id, t]));

      const mapped: Visitor[] = raw.map((pt: any) => {
        const p = profileMap[pt.user_id] || {};
        const e = eventMap[pt.event_id] || {};
        const t = ticketMap[pt.ticket_id] || {};
        return {
          ticket_purchase_id: pt.id,
          qr_code_data:  pt.qr_code_data || '',
          ticket_status: pt.status,
          ticket_name:   t.name || 'Ingresso',
          event_title:   e.title || 'Evento',
          event_id:      pt.event_id,
          purchase_date: pt.created_at,
          validated_at:  pt.validated_at,
          ticket_photo:  pt.photo_url || '',   // selfie capturada no checkout
          user_id:       pt.user_id,
          name:          p.name || '—',
          email:         p.email || '—',
          cpf:           p.cpf || '—',
          phone:         p.phone || '—',
          city:          p.city || '—',
          state:         p.state || '—',
          address:       p.address || '—',
          birth_date:    p.birth_date || '—',
          profile_photo: p.photo_url || '',
          is_courtesy:   pt.is_courtesy || false,
        };
      });

      setVisitors(mapped);
    } catch (err) {
      console.error('[VISITORS] Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Stats ---
  const totalCount = visitors.length;
  const checkedIn  = visitors.filter(v => v.ticket_status === 'used').length;
  const pending    = visitors.filter(v => v.ticket_status === 'active').length;

  // --- Filter ---
  const filtered = useMemo(() => {
    let result = visitors;

    // Filter by check-in status
    if (statusFilter !== 'all') {
      result = result.filter(v => v.ticket_status === statusFilter);
    }

    // Filter by sale type (Courtesy vs Sale)
    if (courtesyFilter === 'sale') {
      result = result.filter(v => !v.is_courtesy);
    } else if (courtesyFilter === 'courtesy') {
      result = result.filter(v => v.is_courtesy);
    }

    // Filter by search term (Name, Email, CPF)
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.name?.toLowerCase().includes(low) || 
        v.email?.toLowerCase().includes(low) ||
        v.cpf?.includes(low) ||
        v.ticket_name?.toLowerCase().includes(low)
      );
    }

    return result;
  }, [visitors, statusFilter, courtesyFilter, searchTerm]);

  // --- Helpers ---
  const fmt = (d: string | null) => {
    if (!d || d === '—') return '—';
    return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fmtDate = (d: string | null) => {
    if (!d || d === '—') return '—';
    return new Date(d).toLocaleDateString('pt-BR');
  };

  // --- CSV export (mailing gold) ---
  const exportCSV = () => {
    const headers = [
      'Nome Completo', 'E-mail', 'CPF', 'Telefone / WhatsApp',
      'Cidade', 'Estado', 'Endereço', 'Data de Nascimento',
      'Evento', 'Tipo de Ingresso', 'QR Code',
      'Status do Check-in', 'Data de Inscrição', 'Data do Check-in',
      'Foto URL'
    ];
    const rows = filtered.map(v => [
      v.name,
      v.email,
      v.cpf,
      v.phone,
      v.city,
      v.state,
      v.address,
      fmtDate(v.birth_date),
      v.event_title,
      v.ticket_name,
      v.qr_code_data,
      v.ticket_status === 'used' ? 'Check-in Feito' : v.ticket_status === 'active' ? 'Aguardando' : 'Cancelado',
      fmt(v.purchase_date),
      fmt(v.validated_at),
      v.ticket_photo || v.profile_photo,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'mailing-visitantes.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const avatarPhoto = (v: Visitor) => v.ticket_photo || v.profile_photo;

  const content = (
    <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────── */}
        {!hideHeader && (
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100">
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Gestão de Visitantes</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Relatório completo de inscritos — pronto para download de mailing.
              </p>
            </div>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-gray-700 transition-colors shadow"
            >
              <Download className="w-4 h-4" />
              Exportar Mailing CSV
            </button>
          </div>
        )}

        {/* ── Event selector ─────────────────────────────── */}
        {!overrideEventId && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">Evento:</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">Todos os meus eventos</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Add Export button even if header is hidden for the Hub view */}
        {hideHeader && (
          <div className="flex justify-end">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Mailing CSV
            </button>
          </div>
        )}

        {/* ── Stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total de Inscritos', value: totalCount, icon: Users, color: 'indigo' },
            { label: 'Check-ins Realizados', value: checkedIn, icon: CheckCircle, color: 'green' },
            { label: 'Pendentes', value: pending, icon: Clock, color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
              <div className={`bg-${color}-50 p-3 rounded-xl`}><Icon className={`w-6 h-6 text-${color}-600`} /></div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest text-${color}-400`}>{label}</p>
                <p className={`text-3xl font-black text-${color === 'indigo' ? 'gray-900' : color + '-700'}`}>{loading ? '…' : value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              className="text-xs font-black uppercase tracking-widest border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Aguardando</option>
              <option value="used">Check-in Feito</option>
            </select>
            <select
              className="text-xs font-black uppercase tracking-widest border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none bg-white"
              value={courtesyFilter}
              onChange={(e) => setCourtesyFilter(e.target.value as any)}
            >
              <option value="all">Venda + Cortesia</option>
              <option value="sale">Apenas Vendas</option>
              <option value="courtesy">Apenas Cortesias</option>
            </select>
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm text-gray-400 italic">Nenhum visitante encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Visitante</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Contato</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Localização</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Dados Pessoais</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Ingresso / Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">QR Code</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((v) => (
                    <tr key={v.ticket_purchase_id} className="hover:bg-gray-50/40 transition-colors">

                      {/* Visitante */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {avatarPhoto(v) ? (
                            <img
                              src={avatarPhoto(v)}
                              alt={v.name}
                              className="w-11 h-11 rounded-xl object-cover border-2 border-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600 font-black text-base">{v.name?.charAt(0)?.toUpperCase() || '?'}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-black text-sm text-gray-900 leading-tight">{v.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{v.event_title}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contato */}
                      <td className="px-4 py-4 min-w-[160px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{v.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span>{v.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Localização */}
                      <td className="px-4 py-4 min-w-[140px]">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-700">
                              {v.city !== '—' ? `${v.city}, ${v.state}` : '—'}
                            </p>
                            {v.address !== '—' && (
                              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{v.address}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Dados Pessoais */}
                      <td className="px-4 py-4 min-w-[160px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <CreditCard className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="font-mono">{v.cpf}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span>{fmtDate(v.birth_date)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Ingresso / Status */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-gray-800">{v.ticket_name}</p>
                          {v.is_courtesy && (
                            <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-amber-200">
                              Cortesia
                            </span>
                          )}
                        </div>
                        {v.ticket_status === 'used' ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />Check-in
                          </span>
                        ) : v.ticket_status === 'active' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" />Aguardando
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                            <XCircle className="w-3 h-3" />Cancelado
                          </span>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">{fmt(v.purchase_date)}</p>
                      </td>

                      {/* QR Code */}
                      <td className="px-4 py-4">
                        {v.qr_code_data ? (
                          <div className="flex items-center gap-1.5">
                            <QrCode className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-[10px] font-mono text-gray-500 truncate max-w-[100px]">{v.qr_code_data}</span>
                          </div>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>

                      {/* Check-in */}
                      <td className="px-4 py-4">
                        {v.validated_at ? (
                          <span className="text-xs font-semibold text-green-600">{fmt(v.validated_at)}</span>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Não validado</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between flex-wrap gap-2">
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
  );
  
  if (hideHeader || overrideEventId) {
    return content;
  }

  return (
    <DashboardLayout userType="organizer">
      {content}
    </DashboardLayout>
  );
};

export default OrganizerVisitors;
