import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface SiteSection {
    id: string;
    section_key: string;
    title: string;
    subtitle: string;
    bg_image: string;
    cta_text: string;
    cta_link: string;
    is_active: boolean;
    config: any;
}

export interface HeroBanner {
    id: string;
    title: string;
    image_url: string;
    link_url: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

const MAX_HERO_BANNERS = 20;

class CMSService {
    async getSections(): Promise<SiteSection[]> {
        try {
            const { data, error } = await supabase
                .from('site_sections')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error fetching site sections:', e);
            return [];
        }
    }

    async getSectionByKey(key: string): Promise<SiteSection | null> {
        try {
            const { data, error } = await supabase
                .from('site_sections')
                .select('*')
                .eq('section_key', key)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error(`Error fetching section ${key}:`, e);
            return null;
        }
    }

    async updateSection(key: string, updates: any): Promise<void> {
        try {
            const { error } = await supabase
                .from('site_sections')
                .upsert({
                    ...updates,
                    section_key: key,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'section_key' });

            if (error) throw error;
        } catch (e) {
            console.error(`Error updating section ${key}:`, e);
            throw e;
        }
    }

    async getGlobalConfig(key: string): Promise<any> {
        try {
            const { data, error } = await supabase
                .from('site_global_config')
                .select('config_value')
                .eq('config_key', key)
                .maybeSingle();

            if (error) throw error;
            return data?.config_value;
        } catch (e) {
            console.error(`Error fetching global config ${key}:`, e);
            return null;
        }
    }

    async updateGlobalConfig(key: string, value: any): Promise<void> {
        try {
            const { error } = await supabase
                .from('site_global_config')
                .upsert({
                    config_key: key,
                    config_value: value,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (e) {
            console.error(`Error updating global config ${key}:`, e);
            throw e;
        }
    }

    // ========================
    // Hero Banners CRUD
    // ========================

    async getHeroBanners(): Promise<HeroBanner[]> {
        try {
            const { data, error } = await supabase
                .from('hero_banners')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error fetching hero banners:', e);
            return [];
        }
    }

    async getActiveHeroBanners(): Promise<HeroBanner[]> {
        try {
            const { data, error } = await supabase
                .from('hero_banners')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error fetching active hero banners:', e);
            return [];
        }
    }

    async createHeroBanner(banner: { title: string; image_url: string; link_url?: string; is_active?: boolean }): Promise<HeroBanner> {
        // Check max limit
        const existing = await this.getHeroBanners();
        if (existing.length >= MAX_HERO_BANNERS) {
            throw new Error(`Limite máximo de ${MAX_HERO_BANNERS} banners atingido.`);
        }

        const nextOrder = existing.length > 0 ? Math.max(...existing.map(b => b.sort_order)) + 1 : 0;

        const { data, error } = await supabase
            .from('hero_banners')
            .insert({
                title: banner.title,
                image_url: banner.image_url,
                link_url: banner.link_url || '/events',
                is_active: banner.is_active ?? true,
                sort_order: nextOrder,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateHeroBanner(id: string, updates: Partial<HeroBanner>): Promise<void> {
        const { error } = await supabase
            .from('hero_banners')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
    }

    async deleteHeroBanner(id: string): Promise<void> {
        const { error } = await supabase
            .from('hero_banners')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async reorderHeroBanners(orderedIds: string[]): Promise<void> {
        const updates = orderedIds.map((id, index) => 
            supabase.from('hero_banners').update({ sort_order: index }).eq('id', id)
        );
        await Promise.all(updates);
    }

    // ========================
    // FAQ CRUD
    // ========================

    async getFAQs(): Promise<FAQ[]> {
        try {
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error fetching FAQs:', e);
            return [];
        }
    }

    async getActiveFAQs(): Promise<FAQ[]> {
        try {
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error fetching active FAQs:', e);
            return [];
        }
    }

    async createFAQ(faq: { question: string; answer: string; is_active?: boolean }): Promise<FAQ> {
        const { data, error } = await supabase
            .from('faqs')
            .insert({
                question: faq.question,
                answer: faq.answer,
                is_active: faq.is_active ?? true,
                sort_order: 0
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateFAQ(id: string, updates: Partial<FAQ>): Promise<void> {
        const { error } = await supabase
            .from('faqs')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
    }

    async deleteFAQ(id: string): Promise<void> {
        const { error } = await supabase
            .from('faqs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async reorderFAQs(orderedIds: string[]): Promise<void> {
        const updates = orderedIds.map((id, index) => 
            supabase.from('faqs').update({ sort_order: index }).eq('id', id)
        );
        await Promise.all(updates);
    }

    async uploadBannerImage(file: File): Promise<string> {
        try {
            const { api } = await import('@/services/api');
            const presignResponse = await api.post<{ presignedUrl: string, objectKey: string, publicUrl: string }>('/api/uploads/presign', {
                type: 'cms-hero-banner',
                fileName: file.name,
                contentType: file.type || 'image/jpeg',
                fileSize: file.size
            });
            const { presignedUrl, publicUrl } = presignResponse;

            const uploadResponse = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type || 'image/jpeg'
                }
            });

            if (!uploadResponse.ok) {
                throw new Error(`Upload failed with status ${uploadResponse.status}`);
            }

            console.log(`✅ Banner uploaded to MinIO: ${publicUrl}`);
            return publicUrl;
        } catch (err: any) {
            console.error('❌ Falha no upload do banner:', err);
            throw new Error(`Não foi possível enviar a imagem do banner. ${err?.message || ''}`);
        }
    }
}

export const cmsService = new CMSService();
export default cmsService;

