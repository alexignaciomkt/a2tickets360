import { Candidate } from '@/interfaces/candidate';
import { api } from './api';

class CandidateService {
    async getCandidates(organizerId: string): Promise<Candidate[]> {
        return api.get(`/api/candidates/organizer/${organizerId}`);
    }

    async apply(candidateData: Omit<Candidate, 'id' | 'status' | 'appliedAt'>): Promise<Candidate> {
        return api.post('/api/candidates', candidateData);
    }

    async updateStatus(candidateId: string, status: Candidate['status']): Promise<void> {
        return api.put(`/api/candidates/${candidateId}/status`, { status });
    }

    async addNote(candidateId: string, note: string): Promise<void> {
        return api.post(`/api/candidates/${candidateId}/notes`, { note });
    }

    async updateProfile(candidateId: string, data: Partial<Candidate>): Promise<Candidate> {
        return api.put(`/api/candidates/${candidateId}`, data);
    }

    async respondToProposal(candidateId: string, proposalId: string, status: 'accepted' | 'declined'): Promise<void> {
        return api.post(`/api/candidates/${candidateId}/proposals/${proposalId}/respond`, { status });
    }

    async getByEmail(email: string): Promise<Candidate | null> {
        return api.get(`/api/candidates/email/${email}`);
    }
}

export const candidateService = new CandidateService();
