import {
  Transaction,
  FinancialSummary,
  RevenueByPeriod,
  RevenueByCity,
  RevenueByCategory,
  PayoutRequest
} from '@/interfaces/financial';
import { api } from './api';

class FinancialService {
  // Obter todas as transações com filtros
  async getTransactions(filters?: any): Promise<Transaction[]> {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/api/transactions?${params}`);
  }

  // Obter uma transação específica
  async getTransaction(id: string): Promise<Transaction | null> {
    return api.get(`/api/transactions/${id}`);
  }

  // Obter resumo financeiro
  async getFinancialSummary(filters?: any): Promise<FinancialSummary> {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/api/financial/summary?${params}`);
  }

  // Obter receita por período
  async getRevenueByPeriod(period: string, filters?: any): Promise<RevenueByPeriod[]> {
    const params = new URLSearchParams({ ...filters, period }).toString();
    return api.get(`/api/financial/revenue-by-period?${params}`);
  }

  // Obter solicitações de pagamento (payouts)
  async getPayoutRequests(organizerId?: string): Promise<PayoutRequest[]> {
    return api.get(organizerId ? `/api/payouts/organizer/${organizerId}` : '/api/payouts');
  }

  // Criar solicitação de pagamento
  async createPayoutRequest(data: any): Promise<PayoutRequest> {
    return api.post('/api/payouts', data);
  }
}

export const financialService = new FinancialService();
