import { Event, Ticket, SalesChannel, FinancialSummary, Sale } from '@/interfaces/organizer';
import { api } from './api';

export interface EventCategory {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

class OrganizerService {
  // Event Categories (Global Bank)
  async getEventCategories(): Promise<EventCategory[]> {
    return api.get('/api/event-categories');
  }

  async createEventCategory(name: string, icon?: string): Promise<EventCategory> {
    return api.post('/api/event-categories', { name, icon });
  }

  // Events Management
  async getEvents(organizerId: string): Promise<Event[]> {
    return api.get(`/api/events/organizer/${organizerId}`);
  }

  async getEvent(eventId: string): Promise<Event | null> {
    return api.get(`/api/events/${eventId}`);
  }

  async createEvent(eventData: any): Promise<Event> {
    return api.post('/api/events', eventData);
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event | null> {
    return api.put(`/api/events/${eventId}`, eventData);
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    return api.delete(`/api/events/${eventId}`);
  }

  // Image Upload
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload', formData);
  }

  // Profile Management
  async getProfile(organizerId: string): Promise<any> {
    return api.get(`/api/organizers/${organizerId}/profile`);
  }

  async updateProfile(organizerId: string, data: any): Promise<any> {
    return api.put(`/api/organizers/${organizerId}/profile`, data);
  }

  async completeProfile(organizerId: string): Promise<any> {
    return api.put(`/api/organizers/${organizerId}/complete-profile`, {});
  }

  async getProducerBySlug(slug: string): Promise<any> {
    return api.get(`/api/organizers/slug/${slug}`);
  }

  // Tickets Management
  async createTicket(eventId: string, ticketData: any): Promise<Ticket> {
    return api.post(`/api/events/${eventId}/tickets`, ticketData);
  }

  async updateTicket(ticketId: string, ticketData: Partial<Ticket>): Promise<Ticket | null> {
    return api.put(`/api/tickets/${ticketId}`, ticketData);
  }

  // Financial Management
  async getFinancialSummary(eventId: string): Promise<FinancialSummary> {
    return api.get(`/api/events/${eventId}/financial-summary`);
  }

  async getSales(eventId: string): Promise<Sale[]> {
    return api.get(`/api/events/${eventId}/sales`);
  }

  // Feed Management (Organizer Posts)
  async createPost(organizerId: string, postData: { imageUrl: string, caption?: string }): Promise<any> {
    return api.post(`/api/organizers/${organizerId}/posts`, postData);
  }

  async getPosts(organizerId: string): Promise<any[]> {
    return api.get(`/api/organizers/${organizerId}/posts`);
  }

  async deletePost(organizerId: string, postId: string): Promise<boolean> {
    return api.delete(`/api/organizers/${organizerId}/posts/${postId}`);
  }

  // Profile Status Validation
  async validateStatus(organizerId: string): Promise<{ profileComplete: boolean }> {
    return api.post(`/api/organizers/${organizerId}/validate-status`, {});
  }

  async getStats(organizerId: string): Promise<any> {
    return api.get(`/api/organizers/${organizerId}/stats`);
  }
}

export const organizerService = new OrganizerService();

