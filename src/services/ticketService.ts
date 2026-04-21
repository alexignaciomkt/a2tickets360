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
          profiles:user_id(name, email, phone, cpf)
        `)
        .eq('events.organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id,
        ticketNumber: t.qr_code_data,
        eventName: t.events.title,
        customerName: t.profiles?.name || 'Não informado',
        customerEmail: t.profiles?.email || 'Não informado',
        customerPhone: t.profiles?.phone || 'Não informado',
        customerCpf: t.profiles?.cpf || 'Não informado',
        ticketType: 'Padrão', // Pode ser expandido se houver tipos
        status: t.status,
        purchaseDate: t.created_at,
        validationDate: t.validated_at,
        price: 0, // Ajustar se houver preço na tabela
        qrCode: t.qr_code_data,
        photoUrl: t.photo_url
      }));
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
