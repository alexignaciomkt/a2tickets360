import { ProfileStatus } from '@/lib/supabase-config';
import { api } from './api';

class MasterService {
    // -------------------------------------------------------------
    // MIGRATED METHODS (CRITICAL)
    // -------------------------------------------------------------
    
    async getStats() {
        // Calls the secure backend endpoint
        return api.get('/api/master/dashboard/stats');
    }

    async getTransactions(filters?: any) {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/api/master/financial/transactions?${params}`);
    }

    async getPayoutRequests(filters?: any) {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/api/master/financial/payouts?${params}`);
    }

    // -------------------------------------------------------------
    // TEMPORARILY DISABLED METHODS (WAITING FOR BACKEND MIGRATION)
    // -------------------------------------------------------------


    async getOrganizers(status?: ProfileStatus) {
        return api.get('/api/master/organizers');
    }

    async getOrganizerDossier(id: string) {
        return api.get(`/api/master/organizers/${id}/dossier`);
    }

    async getPendingOrganizers() {
        // Frontend can filter or we can fetch all
        return api.get('/api/master/organizers');
    }

    async getMailingAnalytics() {
        return { message: "Tracking não implementado" };
    }

    async approveOrganizer(profileDocId: string, masterUserId: string) {
        return api.post(`/api/master/organizers/${profileDocId}/approve`);
    }

    async rejectOrganizer(profileDocId: string) {
        return api.post(`/api/master/organizers/${profileDocId}/reject`);
    }

    async suspendOrganizer(profileDocId: string) {
        return api.post(`/api/master/organizers/${profileDocId}/suspend`);
    }

    async reactivateOrganizer(profileDocId: string) {
        return api.post(`/api/master/organizers/${profileDocId}/reactivate`);
    }

    async getAllEvents() {
        return api.get('/api/master/events');
    }

    async getAllEventsWithOrganizers() {
        return api.get('/api/master/events');
    }

    async getPendingEvents() {
        return api.get('/api/master/events?status=pending');
    }

    async approveEvent(eventDocId: string) {
        return api.put(`/api/master/events/${eventDocId}/approve`);
    }

    async rejectEvent(eventDocId: string, reason?: string) {
        return api.put(`/api/master/events/${eventDocId}/reject`, { reason });
    }

    async toggleFeaturedEvent(eventDocId: string, isFeatured: boolean) {
        return { message: "Tracking não implementado" };
    }

    async getReportsAnalytics() {
        return { message: "Tracking não implementado" };
    }

    async updateOrganizer(id: string, data: any, userId: string) {
        return api.patch(`/api/master/organizers/${id}`, data);
    }

    async approveOrganizerManually(id: string) {
        return api.post(`/api/master/organizers/${id}/approve`);
    }

    async deleteOrganizer(id: string) {
        return api.delete(`/api/master/organizers/${id}`);
    }
}

export const masterService = new MasterService();
export default masterService;
