export type SponsorStatus = 'prospecting' | 'negotiating' | 'confirmed' | 'delivered' | 'cancelled';
export type InstallmentStatus = 'pending' | 'paid' | 'overdue';

export interface SponsorType {
    id: string;
    organizerId: string;
    name: string;
    description?: string;
    defaultValue?: number | string;
    createdAt: string;
}

export interface Sponsor {
    id: string;
    eventId: string;
    organizerId: string;
    sponsorTypeId: string;
    companyName: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    document?: string;
    totalValue: number | string;
    installments: number;
    status: SponsorStatus;
    contractUrl?: string;
    notes?: string;
    createdAt: string;
    type?: SponsorType;
    soldBy?: { id: string; name: string };
    installmentsList?: SponsorInstallment[];
    deliverables?: SponsorDeliverable[];
}

export interface SponsorInstallment {
    id: string;
    sponsorId: string;
    installmentNumber: number;
    value: number | string;
    dueDate: string;
    paidDate?: string;
    status: InstallmentStatus;
    paymentMethod?: string;
    createdAt: string;
}

export interface SponsorDeliverable {
    id: string;
    sponsorId: string;
    description: string;
    isCompleted: boolean;
    completedAt?: string;
    evidenceUrl?: string;
    createdAt: string;
}

export interface SponsorFormData {
    sponsorTypeId: string;
    soldByStaffId?: string;
    companyName: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    document?: string;
    totalValue: number;
    installments: number;
    status: SponsorStatus;
    notes?: string;
}
