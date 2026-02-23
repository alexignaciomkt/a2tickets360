import { api } from './api';

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    bannerUrl: string;
    imageUrl: string;
    heroImageUrl?: string;
    category: string;
    status: 'draft' | 'published' | 'cancelled';
    isFeatured: boolean;
    startTime?: string;
    endTime?: string;
    gallery?: any[];
    location: {
        name: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
    };
    organizer?: {
        id: string;
        name: string;
        email: string;
        slug: string;
    };
    tickets: any[];
}

class EventService {
    async getPublicEvents(): Promise<Event[]> {
        return api.get('/api/public/events');
    }

    async getFeaturedEvents(): Promise<Event[]> {
        return api.get('/api/public/featured-events');
    }

    async getEventById(id: string): Promise<Event> {
        return api.get(`/api/events/${id}`);
    }
}

export const eventService = new EventService();
export default eventService;
