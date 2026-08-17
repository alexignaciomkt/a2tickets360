import { Hono, Context } from 'hono';
import { db } from '../db';
import { organizers, producerAlbums, producerAlbumPhotos } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';

const router = new Hono();

// ============================================================================
// 1. PUBLIC LIST ALBUMS
// ============================================================================
router.get('/:slug/albums', async (c: Context) => {
  try {
    const slug = c.req.param('slug');
    const [organizer] = await db.select().from(organizers).where(eq(organizers.slug, slug)).limit(1);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const allAlbums = await db.select().from(producerAlbums)
      .where(and(eq(producerAlbums.organizerId, organizer.id), eq(producerAlbums.status, 'PUBLISHED')))
      .orderBy(asc(producerAlbums.sortOrder));

    const result = [];
    for (const album of allAlbums) {
      const photos = await db.select().from(producerAlbumPhotos).where(eq(producerAlbumPhotos.albumId, album.id));
      const coverPhoto = photos.find(p => p.id === album.coverPhotoId) || null;
      
      result.push({
        id: album.id,
        title: album.title,
        description: album.description,
        eventDate: album.eventDate,
        sortOrder: album.sortOrder,
        photoCount: photos.length,
        coverPhoto: coverPhoto ? { id: coverPhoto.id, imageUrl: coverPhoto.imageUrl, caption: coverPhoto.caption } : null,
      });
    }

    return c.json(result);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ============================================================================
// 2. PUBLIC GET ALBUM DETAILS
// ============================================================================
router.get('/:slug/albums/:albumId', async (c: Context) => {
  try {
    const { slug, albumId } = c.req.param();
    const [organizer] = await db.select().from(organizers).where(eq(organizers.slug, slug)).limit(1);
    if (!organizer) return c.json({ error: 'Organizer not found' }, 404);

    const [album] = await db.select().from(producerAlbums)
      .where(and(eq(producerAlbums.id, albumId), eq(producerAlbums.organizerId, organizer.id), eq(producerAlbums.status, 'PUBLISHED')))
      .limit(1);

    if (!album) return c.json({ error: 'Album not found' }, 404);

    const photosData = await db.select().from(producerAlbumPhotos)
      .where(eq(producerAlbumPhotos.albumId, album.id))
      .orderBy(asc(producerAlbumPhotos.sortOrder));

    const photos = photosData.map(p => ({
      id: p.id,
      imageUrl: p.imageUrl,
      caption: p.caption,
      sortOrder: p.sortOrder,
      producerWatermarkUrl: p.producerWatermarkUrl,
    }));

    return c.json({
      id: album.id,
      title: album.title,
      description: album.description,
      eventDate: album.eventDate,
      sortOrder: album.sortOrder,
      photos,
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default router;
