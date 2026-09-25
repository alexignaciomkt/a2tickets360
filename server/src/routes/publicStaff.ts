import { Hono, Context } from 'hono';
import { db } from '../db';
import { 
    profiles, 
    staffProfiles, 
    staffProfileFunctions, 
    staffProfessionalFunctions, 
    eventStaff, 
    events 
} from '../db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

const router = new Hono();

router.get('/:id', async (c: Context) => {
    try {
        const id = c.req.param('id');
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isUuid = uuidRegex.test(id);
        
        // 1. Fetch StaffProfile First (to resolve slug to userId)
        const userStaffProfile = await db.select({
            userId: staffProfiles.userId,
            isPublic: staffProfiles.isPublic,
            bio: staffProfiles.bio,
            slug: staffProfiles.slug
        }).from(staffProfiles).where(isUuid ? eq(staffProfiles.userId, id) : eq(staffProfiles.slug, id)).limit(1);

        if (userStaffProfile.length === 0 || !userStaffProfile[0].isPublic) {
            return c.json({ error: 'Profile not found' }, 404);
        }

        const realUserId = userStaffProfile[0].userId;

        const userProfile = await db.select({
            id: profiles.userId,
            fullName: profiles.name,
            avatarUrl: profiles.avatarUrl,
            city: profiles.city,
            state: profiles.state
        }).from(profiles).where(eq(profiles.userId, realUserId));

        if (userProfile.length === 0) {
            return c.json({ error: 'Profile not found' }, 404);
        }

        // 2. Fetch Global Functions
        const functions = await db.select({
            id: staffProfessionalFunctions.id,
            name: staffProfessionalFunctions.name
        }).from(staffProfileFunctions)
        .innerJoin(staffProfessionalFunctions, eq(staffProfileFunctions.professionalFunctionId, staffProfessionalFunctions.id))
        .where(eq(staffProfileFunctions.staffUserId, realUserId));

        // 3. Fetch Event History (ACTIVE or COMPLETED)
        const history = await db.select({
            eventId: events.id,
            title: events.title,
            bannerUrl: events.bannerUrl,
            startDate: events.startDate,
            city: events.city,
            state: events.state
        }).from(eventStaff)
        .innerJoin(events, eq(eventStaff.eventId, events.id))
        .where(
            and(
                eq(eventStaff.userId, realUserId),
                inArray(eventStaff.status, ['ACTIVE', 'COMPLETED'])
            )
        ).orderBy(desc(events.startDate));

        // Deduplicate events just in case they have multiple roles in the same event
        const uniqueEvents = [];
        const seenEventIds = new Set();
        for (const evt of history) {
            if (!seenEventIds.has(evt.eventId)) {
                seenEventIds.add(evt.eventId);
                uniqueEvents.push(evt);
            }
        }

        return c.json({
            id: userProfile[0].id,
            slug: userStaffProfile[0].slug,
            fullName: userProfile[0].fullName,
            avatarUrl: userProfile[0].avatarUrl,
            city: userProfile[0].city,
            state: userProfile[0].state,
            bio: userStaffProfile[0].bio,
            functions: functions,
            events: uniqueEvents
        });

    } catch (e: any) {
        console.error('[GET /api/public/staff-profiles/:id]', e);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export default router;
