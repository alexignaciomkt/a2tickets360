import { Event, Ticket, SalesChannel, FinancialSummary, Sale } from '@/interfaces/organizer';
import { api } from './api';

class OrganizerService {
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
}

export const organizerService = new OrganizerService();
