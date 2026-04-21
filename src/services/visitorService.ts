import { supabase } from '@/lib/supabase';
import { Visitor } from '@/interfaces/visitor';

export const visitorService = {
    // --- Organizer Management ---
    getVisitors: async (eventId: string): Promise<Visitor[]> => {
        try {
            const { data, error } = await supabase
                .from('purchased_tickets')
                .select(`
                    *,
                    profiles:user_id(name, email, phone, cpf, city, state, address, birth_date)
                `)
                .eq('event_id', eventId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(t => ({
                id: t.id,
                name: t.profiles?.name || 'Não informado',
                email: t.profiles?.email || 'Não informado',
                phone: t.profiles?.phone || 'Não informado',
                document: t.profiles?.cpf || 'Não informado',
                city: t.profiles?.city || 'N/A',
                state: t.profiles?.state || 'N/A',
                address: t.profiles?.address || 'N/A',
                birthDate: t.profiles?.birth_date || 'N/A',
                status: t.status === 'used' ? 'checked_in' : 'registered',
                registeredAt: t.created_at,
                checkedInAt: t.validated_at,
                qrCodeData: t.qr_code_data,
                photoUrl: t.photo_url
            })) as any;
        } catch (e) {
            console.error('Error fetching visitors:', e);
            return [];
        }
    },

    // --- Check-in & Validation ---
    validateQrCode: async (qrCode: string): Promise<any> => {
        try {
            const { data, error } = await supabase
                .from('purchased_tickets')
                .select(`
                    *,
                    profiles:user_id(name, email, phone, cpf),
                    events:event_id(title)
                `)
                .eq('qr_code_data', qrCode)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.id,
                name: data.profiles?.name || 'Não informado',
                email: data.profiles?.email || 'Não informado',
                document: data.profiles?.cpf || 'Não informado',
                eventName: data.events?.title || 'Evento não identificado',
                status: data.status === 'used' ? 'checked_in' : 'registered',
                qrCodeData: data.qr_code_data,
                photoUrl: data.photo_url
            };
        } catch (e) {
            console.error('Error validating QR code:', e);
            return null;
        }
    },

    checkIn: async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('purchased_tickets')
                .update({ 
                    status: 'used',
                    validated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Error during check-in:', e);
            return false;
        }
    }
};
