import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { organizers, producerAlbums } from '../db/schema';
import { eq, and } from 'drizzle-orm';
const router = new Hono();
router.use('/*', authMiddleware);

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'https://s3.a2tickets360.com.br',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  region: process.env.MINIO_REGION || 'us-east-1',
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'a2tickets360';

router.post('/presign', async (c: Context) => {
  try {
    console.log('[PRESIGN 1] request recebido');
    const payload = c.get('jwtPayload');
    if (!payload || !payload.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    console.log('[PRESIGN 2] user validado', payload.id);
    const userId = payload.id;

    const body = await c.req.json();
    const { type, fileName, contentType, fileSize, albumId } = body;

    // Validate type
    if (type !== 'producer-logo' && type !== 'producer-banner' && type !== 'cms-hero-banner' && type !== 'producer-album-photo' && type !== 'producer-watermark') {
      return c.json({ error: 'Invalid upload type' }, 400);
    }

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(contentType)) {
      return c.json({ error: 'Invalid Content-Type. Only JPEG, PNG, and WebP are allowed.' }, 400);
    }

    // Validate file size
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

    // Generate object key securely
    const ext = fileName.split('.').pop() || 'jpg';
    let folder = '';
    let objectKey = '';
    if (type === 'cms-hero-banner') {
      objectKey = `cms/hero-banners/${uuidv4()}.${ext}`;
    } else if (type === 'producer-album-photo') {
      if (!albumId) {
        return c.json({ error: 'albumId is required for this upload type' }, 400);
      }
      
      // Resolve organizer and ownership
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

      // sanitize slug
      const producerSlug = (organizer.slug || organizer.companyName || 'producer').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const shortUuid = organizer.id.split('-')[0];
      const fileUuid = uuidv4();
      
      objectKey = `producers/${producerSlug}__${shortUuid}/albums/${album.id}/photos/${fileUuid}.${ext}`;
    } else if (type === 'producer-watermark') {
      // Resolve organizer and ownership
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

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });
    console.log(`[PRESIGN 3] objectKey gerado: ${objectKey}`);

    // URL expires in 5 minutes (300 seconds)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    console.log('[PRESIGN 4] signedUrl gerada');

    const endpoint = process.env.MINIO_ENDPOINT || 'https://s3.a2tickets360.com.br';
    const publicUrl = `${endpoint}/${BUCKET_NAME}/${objectKey}`;
    console.log(`[PRESIGN 5] publicUrl retornada: ${publicUrl}`);

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

    // Validate MIME
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return c.json({ error: 'Tipo de arquivo inválido. Apenas JPEG, PNG e WebP são permitidos.' }, 400);
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'O tamanho da imagem excede o limite de 10MB.' }, 400);
    }

    // Generate secure key
    const ext = file.name.split('.').pop() || 'jpg';
    const objectKey = `producers/${userId}/banner/${uuidv4()}.${ext}`;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // PutObject directly via SDK
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
    });

    // Implement a 60s timeout for the AWS SDK call by wrapping it in Promise.race or abortController if needed,
    // though the S3Client will respect its internal timeouts. We'll rely on node-fetch or internal http agent.
    
    await s3Client.send(command);

    const endpoint = process.env.MINIO_ENDPOINT || 'https://s3.a2tickets360.com.br';
    const publicUrl = `${endpoint}/${BUCKET_NAME}/${objectKey}`;

    return c.json({
      success: true,
      key: objectKey,
      url: publicUrl
    });

  } catch (error: any) {
    console.error('[UPLOADS] Erro ao enviar banner:', error);
    return c.json({ error: 'Falha no upload do arquivo.' }, 500);
  }
});

export default router;
