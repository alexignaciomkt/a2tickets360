
export interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  heroImageUrl?: string; // New field for hero carousel optimized images
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  category: string;
  organizer: {
    id: string;
    name: string;
  };
  tickets: Ticket[];
  gallery: Photo[];
  featured?: boolean; // Added featured property
}

export interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  remaining: number;
  batch: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  photoUrl: string;
  role: 'customer' | 'organizer' | 'admin';
  tickets: PurchasedTicket[];
}

export interface PurchasedTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketId: string;
  ticketName: string;
  price: number;
  purchaseDate: string;
  status: 'active' | 'used' | 'cancelled';
  qrCode: string;
  observation?: string;
}

export interface Photo {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  photoUrl: string;
  caption?: string;
  likes: number;
  uploadDate: string;
}

// Mock Events Data
export const events: Event[] = [];

// Mock Users Data
export const users: User[] = [];

// More Gallery Photos
export const galleryPhotos: Photo[] = [];

// Generate a mock QR code URL
export const generateQRCode = (ticketId: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketId}`;
};

// Partners data for the carousel
export const partners: any[] = [];

export const allEvents = events;
