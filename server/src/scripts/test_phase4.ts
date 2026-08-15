import { db } from '../db';
import { 
    roles, permissions, rolePermissions, eventStaff, eventStaffRoles, 
    eventStaffPermissionOverrides, staffProfiles, staffFunctions,
    organizers, events 
} from '../db/schema';
import { sql, eq } from 'drizzle-orm';
import { AuthorizationEngine } from '../services/authorizationEngine';

async function runPhase4Tests() {
    console.log('🧪 Starting Phase 4 Real Database Tests...');
    
    const TEST_PREFIX = '00000000-0000-4000-9000-';
    const getId = (num: string) => `${TEST_PREFIX}${num.padStart(12, '0')}`;

    const uOwner = getId('1');
    const uStaff = getId('2');
    const uStaffMulti = getId('3');
    const orgA = getId('A');
    const orgB = getId('B');
    const eventA1 = getId('A1');
    const eventB1 = getId('B1');

    try {
        console.log('1. Setting up test environment (cleanup and creation)...');
        
        // Cleanup existing test data
        await db.execute(sql`DELETE FROM public.event_staff WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.staff_profiles WHERE user_id IN (${uStaff}, ${uStaffMulti})`);
        await db.execute(sql`DELETE FROM public.staff_functions WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.events WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.organizer_details WHERE id IN (${orgA}, ${orgB})`);

        const userIds = [uOwner, uStaff, uStaffMulti, orgA, orgB];
        for (const uid of userIds) {
            await db.execute(sql`DELETE FROM auth.users WHERE id = ${uid}`);
            await db.execute(sql`
                INSERT INTO auth.users (id, email) 
                VALUES (${uid}, ${uid + '@test.com'}) 
                ON CONFLICT (id) DO NOTHING
            `);
        }

        // Setup Organizations & Events
        await db.insert(organizers).values([
            { id: orgA, userId: uOwner, name: 'Test Org A', document: '111', status: 'approved' },
            { id: orgB, userId: uOwner, name: 'Test Org B', document: '222', status: 'approved' }
        ]).onConflictDoNothing();

        await db.insert(events).values([
            { id: eventA1, organizerId: orgA, title: 'Event A1', slug: 'event-a1' },
            { id: eventB1, organizerId: orgB, title: 'Event B1', slug: 'event-b1' }
        ]).onConflictDoNothing();

        // Setup Profiles
        await db.insert(staffProfiles).values([
            { userId: uStaff, fullName: 'Staff One', isPublic: true },
            { userId: uStaffMulti, fullName: 'Staff Two', isPublic: false }
        ]).onConflictDoNothing();

        // Staff Functions
        const fClean = getId('c1ea');
        const fSec = getId('f2ec');
        await db.insert(staffFunctions).values([
            { id: fClean, organizerId: orgA, name: 'Limpeza' },
            { id: fSec, organizerId: orgA, name: 'Segurança' }
        ]).onConflictDoNothing();

        // Fetch required RBAC IDs (Assuming seed_rbac.ts was run)
        const secRole = (await db.select().from(roles).where(eq(roles.systemKey, 'SECURITY')))[0];
        const checkinOpRole = (await db.select().from(roles).where(eq(roles.systemKey, 'CHECKIN_OPERATOR')))[0];
        
        const scanPerm = (await db.select().from(permissions).where(eq(permissions.systemKey, 'checkin.scan')))[0];
        
        if (!secRole || !checkinOpRole || !scanPerm) {
            throw new Error("RBAC seed data missing. Run seed_rbac.ts first.");
        }

        // Setup Event Staff (Assignments)
        const assignment1 = getId('51aa'); // Limpeza, Sem Role
        const assignment2 = getId('52aa'); // Segurança, Multi Role + Override
        const assignmentCross = getId('53aa');

        await db.insert(eventStaff).values([
            { id: assignment1, eventId: eventA1, userId: uStaff, organizerId: orgA, staffFunctionId: fClean, status: 'ACTIVE' },
            { id: assignment2, eventId: eventA1, userId: uStaffMulti, organizerId: orgA, staffFunctionId: fSec, status: 'ACTIVE' },
            { id: assignmentCross, eventId: eventB1, userId: uStaffMulti, organizerId: orgB, staffFunctionId: fSec, status: 'ACTIVE' }
        ]).onConflictDoNothing();

        // RBAC for Event Staff
        await db.insert(eventStaffRoles).values([
            { eventStaffId: assignment2, roleId: secRole.id },
            { eventStaffId: assignment2, roleId: checkinOpRole.id }
        ]).onConflictDoNothing();

        await db.insert(eventStaffPermissionOverrides).values([
            { eventStaffId: assignment2, permissionId: scanPerm.id, overrideType: 'DENY' }
        ]).onConflictDoNothing();


        console.log('2. Running Phase 4 Test Cases...');
        let passed = 0;
        let failed = 0;

        const assertTest = async (name: string, expected: boolean, checkParams: any) => {
            const result = await AuthorizationEngine.hasPermission(checkParams);
            if (result === expected) {
                console.log(`✅ [PASS] ${name}`);
                passed++;
            } else {
                console.error(`❌ [FAIL] ${name} | Expected ${expected} but got ${result}`);
                failed++;
            }
        };

        // 1. Staff sem role
        await assertTest('EVENT STAFF SEM ROLE -> deny', false, { userId: uStaff, organizerId: orgA, eventId: eventA1, permissionKey: 'checkin.scan' });

        // 2. Multi Role (Segurança + Checkin)
        // checkin.open comes from CHECKIN_OPERATOR
        await assertTest('EVENT STAFF MULTI-ROLE -> allow', true, { userId: uStaffMulti, organizerId: orgA, eventId: eventA1, permissionKey: 'checkin.open' });

        // 3. Override (Deny on checkin.scan)
        await assertTest('EVENT STAFF OVERRIDE DENY -> deny', false, { userId: uStaffMulti, organizerId: orgA, eventId: eventA1, permissionKey: 'checkin.scan' });

        // 4. Cross Tenant (Staff in Event B should not have access to Event A1 with orgB's tenant context)
        await assertTest('EVENT STAFF CROSS-TENANT -> deny', false, { userId: uStaffMulti, organizerId: orgB, eventId: eventA1, permissionKey: 'checkin.open' });


        // 5. Permissão Inexistente
        await assertTest('EVENT STAFF PERMISSION INEXISTENTE -> deny', false, { userId: uStaffMulti, organizerId: orgA, eventId: eventA1, permissionKey: 'permission.does.not.exist' });
        await assertTest('EVENT STAFF PERMISSION UNDEFINED -> deny', false, { userId: uStaffMulti, organizerId: orgA, eventId: eventA1, permissionKey: undefined as any });

        console.log(`\nTest Results: ${passed} passed, ${failed} failed.`);

        console.log('3. Cleanup...');
        await db.execute(sql`DELETE FROM public.event_staff WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.staff_profiles WHERE user_id IN (${uStaff}, ${uStaffMulti})`);
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

runPhase4Tests();
