import { api } from './api';
import {
    Sponsor,
    SponsorType,
    SponsorFormData,
    SponsorInstallment,
    SponsorDeliverable
} from '@/interfaces/sponsor';

export const sponsorService = {
    // Sponsor Types (por Organizador)
    getSponsorTypes: async (organizerId: string): Promise<SponsorType[]> => {
        return await api.get(`/api/organizers/${organizerId}/sponsor-types`);
    },

    createSponsorType: async (organizerId: string, data: Partial<SponsorType>): Promise<SponsorType> => {
        return await api.post(`/api/organizers/${organizerId}/sponsor-types`, data);
    },

    // Patrocinadores
    getSponsors: async (eventId: string): Promise<Sponsor[]> => {
        return await api.get(`/api/events/${eventId}/sponsors`);
    },

    createSponsor: async (eventId: string, data: SponsorFormData): Promise<Sponsor> => {
        return await api.post(`/api/events/${eventId}/sponsors`, data);
    },

    updateSponsor: async (id: string, data: Partial<SponsorFormData>): Promise<Sponsor> => {
        return await api.put(`/api/sponsors/${id}`, data);
    },

    // Parcelas
    generateInstallments: async (sponsorId: string, installments: Partial<SponsorInstallment>[]): Promise<SponsorInstallment[]> => {
        return await api.post(`/api/sponsors/${sponsorId}/installments`, installments);
    },

    updateInstallment: async (id: string, data: Partial<SponsorInstallment>): Promise<SponsorInstallment> => {
        return await api.put(`/api/sponsor-installments/${id}`, data);
    },

    // Contrapartidas
    addDeliverable: async (sponsorId: string, data: Partial<SponsorDeliverable>): Promise<SponsorDeliverable> => {
        return await api.post(`/api/sponsors/${sponsorId}/deliverables`, data);
    },

    updateDeliverable: async (id: string, data: Partial<SponsorDeliverable>): Promise<SponsorDeliverable> => {
        return await api.put(`/api/sponsor-deliverables/${id}`, data);
    }
};
