export interface SplitInstruction {
    walletId: string;
    fixedValue?: number;
    percentage?: number;
}

export interface PaymentRequest {
    customer: string;
    billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
    value: number;
    dueDate: string;
    description: string;
    externalReference: string;
    splits?: SplitInstruction[];
}

export interface PaymentResult {
    gatewayPaymentId: string;
    invoiceUrl?: string;
    qrCodeData?: string;
    status: string;
}

export interface GatewayInterface {
    createPayment(data: PaymentRequest): Promise<PaymentResult>;
    createCustomer(data: { name: string, email: string, cpfCnpj?: string }): Promise<{ gatewayCustomerId: string }>;
    createSubAccount(data: any): Promise<{ gatewayAccountId: string, walletId: string }>;
    refundPayment(gatewayPaymentId: string): Promise<{ success: boolean }>;
    validateWebhookSignature(headers: Record<string, string>, body: string): boolean;
}
