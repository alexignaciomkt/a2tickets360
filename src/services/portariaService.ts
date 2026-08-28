import { supabase } from '@/lib/supabase';

export interface PortariaOperation {
    id: string;
    title: string;
    slug: string;
    date?: string;
    bannerUrl?: string;
}

export const portariaService = {
    getCurrentOperations: async (accessToken: string): Promise<PortariaOperation[]> => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        
        console.log('[PORTARIA SERVICE] BEFORE REQUEST', apiUrl);
        try {
            const response = await fetch(`${apiUrl}/api/portaria/current-operation`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('[PORTARIA SERVICE] AFTER REQUEST', { status: response.status });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Erro ao carregar operações da portaria');
            }

            const data = await response.json();
            return data.operations || [];
        } catch (error: any) {
            console.error('[PORTARIA SERVICE] ERROR', error.message || error);
            throw error;
        }
    },

    sendRecoveryForStaff: async (eventStaffId: string, accessToken: string): Promise<void> => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        
        const response = await fetch(`${apiUrl}/api/staff/${eventStaffId}/send-access-recovery`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erro ao enviar recuperação');
        }
    }
};
