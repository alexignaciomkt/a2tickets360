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

    private throwUnavailable(): never {
        throw new Error('Funcionalidade temporariamente indisponível. A plataforma está passando por um upgrade de segurança (P0) e esta tela será reativada em breve.');
    }

    async getOrganizers(status?: ProfileStatus) {
        this.throwUnavailable();
    }

    async getPendingOrganizers() {
        this.throwUnavailable();
    }

    async getMailingAnalytics() {
        this.throwUnavailable();
    }

    async approveOrganizer(profileDocId: string, masterUserId: string) {
        this.throwUnavailable();
    }

    async rejectOrganizer(profileDocId: string) {
        this.throwUnavailable();
    }

    async suspendOrganizer(profileDocId: string) {
        this.throwUnavailable();
    }

    async reactivateOrganizer(profileDocId: string) {
        this.throwUnavailable();
    }

    async getAllEvents() {
        this.throwUnavailable();
    }

    async getAllEventsWithOrganizers() {
        this.throwUnavailable();
    }

    async getPendingEvents() {
        this.throwUnavailable();
    }

    async approveEvent(eventDocId: string) {
        this.throwUnavailable();
    }

    async rejectEvent(eventDocId: string, reason?: string) {
        this.throwUnavailable();
    }

    async toggleFeaturedEvent(eventDocId: string, isFeatured: boolean) {
        this.throwUnavailable();
    }

    async getReportsAnalytics() {
        this.throwUnavailable();
    }

    async updateOrganizer(id: string, data: any, userId: string) {
        this.throwUnavailable();
    }

    async approveOrganizerManually(id: string) {
        this.throwUnavailable();
    }

    async deleteOrganizer(id: string) {
        this.throwUnavailable();
    }
}

export const masterService = new MasterService();
export default masterService;
