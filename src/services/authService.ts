import { supabase } from '@/lib/supabase';
import { UserRole, ProfileStatus } from '@/lib/supabase-config';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    companyName?: string;
    cnpj?: string;
    city?: string;
    state?: string;
}

export interface UserProfile {
    id: string;
    user_id: string;
    role: UserRole;
    status: ProfileStatus;
    companyName?: string;
    cnpj?: string;
    cpf?: string;
    phone?: string;
    city?: string;
    state?: string;
    address?: string;
    birth_date?: string;
    profile_complete: boolean;
    created_at: string;
    updated_at: string;
}

class AuthService {
    async registerUser(data: RegisterData) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: { name: data.name }
            }
        });

        if (authError) throw authError;

        const initialStatus: ProfileStatus = data.role === 'customer' ? 'approved' : 'pending';

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                user_id: authData.user!.id,
                name: data.name,
                email: data.email,
                role: data.role,
                cpf: data.cpf,
                phone: data.phone,
                city: data.city,
                state: data.state,
                status: initialStatus,
                profile_complete: true
            })
            .select()
            .single();

        if (profileError) throw profileError;

        return { account: authData.user, profile };
    }

    async login(email: string, password: string) {
        return supabase.auth.signInWithPassword({ email, password });
    }

    async logout() {
        return supabase.auth.signOut();
    }

    async getCurrentAccount() {
        const { data } = await supabase.auth.getUser();
        return data.user;
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) return null;
        return data as UserProfile;
    }

    async updateProfile(profileDocId: string, data: Partial<UserProfile>) {
        return supabase.from('profiles').update(data).eq('id', profileDocId);
    }
}

export const authService = new AuthService();
export default authService;
