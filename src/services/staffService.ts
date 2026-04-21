import { supabase } from '@/lib/supabase';
import { db, LocalTicket } from '@/lib/offline-db';

class StaffService {
  /**
   * Sincroniza a lista de ingressos do Supabase para o IndexedDB local.
   */
  async syncEventTickets(eventId: string): Promise<{ success: boolean; count: number }> {
    try {
      const { data, error } = await supabase
        .from('purchased_tickets')
        .select(`
          id,
          qr_code_data,
          status,
          photo_url,
          ticket_id,
          tickets(name)
        `)
        .eq('event_id', eventId)
        .in('status', ['active', 'used']);

      if (error) throw error;

      const localTickets: LocalTicket[] = (data || []).map((pt: any) => ({
        id: pt.id,
        qr_code: pt.qr_code_data,
        buyer_name: 'Participante',
        buyer_cpf: '',
        selfie_url: pt.photo_url || '',
        ticket_name: pt.tickets?.name || 'Ingresso',
        status: pt.status === 'used' ? 'used' : 'valid',
        synced: true
      }));

      // Limpa ingressos antigos do mesmo evento e insere os novos
      // Nota: Em um sistema real, faríamos um merge inteligente. 
      // Para este MVP, vamos sobrescrever para garantir integridade.
      await db.tickets.bulkPut(localTickets);

      return { success: true, count: localTickets.length };
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro na sincronização:', e);
      return { success: false, count: 0 };
    }
  }

  /**
   * Valida um ingresso (Online primeiro, fallback para Offline).
   */
  async validateTicket(qrCode: string): Promise<{ 
    success: boolean; 
    message: string; 
    ticket?: Partial<LocalTicket>; 
    alreadyUsed?: boolean 
  }> {
    const isOnline = navigator.onLine;

    if (isOnline) {
      return this.validateOnline(qrCode);
    } else {
      return this.validateOffline(qrCode);
    }
  }

  private async validateOnline(qrCode: string) {
    try {
      // 1. Busca o ingresso no Supabase
      let ticketQuery = supabase
        .from('purchased_tickets')
        .select(`
          id,
          event_id,
          status,
          photo_url,
          tickets(name)
        `);
        
      if (qrCode.startsWith('TICKET-')) {
        const idMatch = qrCode.replace('TICKET-', '');
        // Verifica se é um UUID válido (ingressos antigos)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idMatch);
        
        if (isUuid) {
          ticketQuery = ticketQuery.eq('id', idMatch);
        } else {
          // Se não for UUID, é o novo formato randomizado salvo no banco
          ticketQuery = ticketQuery.eq('qr_code_data', qrCode);
        }
      } else {
        ticketQuery = ticketQuery.eq('qr_code_data', qrCode);
      }

      const { data: ticket, error } = await ticketQuery.single();

      if (error || !ticket) return { success: false, message: 'Ingresso não encontrado ou inválido.' };

      if (ticket.status === 'used') {
        return { 
          success: false, 
          message: 'Este ingresso já foi utilizado!', 
          alreadyUsed: true,
          ticket: {
            buyer_name: 'Participante',
            selfie_url: ticket.photo_url
          }
        };
      }

      // 2. Marca como utilizado no Supabase
      const { error: updateError } = await supabase
        .from('purchased_tickets')
        .update({ status: 'used' })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // 3. Atualiza cache local
      await db.tickets.update(ticket.id, { status: 'used', synced: true });

      return { 
        success: true, 
        message: 'Check-in realizado com sucesso!',
        ticket: {
          buyer_name: 'Participante',
          selfie_url: ticket.photo_url,
          ticket_name: ticket.tickets?.name
        }
      };
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro na validação online, tentando offline:', e);
      return this.validateOffline(qrCode);
    }
  }

  private async validateOffline(qrCode: string) {
    const localTicket = await db.tickets.where('qr_code').equals(qrCode).first();

    if (!localTicket) {
      return { success: false, message: 'Ingresso não encontrado no banco local.' };
    }

    if (localTicket.status === 'used') {
      return { 
        success: false, 
        message: 'Atenção: Já utilizado (Validação Offline)!', 
        alreadyUsed: true,
        ticket: localTicket 
      };
    }

    // Marca como usado localmente e pendente de sincronização
    await db.tickets.update(localTicket.id, { 
      status: 'used', 
      synced: false,
      check_in_at: new Date().toISOString()
    });

    return { 
      success: true, 
      message: 'Validado Offline! (Sincronização pendente)', 
      ticket: localTicket 
    };
  }

  /**
   * Sincroniza check-ins feitos offline de volta para o Supabase.
   */
  async syncOfflineCheckins(): Promise<number> {
    const pending = await db.tickets.where('synced').equals(0).toArray();
    let syncedCount = 0;

    for (const ticket of pending) {
      const { error } = await supabase
        .from('purchased_tickets')
        .update({ status: 'used' })
        .eq('id', ticket.id);

      if (!error) {
        await db.tickets.update(ticket.id, { synced: true });
        syncedCount++;
      }
    }

    return syncedCount;
  }
}

export const staffService = new StaffService();
