import { supabase, supabaseAdmin } from '@/lib/supabase';
import { ProfileStatus, MINIO_CONFIG } from '@/lib/supabase-config';
import { webhookService } from './webhookService';

class MasterService {
    // List all organizers (with optional status filter)
    async getOrganizers(status?: ProfileStatus) {
        let query = supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('role', 'organizer');

        if (status) {
            query = query.eq('status', status);
        }

        const { data: profiles, error } = await query.order('created_at', { ascending: false });
        if (error) {
            console.error('Erro ao buscar organizadores (MasterService):', {
                message: error.message,
                details: error.details,
                code: error.code
            });
            throw error;
        }

        // Fetch details independently
        const userIds = profiles.map(p => p.user_id);
        let detailsMap: Record<string, any> = {};
        
        if (userIds.length > 0) {
            const { data: detailsList } = await supabaseAdmin
                .from('organizer_details')
                .select('*')
                .in('user_id', userIds);
                
            if (detailsList) {
                console.log(`[MASTER SERVICE] Detalhes encontrados para ${detailsList.length} usuários.`);
                detailsList.forEach(det => {
                    detailsMap[det.user_id] = det;
                });
            } else {
                console.warn('[MASTER SERVICE] Nenhum detalhe encontrado para os userIds fornecidos.');
            }
        }

        return profiles.map(d => {
            const details = detailsMap[d.user_id] || {};
            
            // Map document URLs explicitly from snake_case
            const docFront = details.document_front_url || details.documentFrontUrl;
            const docBack = details.document_back_url || details.documentBackUrl;

            const item = {
                ...d,
                ...details,
                id: d.id, // Ensure profile ID is the one used by UI
                userId: d.user_id,
                name: details.company_name || d.name || 'Produtor',
                email: d.email,
                companyName: details.company_name || 'Empresa Não Definida',
                status: d.status as ProfileStatus,
                profileComplete: d.profile_complete || false,
                createdAt: d.created_at,
                updatedAt: d.updated_at,
                phone: details.phone,
                mobilePhone: details.phone,
                // Explicit camelCase mapping for document URLs (modal expects both formats)
                documentFrontUrl: docFront || null,
                documentBackUrl: docBack || null,
                document_front_url: docFront || null,
                document_back_url: docBack || null,
                // Additional fields the modal expects
                slug: details.slug || null,
                bio: details.bio || null,
                cpf: details.cpf || null,
                cnpj: details.cnpj || null,
                address: details.address || null,
                city: details.city || null,
                state: details.state || null,
                postalCode: details.postal_code || null,
                logoUrl: details.logo_url || details.logoUrl || null,
                bannerUrl: details.banner_url || details.bannerUrl || null,
                logo_url: details.logo_url || details.logoUrl || null,
                banner_url: details.banner_url || details.bannerUrl || null,
                asaas_key: details.asaas_key || details.asaasApiKey || null,
            };

            if (!docFront) {
                console.warn(`[MASTER SERVICE] Documento frontal ausente para o produtor: ${item.email}`);
            }

            return item;
        });
    }

    // Get pending organizers (awaiting approval)
    async getPendingOrganizers() {
        return this.getOrganizers('pending');
    }

    // List all customers (Leads/Mailing Global)
    async getAllCustomers() {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('role', 'customer')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Erro ao buscar clientes (MasterService):', error);
            throw error;
        }
        return data;
    }

    // Approve an organizer
    async approveOrganizer(profileDocId: string, masterUserId: string) {
        return supabase
            .from('profiles')
            .update({
                status: 'approved'
            })
            .eq('id', profileDocId);
    }

    // Reject an organizer
    async rejectOrganizer(profileDocId: string) {
        return supabase
            .from('profiles')
            .update({
                status: 'rejected'
            })
            .eq('id', profileDocId);
    }

    // Suspend an organizer
    async suspendOrganizer(profileDocId: string) {
        return supabase
            .from('profiles')
            .update({
                status: 'suspended'
            })
            .eq('id', profileDocId);
    }

    // Reactivate a suspended organizer
    async reactivateOrganizer(profileDocId: string) {
        return supabase
            .from('profiles')
            .update({
                status: 'approved'
            })
            .eq('id', profileDocId);
    }

    // Get all events (for approval)
    async getAllEvents() {
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    // Get all events with full organizer data (for history and management)
    async getAllEventsWithOrganizers() {
        const { data: events, error } = await supabaseAdmin
            .from('events')
            .select(`
                *,
                tickets (*)
            `)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        if (!events || events.length === 0) return [];

        const organizerIds = [...new Set(events.map(e => e.organizer_id))];
        
        let profilesMap: Record<string, any> = {};
        let detailsMap: Record<string, any> = {};

        if (organizerIds.length > 0) {
            const [{ data: profiles }, { data: details }] = await Promise.all([
                supabaseAdmin.from('profiles').select('*').in('user_id', organizerIds),
                supabaseAdmin.from('organizer_details').select('*').in('user_id', organizerIds)
            ]);
            
            if (profiles) profiles.forEach(p => { profilesMap[p.user_id] = p; });
            if (details) details.forEach(d => { detailsMap[d.user_id] = d; });
        }

        return events.map(event => {
            const profile = profilesMap[event.organizer_id] || {};
            const details = detailsMap[event.organizer_id] || {};

            return {
                ...event,
                bannerUrl: event.banner_url,
                imageUrl: event.banner_url,
                startDate: event.start_date,
                endDate: event.end_date,
                locationName: event.location_name,
                locationAddress: event.address,
                locationCity: event.city,
                locationState: event.state,
                eventType: event.event_type,
                tickets: (event.tickets || []).map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    price: t.price,
                    quantity: t.quantity,
                    remaining: t.remaining,
                    category: t.category
                })),
                organizer: {
                    userId: event.organizer_id,
                    name: profile.name || 'Produtor',
                    email: profile.email || '',
                    status: profile.status || 'pending',
                    profileComplete: profile.profile_complete || false,
                    companyName: details.company_name || profile.name || '',
                    phone: details.phone || '',
                    cpf: details.cpf || '',
                    cnpj: details.cnpj || '',
                    slug: details.slug || '',
                    logoUrl: details.logo_url || '',
                    documentFrontUrl: details.document_front_url || '',
                    documentBackUrl: details.document_back_url || '',
                }
            };
        });
    }

    // Get pending events (with full organizer data for the approval modal)
    async getPendingEvents() {
        const all = await this.getAllEventsWithOrganizers();
        return all.filter(e => e.status === 'pending');
    }

    // Approve event (Hierarchy Aware)
    async approveEvent(eventDocId: string) {
        // 1. Fetch event to get organizer_id
        const { data: event, error: evErr } = await supabaseAdmin
            .from('events')
            .select('organizer_id, title')
            .eq('id', eventDocId)
            .single();
        
        if (evErr || !event) throw new Error('Evento não encontrado.');

        // 2. Check organizer status
        const { data: profile, error: profErr } = await supabaseAdmin
            .from('profiles')
            .select('status')
            .eq('user_id', event.organizer_id)
            .single();

        if (profErr || !profile) throw new Error('Perfil do produtor não encontrado.');

        if (profile.status !== 'approved') {
            throw new Error(`Aprovação bloqueada: O produtor do evento "${event.title}" ainda não foi aprovado pela administração.`);
        }

        const result = await supabaseAdmin
            .from('events')
            .update({ status: 'published' })
            .eq('id', eventDocId);
        
        // Dispatch webhook for event approval
        webhookService.dispatch('event_approved', {
            eventId: eventDocId,
            status: 'published',
            approvedAt: new Date().toISOString()
        });

        return result;
    }

    // Reject event
    async rejectEvent(eventDocId: string, reason?: string) {
        const result = await supabase
            .from('events')
            .update({ status: 'rejected' })
            .eq('id', eventDocId);
        
        webhookService.dispatch('event_rejected', {
            eventId: eventDocId,
            status: 'rejected',
            reason: reason || 'Rejeitado pelo administrador',
            rejectedAt: new Date().toISOString()
        });

        return result;
    }

    // Toggle featured event
    async toggleFeaturedEvent(eventDocId: string, isFeatured: boolean) {
        return supabase
            .from('events')
            .update({ is_featured: isFeatured })
            .eq('id', eventDocId);
    }

    // Platform stats
    async getStats() {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            const [
                { count: totalUsers },
                { count: totalOrganizers },
                { count: pendingOrganizers },
                { count: totalEvents },
                { count: totalSales },
                { count: pendingEvents },
                { count: eventsThisMonth }
            ] = await Promise.all([
                supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
                supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organizer'),
                supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organizer').eq('status', 'pending'),
                supabaseAdmin.from('events').select('*', { count: 'exact', head: true }),
                supabaseAdmin.from('sales').select('*', { count: 'exact', head: true }),
                supabaseAdmin.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabaseAdmin.from('events').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth)
            ]);

            return {
                totalOrganizers: totalOrganizers || 0,
                totalUsers: totalUsers || 0,
                totalEvents: totalEvents || 0,
                totalSales: totalSales || 0,
                pendingOrganizers: pendingOrganizers || 0,
                activeOrganizers: (totalOrganizers || 0) - (pendingOrganizers || 0),
                totalRevenue: 0,
                totalCommissions: 0,
                pendingEvents: pendingEvents || 0,
                eventsThisMonth: eventsThisMonth || 0
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                totalOrganizers: 0,
                totalEvents: 0,
                totalSales: 0,
                pendingOrganizers: 0,
                activeOrganizers: 0,
                totalRevenue: 0,
                totalCommissions: 0,
                pendingEvents: 0,
                eventsThisMonth: 0
            };
        }
    }

    // Update an organizer's profile (Modular aware)
    async updateOrganizer(id: string, data: any, userId: string) {
        const profileFields = ['name', 'email', 'status', 'profile_complete'];
        const detailsFields = [
            'slug', 'company_name', 'bio', 'category', 'logo_url', 'banner_url', 
            'cnpj', 'phone', 'birthDate', 'address', 'city', 'state', 'postalCode'
        ];

        const profileUpdate: any = {};
        const detailsUpdate: any = {};

        Object.keys(data).forEach(key => {
            // Map camelCase to snake_case if needed
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            
            if (profileFields.includes(snakeKey)) profileUpdate[snakeKey] = data[key];
            else if (detailsFields.includes(snakeKey)) detailsUpdate[snakeKey] = data[key];
        });

        const promises = [];

        if (Object.keys(profileUpdate).length > 0) {
            promises.push(supabaseAdmin.from('profiles').update(profileUpdate).eq('id', id));
        }

        if (Object.keys(detailsUpdate).length > 0) {
            promises.push(supabaseAdmin.from('organizer_details').update(detailsUpdate).eq('user_id', userId));
        }

        return Promise.all(promises);
    }

    async approveOrganizerManually(id: string) {
        console.log(`[MASTER SERVICE] Iniciando aprovação administrativa para: ${id}`);
        
        // 1. Get full profile and details to prepare "graduation"
        const { data: profile, error: fetchErr } = await supabaseAdmin
            .from('profiles')
            .select('*, onboarding_feed')
            .eq('id', id)
            .single();

        if (fetchErr || !profile) {
            console.error('[MASTER SERVICE] Perfil não encontrado para aprovação:', fetchErr);
            throw new Error('Não foi possível localizar o perfil para aprovação.');
        }

        const userId = profile.user_id;

        // 2. Update Profile Status to 'approved'
        const { error: updateErr } = await supabaseAdmin
            .from('profiles')
            .update({
                status: 'approved',
                profile_complete: true
            })
            .eq('id', id);

        if (updateErr) throw updateErr;

        // 3. GRADUATION: Ensure record exists in legacy 'organizers' table
        // This is required because events/posts reference organizers.id
        const { data: existingOrg } = await supabaseAdmin
            .from('organizers')
            .select('id')
            .eq('email', profile.email)
            .single();

        let organizerId = existingOrg?.id;

        if (!existingOrg) {
            console.log('[MASTER SERVICE] Criando registro na tabela legado "organizers"...');
            
            // Fetch more details from organizer_details if available
            const { data: details } = await supabaseAdmin
                .from('organizer_details')
                .select('*')
                .eq('user_id', userId)
                .single();

            const { data: newOrg, error: orgInsertErr } = await supabaseAdmin
                .from('organizers')
                .insert({
                    name: profile.name || (details?.company_name) || 'Produtor',
                    email: profile.email,
                    passwordHash: 'PROMOTED_FROM_AUTH', // Placeholder for legacy table requirements
                    companyName: details?.company_name,
                    cnpj: details?.cnpj || details?.cpf_cnpj,
                    phone: details?.phone,
                    slug: details?.slug,
                    logoUrl: details?.logo_url,
                    bannerUrl: details?.banner_url,
                    profileComplete: true,
                    isActive: true
                })
                .select()
                .single();

            if (orgInsertErr) {
                console.error('[MASTER SERVICE] Erro ao criar registro em "organizers":', orgInsertErr);
                // We continue because the profile is already approved, but this is a warning sign
            } else {
                organizerId = newOrg.id;
            }
        }

        // 4. Move Onboarding Feed to organizer_posts
        if (organizerId && profile.onboarding_feed && Array.isArray(profile.onboarding_feed)) {
            console.log(`[MASTER SERVICE] Migrando ${profile.onboarding_feed.length} fotos do feed...`);
            const postsToInsert = profile.onboarding_feed.map(url => ({
                organizerId: organizerId,
                imageUrl: url,
                caption: 'Postado durante onboarding'
            }));

            const { error: postsErr } = await supabaseAdmin
                .from('organizer_posts')
                .insert(postsToInsert);
            
            if (postsErr) console.error('[MASTER SERVICE] Erro ao migrar posts do feed:', postsErr);
        }

        // 5. Cascade approval to events (REMOVIDO: O Master agora aprova cada evento manualmente)
        /*
        await supabaseAdmin
            .from('events')
            .update({ status: 'published' })
            .eq('organizer_id', userId)
            .eq('status', 'pending');
        */

        // 6. Trigger Webhook
        webhookService.dispatch('producer_approved', {
            profileId: id,
            userId: userId,
            status: 'approved',
            timestamp: new Date().toISOString()
        });

        console.log(`[MASTER SERVICE] Aprovação de ${profile.email} concluída com sucesso!`);
        return profile;
    }

    async deleteOrganizer(id: string) {
        console.log(`[MASTER SERVICE] Iniciando exclusão ultra-resiliente para o ID: ${id}`);
        
        let profile = null;
        let userId = null;

        // --- BUSCA MULTI-NÍVEL DE IDENTIDADE ---
        
        // 1. Tentar por ID na tabela de perfis (Padrão)
        const { data: pById } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
        if (pById) {
            console.log('[MASTER SERVICE] Localizado por: Profile ID');
            profile = pById;
        }

        // 2. Tentar por USER_ID (Se o ID passado for o do Auth)
        if (!profile) {
            const { data: pByUid } = await supabaseAdmin.from('profiles').select('*').eq('user_id', id).single();
            if (pByUid) {
                console.log('[MASTER SERVICE] Localizado por: User ID (Auth)');
                profile = pByUid;
            }
        }

        // 3. Tentar via Tabela de Detalhes (Se o ID passado for o ID do registro de Empresa)
        if (!profile) {
            const { data: detail } = await supabaseAdmin.from('organizer_details').select('user_id').eq('id', id).single();
            if (detail) {
                const { data: pByDetail } = await supabaseAdmin.from('profiles').select('*').eq('user_id', detail.user_id).single();
                if (pByDetail) {
                    console.log('[MASTER SERVICE] Localizado via: ID de Detalhes (Empresa)');
                    profile = pByDetail;
                }
            }
        }

        // 4. Tentar via Tabela Legado 'organizers' (Se o ID passado for o ID antigo)
        if (!profile) {
            // Busca por email na tabela profiles usando o email da tabela legado
            const { data: legacyOrg } = await supabaseAdmin.from('organizers').select('email').eq('id', id).single();
            if (legacyOrg) {
                const { data: pByEmail } = await supabaseAdmin.from('profiles').select('*').eq('email', legacyOrg.email).single();
                if (pByEmail) {
                    console.log('[MASTER SERVICE] Localizado via: ID Legado (Organizers Table)');
                    profile = pByEmail;
                }
            }
        }

        if (!profile) {
            console.error('[MASTER SERVICE] ❌ Identidade não encontrada em nenhuma tabela!');
            throw new Error('Organizador não encontrado no banco de dados. Tente atualizar a página.');
        }

        userId = profile.user_id;
        const status = profile.status;
        console.log(`[MASTER SERVICE] ✅ Perfil Identificado: ${profile.email} (Status: ${status})`);

        // 2. Rule: Security Guard (Don't delete active producers with events)
        if (status === 'approved') {
            console.warn('[MASTER SERVICE] Bloqueio: Produtor aprovado não pode ser excluído diretamente.');
            throw new Error('Não é permitido excluir produtores ativos. Suspenda o produtor primeiro.');
        }

        // 3. Conditional Cleanup
        try {
            // Is it a "Full Organizer" or just an "Onboarding Profile"?
            // Onboarding/Pending users might not have organizer_details or events yet.
            
            // 3.1 Try to delete Minio dedicated bucket (soft fail)
            console.log('[MASTER SERVICE] Limpando Storage no Minio...');
            try {
                // Fetch company name for bucket identification if available
                const { data: details } = await supabaseAdmin
                    .from('organizer_details')
                    .select('company_name')
                    .eq('user_id', userId)
                    .single();
                
                const producerName = details?.company_name;
                
                await fetch('/api/minio/delete-bucket', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, producerName })
                });
            } catch (minioErr) {
                console.warn('[MASTER SERVICE] Aviso Minio (ignorado):', minioErr);
            }

            // 3.2 Recursive Data Cleanup (Only if they managed to create events/stands)
            console.log('[MASTER SERVICE] Iniciando limpeza de dependências (se existirem)...');
            
            // Find events linked to this user_id
            const { data: events } = await supabaseAdmin
                .from('events')
                .select('id')
                .eq('organizer_id', userId);

            const eventIds = events?.map(e => e.id) || [];

            if (eventIds.length > 0) {
                console.log(`[MASTER SERVICE] Limpando dados de ${eventIds.length} eventos...`);
                // Cleanup order: Checkins -> exhibitor items -> intermediate data -> events
                await supabaseAdmin.from('checkins').delete().in('event_id', eventIds);
                
                const { data: stands } = await supabaseAdmin.from('stands').select('id').in('event_id', eventIds);
                const standIds = stands?.map(s => s.id) || [];
                if (standIds.length > 0) {
                    await supabaseAdmin.from('exhibitor_leads').delete().in('stand_id', standIds);
                    await supabaseAdmin.from('exhibitor_logistics').delete().in('stand_id', standIds);
                    await supabaseAdmin.from('exhibitor_staff').delete().in('stand_id', standIds);
                    await supabaseAdmin.from('stands').delete().in('id', standIds);
                }

                const { data: sponsors } = await supabaseAdmin.from('sponsors').select('id').in('event_id', eventIds);
                const sponsorIds = sponsors?.map(s => s.id) || [];
                if (sponsorIds.length > 0) {
                    await supabaseAdmin.from('sponsor_installments').delete().in('sponsor_id', sponsorIds);
                    await supabaseAdmin.from('sponsor_deliverables').delete().in('sponsor_id', sponsorIds);
                    await supabaseAdmin.from('sponsors').delete().in('id', sponsorIds);
                }

                await supabaseAdmin.from('sales').delete().in('event_id', eventIds);
                await supabaseAdmin.from('tickets').delete().in('event_id', eventIds);
                await supabaseAdmin.from('visitors').delete().in('event_id', eventIds);
                await supabaseAdmin.from('staff_proposals').delete().in('event_id', eventIds);
                await supabaseAdmin.from('events').delete().in('id', eventIds);
            }

            // 3.3 Delete Direct Organizer Records
            console.log('[MASTER SERVICE] Removendo registros diretos...');
            const { data: quotes } = await supabaseAdmin.from('quotes').select('id').eq('organizer_id', userId);
            const quoteIds = quotes?.map(q => q.id) || [];
            if (quoteIds.length > 0) {
                await supabaseAdmin.from('quote_responses').delete().in('quote_id', quoteIds);
                await supabaseAdmin.from('quotes').delete().in('id', quoteIds);
            }

            await supabaseAdmin.from('staff').delete().eq('organizer_id', userId);
            await supabaseAdmin.from('suppliers').delete().eq('organizer_id', userId);
            await supabaseAdmin.from('organizer_posts').delete().eq('organizer_id', userId);
            await supabaseAdmin.from('organizer_details').delete().eq('user_id', userId);

            // 3.4 DELETE FROM PROFILES
            console.log('[MASTER SERVICE] Deletando linha do perfil...');
            const { error: profileDelErr } = await supabaseAdmin
                .from('profiles')
                .delete()
                .eq('user_id', userId);
            
            if (profileDelErr) throw profileDelErr;

            // 3.5 DELETE FROM AUTH (Critical Admin Action)
            console.log('[MASTER SERVICE] Removendo do Auth do Supabase...');
            const { error: authDelErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (authDelErr) console.warn('[MASTER SERVICE] Falha ao deletar do Auth (ignorado):', authDelErr.message);

            console.log('[MASTER SERVICE] Exclusão concluída com sucesso!');
            return { success: true };

        } catch (err: any) {
            console.error('[MASTER SERVICE] Erro catastrófico na exclusão:', err);
            throw new Error(`Falha na limpeza de dados: ${err.message || 'Erro desconhecido'}`);
        }
    }
}

export const masterService = new MasterService();
export default masterService;
