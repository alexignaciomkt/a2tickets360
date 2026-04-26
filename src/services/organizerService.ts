import { supabase } from '@/lib/supabase';
import { MINIO_CONFIG } from '@/lib/supabase-config';
import { webhookService } from './webhookService';
import { Event, Ticket, SalesChannel, FinancialSummary, Sale } from '@/interfaces/organizer';
import { v4 as uuidv4 } from 'uuid';

export interface EventCategory {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

class OrganizerService {
  // Event Categories
  async getEventCategories(): Promise<EventCategory[]> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map(d => ({
        id: d.id,
        name: d.name,
        icon: d.icon || 'tag',
        createdAt: d.created_at
      }));
    } catch (err) {
      console.error('Falha crítica ao buscar categorias do banco de dados:', err);
      // Retornar vazio para que a interface não mostre dados "falsos" enquanto depuramos o banco
      return [];
    }
  }

  async createEventCategory(name: string): Promise<EventCategory> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .insert({ name, icon: 'tag' })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria no Supabase:', error);
        throw error;
      }
      
      console.log('Nova categoria criada:', data);
      return {
        id: data.id,
        name: data.name,
        icon: data.icon,
        createdAt: data.created_at
      };
    } catch (err) {
      console.error('Falha crítica ao criar categoria:', err);
      throw err;
    }
  }

  // Events Management
  async getEvents(organizerId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          tickets (*)
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        startDate: d.start_date,
        date: d.start_date, // Alias para compatibilidade
        endDate: d.end_date,
        locationName: d.location_name,
        address: d.address,
        bannerUrl: d.banner_url,
        imageUrl: d.banner_url, // Alias para compatibilidade
        status: d.status,
        organizerId: d.organizer_id,
        slug: d.slug,
        category: d.category,
        tickets: (d.tickets || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          quantity: t.quantity,
          remaining: t.remaining,
          category: t.category,
          isActive: t.is_active
        }))
      } as unknown as Event));
    } catch (e) {
      console.error('Error fetching events:', e);
      return [];
    }
  }

  async getEvent(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          tickets (*)
        `)
        .eq('id', eventId)
        .single();

      if (error) return null;
      return {
        ...data,
        id: data.id,
        tickets: (data.tickets || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          quantity: t.quantity,
          remaining: t.remaining,
          category: t.category,
          isActive: t.is_active
        }))
      } as unknown as Event;
    } catch {
      return null;
    }
  }

  private combineDateTime(dateStr: string, timeStr: string) {
    if (!dateStr) return null;
    if (!timeStr) return dateStr;
    return `${dateStr}T${timeStr}:00`;
  }

  async createEvent(eventData: any): Promise<Event> {
    // Força o status inicial como 'pending' para fluxo de aprovação master
    // Só permite 'draft' se o usuário salvou explicitamente como rascunho
    const initialStatus = eventData.status === 'draft' ? 'draft' : 'pending';
    
    // Map camelCase to snake_case
    const dbData: any = {
      title: eventData.title,
      slug: eventData.slug || uuidv4().substring(0, 8),
      description: eventData.description,
      category: eventData.category,
      organizer_id: eventData.organizerId,
      status: initialStatus,
      start_date: this.combineDateTime(eventData.date || eventData.startDate, eventData.time),
      end_date: this.combineDateTime(eventData.endDate, eventData.endTime),
      location_name: eventData.locationName,
      address: eventData.locationAddress || eventData.address,
      city: eventData.locationCity || eventData.city,
      state: eventData.locationState || eventData.state,
      postal_code: eventData.locationPostalCode || eventData.postalCode,
      capacity: eventData.capacity || 0,
      event_type: eventData.eventType || 'paid',
      banner_url: eventData.imageUrl || eventData.bannerUrl
    };

    const { data, error } = await supabase
      .from('events')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    // Handle initial tickets if provided
    if (eventData.tickets && eventData.tickets.length > 0) {
      const ticketsData = eventData.tickets.map((t: any) => ({
        event_id: data.id,
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        remaining: t.quantity,
        category: t.category || 'standard'
      }));
      await supabase.from('tickets').insert(ticketsData);
    }

    // Webhook: Evento Criado (dispara para rascunhos e publicações)
    const webhookPayload = {
      eventId: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      eventType: data.event_type,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      locationName: data.location_name,
      address: data.address,
      city: data.city,
      state: data.state,
      capacity: data.capacity,
      bannerUrl: data.banner_url,
      organizerId: data.organizer_id,
      tickets: eventData.tickets || [],
      timestamp: new Date().toISOString()
    };

    webhookService.dispatch('event_created', webhookPayload);

    // Webhook: Evento Publicado (dispara apenas quando o produtor solicitou publicação)
    if (initialStatus === 'pending') {
      webhookService.dispatch('event_published', {
        ...webhookPayload,
        message: `O produtor solicitou a publicação do evento "${data.title}". Evento aguardando análise.`
      });
    }

    return { id: data.id, ...data } as unknown as Event;
  }

  async updateEvent(eventId: string, eventData: any): Promise<Event> {
    // Map camelCase to snake_case
    const dbData: any = {};
    if (eventData.title) dbData.title = eventData.title;
    if (eventData.description) dbData.description = eventData.description;
    if (eventData.category) dbData.category = eventData.category;
    if (eventData.date || eventData.startDate) dbData.start_date = this.combineDateTime(eventData.date || eventData.startDate, eventData.time);
    if (eventData.endDate) dbData.end_date = this.combineDateTime(eventData.endDate, eventData.endTime);
    if (eventData.locationName) dbData.location_name = eventData.locationName;
    if (eventData.locationAddress || eventData.address) dbData.address = eventData.locationAddress || eventData.address;
    if (eventData.locationCity || eventData.city) dbData.city = eventData.locationCity || eventData.city;
    if (eventData.locationState || eventData.state) dbData.state = eventData.locationState || eventData.state;
    if (eventData.locationPostalCode || eventData.postalCode) dbData.postal_code = eventData.locationPostalCode || eventData.postalCode;
    if (eventData.capacity !== undefined) dbData.capacity = eventData.capacity;
    if (eventData.eventType) dbData.event_type = eventData.eventType;
    if (eventData.imageUrl || eventData.bannerUrl) dbData.banner_url = eventData.imageUrl || eventData.bannerUrl;
    if (eventData.status) dbData.status = eventData.status;

    const { data, error } = await supabase
      .from('events')
      .update(dbData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return { id: data.id, ...data } as unknown as Event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }

  async createTicket(eventId: string, ticketData: any): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        event_id: eventId,
        name: ticketData.name,
        price: ticketData.price,
        quantity: ticketData.quantity,
        remaining: ticketData.quantity,
        category: ticketData.category || 'standard',
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return { id: data.id, ...data } as unknown as Ticket;
  }

  async updateTicket(ticketId: string, ticketData: any): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .update({
        name: ticketData.name,
        price: ticketData.price,
        quantity: ticketData.quantity,
        remaining: ticketData.remaining,
        category: ticketData.category,
        is_active: ticketData.isActive
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return { id: data.id, ...data } as unknown as Ticket;
  }

  async deleteTicket(ticketId: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId);

    if (error) throw error;
  }

  async getTickets(eventId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw error;
    return data.map(d => ({ id: d.id, ...d } as unknown as Ticket));
  }

  // Image Upload — organizando por cargo (producers, customers, staff)
  private sanitizePathName(name: string): string {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async uploadImage(file: File, userId?: string, producerName?: string, customFileName?: string, role: string = 'producer'): Promise<{ url: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = customFileName ? `${customFileName}.${fileExt}` : `${uuidv4()}.${fileExt}`;
      
      const roleFolder = role === 'organizer' || role === 'producer' ? 'producers' : 
                         role === 'customer' ? 'customers' : 
                         role === 'staff' ? 'staff' : 'others';
      
      let filePath: string;
      if (userId) {
        const sanitized = producerName ? this.sanitizePathName(producerName) : 'user';
        filePath = `${roleFolder}/${sanitized}-${userId}/${fileName}`;
      } else {
        filePath = `public/${fileName}`;
      }

      console.log(`[UPLOAD] Iniciando upload para o MinIO (S3): ${filePath}`);

      const { s3Client } = await import('@/lib/s3-client');
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      const { MINIO_CONFIG } = await import('@/lib/supabase-config');

      // Convert File to ArrayBuffer/Buffer
      const arrayBuffer = await file.arrayBuffer();
      
      const bucketName = MINIO_CONFIG.bucket;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type || 'image/jpeg',
      });

      await s3Client.send(command);

      const publicUrl = `${MINIO_CONFIG.endpoint}/${bucketName}/${filePath}`;
      
      console.log(`✅ Upload concluído via MinIO: ${publicUrl}`);
      return { url: publicUrl };
    } catch (storageError: any) {
      console.error('❌ Falha crítica no upload pelo MinIO:', storageError);
      throw new Error(`Não foi possível carregar a imagem para o MinIO. Erro original: ${storageError?.message || 'Verifique sua conexão.'}`);
    }
  }

  // Stats for Dashboard
  async getStats(organizerId: string): Promise<any> {
    try {
      const [
        { count: totalEvents },
        { data: events }
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('organizer_id', organizerId),
        supabase.from('events').select('title').eq('organizer_id', organizerId).order('created_at', { ascending: false }).limit(1)
      ]);

      return {
        totalEvents: totalEvents || 0,
        visitorCount: 0,
        nextEvent: events?.[0] ? { title: events[0].title } : null,
        totalTicketsSold: 0,
        totalRevenue: 0
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalEvents: 0,
        visitorCount: 0,
        nextEvent: null,
        totalTicketsSold: 0,
        totalRevenue: 0
      };
    }
  }

  // BI Analytics Stats
  async getBIStats(organizerId: string, eventId: string = 'all', dateRange?: { from: Date; to: Date }): Promise<any> {
    try {
      // 1. Fetch Events for this organizer
      let eventsQuery = supabase.from('events').select('*, tickets(*)').eq('organizer_id', organizerId);
      if (eventId !== 'all') {
        const ids = eventId.split(',');
        eventsQuery = eventsQuery.in('id', ids);
      }
      const { data: events, error: eventsError } = await eventsQuery;
      if (eventsError) throw eventsError;

      const eventIds = events.map(e => e.id);
      
      if (eventIds.length === 0) {
        return {
          kpis: { totalEvents: 0, ticketsGenerated: 0, ticketsSold: 0, currentRevenue: 0, estimatedRevenue: 0, occupancyRate: 0 },
          charts: { salesByEvent: [], salesPerformance: [], revenueOverTime: [], salesByGender: [], salesByAge: [], usersByLocation: [] }
        };
      }

      // 2. Fetch Sales (Purchased Tickets) sem JOIN para evitar erros de FK
      let salesQuery = supabase
        .from('purchased_tickets')
        .select('*')
        .in('event_id', eventIds);

      // Descomentar se dataRange for suportado depois, por agora fetch tudo
      // se quisermos, podemos usar as datas depois

      const { data: sales, error: salesError } = await salesQuery;
      if (salesError) {
        console.error('Error fetching sales:', salesError);
        throw salesError;
      }

      const safeSales = sales || [];
      const safeEvents = events || [];

      // 2.1 Fetch Profiles para os usuários das vendas
      const userIds = [...new Set(safeSales.map((s: any) => s.user_id).filter(Boolean))];
      let profilesMap: Record<string, any> = {};
      
      if (userIds.length > 0) {
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, gender, birth_date, city, state')
            .in('user_id', userIds);
            
          if (!profilesError && profilesData) {
            profilesData.forEach((p: any) => {
              profilesMap[p.user_id] = p;
            });
          } else {
            console.warn('Could not fetch profiles demographics:', profilesError);
          }
        } catch (err) {
          console.warn('Exception fetching profiles:', err);
        }
      }

      // Map tickets for quick price lookup (tickets are in events)
      const ticketPriceMap: Record<string, number> = {};
      safeEvents.forEach(e => {
        e.tickets?.forEach((t: any) => {
          ticketPriceMap[t.id] = t.price || 0;
        });
      });

      // Create a map for quick event title lookup
      const eventTitleMap: Record<string, string> = {};
      safeEvents.forEach(e => {
        eventTitleMap[e.id] = e.title || 'Evento Desconhecido';
      });

      // 3. Process KPIs
      const totalEvents = safeEvents.length;
      const totalCapacity = safeEvents.reduce((acc, event) => 
        acc + (event.tickets?.reduce((tAcc: number, t: any) => tAcc + (t.quantity || 0), 0) || 0), 0
      );
      const ticketsSold = safeSales.filter((s: any) => s.status !== 'cancelled' && s.status !== 'refunded').length;
      
      const currentRevenue = safeSales.reduce((acc, sale: any) => {
        if (sale.status === 'cancelled' || sale.status === 'refunded') return acc;
        return acc + (ticketPriceMap[sale.ticket_id] || 0);
      }, 0);
      const estimatedRevenue = safeEvents.reduce((acc, event) => 
        acc + (event.tickets?.reduce((tAcc: number, t: any) => tAcc + ((t.price || 0) * (t.quantity || 0)), 0) || 0), 0
      );

      // 4. Sales by Event (BarChart) - TOP 10
      const eventSalesMap: Record<string, number> = {};
      safeSales.forEach((sale: any) => {
        const title = eventTitleMap[sale.event_id];
        if (title) {
          eventSalesMap[title] = (eventSalesMap[title] || 0) + 1;
        }
      });
      const salesByEvent = Object.entries(eventSalesMap)
        .map(([name, vendas]) => ({ name, vendas }))
        .sort((a, b) => b.vendas - a.vendas)
        .slice(0, 10);

      // 5. Performance by Period (LineChart with multiple events) & Revenue Over Time
      const perfMap: Record<string, any> = {};
      safeSales.forEach((sale: any) => {
        if (!sale.created_at || sale.status === 'cancelled') return;
        const date = sale.created_at.split('T')[0];
        if (!perfMap[date]) {
          perfMap[date] = { date, revenue: 0 };
        }
        
        const title = eventTitleMap[sale.event_id];
        if (title) {
          perfMap[date][title] = (perfMap[date][title] || 0) + 1;
        }
        
        perfMap[date].revenue += (ticketPriceMap[sale.ticket_id] || 0);
      });
      const salesPerformance = Object.values(perfMap).sort((a, b) => a.date.localeCompare(b.date));
      const revenueOverTime = salesPerformance.map(p => ({ date: p.date, revenue: p.revenue }));

      // 6. Demographics: Gender
      const genderMap: Record<string, number> = { 'Masculino': 0, 'Feminino': 0, 'Outros/Não Informado': 0 };
      safeSales.forEach((sale: any) => {
        if (sale.status === 'cancelled') return;
        const profile = profilesMap[sale.user_id] || {};
        let gender = profile.gender;
        if (!gender) gender = 'Outros/Não Informado';
        else {
          gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
          if (!['Masculino', 'Feminino'].includes(gender)) {
            gender = 'Outros/Não Informado';
          }
        }
        genderMap[gender]++;
      });
      const salesByGender = Object.entries(genderMap).map(([name, value]) => ({ name, value })).filter(g => g.value > 0);

      // 7. Demographics: Age
      const ageRanges = [
        { label: '0-18', min: 0, max: 18 },
        { label: '18-24', min: 19, max: 24 },
        { label: '25-34', min: 25, max: 34 },
        { label: '35-44', min: 35, max: 44 },
        { label: '45-54', min: 45, max: 54 },
        { label: '55+', min: 55, max: 150 }
      ];
      const ageStats = ageRanges.map(r => ({ name: r.label, value: 0 }));
      
      safeSales.forEach((sale: any) => {
        if (sale.status === 'cancelled') return;
        const profile = profilesMap[sale.user_id] || {};
        if (profile.birth_date) {
          try {
            const birthDate = new Date(profile.birth_date);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            const range = ageRanges.find(r => age >= r.min && age <= r.max);
            if (range) {
              const stat = ageStats.find(s => s.name === range.label);
              if (stat) stat.value++;
            }
          } catch (e) {}
        }
      });

      // 8. Users by Location
      const locationMap: Record<string, number> = {};
      safeSales.forEach((sale: any) => {
        if (sale.status === 'cancelled') return;
        const profile = profilesMap[sale.user_id] || {};
        let loc = 'Não Informado';
        if (profile.state && profile.city) {
          loc = `${profile.city} - ${profile.state}`;
        } else if (profile.state || profile.city) {
          loc = profile.state || profile.city;
        }
        locationMap[loc] = (locationMap[loc] || 0) + 1;
      });
      const usersByLocation = Object.entries(locationMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return {
        kpis: {
          totalEvents,
          ticketsGenerated: totalCapacity,
          ticketsSold,
          currentRevenue,
          estimatedRevenue: estimatedRevenue || 0,
          occupancyRate: totalCapacity > 0 ? (ticketsSold / totalCapacity) * 100 : 0
        },
        charts: {
          salesByEvent,
          salesPerformance,
          revenueOverTime,
          salesByGender,
          salesByAge: ageStats,
          usersByLocation
        }
      };
    } catch (e) {
      console.error('Error calculating BI stats:', e);
      return null;
    }
  }

  // Profile
  async getProfile(userId: string): Promise<any> {
    try {
      const [
        { data: profile },
        { data: details }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('organizer_details').select('*').eq('user_id', userId).single()
      ]);

      if (!profile) return null;

      return {
        ...profile,
        ...details,
        id: profile.id,
        profileDocId: profile.id
      };
    } catch (e) {
      console.error('Error fetching combined profile:', e);
      return null;
    }
  }

  async getProducerBySlug(slug: string): Promise<any> {
    const { data, error } = await supabase
      .from('organizer_details')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
       console.error('Error in getProducerBySlug:', error);
       return null;
    }
    
    return data;
  }

  // Analytics & Metrics
  async trackView(type: 'event_page' | 'producer_page', id: string, visitorHash?: string): Promise<void> {
    try {
      const data: any = {
        view_type: type,
        visitor_hash: visitorHash || 'anonymous',
      };

      if (type === 'event_page') data.event_id = id;
      else data.producer_id = id;

      // Se for event_page, precisamos do producer_id também para o BI do produtor
      if (type === 'event_page') {
        const { data: event } = await supabase.from('events').select('organizer_id').eq('id', id).single();
        if (event) data.producer_id = event.organizer_id;
      }

      await supabase.from('analytics_views').insert(data);
    } catch (e) {
      console.error('Error tracking view:', e);
    }
  }

  async getAnalyticsSummary(organizerId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('analytics_views')
        .select('view_type, event_id, created_at')
        .eq('producer_id', organizerId);

      if (error) throw error;

      return data;
    } catch (e) {
      console.error('Error fetching analytics summary:', e);
      return [];
    }
  }

  async updateProfile(profileDocId: string, data: any, userId: string): Promise<any> {
    const profileFields = ['name', 'email', 'status', 'profile_complete', 'cpf', 'phone', 'photo_url'];
    // All fields that go to organizer_details (snake_case as stored in DB)
    const detailsFieldsMap: Record<string, string> = {
      'slug': 'slug',
      'companyName': 'company_name',
      'company_name': 'company_name',
      'bio': 'bio',
      'category': 'category',
      'logoUrl': 'logo_url',
      'logo_url': 'logo_url',
      'bannerUrl': 'banner_url',
      'banner_url': 'banner_url',
      'cnpj': 'cnpj',
      'cpf': 'cpf',
      'rg': 'rg',
      'phone': 'phone',
      'birthDate': 'birth_date',
      'address': 'address',
      'city': 'city',
      'state': 'state',
      'postalCode': 'postal_code',
      'documentFrontUrl': 'document_front_url',
      'document_front_url': 'document_front_url',
      'documentBackUrl': 'document_back_url',
      'document_back_url': 'document_back_url',
      'asaasApiKey': 'asaas_key',
      'asaas_key': 'asaas_key',
      'instagramUrl': 'instagram_url',
      'instagram_url': 'instagram_url',
      'facebookUrl': 'facebook_url',
      'facebook_url': 'facebook_url',
      'whatsappNumber': 'whatsapp_number',
      'whatsapp_number': 'whatsapp_number',
      'websiteUrl': 'website_url',
      'website_url': 'website_url',
      'tiktok_url': 'tiktok_url',
      'youtube_url': 'youtube_url',
      'twitter_url': 'twitter_url',
      'linkedin_url': 'linkedin_url',
      'companyAddress': 'company_address',
      'company_address': 'company_address',
      'lastStep': 'last_step',
      'settings': 'settings',
    };

    const profileUpdate: any = {};
    const detailsUpdate: any = {};

    console.log(`[UPDATE_PROFILE] Recebendo dados para atualização:`, data);

    // Trava de segurança para Slug: se vier vazia ou for um UUID, tenta gerar do nome da empresa
    if ((!data.slug || data.slug.length > 20) && (data.companyName || data.name)) {
        const base = data.companyName || data.name || 'produtor';
        detailsUpdate.slug = base.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 30);
    } else if (data.slug) {
        detailsUpdate.slug = data.slug;
    }

    Object.keys(data).forEach(key => {
      // Check profile fields
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (profileFields.includes(snakeKey)) profileUpdate[snakeKey] = data[key];
      // Check details fields (using explicit map)
      if (detailsFieldsMap[key]) {
        detailsUpdate[detailsFieldsMap[key]] = data[key];
      }
    });

    try {
      if (Object.keys(profileUpdate).length > 0) {
        console.log(`[PROFILE] Atualizando perfil do usuário ${userId}...`);
        const { error: pError } = await supabase.from('profiles').update(profileUpdate).eq('user_id', userId);
        if (pError) throw pError;
      }

      if (Object.keys(detailsUpdate).length > 0) {
        console.log(`[DETAILS] Salvando detalhes do organizador (Upsert) para ${userId}...`, detailsUpdate);
        
        // Ensure documents and banner/logo are always prioritized if present in data
        if (data.documentFrontUrl) detailsUpdate.document_front_url = data.documentFrontUrl;
        if (data.documentBackUrl) detailsUpdate.document_back_url = data.documentBackUrl;
        if (data.banner_url) detailsUpdate.banner_url = data.banner_url;
        if (data.logo_url) detailsUpdate.logo_url = data.logo_url;

        const { error: dError } = await supabase
          .from('organizer_details')
          .upsert(
            { ...detailsUpdate, user_id: userId, updated_at: new Date().toISOString() }, 
            { onConflict: 'user_id' }
          );
        
        if (dError) {
          console.error('❌ Erro no Upsert de detalhes:', dError);
          throw dError;
        }
        console.log('✅ Detalhes atualizados com sucesso!');
      }
      return { success: true };
    } catch (e: any) {
      console.error('❌ Erro crítico no updateProfile:', e.message || e);
      throw e;
    }
  }

  async completeProfile(profileDocId: string): Promise<any> {
    return supabase.from('profiles').update({ profile_complete: true }).eq('id', profileDocId);
  }

  // Persist feed posts during onboarding
  async saveFeedPosts(userId: string, posts: any[]): Promise<any> {
    console.log(`[STORAGE] Persistindo ${posts.length} fotos do feed para o usuário ${userId}`);
    
    const postData = posts.map(p => ({
      organizer_id: userId,
      image_url: p.imageUrl,
      caption: p.caption || '', 
      has_caption: !!p.caption,
      created_at: new Date().toISOString()
    }));
    
    return supabase
      .from('organizer_posts')
      .insert(postData);
  }

  async updatePost(postId: string, data: { caption: string }): Promise<any> {
    return supabase
      .from('organizer_posts')
      .update({ 
        caption: data.caption,
        has_caption: !!data.caption
      })
      .eq('id', postId);
  }

  async deletePost(postId: string): Promise<any> {
    return supabase
      .from('organizer_posts')
      .delete()
      .eq('id', postId);
  }

  async getPosts(organizerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('organizer_posts')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(p => ({
        id: p.id,
        caption: p.caption,
        imageUrl: p.image_url,
        createdAt: p.created_at
    }));
  }
  // Product Management (Ecommerce)
  async getProducts(organizerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (*)
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        price: d.price,
        salePrice: d.sale_price,
        imageUrl: d.image_url,
        images: d.images,
        status: d.status,
        hasVariants: d.has_variants,
        deliveryOptions: d.delivery_options,
        stockStrategy: d.stock_strategy,
        totalStock: d.total_stock,
        isFeatured: d.is_featured,
        variants: d.product_variants || []
      }));
    } catch (e) {
      console.error('Error fetching products:', e);
      return [];
    }
  }

  async saveProduct(organizerId: string, productData: any): Promise<any> {
    const { variants, ...baseData } = productData;

    // Map frontend to snake_case
    const dbData = {
      organizer_id: organizerId,
      name: baseData.name,
      description: baseData.description,
      price: baseData.price,
      sale_price: baseData.originalPrice || baseData.salePrice,
      image_url: baseData.image || baseData.imageUrl,
      category_id: baseData.categoryId,
      status: baseData.status || 'active',
      has_variants: baseData.hasVariants,
      delivery_options: baseData.deliveryOptions || { pickup: true, shipping: false },
      stock_strategy: baseData.hasVariants ? 'by_variant' : 'total',
      total_stock: baseData.hasVariants ? 0 : (baseData.stock || 0),
      is_featured: baseData.featured || baseData.isFeatured
    };

    let productId = baseData.id;
    let result;

    if (productId) {
      const { data, error } = await supabase
        .from('products')
        .update(dbData)
        .eq('id', productId)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      result = data;
      productId = data.id;
    }

    // Handle Variants
    if (variants && variants.length > 0) {
      // Simple strategy: delete and recreation for updates
      if (baseData.id) {
        await supabase.from('product_variants').delete().eq('product_id', productId);
      }

      const variantData = variants.map((v: any) => ({
        product_id: productId,
        name: v.name,
        attributes: v.attributes || {},
        stock: v.stock || 0,
        price: v.price || null,
        sku: v.sku || null
      }));

      const { error: vError } = await supabase.from('product_variants').insert(variantData);
      if (vError) throw vError;
    }

    return result;
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
  }

  async getProductOrders(organizerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('product_orders')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getStoreOrders(organizerId: string): Promise<any[]> {
    return this.getProductOrders(organizerId);
  }
}

export const organizerService = new OrganizerService();
export default organizerService;
