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
        return response as any;
    },

    async buyFeaturedCredits(quantity: number, originEventId?: string): Promise<BuyServiceCreditsResponse> {
        const payload = {
            quantity,
            ...(originEventId ? { originEventId } : {})
        };
        const response = await api.post('/api/service-credits/buy', payload);
        return response as any;
    },

    async getFeaturedCreditStatus(eventId: string): Promise<FeaturedCreditStatus> {
        const response = await api.get(`/api/events/${eventId}/featured-credit-status`);
        return response as any;
    },

    async reserveFeaturedCredit(eventId: string): Promise<{ success: boolean; creditId: string }> {
        const response = await api.post('/api/service-credits/reserve', { eventId });
        return response as any;
    },

    async releaseFeaturedCredit(eventId: string): Promise<{ success: boolean; creditId: string }> {
        const response = await api.post('/api/service-credits/release', { eventId });
        return response as any;
    },

    async activateFeaturedCredit(eventId: string): Promise<any> {
        const response = await api.post('/api/service-credits/activate-featured', { eventId });
        return response;
    },

    async reserveSession(reservationToken: string): Promise<{ success: boolean; creditId: string; summary: ServiceCreditsSummary }> {
        const response = await api.post('/api/service-credits/reserve-session', { reservationToken });
        return response as any;
    },

    async cancelReservation(reservationToken: string): Promise<{ success: boolean; creditId: string; summary: ServiceCreditsSummary }> {
        const response = await api.post('/api/service-credits/cancel-reservation', { reservationToken });
        return response as any;
    },

    async consumeReservation(reservationToken: string, eventId: string): Promise<{ success: boolean; summary: ServiceCreditsSummary }> {
        const response = await api.post('/api/service-credits/consume-reservation', { reservationToken, eventId });
        return response as any;
    }
};
