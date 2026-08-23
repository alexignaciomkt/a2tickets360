import { supabase } from '@/lib/supabase';

export interface PurchasedTicket {
  id: string;
  ticketNumber: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  ticketType: string;
  status: 'valid' | 'used' | 'invalid' | 'cancelled';
  purchaseDate: string;
  validationDate?: string;
  price: number;
  qrCode: string;
  photoUrl?: string;
}

class TicketService {
  async getOrganizerTickets(organizerId: string): Promise<PurchasedTicket[]> {
    try {
      const { data, error } = await supabase
        .from('purchased_tickets')
        .select(`
          *,
          events!inner(title, organizer_id),
          event_participants!fk_purchased_tickets_participant_cross(id, full_name, email)
        `)
        .eq('events.organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(t => {
        // Obter o nome nominal a partir do join correto de event_participants
        const participant = Array.isArray(t.event_participants) 
            ? t.event_participants[0] 
            : t.event_participants;
            
        return {
          id: t.id,
          ticketNumber: t.qr_code_data,
          eventName: t.events.title,
          customerName: participant?.full_name || 'Participante não identificado (Legado)',
          customerEmail: participant?.email || 'Não informado',
          customerPhone: 'Não informado', // Pode ser mapeado no futuro se adicionarmos no participant
          customerCpf: 'Não informado',
          ticketType: 'Padrão',
          status: t.status,
          purchaseDate: t.created_at,
          validationDate: t.validated_at,
          price: 0,
          qrCode: t.qr_code_data,
          photoUrl: t.photo_url
        };
      });
    } catch (e) {
      console.error('Error fetching tickets:', e);
      return [];
    }
  }

  async validateTicket(ticketId: string): Promise<boolean> {
    const { error } = await supabase
      .from('purchased_tickets')
      .update({ 
        status: 'used',
        validated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    return !error;
  }
}

export const ticketService = new TicketService();
