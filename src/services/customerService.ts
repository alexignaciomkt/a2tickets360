import { api } from './api';

export interface PurchasedTicket {
    id: string;
    eventId: string;
    eventTitle: string;
    ticketName: string;
    price: number;
    status: 'active' | 'used' | 'cancelled';
    purchaseDate: string;
    qrCodeData: string;
}

class CustomerService {
    async getTickets(email: string): Promise<any[]> {
        return api.get(`/api/customer/tickets?email=${encodeURIComponent(email)}`);
    }
}

export const customerService = new CustomerService();
export default customerService;
