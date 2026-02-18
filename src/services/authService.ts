import { api } from './api';

export interface RegisterData {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    city?: string;
    state?: string;
}

class AuthService {
    async registerCandidate(data: RegisterData) {
        return api.post('/api/candidates', data);
    }

    async verifyEmail(token: string, type: 'candidate' | 'organizer') {
        return api.get(`/api/auth/verify?token=${token}&type=${type}`);
    }

    async login(email: string, password: string) {
        return api.post('/api/login', { email, password });
    }
}

export const authService = new AuthService();
