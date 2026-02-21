import api from './api';
import { Organizer } from '@/interfaces/organizer';

export const masterService = {
    // Gestão de Organizadores
    getOrganizers: async (): Promise<Organizer[]> => {
        return await api.get('/api/master/organizers');
    },

    createOrganizer: async (data: any): Promise<Organizer> => {
        return await api.post('/api/master/organizers', data);
    },

    updateOrganizer: async (id: string, data: any): Promise<Organizer> => {
        return await api.put(`/api/master/organizers/${id}`, data);
    },

    deleteOrganizer: async (id: string): Promise<any> => {
        return await api.delete(`/api/master/organizers/${id}`);
    },

    // Aprovação de Eventos
    getPendingEvents: async (): Promise<any[]> => {
        return await api.get('/api/master/events/pending');
    },

    getEvents: async (): Promise<any[]> => {
        return await api.get('/api/master/events');
    },

    approveEvent: async (id: string): Promise<any> => {
        return await api.put(`/api/master/events/${id}/approve`, {});
    },

    toggleFeaturedEvent: async (id: string, isFeatured: boolean): Promise<any> => {
        return await api.put(`/api/master/events/${id}/featured`, { isFeatured });
    },

    approveOrganizerManually: async (id: string): Promise<any> => {
        return await api.post(`/api/master/organizers/${id}/approve-manually`, {});
    },

    getStats: async (): Promise<any> => {
        return await api.get('/api/master/stats');
    },
};

export default masterService;
