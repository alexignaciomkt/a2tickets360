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
}

export const candidateService = new CandidateService();
