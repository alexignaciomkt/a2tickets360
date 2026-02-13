
export interface Candidate {
    id: string;
    organizerId: string;
    name: string;
    email: string;
    phone: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    experience: string; // Descrição breve da experiência
    interestedRolesIds: string[]; // IDs de roles que tem interesse (ex: Segurança, Bar)
    status: 'pending' | 'reviewed' | 'hired' | 'rejected';
    appliedAt: string;
    notes?: string; // Anotações internas do organizador
}
