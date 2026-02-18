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

    // Outras funções master podem ser adicionadas aqui (ex: aprovação de eventos)
};

export default masterService;
