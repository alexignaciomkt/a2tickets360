
// Novas interfaces de Gestão de RH (Fase 1)
export interface StaffRole {
  id: string;
  name: string;
  description?: string;
  color: string;
  permissions: {
    webDashboard: boolean; // Acesso ao painel administrativo
    validatorApp: boolean; // Acesso ao app de validação
    posSystem: boolean; // Acesso ao PDV
    canManageStaff: boolean; // Pode criar/editar outros staffs
  };
  eventFunction?: string; // Função padrão (ex: "Segurança de Portão")
}

export interface StaffMember {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;

  // Agora usamos o ID do cargo
  roleId: string;
  customRole?: StaffRole; // Populated role data

  // Legacy role support (to be migrated)
  role?: 'supervisor' | 'operator';

  eventFunction: string; // Função específica desta pessoa no evento

  // Dados Contratuais (Fase 2)
  contractType?: 'daily' | 'clt' | 'freelance' | 'volunteer';
  paymentValue?: number; // Valor (R$)
  paymentType?: 'hourly' | 'fixed'; // Por hora ou Valor fixo

  // Escala e Horário
  shiftStart?: string; // Horário de início (ex: "18:00")
  shiftEnd?: string; // Horário de fim (ex: "02:00")
  breakDuration?: number; // Pausa em minutos (ex: 60)

  isActive: boolean;
  sendCredentials: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface StaffAuth {
  staffId: string;
  eventId: string;
  eventTitle: string;
  staffName: string;
  role: 'supervisor' | 'operator';
}

export interface CheckInRecord {
  id: string;
  ticketId: string;
  participantName: string;
  staffId: string;
  staffName: string;
  checkInTime: string;
  eventId: string;
}

// Novas interfaces para PDV
export interface CardMachine {
  id: string;
  serialNumber: string;
  model: string;
  responsiblePerson: string;
  responsiblePhone: string;
}

export interface SalesPoint {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  email: string;
  commission: number;
  compensationType: 'percentage' | 'fixed' | 'per_ticket';
  compensationValue: number;
  status: 'active' | 'inactive';
  totalSales: number;
  ticketsSold: number;
  cardMachines: CardMachine[];
  createdAt: string;
}
