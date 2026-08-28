import { db } from '../db';
import { eventStaff, staffCredentials } from '../db/schema';
import { eq, and, or, lt, gt, sql } from 'drizzle-orm';
import crypto from 'crypto';

export class StaffAssignmentService {
    /**
     * Generate a secure random token for QR codes
     */
    static generateCredentialToken(): string {
        return 'CRED-' + crypto.randomBytes(16).toString('hex');
    }

    /**
     * Accepts an assignment, validates shift conflicts using an advisory lock,
     * updates the assignment to ACTIVE, and generates the staff credential.
     * All inside a single atomic transaction.
     */
    static async acceptAssignmentAndIssueCredential(userId: string, assignment: any) {
        if (assignment.status !== 'PENDING_ACCEPTANCE') {
            throw new Error('Invalid state for acceptance');
        }

        return await db.transaction(async (tx) => {
            // Get a unique 64-bit integer based on the user's UUID for the lock
            const userHash = userId.replace(/-/g, '').substring(0, 15);
            const lockId = parseInt(userHash, 16) % 2147483647;
            
            // Acquire transaction-level advisory lock
            await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockId})`);

            // Check shift conflicts
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
    
            // Activate event_staff
            await tx.update(eventStaff)
                .set({ 
                    status: 'ACTIVE', 
                    acceptedAt: new Date() 
                })
                .where(eq(eventStaff.id, assignment.id));
                
            // Issue credential
            const token = this.generateCredentialToken();
            const [cred] = await tx.insert(staffCredentials).values({
                eventStaffId: assignment.id,
                credentialToken: token
            }).returning();
            
            return { message: 'Accepted successfully', credential: cred };
        });
    }
}
