export type VisitorStatus = 'registered' | 'confirmed' | 'checked_in';

export interface Visitor {
    id: string;
    eventId: string;
    name: string;
    email: string;
    phone?: string;
    document?: string;
    company?: string;
    role?: string;
    qrCodeData: string;
    status: VisitorStatus;
    registeredAt: string;
    checkedInAt?: string;
}

export interface VisitorFormData {
    name: string;
    email: string;
    phone?: string;
    document?: string;
    company?: string;
    role?: string;
}
