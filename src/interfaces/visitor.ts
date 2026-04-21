export type VisitorStatus = 'registered' | 'confirmed' | 'checked_in';

export interface Visitor {
    id: string;
    eventId: string;
    name: string;
    email: string;
    phone?: string;
    document?: string;
    city?: string;
    state?: string;
    address?: string;
    birthDate?: string;
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
    city?: string;
    state?: string;
    address?: string;
    birthDate?: string;
    company?: string;
    role?: string;
}
