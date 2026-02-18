import api from './api';
import { Stand, StandCategory, StandFormData, StandCategoryFormData } from '@/interfaces/stand';

export const standService = {
    // Categorias de Stand
    getCategories: async (eventId: string): Promise<StandCategory[]> => {
        return await api.get(`/api/events/${eventId}/stand-categories`);
    },

    createCategory: async (eventId: string, data: StandCategoryFormData): Promise<StandCategory> => {
        return await api.post(`/api/events/${eventId}/stand-categories`, data);
    },

    // Stands
    getStands: async (eventId: string): Promise<Stand[]> => {
        return await api.get(`/api/events/${eventId}/stands`);
    },

    createStand: async (eventId: string, data: StandFormData): Promise<Stand> => {
        return await api.post(`/api/events/${eventId}/stands`, data);
    },

    updateStand: async (id: string, data: Partial<StandFormData>): Promise<Stand> => {
        return await api.put(`/api/stands/${id}`, data);
    },

    deleteStand: async (id: string): Promise<{ success: boolean }> => {
        return await api.delete(`/api/stands/${id}`);
    },

    // Planta Baixa
    uploadFloorPlan: async (eventId: string, floorPlanUrl: string): Promise<any> => {
        return await api.post(`/api/events/${eventId}/floor-plan`, { floorPlanUrl });
    }
};

export default standService;
