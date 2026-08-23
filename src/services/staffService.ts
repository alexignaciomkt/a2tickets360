import { supabase } from '@/lib/supabase';
import { db, LocalTicket } from '@/lib/offline-db';
import { StaffMember, StaffRole } from '@/interfaces/staff';

class StaffService {
  /**
   * Obtém as roles de staff do catálogo global
   */
  async getRoles(): Promise<any[]> {
    try {
      const { api } = await import('@/services/api');
      return await api.get('/api/staff/roles');
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao buscar roles:', e);
      throw e;
    }
  }

  /**
   * Obtém as funções operacionais
   */
  async getFunctions(): Promise<any[]> {
    try {
      const { api } = await import('@/services/api');
      return await api.get('/api/staff/functions');
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao buscar functions:', e);
      throw e;
    }
  }

  /**
   * Cria uma nova função operacional
   */
  async createFunction(data: { name: string, description?: string, defaultSystemRoleId?: string }): Promise<any> {
    try {
      const { api } = await import('@/services/api');
      return await api.post('/api/staff/functions', data);
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao criar function:', e);
      throw e;
    }
  }

  /**
   * Obtém a lista de convites e vínculos do Staff atual
   */
  async getMyInvites(): Promise<any[]> {
    try {
      const { api } = await import('@/services/api');
      return await api.get('/api/staff/my-invites');
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao buscar convites do staff:', e);
      return [];
    }
  }

  /**
   * Obtém a lista de staff
   */
  async getFinancialSummary(eventId: string): Promise<any> {
    try {
      // Como determinado pela auditoria P0.3, a estrutura financeira 
      // (cachê, valor, horas) ainda não existe em event_staff ou functions.
      // Retornamos os counts REAIS de pessoas por evento, 
      // mas custos como nulos para mostrar os empty states corretos.
      let query = supabase
        .from('event_staff')
        .select(`
          id,
          staff_functions(name)
        `);
      
      if (eventId !== 'all') {
        query = query.eq('event_id', eventId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const staffList = data || [];
      const totalStaff = staffList.length;
      
      // Agrupar por função
      const rolesMap: Record<string, number> = {};
      staffList.forEach((st: any) => {
        const functionName = st.staff_functions?.name || 'Sem Função';
        rolesMap[functionName] = (rolesMap[functionName] || 0) + 1;
      });
      
      const roleBreakdown = Object.entries(rolesMap).map(([name, count], index) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];
        return {
          roleName: name,
          count: count,
          cost: null, // Ainda não informado no schema
          color: colors[index % colors.length]
        };
      });

      return {
        totalCost: null, // Indica "ainda não informado"
        totalStaff,
        hourlyStaff: null,
        fixedStaff: null,
        roleBreakdown
      };
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao buscar financial summary:', e);
      throw e;
    }
  }
  async getEventStaff(eventId: string): Promise<StaffMember[]> {
    try {
      const { api } = await import('@/services/api');
      const data = await api.get<any[]>(`/api/staff/event-staff?eventId=${eventId === 'all' ? '' : eventId}`);
      
      return data.map(s => ({
        id: s.eventStaffId, // Mapeamos o id real do event_staff
        organizerId: s.organizerId,
        eventId: s.eventId,
        name: s.nome,
        email: s.email,
        roleId: s.funcaoId, // ID da função operacional
        staffFunctionId: s.funcaoId, // Mapeamento novo para o modal
        systemRoleIds: s.systemRoleIds || [], // Mapeamento novo para o modal
        eventFunction: s.funcao, // Nome da função
        isActive: s.status === 'ACTIVE',
        status: s.status,
        phone: s.telefone,
        createdAt: s.createdAt,
        shiftStart: s.shiftStart,
        shiftEnd: s.shiftEnd,
      } as any));
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao buscar equipe:', e);
      return [];
    }
  }

  /**
   * Cria um membro da equipe usando a nova arquitetura (Fase 4)
   * Agora usamos api.post('/api/staff/invite') ao invés do INSERT no frontend.
   */
  async createStaffMember(eventId: string, data: any): Promise<any> {
    try {
      const { api } = await import('@/services/api');
      
      const payload = {
        eventId: eventId === 'all' || eventId === '' ? null : eventId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        staffFunctionId: data.staffFunctionId,
        shiftStart: data.shiftStart,
        shiftEnd: data.shiftEnd,
        systemRoleIds: data.systemRoleIds
      };

      const response = await api.post<{ eventStaffId: string, status: string, success: boolean, accessDelivery: string }>('/api/staff/invite', payload);
      
      return response;
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao criar staff:', e);
      throw e;
    }
  }

  /**
   * Envia o acesso (convite ou recuperação) para o Staff.
   */
  async sendAccess(eventStaffId: string): Promise<any> {
    try {
      const { api } = await import('@/services/api');
      return await api.post(`/api/staff/${eventStaffId}/send-access`, {});
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao enviar acesso:', e);
      throw e;
    }
  }

  /**
   * Envia recuperação de senha (para staffs já ativos)
   */
  async sendRecovery(eventStaffId: string): Promise<any> {
    try {
      const { api } = await import('@/services/api');
      return await api.post(`/api/staff/${eventStaffId}/send-access-recovery`, {});
    } catch (e) {
      console.error('[STAFF_SERVICE] Erro ao enviar recuperação:', e);
      throw e;
    }
  }

  /**
   * Aceita um convite de Staff
   */
  async acceptInvite(eventStaffId: string): Promise<any> {
    try {
      const { api } = await import('@/services/api');
      return await api.post(`/api/staff/accept/${eventStaffId}`, {});
    } catch (e) {
      throw e;
    }
  }

  /**
   * Recusa um convite de Staff
   */
  async declineInvite(eventStaffId: string): Promise<any> {
    try {
      const { api } = await import('@/services/api');
      return await api.post(`/api/staff/decline/${eventStaffId}`, {});
    } catch (e) {
      throw e;
    }
  }

  /**
   * Atualiza um membro da equipe
   */
  async updateStaffMember(id: string, data: any): Promise<void> {
    const { error } = await supabase.from('staff').update({
       event_id: data.eventId === 'all' || data.eventId === '' ? null : data.eventId,
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
