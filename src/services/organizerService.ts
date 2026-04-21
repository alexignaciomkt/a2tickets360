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
        eventsQuery = eventsQuery.eq('id', eventId);
      }
      const { data: events, error: eventsError } = await eventsQuery;
      if (eventsError) throw eventsError;

      const eventIds = events.map(e => e.id);
      
      // 2. Fetch Sales (Purchased Tickets) with User Profiles
      let salesQuery = supabase
        .from('purchased_tickets')
        .select(`
          id,
          created_at,
          event_id,
          profiles:user_id (
            gender,
            birth_date
          ),
          tickets:ticket_id (
            price,
            name
          )
        `)
        .in('event_id', eventIds)
        .in('status', ['active', 'used', 'confirmed']);

      if (dateRange) {
        salesQuery = salesQuery.gte('created_at', dateRange.from.toISOString()).lte('created_at', dateRange.to.toISOString());
      }

      const { data: sales, error: salesError } = await salesQuery;
      if (salesError) throw salesError;

      const safeSales = sales || [];
      const safeEvents = events || [];

      // 3. Process Metrics
      const totalEvents = safeEvents.length;
      const totalCapacity = safeEvents.reduce((acc, event) => 
        acc + (event.tickets?.reduce((tAcc: number, t: any) => tAcc + (t.quantity || 0), 0) || 0), 0
      );
      const ticketsSold = safeSales.length;
      
      const currentRevenue = safeSales.reduce((acc, sale: any) => acc + (sale.tickets?.price || 0), 0);
      
      const estimatedRevenue = safeEvents.reduce((acc, event) => 
        acc + (event.tickets?.reduce((tAcc: number, t: any) => tAcc + ((t.price || 0) * (t.quantity || 0)), 0) || 0), 0
      );

      // 4. Sales by Period
      const periodMap: Record<string, { date: string, sales: number, revenue: number }> = {};
      safeSales.forEach((sale: any) => {
        if (!sale.created_at) return;
        const date = sale.created_at.split('T')[0];
        if (!periodMap[date]) periodMap[date] = { date, sales: 0, revenue: 0 };
        periodMap[date].sales++;
        periodMap[date].revenue += (sale.tickets?.price || 0);
      });
      const salesByPeriod = Object.values(periodMap).sort((a, b) => a.date.localeCompare(b.date));

      // 5. Demographics: Gender
      const genderMap: Record<string, number> = { 'Masculino': 0, 'Feminino': 0, 'Outro': 0, 'Não Informado': 0 };
      safeSales.forEach((sale: any) => {
        const gender = sale.profiles?.gender || 'Não Informado';
        const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
        if (genderMap[normalizedGender] !== undefined) genderMap[normalizedGender]++;
        else genderMap['Não Informado']++;
      });
      const salesByGender = Object.entries(genderMap).map(([name, value]) => ({ name, value }));

      // 6. Demographics: Age
      const ageRanges = [
        { label: '< 18', min: 0, max: 17 },
        { label: '18-25', min: 18, max: 25 },
        { label: '26-35', min: 26, max: 35 },
        { label: '36-45', min: 36, max: 45 },
        { label: '46-60', min: 46, max: 60 },
        { label: '60+', min: 61, max: 150 }
      ];
      const ageStats = ageRanges.map(r => ({ name: r.label, value: 0 }));
      
      safeSales.forEach((sale: any) => {
        if (sale.profiles?.birth_date) {
          try {
            const birthDate = new Date(sale.profiles.birth_date);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            const range = ageRanges.find(r => age >= r.min && age <= r.max);
            if (range) {
              const stat = ageStats.find(s => s.name === range.label);
              if (stat) stat.value++;
            }
          } catch (e) {
            console.warn('Invalid birth date for sale:', sale.id);
          }
        }
      });

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
          salesByPeriod,
          salesByGender,
          salesByAge: ageStats
        }
      };
    } catch (e) {
      console.error('Error calculating BI stats:', e);
      return {
        kpis: {
          totalEvents: 0,
          ticketsGenerated: 0,
          ticketsSold: 0,
          currentRevenue: 0,
          estimatedRevenue: 0,
          occupancyRate: 0
        },
        charts: {
          salesByPeriod: [],
          salesByGender: [],
          salesByAge: []
        }
      };
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
      .limit(1);
    
    if (error) {
       console.error('Error in getProducerBySlug:', error);
    }

    const row = data && data.length > 0 ? data[0] : null;
    
    if (error || !row) return null;
    
    return {
      id: row.user_id,
      user_id: row.user_id,
      name: row.company_name,
      company_name: row.company_name,
      avatar: row.logo_url,
      logo_url: row.logo_url,
      banner_url: row.banner_url,
      bio: row.bio,
      location: row.company_address || row.city,
      city: row.city,
      state: row.state,
      website: row.website_url,
      instagram_url: row.instagram_url,
      facebook_url: row.facebook_url,
      whatsapp_number: row.whatsapp_number,
      category: row.category,
      ...row 
    };
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
      'facebookUrl': 'facebook_url',
      'whatsappNumber': 'whatsapp_number',
      'websiteUrl': 'website_url',
      'companyAddress': 'company_address',
      'lastStep': 'last_step',
    };

    const profileUpdate: any = {};
    const detailsUpdate: any = {};

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
        
        // Ensure documents are always prioritized if present in data
        if (data.documentFrontUrl) detailsUpdate.document_front_url = data.documentFrontUrl;
        if (data.documentBackUrl) detailsUpdate.document_back_url = data.documentBackUrl;

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
}

export const organizerService = new OrganizerService();
export default organizerService;
