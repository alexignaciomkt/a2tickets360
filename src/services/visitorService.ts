import { Visitor, VisitorFormData } from '@/interfaces/visitor';
import { api } from './api';

export const visitorService = {
    // --- Public Registration ---
    registerVisitor: async (eventId: string, data: VisitorFormData): Promise<Visitor> => {
        return await api.post(`/api/events/${eventId}/visitors/register`, data);
    },

    // --- Organizer Management ---
    getVisitors: async (eventId: string): Promise<Visitor[]> => {
        return await api.get(`/api/events/${eventId}/visitors`);
    },

    updateVisitor: async (id: string, data: Partial<Visitor>): Promise<Visitor> => {
        return await api.put(`/api/visitors/${id}`, data);
    },

    // --- Check-in & Validation ---
    validateQrCode: async (qrCode: string): Promise<Visitor> => {
        return await api.get(`/api/visitors/validate/${qrCode}`);
    },

    checkIn: async (id: string): Promise<Visitor> => {
        return await api.post(`/api/visitors/${id}/checkin`, {});
    }
};
