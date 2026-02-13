
import { Event, Ticket, SalesChannel, FinancialSummary, Sale } from '@/interfaces/organizer';

// Mock data para demonstração
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Música Eletrônica',
    description: 'Um festival incrível com os melhores DJs do Brasil',
    category: 'Música',
    date: '2025-06-15',
    time: '20:00',
    duration: '8 horas',
    location: {
      name: 'Centro de Eventos',
      address: 'Av. Principal, 1000',
      city: 'São José dos Campos',
      state: 'SP',
      postalCode: '12345-000',
      coordinates: { lat: -23.2237, lng: -45.9009 }
    },
    capacity: 5000,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    organizerId: '1',
    organizerName: 'Produções Culturais',
    tickets: [
      {
        id: '1',
        eventId: '1',
        name: 'Pista',
        price: 80,
        quantity: 3000,
        remaining: 2500,
        batch: '1º Lote',
        salesStart: '2025-03-01T00:00:00',
        salesEnd: '2025-06-15T18:00:00',
        isActive: true,
        category: 'standard'
      },
      {
        id: '2',
        eventId: '1',
        name: 'VIP',
        description: 'Acesso à área VIP com bar exclusivo',
        price: 150,
        quantity: 500,
        remaining: 450,
        batch: '1º Lote',
        salesStart: '2025-03-01T00:00:00',
        salesEnd: '2025-06-15T18:00:00',
        isActive: true,
        category: 'vip'
      }
    ],
    salesChannels: [
      {
        id: '1',
        eventId: '1',
        name: 'A2Tickets Online',
        type: 'online',
        status: 'active',
        commission: 5
      },
      {
        id: '2',
        eventId: '1',
        name: 'Loja Centro',
        type: 'physical',
        status: 'active',
        commission: 8,
        contactPerson: 'João Silva',
        phone: '(12) 99999-9999',
        address: 'Rua das Flores, 123 - Centro'
      }
    ],
    createdAt: '2025-03-01T10:00:00',
    updatedAt: '2025-03-15T14:30:00'
  }
];

const mockSales: Sale[] = [
  {
    id: '1',
    eventId: '1',
    ticketId: '1',
    channelId: '1',
    buyerName: 'Maria Silva',
    buyerEmail: 'maria@email.com',
    buyerPhone: '(12) 98888-8888',
    quantity: 2,
    unitPrice: 80,
    totalPrice: 160,
    fees: 8,
    netAmount: 152,
    paymentStatus: 'paid',
    paymentMethod: 'Cartão de Crédito',
    saleDate: '2025-03-10T15:30:00',
    checkInStatus: 'pending'
  }
];

class OrganizerService {
  // Events Management
  async getEvents(organizerId: string): Promise<Event[]> {
    return mockEvents.filter(event => event.organizerId === organizerId);
  }

  async getEvent(eventId: string): Promise<Event | null> {
    return mockEvents.find(event => event.id === eventId) || null;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockEvents.push(newEvent);
    return newEvent;
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event | null> {
    const eventIndex = mockEvents.findIndex(event => event.id === eventId);
    if (eventIndex === -1) return null;

    mockEvents[eventIndex] = {
      ...mockEvents[eventIndex],
      ...eventData,
      updatedAt: new Date().toISOString()
    };
    return mockEvents[eventIndex];
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const eventIndex = mockEvents.findIndex(event => event.id === eventId);
    if (eventIndex === -1) return false;

    mockEvents.splice(eventIndex, 1);
    return true;
  }

  // Tickets Management
  async createTicket(eventId: string, ticketData: Omit<Ticket, 'id' | 'eventId'>): Promise<Ticket> {
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      eventId
    };

    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.tickets.push(newTicket);
    }

    return newTicket;
  }

  async updateTicket(ticketId: string, ticketData: Partial<Ticket>): Promise<Ticket | null> {
    for (const event of mockEvents) {
      const ticketIndex = event.tickets.findIndex(ticket => ticket.id === ticketId);
      if (ticketIndex !== -1) {
        event.tickets[ticketIndex] = { ...event.tickets[ticketIndex], ...ticketData };
        return event.tickets[ticketIndex];
      }
    }
    return null;
  }

  // Sales Channels Management
  async createSalesChannel(eventId: string, channelData: Omit<SalesChannel, 'id' | 'eventId'>): Promise<SalesChannel> {
    const newChannel: SalesChannel = {
      ...channelData,
      id: Date.now().toString(),
      eventId
    };

    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.salesChannels.push(newChannel);
    }

    return newChannel;
  }

  async updateSalesChannel(channelId: string, channelData: Partial<SalesChannel>): Promise<SalesChannel | null> {
    for (const event of mockEvents) {
      const channelIndex = event.salesChannels.findIndex(channel => channel.id === channelId);
      if (channelIndex !== -1) {
        event.salesChannels[channelIndex] = { ...event.salesChannels[channelIndex], ...channelData };
        return event.salesChannels[channelIndex];
      }
    }
    return null;
  }

  // Financial Management
  async getFinancialSummary(eventId: string): Promise<FinancialSummary> {
    const event = mockEvents.find(e => e.id === eventId);
    const sales = mockSales.filter(sale => sale.eventId === eventId);

    if (!event) {
      throw new Error('Evento não encontrado');
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalFees = sales.reduce((sum, sale) => sum + sale.fees, 0);
    const netRevenue = sales.reduce((sum, sale) => sum + sale.netAmount, 0);
    const ticketsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const ticketsRemaining = event.tickets.reduce((sum, ticket) => sum + ticket.remaining, 0);

    return {
      eventId,
      totalRevenue,
      totalSales: sales.length,
      totalFees,
      netRevenue,
      ticketsSold,
      ticketsRemaining,
      salesByChannel: [],
      salesByTicketType: []
    };
  }

  async getSales(eventId: string): Promise<Sale[]> {
    return mockSales.filter(sale => sale.eventId === eventId);
  }
}

export const organizerService = new OrganizerService();
