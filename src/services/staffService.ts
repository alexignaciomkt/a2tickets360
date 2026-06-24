import { supabase } from '@/lib/supabase';
import { db, LocalTicket } from '@/lib/offline-db';
import { StaffMember, StaffRole } from '@/interfaces/staff';

class StaffService {
  /**
   * Obtém as roles de staff
   */
  async getRoles(): Promise<StaffRole[]> {
    // Retorna roles básicas mockadas ou do banco, se existir tabela
    return [
      { id: '1', name: 'Supervisor', color: '#4f46e5' },
      { id: '2', name: 'Operador de Caixa', color: '#10b981' },
      { id: '3', name: 'Validador/Portaria', color: '#f59e0b' },
      { id: '4', name: 'Segurança', color: '#ef4444' }
    ];
  }

  /**
   * Obtém a lista de staff
   */
  async getEventStaff(eventId: string): Promise<StaffMember[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return [];

      let query = supabase.from('staff').select('*');
      if (eventId !== 'all') {
         query = query.eq('event_id', eventId);
      } else {
         query = query.eq('organizer_id', userData.user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(s => ({
        id: s.id,
        organizerId: s.organizer_id,
        eventId: s.event_id,
        name: s.name,
        email: s.email,
        roleId: s.role_id,
        eventFunction: s.event_function,
        isActive: s.is_active,
        photoUrl: s.photo_url,
        createdAt: s.created_at
      } as StaffMember));
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao buscar equipe:', e);
      return [];
    }
  }

  /**
   * Cria um membro da equipe (cria no Auth e na tabela staff)
   */
  async createStaffMember(eventId: string, data: any): Promise<any> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Não autenticado');

      // 1. Gera uma senha temporária (o envio mandará esta senha)
      const tempPassword = Math.random().toString(36).slice(-8);

      // 2. Insere na tabela 'staff'
      const { data: newStaff, error } = await supabase.from('staff').insert({
         organizer_id: userData.user.id,
         event_id: eventId,
         name: data.name,
         email: data.email,
         role_id: data.roleId || 'validador',
         event_function: data.eventFunction,
         is_active: data.isActive,
         photo_url: data.photoUrl,
         password_hash: tempPassword // Guardando mock para retrocompatibilidade
      }).select().single();

      if (error) throw error;

      return { ...newStaff, tempPassword }; // Retorna a senha pro sendStaffCredentials
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao criar staff:', e);
      throw e;
    }
  }

  /**
   * Atualiza um membro da equipe
   */
  async updateStaffMember(id: string, data: any): Promise<void> {
    const { error } = await supabase.from('staff').update({
       name: data.name,
       email: data.email,
       role_id: data.roleId,
       event_function: data.eventFunction,
       is_active: data.isActive,
       photo_url: data.photoUrl
    }).eq('id', id);

    if (error) throw error;
  }

  /**
   * Deleta membro da equipe
   */
  async deleteStaffMember(id: string): Promise<void> {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Envia as credenciais e tenta criar a conta no Auth (se não existir)
   */
  async sendStaffCredentials(staffData: any, manualPassword?: string): Promise<void> {
    // 1. Criar perfil real no Supabase Auth usando signUp
    const password = manualPassword || staffData.tempPassword || 'A2tickets@2026';
    
    // Tenta criar no Auth (pode falhar se o admin já o fez ou se já existe)
    // Usamos um signUp comum. Pode exigir confirmação de e-mail dependendo da configuração
    await supabase.auth.signUp({
      email: staffData.email,
      password: password,
      options: {
        data: {
          name: staffData.name,
          role: 'staff'
        }
      }
    });

    // Em produção, isso faria uma chamada para a API que enviaria o e-mail
    console.log(`[STAFF_SERVICE] Simulando envio de email para ${staffData.email} com senha: ${password}`);
  }

  /**
   * Sincroniza a lista de ingressos do Supabase para o IndexedDB local.
   */
  async syncEventTickets(eventId: string): Promise<{ success: boolean; count: number }> {
    try {
      const { data, error } = await supabase
        .from('purchased_tickets')
        .select(`
          id,
          event_id,
          status,
          photo_url,
          ticket_id,
          profiles:user_id(name),
          tickets(name)
        `)
        .eq('event_id', eventId)
        .in('status', ['active', 'used']);

      if (error) throw error;

      const localTickets: LocalTicket[] = (data || []).map((pt: any) => ({
        id: pt.id,
        qr_code: pt.qr_code_data,
        buyer_name: pt.profiles?.name || 'Participante',
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
      const cleanCode = qrCode.trim().toUpperCase();
      console.log('[STAFF_SERVICE] Validando:', cleanCode);

      // 1. Busca o ingresso no Supabase
      let ticketQuery = supabase
        .from('purchased_tickets')
        .select(`
          id,
          event_id,
          status,
          photo_url,
          profiles:user_id(name),
          tickets(name)
        `);
        
      if (cleanCode.startsWith('TICKET-')) {
        const idMatch = cleanCode.replace('TICKET-', '');
        // Verifica se é um UUID válido (ingressos antigos)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idMatch);
        
        if (isUuid) {
          ticketQuery = ticketQuery.or(`id.eq.${idMatch},qr_code_data.eq.${cleanCode}`);
        } else {
          ticketQuery = ticketQuery.eq('qr_code_data', cleanCode);
        }
      } else {
        // Se não tem o prefixo, tenta buscar o código puro OU adicionar o prefixo automaticamente
        ticketQuery = ticketQuery.or(`qr_code_data.eq.${cleanCode},qr_code_data.eq.TICKET-${cleanCode}`);
      }

      const { data: ticket, error } = await ticketQuery.single();

      if (error || !ticket) {
        console.warn('[STAFF_SERVICE] Ingresso não encontrado:', error);
        return { success: false, message: 'Ingresso não encontrado ou inválido.' };
      }

      if (ticket.status === 'used') {
        return { 
          success: false, 
          message: 'Este ingresso já foi utilizado!', 
          alreadyUsed: true,
          ticket: {
            buyer_name: ticket.profiles?.name || 'Participante',
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
          buyer_name: ticket.profiles?.name || 'Participante',
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
