
export interface Candidate {
    id: string;
    organizerId: string;
    name: string;
    email: string;
    phone: string;
    photoUrl?: string; // New: Recruitment Vitrine
    gender?: 'M' | 'F' | 'Other'; // New: Demographic filter
    birthDate?: string; // New: To calculate age
    rating?: number; // New: Star rating (0-5)
    city?: string; // New: Location filter
    state?: string; // New: Location filter
    linkedinUrl?: string;
    portfolioUrl?: string;
    experience: string;
    biography?: string; // New: Staff Portal
    interestedRolesIds: string[];
    certifications?: {
        name: string;
        fileUrl: string;
        expiryDate?: string;
    }[]; // New: Staff Portal
    proposals?: {
        id: string;
        eventId: string;
        eventTitle: string;
        roleId: string;
        roleName: string;
        status: 'pending' | 'accepted' | 'declined';
        sentAt: string;
    }[]; // New: Staff Portal invitations
    status: 'pending' | 'reviewed' | 'hired' | 'rejected';
    appliedAt: string;
    notes?: string;
}
