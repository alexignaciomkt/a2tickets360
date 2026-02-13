import { organizers } from "../db/schema";

export class AsaasService {
    private baseUrl: string;
    private apiKey: string;
    private walletId: string;

    constructor() {
        this.apiKey = process.env.ASAAS_API_KEY || '';
        this.walletId = process.env.ASAAS_WALLET_ID || 'cdcbd1de-2c4f-4b90-a290-06610df89db1';
        this.baseUrl = process.env.NODE_ENV === 'production'
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
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.description || 'Erro na API Asaas');
        }

        return await response.json();
    }

    // Criar Subconta Gerenciada
    async createSubAccount(organizerData: {
        name: string,
        email: string,
        cpfCnpj: string,
        mobilePhone: string
    }) {
        return this.request('/accounts', 'POST', {
            ...organizerData,
            loginEmail: organizerData.email,
            companyType: 'INDIVIDUAL', // Ajustar conforme necessário
        });
    }

    // Criar Cobrança com Split
    async createPayment(data: {
        customer: string,
        billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO',
        value: number,
        dueDate: string,
        description: string,
        externalReference: string,
        splitPercent: number // Ex: 10 para 10%
    }) {
        return this.request('/payments', 'POST', {
            customer: data.customer,
            billingType: data.billingType,
            value: data.value,
            dueDate: data.dueDate,
            description: data.description,
            externalReference: data.externalReference,
            split: [
                {
                    walletId: this.walletId,
                    percentValue: data.splitPercent
                }
            ]
        });
    }

    // Criar Cliente no Asaas
    async createCustomer(data: { name: string, email: string, cpfCnpj: string }) {
        return this.request('/customers', 'POST', data);
    }
}

export const asaas = new AsaasService();
