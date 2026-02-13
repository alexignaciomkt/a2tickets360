
import { Candidate } from '@/interfaces/candidate';

const mockCandidates: Candidate[] = [
    {
        id: 'cand_1',
        organizerId: '1', // Mock organizer ID
        name: 'Carlos Oliveira',
        email: 'carlos.work@email.com',
        phone: '(11) 98888-7777',
        experience: 'Tenho 3 anos de experiência como segurança em eventos de grande porte. Tenho curso de vigilante atualizado.',
        interestedRolesIds: ['role_security'],
        status: 'pending',
        appliedAt: '2025-02-15T14:30:00',
        linkedinUrl: 'linkedin.com/in/carlos-oli-mock'
    },
    {
        id: 'cand_2',
        organizerId: '1',
        name: 'Mariana Costa',
        email: 'mari.costa@email.com',
        phone: '(21) 97777-6666',
        experience: 'Trabalhei no Rock in Rio como bartender e coordenadora de bar.',
        interestedRolesIds: ['role_bar', 'role_admin'],
        status: 'reviewed',
        appliedAt: '2025-02-10T09:00:00',
        portfolioUrl: 'instagram.com/mari.drinks'
    }
];

class CandidateService {

    async getCandidates(organizerId: string): Promise<Candidate[]> {
        // Em produção, filtrar por organizerId
        return Promise.resolve([...mockCandidates]);
    }

    async apply(candidateData: Omit<Candidate, 'id' | 'status' | 'appliedAt'>): Promise<Candidate> {
        const newCandidate: Candidate = {
            ...candidateData,
            id: `cand_${Date.now()}`,
            status: 'pending',
            appliedAt: new Date().toISOString()
        };
        mockCandidates.push(newCandidate);
        return Promise.resolve(newCandidate);
    }

    async updateStatus(candidateId: string, status: Candidate['status']): Promise<void> {
        const candidate = mockCandidates.find(c => c.id === candidateId);
        if (candidate) {
            candidate.status = status;
        }
        return Promise.resolve();
    }

    async addNote(candidateId: string, note: string): Promise<void> {
        const candidate = mockCandidates.find(c => c.id === candidateId);
        if (candidate) {
            candidate.notes = note;
        }
        return Promise.resolve();
    }
}

export const candidateService = new CandidateService();
