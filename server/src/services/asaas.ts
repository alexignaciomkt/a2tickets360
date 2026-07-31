import { organizers } from "../db/schema";

export class AsaasService {
    private baseUrl: string;
    private apiKey: string;
    private walletId: string;

    constructor() {
        let key = process.env.ASAAS_API_KEY || '';
        if (key.startsWith('\\')) key = key.substring(1);
        this.apiKey = key;
        
        this.walletId = process.env.ASAAS_WALLET_ID || '';
        this.baseUrl = process.env.ASAAS_ENV === 'production'
            ? 'https://api.asaas.com/v3'
            : 'https://sandbox.asaas.com/api/v3';
    }

    private async request(endpoint: string, method: string, data?: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'access_token': this.apiKey,
            },
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            let errorData: any = null;
            try {
                errorData = await response.json();
            } catch (e) {
                const text = await response.text().catch(() => '');
                throw new Error(`Erro na API Asaas (Status ${response.status}): ${text}`);
            }
            const errorMessage = errorData?.errors?.[0]?.description || errorData?.message || 'Erro desconhecido na API Asaas';
            throw new Error(`Asaas [${response.status}]: ${errorMessage}`);
        }

        return await response.json();
    }

    // Criar Subconta Gerenciada
    async createSubAccount(organizerData: any) {
        return this.request('/accounts', 'POST', {
            ...organizerData,
            loginEmail: organizerData.email,
            companyType: organizerData.cpfCnpj?.length > 14 ? 'LIMITED' : 'INDIVIDUAL', 
        });
    }

    async createPayment(data: {
        customer: string,
        billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO',
        value: number,
        dueDate: string,
        description: string,
        externalReference: string,
        splitValue: number, // Ex: 15.50
        splitWalletId: string // A carteira do organizador que vai receber o split
    }) {
        const payload: any = {
            customer: data.customer,
            billingType: data.billingType,
            value: data.value,
            dueDate: data.dueDate,
            description: data.description,
            externalReference: data.externalReference,
        };

        if (data.splitWalletId && data.splitValue > 0) {
            payload.split = [
                {
                    walletId: data.splitWalletId,
                    fixedValue: data.splitValue
                }
            ];
        }

        return this.request('/payments', 'POST', payload);
    }

    // Criar Cliente no Asaas
    async createCustomer(data: { name: string, email: string, cpfCnpj: string }) {
        return this.request('/customers', 'POST', data);
    }

    // Criar Pagamento de Promoção (Destaque na Home) — Sem split, 100% para o Master
    async createPromotionPayment(data: {
        customer: string,
        value: number,
        description: string,
        externalReference: string
    }) {
        return this.request('/payments', 'POST', {
            customer: data.customer,
            billingType: 'PIX',
            value: data.value,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: data.description,
            externalReference: data.externalReference
        });
    }
}

export const asaas = new AsaasService();
