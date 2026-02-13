
import { Event as SanjaEvent, User as SanjaUser, Photo } from './mockData';

export interface A2Event extends SanjaEvent {
  producerId: string;
}

export interface Producer {
  id: string;
  name: string;
  slug: string;
  description: string;
  profileImage: string;
  coverImage: string;
  followers: number;
  following: boolean;
  category?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  verified?: boolean;
}

export interface Post {
  id: string;
  producerId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  shares?: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  lastPurchase: string;
  totalSpent: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
}
