
import { AsaasConfig, Transaction } from '@/interfaces/financial';

export class AsaasService {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(config: AsaasConfig) {
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.asaas.com/v3' 
      : 'https://sandbox.asaas.com/api/v3';
  }

  private async request(endpoint: string, method: string, data?: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'access_token': this.apiKey,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro na requisição ao Asaas');
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Customers
  async createCustomer(data: { name: string, email: string, cpfCnpj?: string, phone?: string }) {
    return this.request('/customers', 'POST', data);
  }

  async getCustomer(customerId: string) {
    return this.request(`/customers/${customerId}`, 'GET');
  }

  // Payments
  async createPayment(data: {
    customer: string,
    billingType: string,
    value: number,
    dueDate: string,
    description?: string,
    externalReference?: string,
  }) {
    return this.request('/payments', 'POST', data);
  }

  async getPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}`, 'GET');
  }

  async cancelPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}/cancel`, 'POST');
  }

  async refundPayment(paymentId: string, value?: number) {
    const data = value ? { value } : {};
    return this.request(`/payments/${paymentId}/refund`, 'POST', data);
  }

  // Transformar dados do Asaas para o formato da aplicação
  transformAsaasPaymentToTransaction(payment: any, eventData: any, userData: any): Transaction {
    return {
      id: payment.id,
      externalId: payment.id,
      eventId: eventData.id,
      eventName: eventData.name,
      organizerId: eventData.organizerId,
      organizerName: eventData.organizerName,
      userId: userData.id,
      userName: userData.name,
      amount: payment.value,
      status: this.mapAsaasStatus(payment.status),
      paymentMethod: this.mapAsaasPaymentMethod(payment.billingType),
      fee: payment.fee || 0,
      platformFee: payment.value * 0.10, // 10% da plataforma
      netAmount: payment.netValue || (payment.value - (payment.value * 0.10)),
      date: payment.dateCreated,
      dueDate: payment.dueDate,
      paymentDate: payment.paymentDate,
      invoiceUrl: payment.invoiceUrl,
      notes: payment.description
    };
  }

  private mapAsaasStatus(asaasStatus: string): 'pending' | 'confirmed' | 'cancelled' | 'refunded' {
    const statusMap: {[key: string]: 'pending' | 'confirmed' | 'cancelled' | 'refunded'} = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'RECEIVED': 'confirmed',
      'RECEIVED_IN_CASH': 'confirmed',
      'CANCELLED': 'cancelled',
      'REFUNDED': 'refunded'
    };
    return statusMap[asaasStatus] || 'pending';
  }

  private mapAsaasPaymentMethod(billingType: string): string {
    const methodMap: {[key: string]: string} = {
      'BOLETO': 'Boleto',
      'CREDIT_CARD': 'Cartão de Crédito',
      'PIX': 'PIX',
      'UNDEFINED': 'Outro'
    };
    return methodMap[billingType] || 'Outro';
  }
}

// Exportar uma instância com configuração padrão (será substituída em produção)
export const asaasService = new AsaasService({
  apiKey: 'YOUR_API_KEY', // Seria substituído por uma variável de ambiente
  environment: 'sandbox'
});
