import api from './api';

export interface ServiceCredit {
    id: string;
    creditNumber: string;
    status: 'AVAILABLE' | 'RESERVED' | 'CONSUMED' | 'CANCELLED';
    creditType: 'FEATURED_EVENT';
    originEventId: string | null;
    reservedEventId: string | null;
    consumedEventId: string | null;
    createdAt: string;
    consumedAt: string | null;
}

export interface ServiceCreditsSummary {
    available: number;
    reserved: number;
    consumed: number;
    cancelled: number;
    total: number;
}

export interface ServiceCreditsResponse {
    summary: ServiceCreditsSummary;
    credits: ServiceCredit[];
}

export interface BuyServiceCreditsResponse {
    invoiceUrl?: string;
    pixQrCode?: string | null;
    ticketId?: string;
}

export interface FeaturedCreditStatus {
    hasAvailableCredits: boolean;
    availableCount: number;
    reservedCredit: ServiceCredit | null;
    activeHighlight: any | null; // eventFeaturedCycles
}

export const serviceCreditsService = {
    async getServiceCredits(): Promise<ServiceCreditsResponse> {
        const response = await api.get('/api/service-credits');
        return response.data;
    },

    async buyFeaturedCredits(quantity: number, originEventId?: string): Promise<BuyServiceCreditsResponse> {
        const payload = {
            quantity,
            ...(originEventId ? { originEventId } : {})
        };
        const response = await api.post('/api/service-credits/buy', payload);
        return response.data;
    },

    async getFeaturedCreditStatus(eventId: string): Promise<FeaturedCreditStatus> {
        const response = await api.get(`/api/events/${eventId}/featured-credit-status`);
        return response.data;
    },

    async reserveFeaturedCredit(eventId: string): Promise<{ success: boolean; creditId: string }> {
        const response = await api.post('/api/service-credits/reserve', { eventId });
        return response.data;
    },

    async releaseFeaturedCredit(eventId: string): Promise<{ success: boolean; creditId: string }> {
        const response = await api.post('/api/service-credits/release', { eventId });
        return response.data;
    }
};
