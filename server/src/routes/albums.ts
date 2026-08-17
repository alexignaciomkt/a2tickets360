import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import { db } from '../db';
import { organizers, producerAlbums, producerAlbumPhotos, events } from '../db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

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
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'https://s3.a2tickets360.com.br';

const getOrganizer = async (userId: string) => {
  const [organizer] = await db.select().from(organizers).where(eq(organizers.userId, userId)).limit(1);
  return organizer;
};

// 1. CREATE ALBUM
router.post('/', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload?.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const organizer = await getOrganizer(userId);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const body = await c.req.json();
    const { title, description, eventId, eventDate } = body;

    if (!title || title.length > 100) return c.json({ error: 'Invalid title' }, 400);
    if (description && description.length > 150) return c.json({ error: 'Description too long' }, 400);

    if (eventId) {
      const [evt] = await db.select().from(events).where(and(eq(events.id, eventId), eq(events.organizerId, organizer.id))).limit(1);
      if (!evt) return c.json({ error: 'Event not found or access denied' }, 403);
    }

    const [album] = await db.insert(producerAlbums).values({
      organizerId: organizer.id,
      title,
      description: description || null,
      eventId: eventId || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      status: 'DRAFT',
    }).returning();

    return c.json(album, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 2. LIST ALBUMS
router.get('/', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload?.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const organizer = await getOrganizer(userId);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const allAlbums = await db.select().from(producerAlbums)
      .where(eq(producerAlbums.organizerId, organizer.id))
      .orderBy(asc(producerAlbums.sortOrder), desc(producerAlbums.createdAt));

    const result = [];
    for (const album of allAlbums) {
      const photos = await db.select().from(producerAlbumPhotos).where(eq(producerAlbumPhotos.albumId, album.id));
      const coverPhoto = photos.find(p => p.id === album.coverPhotoId) || null;
      result.push({
        ...album,
        photoCount: photos.length,
        coverPhoto,
      });
    }

    return c.json(result);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 3. GET ALBUM DETAILS
router.get('/:albumId', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload?.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const albumId = c.req.param('albumId');
    const organizer = await getOrganizer(userId);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const [album] = await db.select().from(producerAlbums)
      .where(and(eq(producerAlbums.id, albumId), eq(producerAlbums.organizerId, organizer.id)))
      .limit(1);

    if (!album) return c.json({ error: 'Album not found' }, 404);

    const photos = await db.select().from(producerAlbumPhotos)
      .where(eq(producerAlbumPhotos.albumId, album.id))
      .orderBy(asc(producerAlbumPhotos.sortOrder));

    return c.json({ ...album, photos });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 4. UPDATE ALBUM
router.put('/:albumId', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload?.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const albumId = c.req.param('albumId');
    const organizer = await getOrganizer(userId);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const [album] = await db.select().from(producerAlbums)
      .where(and(eq(producerAlbums.id, albumId), eq(producerAlbums.organizerId, organizer.id)))
      .limit(1);

    if (!album) return c.json({ error: 'Album not found' }, 404);

    const body = await c.req.json();
    const { title, description, eventId, eventDate, sortOrder, coverPhotoId, status } = body;

    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (eventDate !== undefined) updates.eventDate = eventDate ? new Date(eventDate) : null;

    if (eventId !== undefined) {
      if (eventId !== null) {
        const [evt] = await db.select().from(events).where(and(eq(events.id, eventId), eq(events.organizerId, organizer.id))).limit(1);
        if (!evt) return c.json({ error: 'Event not found or access denied' }, 403);
      }
      updates.eventId = eventId;
    }

    if (coverPhotoId !== undefined && coverPhotoId !== null) {
      const [photo] = await db.select().from(producerAlbumPhotos).where(and(eq(producerAlbumPhotos.id, coverPhotoId), eq(producerAlbumPhotos.albumId, album.id))).limit(1);
      if (!photo) return c.json({ error: 'Cover photo not found in this album' }, 400);
      updates.coverPhotoId = coverPhotoId;
    } else if (coverPhotoId === null) {
      updates.coverPhotoId = null;
    }

    let finalStatus = status || album.status;
    let finalCover = updates.coverPhotoId !== undefined ? updates.coverPhotoId : album.coverPhotoId;
    let finalTitle = updates.title !== undefined ? updates.title : album.title;

    if (status === 'PUBLISHED') {
      const photosCountRes = await db.select({ count: sql<number>`count(*)` }).from(producerAlbumPhotos).where(eq(producerAlbumPhotos.albumId, album.id));
      const count = Number(photosCountRes[0].count);
      if (count === 0) return c.json({ error: 'Cannot publish an empty album' }, 400);
      if (!finalTitle || finalTitle.trim().length === 0) return c.json({ error: 'Cannot publish without a title' }, 400);

      if (!finalCover) {
        const photos = await db.select().from(producerAlbumPhotos).where(eq(producerAlbumPhotos.albumId, album.id)).orderBy(asc(producerAlbumPhotos.sortOrder)).limit(1);
        if (photos.length > 0) {
          finalCover = photos[0].id;
          updates.coverPhotoId = finalCover;
        }
      }

      // Snapshot the watermark for all photos missing it
      if (organizer.watermarkUrl && organizer.watermarkObjectKey) {
        await db.execute(sql`
          UPDATE producer_album_photos 
          SET producer_watermark_url = ${organizer.watermarkUrl}, 
              producer_watermark_object_key = ${organizer.watermarkObjectKey}
          WHERE album_id = ${album.id} 
          AND producer_watermark_object_key IS NULL
        `);
      }
    } else if (status && !['DRAFT', 'PUBLISHED', 'HIDDEN'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    if (status) updates.status = status;

    const [updated] = await db.update(producerAlbums)
      .set(updates)
      .where(eq(producerAlbums.id, album.id))
      .returning();

    return c.json(updated);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 5. DELETE ALBUM
router.delete('/:albumId', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload?.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const albumId = c.req.param('albumId');
    const organizer = await getOrganizer(userId);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const [album] = await db.select().from(producerAlbums)
      .where(and(eq(producerAlbums.id, albumId), eq(producerAlbums.organizerId, organizer.id)))
      .limit(1);

    if (!album) return c.json({ error: 'Album not found' }, 404);

    const photos = await db.select().from(producerAlbumPhotos).where(eq(producerAlbumPhotos.albumId, album.id));
    
    if (photos.length > 0) {
      const keys = photos.map(p => ({ Key: p.objectKey }));
      const failedKeys = [];
      
      try {
        // AWS S3 DeleteObjects allows up to 1000 keys per request, but MinIO might require Content-MD5
        // Using concurrent DeleteObjectCommand to avoid MissingContentMD5 error
        for (let i = 0; i < keys.length; i += 50) {
          const batch = keys.slice(i, i + 50);
          await Promise.all(batch.map(async (k) => {
            try {
              const cmd = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: k.Key });
              await s3Client.send(cmd);
            } catch (err: any) {
              failedKeys.push(k.Key);
            }
          }));
        }
      } catch (e: any) {
        console.error('Failed to execute DeleteObject commands:', e);
        return c.json({ error: 'Failed to delete some files from storage' }, 500);
      }
      
      if (failedKeys.length > 0) {
        console.error('Some objects failed to delete:', failedKeys);
        // We can choose to return 500 or just log it. Let's return 500 to be safe.
        return c.json({ error: 'Failed to delete some files from storage', failedKeys }, 500);
      }
    }

    await db.delete(producerAlbums).where(eq(producerAlbums.id, album.id));
    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 6. ADD PHOTO
router.post('/:albumId/photos', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload?.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const albumId = c.req.param('albumId');
    const organizer = await getOrganizer(userId);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const [album] = await db.select().from(producerAlbums)
      .where(and(eq(producerAlbums.id, albumId), eq(producerAlbums.organizerId, organizer.id)))
      .limit(1);

    if (!album) return c.json({ error: 'Album not found' }, 404);

    const body = await c.req.json();
    const { objectKey, caption } = body;

    if (!objectKey) return c.json({ error: 'objectKey is required' }, 400);
    if (caption && caption.length > 150) return c.json({ error: 'Caption too long' }, 400);

    const producerSlug = (organizer.slug || organizer.companyName || 'producer').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const shortUuid = organizer.id.split('-')[0];
    const expectedPrefix = `producers/${producerSlug}__${shortUuid}/albums/${album.id}/photos/`;

    if (!objectKey.startsWith(expectedPrefix)) {
      return c.json({ error: 'objectKey does not match the authorized prefix' }, 403);
    }

    try {
      const headCmd = new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey });
      const headRes = await s3Client.send(headCmd);
      if (!headRes.ContentType || !['image/jpeg', 'image/png', 'image/webp'].includes(headRes.ContentType)) {
        return c.json({ error: 'Invalid Content-Type in storage' }, 400);
      }
    } catch (e: any) {
      console.error('HeadObject error:', e);
      return c.json({ error: 'Object not found in storage' }, 400);
    }

    const publicUrl = `${MINIO_ENDPOINT}/${BUCKET_NAME}/${objectKey}`;

    const existingPhotosRes = await db.select({ count: sql<number>`count(*)` }).from(producerAlbumPhotos).where(eq(producerAlbumPhotos.albumId, album.id));
    const count = Number(existingPhotosRes[0].count);

    const [photo] = await db.insert(producerAlbumPhotos).values({
      albumId: album.id,
      imageUrl: publicUrl,
      objectKey,
      caption: caption || null,
      sortOrder: count,
      producerWatermarkUrl: album.status === 'PUBLISHED' ? organizer.watermarkUrl : null,
      producerWatermarkObjectKey: album.status === 'PUBLISHED' ? organizer.watermarkObjectKey : null,
    }).returning();

    if (count === 0 && !album.coverPhotoId) {
      await db.update(producerAlbums).set({ coverPhotoId: photo.id }).where(eq(producerAlbums.id, album.id));
    }

    return c.json(photo, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 7. EDIT PHOTO
router.put('/:albumId/photos/:photoId', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload?.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { albumId, photoId } = c.req.param();
    const organizer = await getOrganizer(userId);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const [album] = await db.select().from(producerAlbums)
      .where(and(eq(producerAlbums.id, albumId), eq(producerAlbums.organizerId, organizer.id)))
      .limit(1);

    if (!album) return c.json({ error: 'Album not found' }, 404);

    const [photo] = await db.select().from(producerAlbumPhotos)
      .where(and(eq(producerAlbumPhotos.id, photoId), eq(producerAlbumPhotos.albumId, album.id)))
      .limit(1);
      
    if (!photo) return c.json({ error: 'Photo not found' }, 404);

    const body = await c.req.json();
    const { caption, sortOrder } = body;

    const updates: any = {};
    if (caption !== undefined) {
      if (caption && caption.length > 150) return c.json({ error: 'Caption too long' }, 400);
      updates.caption = caption;
    }
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    if (Object.keys(updates).length > 0) {
      const [updated] = await db.update(producerAlbumPhotos).set(updates).where(eq(producerAlbumPhotos.id, photo.id)).returning();
      return c.json(updated);
    }

    return c.json(photo);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 8. DELETE PHOTO
router.delete('/:albumId/photos/:photoId', async (c: Context) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload?.id;
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { albumId, photoId } = c.req.param();
    const organizer = await getOrganizer(userId);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const [album] = await db.select().from(producerAlbums)
      .where(and(eq(producerAlbums.id, albumId), eq(producerAlbums.organizerId, organizer.id)))
      .limit(1);

    if (!album) return c.json({ error: 'Album not found' }, 404);

    const [photo] = await db.select().from(producerAlbumPhotos)
      .where(and(eq(producerAlbumPhotos.id, photoId), eq(producerAlbumPhotos.albumId, album.id)))
      .limit(1);
      
    if (!photo) return c.json({ error: 'Photo not found' }, 404);

    try {
      const cmd = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: photo.objectKey });
      await s3Client.send(cmd);
    } catch (e: any) {
      console.error('Failed to delete object from MinIO', e);
      return c.json({ error: 'Failed to delete file from storage' }, 500);
    }

    await db.delete(producerAlbumPhotos).where(eq(producerAlbumPhotos.id, photo.id));

    const [currentAlbum] = await db.select().from(producerAlbums).where(eq(producerAlbums.id, album.id)).limit(1);
    if (currentAlbum && !currentAlbum.coverPhotoId) {
      const remainingPhotos = await db.select().from(producerAlbumPhotos).where(eq(producerAlbumPhotos.albumId, album.id)).orderBy(asc(producerAlbumPhotos.sortOrder)).limit(1);
      if (remainingPhotos.length > 0) {
        await db.update(producerAlbums).set({ coverPhotoId: remainingPhotos[0].id }).where(eq(producerAlbums.id, album.id));
      }
    }

    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default router;
