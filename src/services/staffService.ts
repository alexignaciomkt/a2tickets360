
import { StaffMember, StaffAuth, CheckInRecord, StaffRole } from '@/interfaces/staff';
import { api } from './api';

const mockRoles: StaffRole[] = [
  {
    id: 'role_admin',
    name: 'Gerente Geral',
    description: 'Acesso total ao evento',
    color: '#4F46E5', // Indigo
    permissions: {
      webDashboard: true,
      validatorApp: true,
      posSystem: true,
      canManageStaff: true
    }
  },
  {
    id: 'role_security',
    name: 'Segurança / Validador',
    description: 'Responsável pelo controle de acesso',
    color: '#EF4444', // Red
    permissions: {
      webDashboard: false,
      validatorApp: true,
      posSystem: false,
      canManageStaff: false
    }
  },
  {
    id: 'role_bar',
    name: 'Bar / Caixa',
    description: 'Venda de produtos e ingressos na hora',
    color: '#10B981', // Green
    permissions: {
      webDashboard: false,
      validatorApp: false,
      posSystem: true,
      canManageStaff: false
    }
  }
];

// Mock data para demonstração
const mockStaff: StaffMember[] = [
  {
    id: '1',
    eventId: '1',
    name: 'João Silva',
    email: 'joao@staff.com',
    phone: '(12) 99999-9999',
    roleId: 'role_admin',
    role: 'supervisor',
    eventFunction: 'Coordenação de Segurança',
    isActive: true,
    sendCredentials: true,
    createdAt: '2025-03-01T10:00:00',
    lastLogin: '2025-03-15T08:30:00',
    customRole: mockRoles[0]
  }
];

const mockCheckIns: CheckInRecord[] = [];

class StaffService {
  // --- Roles Management ---

  async getRoles(): Promise<StaffRole[]> {
    return api.get('/api/staff/roles');
  }

  async createRole(roleData: Omit<StaffRole, 'id'>): Promise<StaffRole> {
    return api.post('/api/staff/roles', roleData);
  }

  async updateRole(roleId: string, roleData: Partial<StaffRole>): Promise<StaffRole | null> {
    return api.put(`/api/staff/roles/${roleId}`, roleData);
  }

  async deleteRole(roleId: string): Promise<boolean> {
    return api.delete(`/api/staff/roles/${roleId}`);
  }

  // --- Staff Management ---

  async getEventStaff(eventId: string): Promise<StaffMember[]> {
    return api.get(`/api/staff/event/${eventId}`);
  }

  async createStaffMember(eventId: string, staffData: Omit<StaffMember, 'id' | 'eventId' | 'createdAt' | 'isActive'>): Promise<StaffMember> {
    return api.post(`/api/staff/event/${eventId}`, staffData);
  }

  async updateStaffMember(staffId: string, staffData: Partial<StaffMember>): Promise<StaffMember | null> {
    return api.put(`/api/staff/${staffId}`, staffData);
  }

  async deleteStaffMember(staffId: string): Promise<boolean> {
    return api.delete(`/api/staff/${staffId}`);
  }

  // Staff Authentication
  async staffLogin(email: string, password: string): Promise<StaffAuth | null> {
    try {
      const response = await api.post<any>('/api/auth/login', { email, password });

      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        return {
          staffId: response.user.id,
          eventId: response.user.eventId,
          eventTitle: 'Festival SanjaMusic 2025', // Ideal vir da API
          staffName: response.user.name,
          role: response.user.role || 'operator'
        };
      }
      return null;
    } catch (error) {
      console.error('Falha no login:', error);
      return null;
    }
  }

  // Check-in Management
  async performCheckIn(ticketId: string, staffAuth: StaffAuth): Promise<CheckInRecord> {
    try {
      const response = await api.post<any>('/api/checkin/validate', { qrCodeData: ticketId });

      if (response.status === 'valid') {
        return {
          id: Date.now().toString(),
          ticketId,
          participantName: response.attendee,
          staffId: staffAuth.staffId,
          staffName: staffAuth.staffName,
          checkInTime: new Date().toISOString(),
          eventId: staffAuth.eventId
        };
      } else {
        throw new Error(response.message || 'Erro ao validar ingresso');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Falha na conexão com o servidor');
    }
  }

  async getCheckInHistory(eventId: string): Promise<CheckInRecord[]> {
    return mockCheckIns.filter(record => record.eventId === eventId);
  }

  // Envio de credenciais por email (mock)
  async sendStaffCredentials(staffMember: StaffMember, temporaryPassword: string): Promise<boolean> {
    console.log(`Enviando credenciais para ${staffMember.email}:`);
    console.log(`Email: ${staffMember.email}`);
    console.log(`Senha temporária: ${temporaryPassword}`);
    console.log(`Função no evento: ${staffMember.eventFunction}`);
    console.log(`Acesso: /staff/login`);
    return true;
  }
  // --- Financial Reports (Fase 3) ---

  async getFinancialSummary(eventId: string): Promise<{
    totalCost: number;
    totalStaff: number;
    hourlyStaff: number;
    fixedStaff: number;
    roleBreakdown: { roleName: string; count: number; cost: number; color: string }[];
  }> {

    // Obter staff do evento
    const staffList = await this.getEventStaff(eventId);
    const roles = await this.getRoles();

    let totalCost = 0;
    let hourlyStaff = 0;
    let fixedStaff = 0;
    const roleMap = new Map<string, { roleName: string; count: number; cost: number; color: string }>();

    // Inicializar mapa de cargos
    roles.forEach(role => {
      roleMap.set(role.id, {
        roleName: role.name,
        count: 0,
        cost: 0,
        color: role.color
      });
    });

    // Calcular custos
    staffList.forEach(staff => {
      let staffCost = 0;

      if (staff.contractType !== 'volunteer' && staff.paymentValue) {
        if (staff.paymentType === 'fixed') {
          staffCost = staff.paymentValue;
          fixedStaff++;
        } else if (staff.paymentType === 'hourly' && staff.shiftStart && staff.shiftEnd) {
          // Calcular horas trabalhadas
          const start = parseInt(staff.shiftStart.split(':')[0]) + parseInt(staff.shiftStart.split(':')[1]) / 60;
          let end = parseInt(staff.shiftEnd.split(':')[0]) + parseInt(staff.shiftEnd.split(':')[1]) / 60;

          // Se o fim for menor que o início, assumimos que virou o dia (ex: 18:00 as 02:00)
          if (end < start) end += 24;

          const hours = end - start - ((staff.breakDuration || 0) / 60);
          staffCost = staff.paymentValue * Math.max(0, hours);
          hourlyStaff++;
        }
      }

      totalCost += staffCost;

      // Agrupar por cargo
      if (staff.roleId && roleMap.has(staff.roleId)) {
        const roleData = roleMap.get(staff.roleId)!;
        roleData.count++;
        roleData.cost += staffCost;
      }
    });

    return {
      totalCost,
      totalStaff: staffList.length,
      hourlyStaff,
      fixedStaff,
      roleBreakdown: Array.from(roleMap.values()).filter(r => r.count > 0)
    };
  }
}

export const staffService = new StaffService();
