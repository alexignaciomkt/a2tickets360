export type StandStatus = 'available' | 'reserved' | 'sold';

export interface StandCategory {
    id: string;
    eventId: string;
    name: string;
    size?: string;
    price: number;
    createdAt: string;
}

export interface Stand {
    id: string;
    eventId: string;
    organizerId: string;
    categoryId: string;
    identifier: string;
    exhibitorName?: string;
    exhibitorEmail?: string;
    exhibitorPhone?: string;
    exhibitorDocument?: string;
    status: StandStatus;
    reservedUntil?: string;
    notes?: string;
    createdAt: string;
    category?: StandCategory;
    soldByStaffId?: string;
    soldBy?: { id: string; name: string };
}

export interface StandFormData {
    categoryId: string;
    identifier: string;
    exhibitorName?: string;
    exhibitorEmail?: string;
    exhibitorPhone?: string;
    exhibitorDocument?: string;
    status: StandStatus;
    notes?: string;
}

export interface StandCategoryFormData {
    name: string;
    size?: string;
    price: number;
}
