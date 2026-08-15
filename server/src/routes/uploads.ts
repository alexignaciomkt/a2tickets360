import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

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
    const payload = c.get('jwtPayload');
    if (!payload || !payload.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = payload.id;

    const body = await c.req.json();
    const { type, fileName, contentType, fileSize } = body;

    // Validate type
    if (type !== 'producer-logo' && type !== 'producer-banner' && type !== 'cms-hero-banner') {
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
    
    if (type === 'producer-logo' && size > 5 * 1024 * 1024) {
      return c.json({ error: 'Logo size exceeds 5MB limit' }, 400);
    }
    if ((type === 'producer-banner' || type === 'cms-hero-banner') && size > 10 * 1024 * 1024) {
      return c.json({ error: 'Banner size exceeds 10MB limit' }, 400);
    }

    // Generate object key securely
    const ext = fileName.split('.').pop() || 'jpg';
    let folder = '';
    let objectKey = '';
    if (type === 'cms-hero-banner') {
      objectKey = `cms/hero-banners/${uuidv4()}.${ext}`;
    } else {
      folder = type === 'producer-logo' ? 'logo' : 'banner';
      objectKey = `producers/${userId}/${folder}/${uuidv4()}.${ext}`;
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });

    // URL expires in 5 minutes (300 seconds)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const endpoint = process.env.MINIO_ENDPOINT || 'https://s3.a2tickets360.com.br';
    const publicUrl = `${endpoint}/${BUCKET_NAME}/${objectKey}`;

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

export default router;
