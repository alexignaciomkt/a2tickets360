import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import { db } from '../db';
import { 
    eventStaff, 
    staffProfiles, 
    staffFunctions,
    eventStaffRoles,
    roles,
    profiles,
    events
} from '../db/schema';
import { eq, and, or, sql, lt, gt, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { supabaseAuthClient } from '../lib/supabaseAuthClient';

const router = new Hono();
router.use('/*', authMiddleware);

/**
 * GET /api/staff/event-staff
 * Lista a equipe do produtor usando a nova arquitetura (event_staff).
 */
router.get('/event-staff', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const eventId = c.req.query('eventId');

        let query = db.select({
            eventStaffId: eventStaff.id,
            eventId: eventStaff.eventId,
            organizerId: eventStaff.organizerId,
            status: eventStaff.status,
            shiftStart: eventStaff.shiftStart,
            shiftEnd: eventStaff.shiftEnd,
            createdAt: eventStaff.createdAt,
            // Detalhes da função
            funcaoId: staffFunctions.id,
            funcao: staffFunctions.name,
            // Detalhes do Staff (Identidade)
            email: profiles.email,
            // Detalhes do Staff (Perfil de Contratação)
            nome: staffProfiles.fullName,
            telefone: staffProfiles.phone
        })
        .from(eventStaff)
        .leftJoin(staffFunctions, eq(eventStaff.staffFunctionId, staffFunctions.id))
        .leftJoin(profiles, eq(eventStaff.userId, profiles.userId))
        .leftJoin(staffProfiles, eq(eventStaff.userId, staffProfiles.userId))
        .where(eq(eventStaff.organizerId, organizerId));

        if (eventId) {
            query = query.where(and(eq(eventStaff.organizerId, organizerId), eq(eventStaff.eventId, eventId)));
        }

        const data = await query;
        
        // Obter os systemRoleIds
        const staffIds = data.map(s => s.eventStaffId);
        let rolesData: any[] = [];
        if (staffIds.length > 0) {
            rolesData = await db.select().from(eventStaffRoles).where(inArray(eventStaffRoles.eventStaffId, staffIds));
        }

        const mappedData = data.map(s => {
            const systemRoleIds = rolesData.filter(r => r.eventStaffId === s.eventStaffId).map(r => r.roleId);
            return {
                ...s,
                systemRoleIds
            };
        });

        return c.json(mappedData);
    } catch (err: any) {
        console.error('[GET /event-staff]', err);
        return c.json({ error: err.message }, 500);
    }
});

/**
 * GET /api/staff/my-invites
 * Retorna os convites de staff para o usuário logado
 */
router.get('/my-invites', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const userId = payload.id;

        const query = db.select({
            id: eventStaff.id,
            eventId: eventStaff.eventId,
            status: eventStaff.status,
            shiftStart: eventStaff.shiftStart,
            shiftEnd: eventStaff.shiftEnd,
            createdAt: eventStaff.createdAt,
            // Função
            role: staffFunctions.name,
            // Produtora
            organizerName: profiles.name,
            // Evento
            eventName: events.title,
        })
        .from(eventStaff)
        .leftJoin(staffFunctions, eq(eventStaff.staffFunctionId, staffFunctions.id))
        .leftJoin(profiles, eq(eventStaff.organizerId, profiles.userId))
        .leftJoin(events, eq(eventStaff.eventId, events.id))
        .where(eq(eventStaff.userId, userId))
        .orderBy(eventStaff.createdAt);

        const data = await query;
        return c.json(data);
    } catch (err: any) {
        console.error('[GET /my-invites]', err);
        return c.json({ error: err.message }, 500);
    }
});

/**
 * POST /api/staff/invite
 * Invites a person to be Event Staff.
 * Checks for existing identity, creates one if missing via Supabase Invite.
 */
router.post('/invite', async (c: Context) => {
    try {
        const t0 = performance.now();
        const payload = c.get('jwtPayload');
        const organizerId = payload.id; // Assumes the caller is the owner for simplicity
        
        const body = await c.req.json();
        const { eventId, email, name, phone, staffFunctionId, shiftStart, shiftEnd, systemRoleIds } = body;

        if (!eventId || !email || !staffFunctionId) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Requisito: A Service Role Key DEVE estar configurada para convites e listagem
        if (!supabaseAdmin) {
            return c.json({ error: 'Configuração do Servidor Incompleta: SUPABASE_SERVICE_ROLE_KEY não configurada.' }, 500);
        }

        const tAuthStart = performance.now();
        // 1. Resolve Identity via Supabase Admin API (Auth) primeiro
        let userId: string | null = null;
        let hasProfile = false;

        // Fetch ALL users (since we have small volume) or search by email
        // Currently, listUsers() returns paginated users. Let's fetch all (up to 1000 is fine for v1)
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        const tAuthList = performance.now();
        
        if (listError) {
            console.error('[SUPABASE ADMIN] Falha ao listar usuários:', listError);
            return c.json({ error: 'Falha ao validar identidade na plataforma.' }, 500);
        }

        const existingUser = listData.users.find(u => u.email?.toLowerCase() === normalizedEmail);

        let tAuthInvite = tAuthList;

        if (existingUser) {
            userId = existingUser.id;
            hasProfile = true; // Assumimos que tem perfil auth, validaremos local profiles abaixo
        } else {
            // O e-mail não existe em auth.users, enviamos convite oficial via Supabase Admin
            const redirectUrl = process.env.APP_URL ? `${process.env.APP_URL}/auth/setup-password` : 'http://localhost:8081/auth/setup-password';
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
                redirectTo: redirectUrl
            });
            
            if (error || !data.user) {
                console.error('[SUPABASE ADMIN] Falha ao convidar usuário:', error);
                return c.json({ error: 'Falha ao convidar o usuário na plataforma de identidade.' }, 500);
            }
            
            userId = data.user.id;
            tAuthInvite = performance.now();
        }

        const tProfileStart = performance.now();
        // 2. Verificar se o usuário já possui um profile no nosso banco relacional
        const existingProfiles = await db.select().from(profiles).where(eq(profiles.userId, userId));
        
        let currentRole = 'customer';
        if (existingProfiles.length > 0) {
            currentRole = existingProfiles[0].role || 'customer';
            const profile = await db.select().from(staffProfiles).where(eq(staffProfiles.userId, userId));
            if (profile.length > 0) hasProfile = true;
        }

        if (currentRole === 'customer') {
            if (existingProfiles.length > 0) {
                // Atualizar o profile existente gerado pela trigger ou de um cliente antigo
                // IMPORTANTE: Atualizar também o NOME, pois a trigger pode ter pego o email como fallback!
                await db.update(profiles).set({ role: 'staff', name: name }).where(eq(profiles.userId, userId));
            } else {
                // Caso raríssimo onde a trigger falhou ou atrasou, garantimos a inserção manual
                await db.insert(profiles).values({
                    userId: userId,
                    name: name,
                    email: normalizedEmail,
                    role: 'staff'
                });
            }
        }

        // Se não tem staff_profile, precisamos criar
        if (!hasProfile) {
            await db.insert(staffProfiles).values({
                userId: userId,
                fullName: name,
                phone: phone || null,
            });
            hasProfile = true;
        } else {
            // Atualizar o phone no staff_profile caso exista e tenha vindo no form
            if (phone) {
                await db.update(staffProfiles).set({ phone }).where(eq(staffProfiles.userId, userId));
            }
        }
        const tProfileEnd = performance.now();

        // 2. Validate Staff Function exists and belongs to this Organizer
        const sFunc = await db.select().from(staffFunctions)
            .where(and(eq(staffFunctions.id, staffFunctionId), eq(staffFunctions.organizerId, organizerId)));
            
        if (sFunc.length === 0) {
            return c.json({ error: 'Invalid Staff Function' }, 400);
        }

        const functionData = sFunc[0];

        // 3. Prevent Duplicates for the same Event + User
        const existingAssignment = await db.select().from(eventStaff)
            .where(and(eq(eventStaff.eventId, eventId), eq(eventStaff.userId, userId)));
            
        if (existingAssignment.length > 0) {
            return c.json({ error: 'User is already assigned to this event' }, 409);
        }

        const tEventStaffStart = performance.now();
        // 4. Create Event Staff (Invite)
        const newStatus = 'PENDING_ACCEPTANCE'; // Conforme instrução: todo novo convite de evento deve nascer como PENDING_ACCEPTANCE
        const newStaffId = uuidv4();

        const safeDate = (val: any) => {
            if (!val) return null;
            let dateStr = val;
            // Se veio apenas "12:00" do input type="time"
            if (typeof val === 'string' && val.length === 5 && val.includes(':')) {
                const today = new Date().toISOString().split('T')[0];
                dateStr = `${today}T${val}:00Z`;
            }
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? null : d;
        };

        await db.insert(eventStaff).values({
            id: newStaffId,
            eventId,
            userId,
            organizerId,
            staffFunctionId,
            status: newStatus,
            shiftStart: safeDate(shiftStart),
            shiftEnd: safeDate(shiftEnd),
            invitedBy: payload.id,
        });
        const tEventStaffEnd = performance.now();

        const tRolesStart = performance.now();
        // 5. System Roles
        if (systemRoleIds && Array.isArray(systemRoleIds) && systemRoleIds.length > 0) {
            const roleInsertValues = systemRoleIds.map((rId: string) => ({
                eventStaffId: newStaffId,
                roleId: rId
            }));
            await db.insert(eventStaffRoles).values(roleInsertValues);
        } else if (functionData.defaultSystemRoleId) {
            await db.insert(eventStaffRoles).values({
                eventStaffId: newStaffId,
                roleId: functionData.defaultSystemRoleId
            });
        }
        const tRolesEnd = performance.now();

        let accessDelivery = 'INVITE';
        if (existingUser) {
            accessDelivery = 'NONE'; // Usuário já possui conta e senha. Não enviamos nada.
        }

        const tTotalEnd = performance.now();
        
        console.log(`[STAFF INVITE PERF] auth lookup (listUsers): ${(tAuthList - tAuthStart).toFixed(2)}ms`);
        if (!existingUser) {
            console.log(`[STAFF INVITE PERF] supabase invite: ${(tAuthInvite - tAuthList).toFixed(2)}ms`);
        }
        console.log(`[STAFF INVITE PERF] profiles creation: ${(tProfileEnd - tProfileStart).toFixed(2)}ms`);
        console.log(`[STAFF INVITE PERF] event_staff creation: ${(tEventStaffEnd - tEventStaffStart).toFixed(2)}ms`);
        console.log(`[STAFF INVITE PERF] roles creation: ${(tRolesEnd - tRolesStart).toFixed(2)}ms`);
        console.log(`[STAFF INVITE PERF] TOTAL: ${(tTotalEnd - t0).toFixed(2)}ms`);

        return c.json({
            eventStaffId: newStaffId,
            status: newStatus,
            success: true,
            accessDelivery
        });

    } catch (err: any) {
        console.error(err);
        return c.json({ error: err.message }, 500);
    }
});

/**
 * GET /api/staff/roles
 * Retorna o catálogo global de System Roles (Fase 3)
 */
router.get('/roles', async (c: Context) => {
    try {
        const allRoles = await db.select().from(roles).where(eq(roles.isActive, true));
        return c.json(allRoles);
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

/**
 * GET /api/staff/functions
 * Retorna as funções operacionais do organizador atual
 */
router.get('/functions', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        
        const functions = await db.select().from(staffFunctions)
            .where(and(eq(staffFunctions.organizerId, organizerId), eq(staffFunctions.isActive, true)));
            
        return c.json(functions);
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

/**
 * POST /api/staff/functions
 * Cria uma nova função operacional rapidamente para o organizador
 */
router.post('/functions', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const body = await c.req.json();
        
        if (!body.name) {
            return c.json({ error: 'Name is required' }, 400);
        }

        const [newFunc] = await db.insert(staffFunctions).values({
            organizerId,
            name: body.name,
            description: body.description || null,
            defaultSystemRoleId: body.defaultSystemRoleId || null,
            isActive: true
        }).returning();

        return c.json(newFunc);
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

const sendAccessCache = new Map<string, number>();

/**
 * POST /api/staff/:eventStaffId/send-access
 * Envia o acesso para o membro da equipe (Convite novo ou Recuperação de Senha).
 */
router.post('/:eventStaffId/send-access', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const eventStaffId = c.req.param('eventStaffId');

        // Proteção mínima contra SPAM / duplo clique (Cooldown de 60 segundos por staff)
        const lastSent = sendAccessCache.get(eventStaffId);
        if (lastSent && Date.now() - lastSent < 60000) {
            return c.json({ error: 'Acesso enviado recentemente. Aguarde antes de reenviar.' }, 429);
        }
        sendAccessCache.set(eventStaffId, Date.now());

        // 1. Validar propriedade do event_staff
        const staffRec = await db.select().from(eventStaff).where(and(eq(eventStaff.id, eventStaffId), eq(eventStaff.organizerId, organizerId)));
        if (staffRec.length === 0) {
            return c.json({ error: 'Staff member not found or unauthorized' }, 404);
        }

        const userId = staffRec[0].userId;

        // 2. Localizar o e-mail real do usuário
        const profile = await db.select().from(profiles).where(eq(profiles.userId, userId));
        if (profile.length === 0) {
            return c.json({ error: 'Profile not found' }, 404);
        }
        const email = profile[0].email;

        if (!supabaseAdmin) {
            return c.json({ error: 'Servidor incompleto: SUPABASE_SERVICE_ROLE_KEY não configurada' }, 500);
        }

        // 3. Obter status real do usuário no Supabase
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        let flow = '';
        if (userError || !userData.user) {
            // Cenário A: Usuário não existe no Auth
            flow = 'INVITE';
            const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
            if (error) return c.json({ error: 'Erro ao enviar convite' }, 500);
        } else {
            const u = userData.user;
            if (!u.email_confirmed_at) {
                // Cenário B: Conta existe mas não ativou/confirmou. Reenviar invite admin
                flow = 'INVITE';
                const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
                if (error) return c.json({ error: 'Erro ao reenviar confirmação' }, 500);
            } else {
                // Cenário C: Conta existe e está ativa. Enviar Magic Link com o client público.
                flow = 'MAGIC_LINK';
                const redirectUrl = process.env.APP_URL ? `${process.env.APP_URL}/dashboard/staff/invites` : 'http://localhost:8081/dashboard/staff/invites';
                const { error } = await supabaseAuthClient.auth.signInWithOtp({ 
                    email,
                    options: {
                        shouldCreateUser: false,
                        emailRedirectTo: redirectUrl
                    }
                });
                if (error) return c.json({ error: 'Erro ao enviar acesso (Magic Link)' }, 500);
            }
        }

        return c.json({ message: 'Acesso enviado com sucesso', success: true, accessDelivery: flow });

    } catch (err: any) {
        console.error('[SEND ACCESS]', err);
        return c.json({ error: err.message }, 500);
    }
});

/**
 * POST /api/staff/:eventStaffId/send-access-recovery
 * Produtor solicita recuperação de senha (Portaria) para o Staff.
 */
router.post('/:eventStaffId/send-access-recovery', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const organizerId = payload.id;
        const eventStaffId = c.req.param('eventStaffId');

        // Proteção mínima contra SPAM
        const lastSent = sendAccessCache.get(`recovery-${eventStaffId}`);
        if (lastSent && Date.now() - lastSent < 60000) {
            return c.json({ error: 'Recuperação enviada recentemente. Aguarde antes de reenviar.' }, 429);
        }
        sendAccessCache.set(`recovery-${eventStaffId}`, Date.now());

        const staffRec = await db.select().from(eventStaff).where(and(eq(eventStaff.id, eventStaffId), eq(eventStaff.organizerId, organizerId)));
        if (staffRec.length === 0) return c.json({ error: 'Staff member not found or unauthorized' }, 404);

        const profile = await db.select().from(profiles).where(eq(profiles.userId, staffRec[0].userId));
        if (profile.length === 0) return c.json({ error: 'Profile not found' }, 404);
        
        const email = profile[0].email;
        if (!email) return c.json({ error: 'No email found' }, 400);

        if (!supabaseAdmin) return c.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, 500);

        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
        if (error) return c.json({ error: 'Erro ao enviar recuperação de senha' }, 500);

        return c.json({ message: 'E-mail de recuperação de acesso enviado com sucesso.' });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});


/**
 * POST /api/staff/accept/:id
 * Accepts an event staff invitation. Validates shift conflicts globally.
 */
router.post('/accept/:id', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const userId = payload.id;
        const assignmentId = c.req.param('id');

        const assignments = await db.select().from(eventStaff).where(eq(eventStaff.id, assignmentId));
        if (assignments.length === 0) return c.json({ error: 'Not found' }, 404);
        
        const assignment = assignments[0];
        
        // Security check
        if (assignment.userId !== userId) {
            return c.json({ error: 'Forbidden' }, 403);
        }

        if (assignment.status !== 'PENDING_ACCEPTANCE') {
            return c.json({ error: 'Invalid state for acceptance' }, 400);
        }

        // Ideally, use a transaction here, but Postgres constraints/advisory locks are better for true concurrency.
        // We will use an advisory lock on the userId to serialize any acceptance for this specific user.
        // This guarantees no two concurrent acceptances can bypass the conflict check.
        await db.transaction(async (tx) => {
            // Get a unique 64-bit integer based on the user's UUID for the lock
            // We use the first 16 chars of the UUID (without dashes) to create a hash.
            const userHash = userId.replace(/-/g, '').substring(0, 15);
            const lockId = parseInt(userHash, 16) % 2147483647; // keep within postgres int limits
            
            // Acquire transaction-level advisory lock
            await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockId})`);

            if (assignment.shiftStart && assignment.shiftEnd) {
                const start = new Date(assignment.shiftStart);
                const end = new Date(assignment.shiftEnd);
    
                const conflicting = await tx.select().from(eventStaff)
                    .where(and(
                        eq(eventStaff.userId, userId),
                        eq(eventStaff.status, 'ACTIVE'),
                        or(
                            and(
                                lt(eventStaff.shiftStart, end),
                                gt(eventStaff.shiftEnd, start)
                            )
                        )
                    ));
    
                if (conflicting.length > 0) {
                    throw new Error('Shift conflict detected with an existing ACTIVE assignment');
                }
            }
    
            await tx.update(eventStaff)
                .set({ 
                    status: 'ACTIVE', 
                    acceptedAt: new Date() 
                })
                .where(eq(eventStaff.id, assignmentId));
        });

        return c.json({ message: 'Accepted successfully' });
    } catch (err: any) {
        if (err.message === 'Shift conflict detected with an existing ACTIVE assignment') {
            return c.json({ error: err.message }, 409);
        }
        return c.json({ error: err.message }, 500);
    }
});

/**
 * POST /api/staff/decline/:id
 * Declines an event staff invitation.
 */
router.post('/decline/:id', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const userId = payload.id;
        const assignmentId = c.req.param('id');

        const assignments = await db.select().from(eventStaff).where(eq(eventStaff.id, assignmentId));
        if (assignments.length === 0) return c.json({ error: 'Not found' }, 404);
        
        const assignment = assignments[0];
        
        // Security check
        if (assignment.userId !== userId) {
            return c.json({ error: 'Forbidden' }, 403);
        }

        if (assignment.status !== 'PENDING_ACCEPTANCE' && assignment.status !== 'PENDING_PROFILE') {
            return c.json({ error: 'Invalid state for declining' }, 400);
        }

        await db.update(eventStaff)
            .set({ 
                status: 'DECLINED', 
                declinedAt: new Date() 
            })
            .where(eq(eventStaff.id, assignmentId));

        return c.json({ message: 'Declined successfully' });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

export default router;
