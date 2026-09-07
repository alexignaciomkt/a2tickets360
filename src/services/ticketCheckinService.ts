import { API_BASE_URL } from '@/services/api';
import { supabase } from '@/lib/supabase';

export interface CheckinValidationResponse {
    code: 'VALID' | 'ALREADY_USED' | 'INVALID_QR' | 'WRONG_EVENT' | 'PAYMENT_INVALID' | 'CANCELLED' | 'INACTIVE';
    message: string;
    ticket?: {
        id: string;
        buyerName: string | null;
        ticketId: string;
        isCourtesy: boolean;
    };
    validatedAt?: string;
    operatorId?: string;
}

export const ticketCheckinService = {
    validateTicket: async (qrCode: string, eventId: string): Promise<CheckinValidationResponse> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Não autenticado');

        
        
        const response = await fetch(`${API_BASE_URL}/api/checkin/tickets/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ qrCode, eventId })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erro ao validar ingresso');
        }

        return await response.json();
    },

    undoCheckin: async (qrCode: string, eventId: string, reason: string): Promise<void> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Não autenticado');

        

        const response = await fetch(`${API_BASE_URL}/api/checkin/tickets/undo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ qrCode, eventId, reason })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erro ao desfazer check-in');
        }
    }
};
