import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/auth.js';
import { db } from '../db/index.js';
import { profiles, staffProfiles, staffProfessionalFunctions, staffProfileFunctions } from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';

import { normalizeSlug, validateSlug, isReservedSlug } from '../utils/slugUtils';

const router = new Hono();
router.use('/*', authMiddleware);

// PUT /api/me/staff-profile/slug
router.put('/slug', async (c: Context) => {
    try {
        const payload = (c.get as any)('jwtPayload');
        if (!payload || !payload.id) return c.json({ error: 'Unauthorized' }, 401);
        const userId = payload.id;

        const body = await c.req.json();
        const rawSlug = body.slug;

        if (!rawSlug) return c.json({ error: 'Slug is required' }, 400);

        const normalized = normalizeSlug(rawSlug);

        if (!validateSlug(normalized)) {
            return c.json({ error: 'Slug inválido. Use apenas letras, números e hifens. Min 3 e Max 40 caracteres.' }, 400);
        }

        if (isReservedSlug(normalized)) {
            return c.json({ error: 'Este endereço não está disponível (reservado).' }, 400);
        }

        // Check current profile
        const currentProfile = await db.query.staffProfiles.findFirst({
            where: eq(staffProfiles.userId, userId)
        });

        if (!currentProfile) {
            return c.json({ error: 'Perfil não encontrado' }, 404);
        }

        if (currentProfile.slug) {
            return c.json({ error: 'Você já definiu um endereço público. Alterações não são permitidas nesta versão.' }, 403);
        }

        // Try to update
        try {
            await db.update(staffProfiles)
                .set({ slug: normalized })
                .where(eq(staffProfiles.userId, userId));

            return c.json({ success: true, slug: normalized });
        } catch (dbErr: any) {
            // Check for Postgres unique violation 23505
            if (dbErr.code === '23505') {
                return c.json({ error: 'Este endereço já foi escolhido por outra pessoa.' }, 409);
            }
            throw dbErr;
        }

    } catch (e: any) {
        console.error('[PUT /api/me/staff-profile/slug]', e);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// GET /api/me/staff-profile
router.get('/', async (c: Context) => {
    try {
        const payload = (c.get as any)('jwtPayload');
        if (!payload || !payload.id) return c.json({ error: 'Unauthorized' }, 401);
        const userId = payload.id;

        // 1. Get Base Profile
        const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

        // 2. Get Staff Profile
        const [staffProfile] = await db.select().from(staffProfiles).where(eq(staffProfiles.userId, userId)).limit(1);

        // 3. Get Functions
        const functions = await db
            .select({
                id: staffProfessionalFunctions.id,
                name: staffProfessionalFunctions.name,
                slug: staffProfessionalFunctions.slug,
                category: staffProfessionalFunctions.category
            })
            .from(staffProfileFunctions)
            .innerJoin(staffProfessionalFunctions, eq(staffProfileFunctions.professionalFunctionId, staffProfessionalFunctions.id))
            .where(eq(staffProfileFunctions.staffUserId, userId));

        return c.json({
            profile: profile || null,
            staffProfile: staffProfile ? {
                ...staffProfile,
                avatarUrl: profile?.avatarUrl || staffProfile.avatarUrl // Source of truth fallback
            } : null,
            professionalFunctions: functions
        });
    } catch (e) {
        console.error('[GET /api/me/staff-profile] Error:', e);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// PUT /api/me/staff-profile
router.put('/', async (c: Context) => {
    try {
        const payload = (c.get as any)('jwtPayload');
        if (!payload || !payload.id) return c.json({ error: 'Unauthorized' }, 401);
        const userId = payload.id;

        const body = await c.req.json();

        // 1. Update Base Profile
        await db.update(profiles).set({
            name: body.name,
            cpf: body.cpf,
            phone: body.phone,
            birthDate: body.birthDate,
            city: body.city,
            state: body.state,
            updatedAt: new Date()
        }).where(eq(profiles.userId, userId));

        // 2. Clear old functions and insert new ones
        await db.delete(staffProfileFunctions).where(eq(staffProfileFunctions.staffUserId, userId));

        if (body.professionalFunctionIds && body.professionalFunctionIds.length > 0) {
            // Verify if all IDs exist and are active
            const activeFunctions = await db.select({ id: staffProfessionalFunctions.id })
                .from(staffProfessionalFunctions)
                .where(inArray(staffProfessionalFunctions.id, body.professionalFunctionIds));

            const activeIds = activeFunctions.map(f => f.id);
            if (activeIds.length > 0) {
                const inserts = activeIds.map(funcId => ({
                    staffUserId: userId,
                    professionalFunctionId: funcId
                }));
                await db.insert(staffProfileFunctions).values(inserts);
            }
        }

        // 3. Determine if profile is complete
        const functionsCount = body.professionalFunctionIds ? body.professionalFunctionIds.length : 0;
        const isComplete = Boolean(
            body.name && body.cpf && body.phone && body.birthDate &&
            body.city && body.state && body.avatarUrl && functionsCount > 0
        );

        // 3.5 Enforce Global Avatar for Staff Onboarding Conclusion
        if (isComplete && !body.avatarUrl) {
            return c.json({ error: 'Foto de perfil obrigatória para concluir o cadastro profissional.' }, 400);
        }

        // 4. Update Staff Profile
        await db.update(staffProfiles).set({
            fullName: body.name,
            phone: body.phone,
            bio: body.bio || null,
            profileComplete: isComplete,
            updatedAt: new Date()
        }).where(eq(staffProfiles.userId, userId));

        // 5. Salva na Source of Truth (Profiles)
        if (body.avatarUrl) {
            await db.update(profiles).set({
                avatarUrl: body.avatarUrl,
                updatedAt: new Date()
            }).where(eq(profiles.userId, userId));
        }

        return c.json({ success: true, profileComplete: isComplete });
    } catch (e) {
        console.error('[PUT /api/me/staff-profile] Error:', e);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export default router;
