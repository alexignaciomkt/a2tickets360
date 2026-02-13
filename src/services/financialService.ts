
import { 
  Transaction, 
  FinancialSummary, 
  RevenueByPeriod, 
  RevenueByCity,
  RevenueByCategory,
  PayoutRequest
} from '@/interfaces/financial';

// Mock de dados para simular transações
const mockTransactions: Transaction[] = [
  {
    id: '1',
    externalId: 'pay_123456789',
    eventId: '1',
    eventName: 'Festival de Verão',
    organizerId: '1',
    organizerName: 'Produções Culturais',
    userId: '1',
    userName: 'Carlos Silva',
    amount: 150.00,
    status: 'confirmed',
    paymentMethod: 'Cartão de Crédito',
    fee: 4.50,
    platformFee: 15.00,
    netAmount: 130.50,
    date: '2025-05-10T14:30:00',
    paymentDate: '2025-05-10T14:30:00',
    invoiceUrl: 'https://example.com/invoice/123',
  },
  {
    id: '2',
    externalId: 'pay_987654321',
    eventId: '2',
    eventName: 'Workshop de Fotografia',
    organizerId: '2',
    organizerName: 'Studio Frame',
    userId: '2',
    userName: 'Ana Oliveira',
    amount: 80.00,
    status: 'confirmed',
    paymentMethod: 'PIX',
    fee: 0.80,
    platformFee: 8.00,
    netAmount: 71.20,
    date: '2025-05-11T10:15:00',
    paymentDate: '2025-05-11T10:16:20',
    invoiceUrl: 'https://example.com/invoice/456',
  },
  {
    id: '3',
    externalId: 'pay_555666777',
    eventId: '3',
    eventName: 'Feira de Artesanato',
    organizerId: '1',
    organizerName: 'Produções Culturais',
    userId: '3',
    userName: 'Roberto Gomes',
    amount: 25.00,
    status: 'pending',
    paymentMethod: 'Boleto',
    fee: 1.50,
    platformFee: 2.50,
    netAmount: 21.00,
    date: '2025-05-12T09:45:00',
    dueDate: '2025-05-15T23:59:59',
    invoiceUrl: 'https://example.com/invoice/789',
  },
  {
    id: '4',
    externalId: 'pay_111222333',
    eventId: '1',
    eventName: 'Festival de Verão',
    organizerId: '1',
    organizerName: 'Produções Culturais',
    userId: '4',
    userName: 'Maria Santos',
    amount: 150.00,
    status: 'refunded',
    paymentMethod: 'Cartão de Crédito',
    fee: 4.50,
    platformFee: 15.00,
    netAmount: 130.50,
    date: '2025-05-09T16:20:00',
    paymentDate: '2025-05-09T16:22:10',
    invoiceUrl: 'https://example.com/invoice/101',
  },
  // Adicionar mais transações para dados mais realistas
];

// Mock de solicitações de pagamento
const mockPayoutRequests: PayoutRequest[] = [
  {
    id: '1',
    organizerId: '1',
    organizerName: 'Produções Culturais',
    amount: 5000.00,
    status: 'completed',
    requestDate: '2025-05-05T10:00:00',
    processingDate: '2025-05-06T09:30:00',
    completionDate: '2025-05-07T14:15:00',
    bankInfo: {
      bankName: 'Nubank',
      accountType: 'Conta Corrente',
      accountNumber: '1234567',
      branchCode: '0001'
    }
  },
  {
    id: '2',
    organizerId: '2',
    organizerName: 'Studio Frame',
    amount: 1200.00,
    status: 'pending',
    requestDate: '2025-05-15T16:45:00',
    bankInfo: {
      bankName: 'Itaú',
      accountType: 'Conta Poupança',
      accountNumber: '7654321',
      branchCode: '4321'
    }
  }
];

class FinancialService {
  // Obter todas as transações com filtros opcionais
  async getTransactions(filters?: {
    status?: string,
    eventId?: string,
    organizerId?: string,
    userId?: string,
    startDate?: string,
    endDate?: string,
    minAmount?: number,
    maxAmount?: number
  }): Promise<Transaction[]> {
    // Em uma aplicação real, isso seria uma chamada à API
    // Para este mock, vamos filtrar as transações localmente
    let transactions = [...mockTransactions];
    
    if (filters) {
      if (filters.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }
      if (filters.eventId) {
        transactions = transactions.filter(t => t.eventId === filters.eventId);
      }
      if (filters.organizerId) {
        transactions = transactions.filter(t => t.organizerId === filters.organizerId);
      }
      if (filters.userId) {
        transactions = transactions.filter(t => t.userId === filters.userId);
      }
      if (filters.startDate) {
        transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.startDate!));
      }
      if (filters.endDate) {
        transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.endDate!));
      }
      if (filters.minAmount !== undefined) {
        transactions = transactions.filter(t => t.amount >= filters.minAmount!);
      }
      if (filters.maxAmount !== undefined) {
        transactions = transactions.filter(t => t.amount <= filters.maxAmount!);
      }
    }
    
    return transactions;
  }

  // Obter uma transação específica
  async getTransaction(id: string): Promise<Transaction | null> {
    return mockTransactions.find(t => t.id === id) || null;
  }
  
  // Obter resumo financeiro
  async getFinancialSummary(filters?: {
    organizerId?: string,
    startDate?: string,
    endDate?: string
  }): Promise<FinancialSummary> {
    const transactions = await this.getTransactions(filters);
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
    const confirmedAmount = transactions.filter(t => t.status === 'confirmed').reduce((sum, t) => sum + t.amount, 0);
    const refundedAmount = transactions.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.fee, 0);
    const platformRevenue = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    const organizersRevenue = totalRevenue - totalFees - platformRevenue;
    
    return {
      totalRevenue,
      pendingAmount,
      confirmedAmount,
      refundedAmount,
      totalFees,
      platformRevenue,
      organizersRevenue,
      transactionsCount: transactions.length,
    };
  }
  
  // Obter receita por período (dia, semana, mês)
  async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly', filters?: {
    organizerId?: string,
    startDate?: string,
    endDate?: string
  }): Promise<RevenueByPeriod[]> {
    // Em uma aplicação real, isso seria calculado a partir de dados do banco
    // Para este mock, retornamos dados simulados
    return [
      { period: 'Jan', revenue: 15400, transactions: 120 },
      { period: 'Fev', revenue: 17500, transactions: 145 },
      { period: 'Mar', revenue: 20800, transactions: 172 },
      { period: 'Abr', revenue: 22400, transactions: 192 },
      { period: 'Mai', revenue: 28750, transactions: 215 },
      { period: 'Jun', revenue: 32100, transactions: 245 }
    ];
  }
  
  // Obter receita por cidade
  async getRevenueByCity(): Promise<RevenueByCity[]> {
    return [
      { city: 'São José dos Campos', revenue: 45600, transactions: 380 },
      { city: 'Jacareí', revenue: 18200, transactions: 155 },
      { city: 'Taubaté', revenue: 12400, transactions: 110 },
      { city: 'Caçapava', revenue: 8700, transactions: 72 },
      { city: 'Pindamonhangaba', revenue: 7200, transactions: 65 }
    ];
  }
  
  // Obter receita por categoria de evento
  async getRevenueByCategory(): Promise<RevenueByCategory[]> {
    return [
      { category: 'Shows', revenue: 38200, transactions: 310 },
      { category: 'Festas', revenue: 25400, transactions: 215 },
      { category: 'Workshops', revenue: 12800, transactions: 105 },
      { category: 'Esportes', revenue: 9500, transactions: 82 },
      { category: 'Cultural', revenue: 7200, transactions: 65 }
    ];
  }
  
  // Obter solicitações de pagamento (payouts)
  async getPayoutRequests(organizerId?: string): Promise<PayoutRequest[]> {
    if (organizerId) {
      return mockPayoutRequests.filter(p => p.organizerId === organizerId);
    }
    return mockPayoutRequests;
  }
  
  // Criar solicitação de pagamento
  async createPayoutRequest(data: {
    organizerId: string,
    organizerName: string,
    amount: number,
    bankInfo: {
      bankName: string,
      accountType: string,
      accountNumber: string,
      branchCode: string
    }
  }): Promise<PayoutRequest> {
    const newRequest: PayoutRequest = {
      id: `${Date.now()}`,
      ...data,
      status: 'pending',
      requestDate: new Date().toISOString()
    };
    
    // Em uma aplicação real, isso seria salvo no banco de dados
    mockPayoutRequests.push(newRequest);
    
    return newRequest;
  }
}

export const financialService = new FinancialService();
