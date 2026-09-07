import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { organizers, producerAlbums } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

const router = new Hono();

const supabaseUrl = 'https://osfnqpehvhznrecljjjf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

const BUCKET_NAME = 'event-assets';

router.use('/presign', authMiddleware);
router.use('/banner', authMiddleware);

router.post('/presign', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = payload.id;

    const body = await c.req.json();
    const { type, fileName, contentType, fileSize, albumId } = body;

    if (type !== 'profile-avatar' && type !== 'producer-logo' && type !== 'producer-banner' && type !== 'cms-hero-banner' && type !== 'producer-album-photo' && type !== 'producer-watermark') {
      return c.json({ error: 'Invalid upload type' }, 400);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(contentType)) {
      return c.json({ error: 'Invalid Content-Type. Only JPEG, PNG, and WebP are allowed.' }, 400);
    }

    const size = Number(fileSize);
    if (isNaN(size) || size <= 0) {
      return c.json({ error: 'Invalid file size' }, 400);
    }
    
    if (type === 'producer-watermark') {
      if (contentType !== 'image/png' && contentType !== 'image/webp') {
        return c.json({ error: 'Watermark must be PNG or WEBP' }, 400);
      }
      if (size > 5 * 1024 * 1024) {
        return c.json({ error: 'Watermark size exceeds 5MB limit' }, 400);
      }
    } else if (type === 'producer-logo' && size > 5 * 1024 * 1024) {
      return c.json({ error: 'Logo size exceeds 5MB limit' }, 400);
    } else if ((type === 'producer-banner' || type === 'cms-hero-banner' || type === 'producer-album-photo') && size > 10 * 1024 * 1024) {
      return c.json({ error: 'Image size exceeds 10MB limit' }, 400);
    }

    const ext = fileName.split('.').pop() || 'jpg';
    let folder = '';
    let objectKey = '';
    
    if (type === 'cms-hero-banner') {
      objectKey = `cms/hero-banners/${uuidv4()}.${ext}`;
    } else if (type === 'profile-avatar') {
      if (size > 5 * 1024 * 1024) {
        return c.json({ error: 'Avatar size exceeds 5MB limit' }, 400);
      }
      objectKey = `profile-avatar/${userId}/${uuidv4()}.${ext}`;
    } else if (type === 'producer-album-photo') {
      if (!albumId) {
        return c.json({ error: 'albumId is required for this upload type' }, 400);
      }
      
      const [organizer] = await db.select().from(organizers).where(eq(organizers.userId, userId)).limit(1);
      if (!organizer) {
        return c.json({ error: 'Organizer not found' }, 404);
      }
      
      const [album] = await db.select().from(producerAlbums)
        .where(and(eq(producerAlbums.id, albumId), eq(producerAlbums.organizerId, organizer.id)))
        .limit(1);
        
      if (!album) {
        return c.json({ error: 'Album not found or access denied' }, 404);
      }

      const producerSlug = (organizer.slug || organizer.companyName || 'producer').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const shortUuid = organizer.id.split('-')[0];
      const fileUuid = uuidv4();
      
      objectKey = `producers/${producerSlug}__${shortUuid}/albums/${album.id}/photos/${fileUuid}.${ext}`;
    } else if (type === 'producer-watermark') {
      const [organizer] = await db.select().from(organizers).where(eq(organizers.userId, userId)).limit(1);
      if (!organizer) {
        return c.json({ error: 'Organizer not found' }, 404);
      }
      const producerSlug = (organizer.slug || organizer.companyName || 'producer').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const shortUuid = organizer.id.split('-')[0];
      const fileUuid = uuidv4();
      
      objectKey = `producers/${producerSlug}__${shortUuid}/identity/watermark/${fileUuid}.${ext}`;
    } else {
      folder = type === 'producer-logo' ? 'logo' : 'banner';
      objectKey = `producers/${userId}/${folder}/${uuidv4()}.${ext}`;
    }

    const baseUrl = process.env.API_URL || (c.req.header('origin') || '');
    const presignedUrl = `${baseUrl}/api/uploads/direct/${encodeURIComponent(objectKey)}`;

    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(objectKey);
    const publicUrl = publicData.publicUrl;

    return c.json({
      presignedUrl,
      objectKey,
      publicUrl
    });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return c.json({ error: 'Failed to generate upload URL' }, 500);
  }
});

router.put('/direct/:key', async (c: Context) => {
    try {
        const key = decodeURIComponent(c.req.param('key'));
        const arrayBuffer = await c.req.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = c.req.header('content-type') || 'application/octet-stream';

        const { error } = await supabase.storage.from(BUCKET_NAME).upload(key, buffer, {
            contentType,
            upsert: true
        });

        if (error) {
            console.error('Error uploading to Supabase:', error);
            return c.json({ error: 'Failed to upload' }, 500);
        }

        return c.text('OK');
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});


router.post('/banner', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (payload.role !== 'organizer' && payload.role !== 'master') {
      return c.json({ error: 'Acesso negado. Apenas organizadores podem fazer upload de banner.' }, 403);
    }

    const userId = payload.id;
    const body = await c.req.parseBody();
    const file = body['file'] as File;

    if (!file) {
      return c.json({ error: 'Nenhum arquivo enviado.' }, 400);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return c.json({ error: 'Tipo de arquivo inválido. Apenas JPEG, PNG e WebP são permitidos.' }, 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'O tamanho da imagem excede o limite de 10MB.' }, 400);
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const objectKey = `producers/${userId}/banner/${uuidv4()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(objectKey, buffer, {
        contentType: file.type,
        upsert: true
    });

    if (error) {
        throw error;
    }

    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(objectKey);

    return c.json({
      success: true,
      key: objectKey,
      url: publicData.publicUrl
    });

  } catch (error: any) {
    console.error('[UPLOADS] Erro ao enviar banner:', error);
    return c.json({ error: 'Falha no upload do arquivo.' }, 500);
  }
});

export default router;
