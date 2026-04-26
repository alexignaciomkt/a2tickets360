import { supabase } from '@/lib/supabase';

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    endDate?: string;
    bannerUrl: string;
    imageUrl: string;
    heroImageUrl?: string;
    category: string;
    status: 'pending' | 'published' | 'cancelled';
    isFeatured: boolean;
    location: {
        name: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
    };
    organizer?: {
        id: string;
        name: string;
        email: string;
        slug: string;
        logoUrl?: string;
        description?: string;
    };
    ticket_design?: {
        template: string;
        primaryColor: string;
        secondaryColor: string;
        textColor: string;
    };
    gallery_urls?: string[];
    faqs?: { question: string; answer: string }[];
    duration?: string;
    time?: string;
    tickets: any[];
}

class EventService {
    private mapEvent(d: any): Event {
        const organizer = d.organizer || d.user_profiles || {};
        // Ajustado para lidar com objeto ou array vindo do Supabase
        const detailsData = organizer.details || organizer.organizer_details || {};
        const details = Array.isArray(detailsData) ? (detailsData[0] || {}) : detailsData;
        
        return {
            ...d,
            id: d.id,
            bannerUrl: d.banner_url,
            imageUrl: d.banner_url || d.image_url,
            date: d.start_date,
            endDate: d.end_date, // Incluindo end_date para tags dinâmicas
            isFeatured: d.is_featured,
            location: {
                name: d.location_name,
                address: d.address,
                city: d.city || 'Brasil',
                state: d.state || '',
                postalCode: d.postal_code || ''
            },
            organizer: {
                id: organizer.id,
                name: details.company_name || organizer.name || 'Organizador',
                email: organizer.email,
                slug: details.slug || '',
                logoUrl: details.logo_url || '',
                description: details.description || details.bio || organizer.bio || ''
            },
            ticket_design: d.ticket_design || {
                template: 'modern',
                primaryColor: '#4F46E5',
                secondaryColor: '#7C3AED',
                textColor: '#FFFFFF'
            },
            gallery_urls: d.gallery_urls || d.settings?.gallery_urls || [],
            faqs: d.event_faqs || d.settings?.faqs || [],
            duration: d.duration || '4',
            time: d.start_date ? new Date(d.start_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
            tickets: d.tickets || []
        } as Event;
    }

    async getPublicEvents(): Promise<Event[]> {
        try {
            // Regra de Visibilidade: Eventos encerrados somem após 48 horas
            const boundary = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('events')
                .select('*, tickets(*)')
                .eq('status', 'published')
                .or(`end_date.is.null,end_date.gte.${boundary}`) // Mostra ativos ou encerrados há menos de 48h
                .order('start_date', { ascending: true }); // Ordena por data do evento

            if (error) throw error;
            return data.map(d => this.mapEvent(d));
        } catch (e) {
            console.error('Error fetching public events:', e);
            return [];
        }
    }

    async getFeaturedEvents(): Promise<Event[]> {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*, tickets(*)')
                .eq('is_featured', true)
                .eq('status', 'published')
                .limit(10);

            if (error) throw error;
            return data.map(d => this.mapEvent(d));
        } catch (e) {
            console.error('Error fetching featured events:', e);
            return [];
        }
    }

    async getEventById(idOrSlug: string): Promise<Event | null> {
        try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
            
            const { data: eventData, error: eError } = await supabase
                .from('events')
                .select('*, tickets(*), event_faqs(*)')
                .or(isUuid ? `id.eq.${idOrSlug}` : `slug.eq.${idOrSlug}`)
                .maybeSingle();

            if (eError) throw eError;
            if (!eventData) return null;

            if (eventData.organizer_id) {
                const [profileRes, detailsRes] = await Promise.all([
                    supabase.from('profiles').select('*').eq('id', eventData.organizer_id).maybeSingle(),
                    supabase.from('organizer_details').select('*').eq('user_id', eventData.organizer_id).maybeSingle()
                ]);
                
                if (profileRes.data) {
                    const profileData = profileRes.data;
                    if (detailsRes.data) {
                        profileData.details = detailsRes.data;
                    }
                    eventData.organizer = profileData;
                }
            }

            return this.mapEvent(eventData);
        } catch (e) {
            console.error(`Error fetching event ${idOrSlug}:`, e);
            return null;
        }
    }

    async getRankedEventSections(): Promise<{ category: string, events: Event[] }[]> {
        try {
            const allEvents = await this.getPublicEvents();
            if (allEvents.length === 0) return [];

            // 1. Agrupar por Categoria
            const categoriesMap: Record<string, Event[]> = {};
            allEvents.forEach(event => {
                const cat = event.category?.split(' / ')[0] || 'Geral';
                if (!categoriesMap[cat]) categoriesMap[cat] = [];
                categoriesMap[cat].push(event);
            });

            // 2. Criar lista de seções com metadados para ordenação
            const sections = Object.entries(categoriesMap).map(([category, events]) => {
                // Cálculo de tamanho (total de ingressos)
                const totalTickets = events.reduce((acc, ev) => {
                    return acc + (ev.tickets?.reduce((tAcc, t) => tAcc + (t.total_quantity || 0), 0) || 0);
                }, 0);

                // Cálculo de percentual de vendas (Mockado se não houver dados reais)
                const salesPercent = events.reduce((acc, ev) => {
                    const sold = ev.tickets?.reduce((tAcc, t) => tAcc + (t.sold_quantity || 0), 0) || 0;
                    const total = ev.tickets?.reduce((tAcc, t) => tAcc + (t.total_quantity || 0), 1) || 1;
                    return acc + (sold / total);
                }, 0) / events.length;

                return {
                    category,
                    events,
                    totalTickets,
                    salesPercent
                };
            });

            // 3. Ordenação: Alfabética -> Tamanho -> Percentual
            sections.sort((a, b) => {
                if (a.category < b.category) return -1;
                if (a.category > b.category) return 1;
                
                if (b.totalTickets !== a.totalTickets) return b.totalTickets - a.totalTickets;
                return b.salesPercent - a.salesPercent;
            });

            return sections.map(s => ({ category: s.category, events: s.events }));
        } catch (e) {
            console.error('Error fetching ranked event sections:', e);
            return [];
        }
    }
}

export const eventService = new EventService();
export default eventService;
