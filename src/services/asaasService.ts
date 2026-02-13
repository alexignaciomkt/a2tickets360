import { api } from './api';

export class AsaasService {
  /**
   * Cria um checkout (pagamento) através do nosso backend
   */
  async createCheckout(data: {
    ticketId: string,
    quantity: number,
    buyerName: string,
    buyerEmail: string,
    buyerCpf: string,
    paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
  }) {
    return api.post('/api/payments/checkout', data);
  }

  /**
   * Cadastro de Organizador com criação de subconta
   */
  async registerOrganizer(data: {
    name: string,
    email: string,
    password: string,
    cpfCnpj: string,
    mobilePhone: string
  }) {
    return api.post('/api/organizers/register', data);
  }
}

export const asaasService = new AsaasService();
