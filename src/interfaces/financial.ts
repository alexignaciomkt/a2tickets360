
export interface AsaasConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  timeout?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  fee: number;
  feeType: 'percentage' | 'fixed';
}

export interface Transaction {
  id: string;
  externalId?: string;
  eventId: string;
  eventName: string;
  organizerId: string;
  organizerName: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  fee: number;
  platformFee: number;
  netAmount: number;
  date: string;
  dueDate?: string;
  paymentDate?: string;
  invoiceUrl?: string;
  notes?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  pendingAmount: number;
  confirmedAmount: number;
  refundedAmount: number;
  totalFees: number;
  platformRevenue: number;
  organizersRevenue: number;
  transactionsCount: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  transactions: number;
}

export interface RevenueByCity {
  city: string;
  revenue: number;
  transactions: number;
}

export interface RevenueByCategory {
  category: string;
  revenue: number;
  transactions: number;
}

export interface PayoutRequest {
  id: string;
  organizerId: string;
  organizerName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestDate: string;
  processingDate?: string;
  completionDate?: string;
  bankInfo: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    branchCode: string;
  };
}
