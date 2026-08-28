import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import { db } from '../db';
import { 
    staffCredentials,
    employeeCredentials,
    eventStaff,
    employees,
    staffProfiles,
    staffFunctions,
    staffAttendance
} from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { AuthorizationEngine } from '../services/authorizationEngine';
import { StaffAssignmentService } from '../services/staffAssignmentService';
import { v4 as uuidv4 } from 'uuid';

const router = new Hono();
router.use('/*', authMiddleware);

/**
 * Helper to generate a secure random token for QR codes
 * Now delegated to StaffAssignmentService for DRYness
 */
function generateCredentialToken(): string {
    return StaffAssignmentService.generateCredentialToken();
}

/**
 * POST /api/credentials/issue-staff
 * Temporarily issues a credential for an ACTIVE Event Staff
 * In a real flow, this could be automatic on ACCEPT.
 */
router.post('/issue-staff/:eventStaffId', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const userId = payload.id;
        const { eventStaffId } = c.req.param();

        // Must be the staff themselves or an owner/master
        const assignments = await db.select().from(eventStaff).where(eq(eventStaff.id, eventStaffId));
        if (assignments.length === 0) return c.json({ error: 'Assignment not found' }, 404);
        
        const assignment = assignments[0];
        
        // Ensure they are active
        if (assignment.status !== 'ACTIVE') {
            return c.json({ error: 'Cannot issue credential for non-active staff' }, 400);
        }

        // Generate token
        const token = generateCredentialToken();
        const [cred] = await db.insert(staffCredentials).values({
            eventStaffId,
            credentialToken: token
        }).returning();

        return c.json({ message: 'Credential issued', credential: cred });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

/**
 * POST /api/credentials/validate
 * Reads a QR code (credential token) and returns operational data for human validation.
 * Operator must have staff.attendance.checkin permission.
 */
router.post('/validate', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const scannerId = payload.id; // The user operating the scanner
        
        const body = await c.req.json();
        const { credentialToken, eventId, organizerId } = body;

        if (!credentialToken || !eventId || !organizerId) {
            return c.json({ error: 'Missing required parameters' }, 400);
        }

        // 1. Authorize Operator
        const isAuthorized = await AuthorizationEngine.hasPermission({
            userId: scannerId,
            organizerId,
            eventId,
            permissionKey: 'staff.attendance.checkin' // New permission just for staff attendance
        });

        if (!isAuthorized) {
            return c.json({ error: 'Unauthorized to scan staff credentials' }, 403);
        }

        // 2. Resolve Credential (Staff or Employee)
        let resolvedEntity: any = null;
        let type: 'STAFF' | 'EMPLOYEE' | null = null;
        let credId: string | null = null;

        // Try Staff Credential
        const sCreds = await db.select().from(staffCredentials).where(eq(staffCredentials.credentialToken, credentialToken));
        if (sCreds.length > 0) {
            const cred = sCreds[0];
            if (cred.status === 'REVOKED') return c.json({ error: 'CREDENCIAL INATIVA' }, 403);
            
            // Join with event_staff, staff_profiles and staff_functions
            const staffData = await db.select({
                assignment: eventStaff,
                profile: staffProfiles,
                func: staffFunctions
            })
            .from(eventStaff)
            .leftJoin(staffProfiles, eq(eventStaff.userId, staffProfiles.userId))
            .leftJoin(staffFunctions, eq(eventStaff.staffFunctionId, staffFunctions.id))
            .where(eq(eventStaff.id, cred.eventStaffId));

            if (staffData.length > 0) {
                const data = staffData[0];
                if (data.assignment.eventId !== eventId) return c.json({ error: 'CREDENCIAL DE OUTRO EVENTO' }, 403);
                if (data.assignment.status !== 'ACTIVE') return c.json({ error: 'VÍNCULO AINDA NÃO ATIVO' }, 403);
                
                type = 'STAFF';
                credId = cred.id;
                resolvedEntity = {
                    eventStaffId: data.assignment.id,
                    employeeId: null,
                    name: data.profile?.fullName || 'Unknown',
                    avatarUrl: data.profile?.avatarUrl,
                    functionName: data.func?.name || 'N/A',
                    shiftStart: data.assignment.shiftStart,
                    shiftEnd: data.assignment.shiftEnd,
                };
            }
        }

        // Try Employee Credential
        if (!type) {
            const eCreds = await db.select().from(employeeCredentials).where(eq(employeeCredentials.credentialToken, credentialToken));
            if (eCreds.length > 0) {
                const cred = eCreds[0];
                if (cred.status === 'REVOKED') return c.json({ error: 'CREDENCIAL INATIVA' }, 403);
                
                const empData = await db.select({
                    employee: employees,
                    profile: staffProfiles
                })
                .from(employees)
                .leftJoin(staffProfiles, eq(employees.userId, staffProfiles.userId))
                .where(eq(employees.id, cred.employeeId));

                if (empData.length > 0) {
                    const data = empData[0];
                    if (data.employee.organizerId !== organizerId) return c.json({ error: 'CREDENCIAL DE OUTRO ORGANIZADOR' }, 403);
                    if (data.employee.status !== 'active') return c.json({ error: 'EMPLOYEE INATIVO' }, 403);
                    
                    type = 'EMPLOYEE';
                    credId = cred.id;
                    resolvedEntity = {
                        eventStaffId: null,
                        employeeId: data.employee.id,
                        name: data.profile?.fullName || 'Employee (Sem Perfil)',
                        avatarUrl: data.profile?.avatarUrl || data.employee.credentialPhotoUrl || null,
                        functionName: 'Funcionário Fixo',
                        shiftStart: null,
                        shiftEnd: null,
                    };
                }
            }
        }

        if (!type) {
            return c.json({ error: 'CREDENCIAL NÃO ENCONTRADA' }, 404);
        }

        // 3. Check if already checked in
        const existingAttendance = await db.select().from(staffAttendance)
            .where(and(
                eq(staffAttendance.credentialId, credId as string),
                eq(staffAttendance.eventId, eventId)
            ));

        let alreadyCheckedIn = false;
        let checkInDetails = null;

        if (existingAttendance.length > 0) {
            alreadyCheckedIn = true;
            checkInDetails = {
                checkedInAt: existingAttendance[0].checkedInAt
            };
        }

        return c.json({
            type,
            credentialId: credId,
            person: resolvedEntity,
            alreadyCheckedIn,
            checkInDetails
        });

    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

/**
 * POST /api/credentials/confirm
 * Human operator confirms the identity and records the attendance.
 */
router.post('/confirm', async (c: Context) => {
    try {
        const payload = c.get('jwtPayload');
        const scannerId = payload.id;
        
        const body = await c.req.json();
        const { credentialId, eventId, eventStaffId, employeeId, shiftStart } = body;

        if (!credentialId || !eventId) {
            return c.json({ error: 'Missing required parameters' }, 400);
        }

        // Relying on Postgres UNIQUE constraints/Advisory locks for true concurrency on attendance
        // We'll use a transaction with advisory lock on the credential ID
        let checkedInAt = new Date();
        let delayMinutes = 0;

        await db.transaction(async (tx) => {
            const credHash = credentialId.replace(/-/g, '').substring(0, 15);
            const lockId = parseInt(credHash, 16) % 2147483647;
            await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockId})`);

            const existing = await tx.select().from(staffAttendance)
                .where(and(
                    eq(staffAttendance.credentialId, credentialId),
                    eq(staffAttendance.eventId, eventId)
                ));
            
            if (existing.length > 0) {
                throw new Error('JÁ REGISTRADO');
            }

            await tx.insert(staffAttendance).values({
                credentialId,
                eventId,
                eventStaffId: eventStaffId || null,
                employeeId: employeeId || null,
                checkedInBy: scannerId,
                checkedInAt: checkedInAt
            });
        });

        // Calculate delay if shiftStart is provided
        if (shiftStart) {
            const shiftTime = new Date(shiftStart).getTime();
            const checkinTime = checkedInAt.getTime();
            if (checkinTime > shiftTime) {
                delayMinutes = Math.floor((checkinTime - shiftTime) / 60000);
            }
        }

        return c.json({ 
            message: 'Presença confirmada',
            checkedInAt,
            delayMinutes
        });

    } catch (err: any) {
        if (err.message === 'JÁ REGISTRADO') {
            return c.json({ error: err.message }, 409);
        }
        return c.json({ error: err.message }, 500);
    }
});

export default router;
