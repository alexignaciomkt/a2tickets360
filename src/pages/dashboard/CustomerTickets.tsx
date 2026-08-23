import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QRCodeTicket from '@/components/tickets/QRCodeTicket';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Ticket as TicketIcon, Calendar, MapPin, QrCode, CheckCircle, Clock, XCircle, Send, Users } from 'lucide-react';

interface Credential {
  id: string;
  participantId: string | null;
  participantName: string;
  participantPhone: string | null;
  participantPhoto: string | null;
  qrCodeData: string;
  status: string;
  validatedAt: string | null;
  ticketName: string;
  rawTicket: any;
}

interface PurchaseGroup {
  id: string;
  saleId: string | null;
  eventTitle: string;
  eventDate: string | null;
  locationName: string;
  paymentStatus: string;
  purchaseDate: string;
  teamName?: string;
  registrationType?: string;
  credentials: Credential[];
}

const maskPhone = (phone: string | null) => {
  if (!phone) return 'Telefone não informado';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return 'Telefone não informado';
  return `(${clean.substring(0, 2)}) *****-${clean.substring(clean.length - 4)}`;
};

const CustomerTickets = () => {
  const { ticketId } = useParams<{ ticketId?: string }>();
  const { user } = useAuth();
  const [purchaseGroups, setPurchaseGroups] = useState<PurchaseGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PurchaseGroup | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTickets = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('purchased_tickets')
          .select(`
            *,
            events:event_id (title, start_date, location_name),
            tickets:ticket_id (name, price),
            participant:event_participants (full_name, cpf, phone, photo_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const saleIds = [...new Set(data.map(t => t.parent_purchase_id).filter(Boolean))];
          
          let salesMap: Record<string, any> = {};
          let regsMap: Record<string, any> = {};
          
          if (saleIds.length > 0) {
            // Attempt to fetch sales and registrations to enrich data
            const [salesRes, regRes] = await Promise.all([
              supabase.from('sales').select('id, payment_status, created_at, buyer_info').in('id', saleIds),
              supabase.from('sport_registrations').select('sale_id, team_name, registration_type').in('sale_id', saleIds)
            ]);
            
            if (salesRes.data) {
              salesMap = Object.fromEntries(salesRes.data.map(s => [s.id, s]));
            }
            if (regRes.data) {
              regsMap = Object.fromEntries(regRes.data.map(r => [r.sale_id, r]));
            }
          }

          const groupsMap = new Map<string, PurchaseGroup>();

          data.forEach(t => {
            const groupId = t.parent_purchase_id || t.id; // fallback to ticket id if legacy
            const sale = t.parent_purchase_id ? (salesMap[t.parent_purchase_id] || {}) : {};
            const reg = t.parent_purchase_id ? (regsMap[t.parent_purchase_id] || {}) : {};
            
            if (!groupsMap.has(groupId)) {
              groupsMap.set(groupId, {
                id: groupId,
                saleId: t.parent_purchase_id,
                eventTitle: t.events?.title || 'Evento',
                eventDate: t.events?.start_date,
                locationName: t.events?.location_name || 'Local definido',
                paymentStatus: sale.payment_status || (t.status === 'active' ? 'paid' : 'pending'),
                purchaseDate: sale.created_at || t.created_at,
                teamName: reg.team_name,
                registrationType: reg.registration_type,
                credentials: []
              });
            }

            const group = groupsMap.get(groupId)!;
            group.credentials.push({
              id: t.id,
              participantId: t.participant_id,
              participantName: t.participant?.full_name || user.name || 'Participante',
              participantPhone: t.participant?.phone || null,
              participantPhoto: t.participant?.photo_url || t.photo_url || user.photoUrl || null,
              qrCodeData: t.qr_code_data,
              status: t.status,
              validatedAt: t.validated_at,
              ticketName: t.tickets?.name || 'Ingresso Individual',
              rawTicket: t
            });
          });

          // Sort groups by purchase date desc
          const groups = Array.from(groupsMap.values()).sort((a, b) => 
            new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
          );

          setPurchaseGroups(groups);
          
          if (ticketId) {
            let foundGroup = null;
            let foundCred = null;
            for (const g of groups) {
              const c = g.credentials.find(cred => cred.id === ticketId);
              if (c) {
                foundGroup = g;
                foundCred = c;
                break;
              }
            }
            if (foundGroup && foundCred) {
              setSelectedGroup(foundGroup);
              setSelectedCredential(foundCred);
            }
          } else if (groups.length > 0) {
            setSelectedGroup(groups[0]);
            setSelectedCredential(groups[0].credentials[0]);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar ingressos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [user, ticketId]);
  
  const handleGroupSelect = (group: PurchaseGroup) => {
    setSelectedGroup(group);
    setSelectedCredential(group.credentials[0]);
  };
  
  return (
    <DashboardLayout userType="customer">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Minhas Compras e Credenciais</h1>
        <p className="text-gray-500 font-medium italic">Gerencie os acessos de suas inscrições e compras.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Purchase Groups List */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6">Suas Compras</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-[10px] font-bold uppercase">Sincronizando...</p>
              </div>
            ) : purchaseGroups.length > 0 ? (
              <div className="space-y-3">
                {purchaseGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                      selectedGroup?.id === group.id
                        ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100'
                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-sm uppercase tracking-tight truncate leading-tight">
                                {group.eventTitle}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {group.registrationType ? `Inscrição — ${group.registrationType}` : 'Compra'}
                            </p>
                        </div>
                        <div>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] rounded-full ${
                                group.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                group.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-200 text-gray-600'
                            }`}>
                                {group.paymentStatus === 'paid' ? 'Pago' :
                                 group.paymentStatus === 'pending' ? 'Pendente' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200/60 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {group.credentials.length} {group.credentials.length === 1 ? 'credencial' : 'credenciais'}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                    <TicketIcon className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold text-xs uppercase italic">Nenhuma compra na carteira</p>
                <a href="/events" className="btn-primary py-2 px-6 mt-6 inline-block text-[10px]">
                  Explorar Eventos
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Details & Credentials */}
        <div className="lg:col-span-2">
          {selectedGroup && selectedCredential ? (
            <div className="space-y-6">
              
              {/* QR Code Mestre do Selecionado */}
              <QRCodeTicket
                key={selectedCredential.id}
                ticket={selectedCredential.rawTicket}
                userName={selectedCredential.participantName}
                userPhoto={selectedCredential.participantPhoto || undefined}
              />
              
              {/* Lista de Credenciais da Compra */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-xl">
                  <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                          <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">
                              {selectedGroup.teamName ? `Equipe: ${selectedGroup.teamName}` : 'Credenciais'}
                          </h4>
                          <p className="text-xs font-medium text-gray-500 italic mt-0.5">
                              {selectedGroup.saleId ? `Compra #${selectedGroup.saleId.split('-')[0].toUpperCase()}` : 'Compra Legacy'}
                          </p>
                      </div>
                  </div>

                  <div className="space-y-4">
                      {selectedGroup.credentials.map(cred => {
                          const isSelected = selectedCredential.id === cred.id;
                          const isUsed = cred.validatedAt !== null;
                          const isActive = cred.status === 'active';
                          const isPending = cred.status === 'pending';

                          return (
                              <div 
                                  key={cred.id} 
                                  className={`p-4 md:p-5 rounded-2xl border-2 transition-all ${
                                      isSelected ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                                  }`}
                              >
                                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                      {/* Info */}
                                      <div className="flex items-center gap-4">
                                          {cred.participantPhoto ? (
                                              <img src={cred.participantPhoto} alt={cred.participantName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                          ) : (
                                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-sm">
                                                  {cred.participantName[0].toUpperCase()}
                                              </div>
                                          )}
                                          <div>
                                              <p className="font-black text-sm uppercase tracking-tight text-gray-900">{cred.participantName}</p>
                                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                  {cred.ticketName} • {maskPhone(cred.participantPhone)}
                                              </p>
                                              <div className="mt-1.5 flex items-center gap-1.5">
                                                  {isUsed ? (
                                                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                          <CheckCircle className="w-3 h-3" /> Entrada Realizada
                                                      </span>
                                                  ) : isActive ? (
                                                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                          <Clock className="w-3 h-3" /> Aguardando entrada
                                                      </span>
                                                  ) : isPending ? (
                                                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                                          <Clock className="w-3 h-3" /> Pgto pendente
                                                      </span>
                                                  ) : (
                                                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                          <XCircle className="w-3 h-3" /> Inativo
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                          <button 
                                              onClick={() => setSelectedCredential(cred)}
                                              className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                  isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                              }`}
                                          >
                                              Ver Credencial
                                          </button>
                                          <button 
                                              disabled
                                              title="Envio por WhatsApp em breve"
                                              className="flex items-center justify-center py-2 px-3 rounded-xl bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed hover:bg-gray-100 transition-all"
                                          >
                                              <Send className="w-3.5 h-3.5" />
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
              
            </div>
          ) : !loading && (
            <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center min-h-[500px] text-center border-2 border-dashed border-gray-100">
              <div className="p-6 bg-gray-50 rounded-full mb-6">
                  <QrCode className="w-12 h-12 text-gray-200" />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Selecione uma compra para visualizar os acessos</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerTickets;

