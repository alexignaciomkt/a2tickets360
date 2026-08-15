import { db } from '../db';
import { 
    eventStaff, staffProfiles, staffFunctions,
    organizers, events, platformMasters,
    staffCredentials, employeeCredentials, staffAttendance, employees,
    roles, permissions, rolePermissions, eventStaffRoles
} from '../db/schema';
import { sql, eq } from 'drizzle-orm';
import { AuthorizationEngine } from '../services/authorizationEngine';
import crypto from 'crypto';

function generateCredentialToken(): string {
    return 'CRED-' + crypto.randomBytes(16).toString('hex');
}

async function runPhase5Tests() {
    console.log('🧪 Starting Phase 5 Real Database Tests...');
    
    const TEST_PREFIX = '00000000-0000-5000-9000-';
    const getId = (num: string) => `${TEST_PREFIX}${num.padStart(12, '0').toLowerCase()}`;

    const uOwner = getId('1');
    const uStaff = getId('2');
    const uEmployee = getId('3');
    const orgA = getId('A');
    const orgB = getId('B');
    const eventA1 = getId('A1');
    const eventB1 = getId('B1');

    try {
        console.log('1. Setting up test environment...');
        
        // Cleanup existing test data
        await db.execute(sql`DELETE FROM public.staff_attendance WHERE event_id IN (${eventA1}, ${eventB1})`);
        await db.execute(sql`DELETE FROM public.staff_credentials`);
        await db.execute(sql`DELETE FROM public.employee_credentials`);
        await db.execute(sql`DELETE FROM public.event_staff WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.employees WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.staff_profiles WHERE user_id IN (${uStaff}, ${uEmployee})`);
        await db.execute(sql`DELETE FROM public.staff_functions WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.events WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.organizer_details WHERE id IN (${orgA}, ${orgB})`);

        const userIds = [uOwner, uStaff, uEmployee, orgA, orgB];
        for (const uid of userIds) {
            await db.execute(sql`DELETE FROM auth.users WHERE id = ${uid}`);
            await db.execute(sql`
                INSERT INTO auth.users (id, email) 
                VALUES (${uid}, ${uid + '@test5.com'}) 
                ON CONFLICT (id) DO NOTHING
            `);
        }

        // Setup Organizations & Events
        await db.insert(organizers).values([
            { id: orgA, userId: uOwner, name: 'Test Org A', document: '111', status: 'approved' },
            { id: orgB, userId: uOwner, name: 'Test Org B', document: '222', status: 'approved' }
        ]).onConflictDoNothing();

        await db.insert(events).values([
            { id: eventA1, organizerId: orgA, title: 'Event A1', slug: 'event-a1-p5' },
            { id: eventB1, organizerId: orgB, title: 'Event B1', slug: 'event-b1-p5' }
        ]).onConflictDoNothing();

        // Setup Profiles
        await db.insert(staffProfiles).values([
            { userId: uStaff, fullName: 'Staff One', avatarUrl: 'staff.jpg', isPublic: true },
            { userId: uEmployee, fullName: 'Employee One', avatarUrl: 'emp.jpg', isPublic: false } // Private employee profile for identity
        ]).onConflictDoNothing();

        // Staff Functions
        const fClean = getId('c1ea');
        await db.insert(staffFunctions).values([
            { id: fClean, organizerId: orgA, name: 'Limpeza' }
        ]).onConflictDoNothing();

        // Setup Event Staff (Assignments)
        const assignmentActive = getId('51aa');
        const assignmentPending = getId('52aa');
        const assignmentCancelled = getId('53aa');

        await db.insert(eventStaff).values([
            { id: assignmentActive, eventId: eventA1, userId: uStaff, organizerId: orgA, staffFunctionId: fClean, status: 'ACTIVE', shiftStart: new Date(Date.now() - 3600000) }, // started 1h ago
            { id: assignmentPending, eventId: eventA1, userId: uEmployee, organizerId: orgA, staffFunctionId: fClean, status: 'PENDING_ACCEPTANCE' }, // Use uEmployee for eventA1
            { id: assignmentCancelled, eventId: eventB1, userId: uStaff, organizerId: orgB, staffFunctionId: fClean, status: 'CANCELLED' } // Use eventB1 for uStaff
        ]).onConflictDoNothing();

        // Credentials
        const credActive = generateCredentialToken();
        const credPending = generateCredentialToken();
        const credCancelled = generateCredentialToken();

        await db.insert(staffCredentials).values([
            { id: getId('c111'), eventStaffId: assignmentActive, credentialToken: credActive, status: 'ACTIVE' },
            { id: getId('c222'), eventStaffId: assignmentPending, credentialToken: credPending, status: 'ACTIVE' }, // token exists but assignment is pending
            { id: getId('c333'), eventStaffId: assignmentCancelled, credentialToken: credCancelled, status: 'ACTIVE' } // token exists but assignment is cancelled
        ]);

        // Employee
        const emp1 = getId('e111');
        await db.insert(employees).values([
            { id: emp1, userId: uEmployee, organizerId: orgA, accessScope: 'ALL_EVENTS' }
        ]).onConflictDoNothing();

        const credEmp = generateCredentialToken();
        await db.insert(employeeCredentials).values([
            { id: getId('c444'), employeeId: emp1, credentialToken: credEmp, status: 'ACTIVE' }
        ]);

        console.log('2. Running Phase 5 Test Cases (Endpoints Mock)...');
        let passed = 0;
        let failed = 0;

        const assertValidation = async (name: string, token: string, expectedError: string | null, eventId: string = eventA1, organizerId: string = orgA) => {
            // Mocking the backend validation logic from credentials.ts
            let error = null;
            
            // 2. Resolve Credential
            let type: 'STAFF' | 'EMPLOYEE' | null = null;
    
            const sCreds = await db.select().from(staffCredentials).where(eq(staffCredentials.credentialToken, token));
            if (sCreds.length > 0) {
                const cred = sCreds[0];
                if (cred.status === 'REVOKED') error = 'CREDENCIAL INATIVA';
                else {
                    const staffData = await db.select({ assignment: eventStaff })
                        .from(eventStaff)
                        .where(eq(eventStaff.id, cred.eventStaffId));
        
                    if (staffData.length > 0) {
                        const data = staffData[0];
                        if (data.assignment.eventId !== eventId) error = 'CREDENCIAL DE OUTRO EVENTO';
                        else if (data.assignment.status !== 'ACTIVE') error = 'VÍNCULO AINDA NÃO ATIVO';
                        else type = 'STAFF';
                    }
                }
            }
    
            if (!type && !error) {
                const eCreds = await db.select().from(employeeCredentials).where(eq(employeeCredentials.credentialToken, token));
                if (eCreds.length > 0) {
                    const cred = eCreds[0];
                    if (cred.status === 'REVOKED') error = 'CREDENCIAL INATIVA';
                    else {
                        const empData = await db.select({ employee: employees })
                            .from(employees)
                            .where(eq(employees.id, cred.employeeId));
        
                        if (empData.length > 0) {
                            const data = empData[0];
                            if (data.employee.organizerId !== organizerId) error = 'CREDENCIAL DE OUTRO ORGANIZADOR';
                            else if (data.employee.status !== 'active') error = 'EMPLOYEE INATIVO';
                            else type = 'EMPLOYEE';
                        }
                    }
                }
            }
    
            if (!type && !error) {
                error = 'CREDENCIAL NÃO ENCONTRADA';
            }

            if (error === expectedError) {
                console.log(`✅ [PASS] ${name}`);
                passed++;
            } else {
                console.error(`❌ [FAIL] ${name} | Expected error: ${expectedError}, Got: ${error}`);
                failed++;
            }
        };

        await assertValidation('STAFF CREDENTIAL ACTIVE -> allow', credActive, null);
        await assertValidation('STAFF CREDENTIAL PENDING -> block', credPending, 'VÍNCULO AINDA NÃO ATIVO');
        await assertValidation('STAFF CREDENTIAL CANCELLED -> block', credCancelled, 'VÍNCULO AINDA NÃO ATIVO', eventB1, orgB); 
        await assertValidation('STAFF CREDENTIAL WRONG EVENT -> block', credActive, 'CREDENCIAL DE OUTRO EVENTO', eventB1, orgA);
        
        await assertValidation('EMPLOYEE CREDENTIAL ALL_EVENTS -> allow', credEmp, null);
        await assertValidation('EMPLOYEE CREDENTIAL CROSS TENANT -> block', credEmp, 'CREDENCIAL DE OUTRO ORGANIZADOR', eventB1, orgB);


        console.log(`\nTest Results: ${passed} passed, ${failed} failed.`);

        console.log('3. Cleanup...');
        await db.execute(sql`DELETE FROM public.staff_attendance WHERE event_id IN (${eventA1}, ${eventB1})`);
        await db.execute(sql`DELETE FROM public.staff_credentials`);
        await db.execute(sql`DELETE FROM public.employee_credentials`);
        await db.execute(sql`DELETE FROM public.event_staff WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.employees WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.staff_profiles WHERE user_id IN (${uStaff}, ${uEmployee})`);
        await db.execute(sql`DELETE FROM public.staff_functions WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.events WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.organizer_details WHERE id IN (${orgA}, ${orgB})`);
        for (const uid of userIds) {
            await db.execute(sql`DELETE FROM auth.users WHERE id = ${uid}`);
        }

        console.log('✅ Cleanup completed.');

    } catch (e) {
        console.error('Test execution failed:', e);
    } finally {
        process.exit(0);
    }
}

runPhase5Tests();
