import { db } from '../db';
import { 
    roles, permissions, rolePermissions, employees, employeeEventAccess, employeeRoles, 
    employeePermissionOverrides, platformMasters, organizers, events 
} from '../db/schema';
import { sql, eq } from 'drizzle-orm';
import { AuthorizationEngine } from '../services/authorizationEngine';
import { v4 as uuidv4 } from 'uuid';

async function runTests() {
    console.log('🧪 Starting Real Database Tests for AuthorizationEngine...');
    
    // We will generate a consistent set of UUIDs to easily clean them up
    const TEST_PREFIX = '00000000-0000-4000-8000-';
    const getId = (num: string) => `${TEST_PREFIX}${num.padStart(12, '0')}`;

    const uMaster = getId('1');
    const uOwner = getId('2');
    const uEmpNoRole = getId('3');
    const uEmpRole = getId('4');
    const uEmpMultiRole = getId('5');
    const uEmpCrossTenant = getId('6');
    const orgA = getId('A');
    const orgB = getId('B');
    const eventA1 = getId('A1');
    const eventA2 = getId('A2');
    const eventB1 = getId('B1');

    try {
        console.log('1. Setting up test environment (auth.users and core entities)...');
        
        // Cleanup existing test data from previous failed runs
        await db.execute(sql`DELETE FROM public.employees WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.platform_masters WHERE user_id = ${uMaster}`);
        await db.execute(sql`DELETE FROM public.events WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.organizer_details WHERE id IN (${orgA}, ${orgB})`);

        // Ensure test users exist in auth.users
        const userIds = [uMaster, uOwner, uEmpNoRole, uEmpRole, uEmpMultiRole, uEmpCrossTenant, orgA, orgB];
        for (const uid of userIds) {
            await db.execute(sql`
                INSERT INTO auth.users (id, email) 
                VALUES (${uid}, ${uid + '@test.com'}) 
                ON CONFLICT (id) DO NOTHING
            `);
        }

        // Setup Organizations (Tenants)
        await db.insert(organizers).values([
            { id: orgA, userId: uOwner, name: 'Test Org A', document: '111', status: 'approved' },
            { id: orgB, userId: uOwner, name: 'Test Org B', document: '222', status: 'approved' } // owner owns both for simplicity
        ]).onConflictDoNothing();

        // Setup Events
        await db.insert(events).values([
            { id: eventA1, organizerId: orgA, title: 'Event A1', slug: 'event-a1' },
            { id: eventA2, organizerId: orgA, title: 'Event A2', slug: 'event-a2' },
            { id: eventB1, organizerId: orgB, title: 'Event B1', slug: 'event-b1' }
        ]).onConflictDoNothing();

        // Platform Master
        await db.insert(platformMasters).values({ userId: uMaster }).onConflictDoNothing();

        // Employees
        const empNoRole = getId('E1');
        const empRole = getId('E2');
        const empMulti = getId('E3');
        const empCross = getId('E4');

        await db.insert(employees).values([
            { id: empNoRole, userId: uEmpNoRole, organizerId: orgA, accessScope: 'ALL_EVENTS' },
            { id: empRole, userId: uEmpRole, organizerId: orgA, accessScope: 'ALL_EVENTS' },
            { id: empMulti, userId: uEmpMultiRole, organizerId: orgA, accessScope: 'SELECTED_EVENTS' },
            { id: empCross, userId: uEmpCrossTenant, organizerId: orgB, accessScope: 'ALL_EVENTS' }
        ]).onConflictDoNothing();

        // Event Scope for Multi
        await db.insert(employeeEventAccess).values({ employeeId: empMulti, eventId: eventA1 }).onConflictDoNothing();

        // Fetch required RBAC IDs (Assuming seed_rbac.ts was run)
        const checkinOpRole = (await db.select().from(roles).where(eq(roles.systemKey, 'CHECKIN_OPERATOR')))[0];
        const financeRole = (await db.select().from(roles).where(eq(roles.systemKey, 'FINANCIAL_MANAGER')))[0];
        const scanPerm = (await db.select().from(permissions).where(eq(permissions.systemKey, 'checkin.scan')))[0];
        const statsPerm = (await db.select().from(permissions).where(eq(permissions.systemKey, 'checkin.stats')))[0];
        const financeViewPerm = (await db.select().from(permissions).where(eq(permissions.systemKey, 'finance.view')))[0];
        
        if (!checkinOpRole || !financeRole || !scanPerm) {
            throw new Error("RBAC seed data missing. Run seed_rbac.ts first.");
        }

        // Employee Roles
        await db.insert(employeeRoles).values([
            { employeeId: empRole, roleId: checkinOpRole.id }, // checkin.scan
            { employeeId: empMulti, roleId: checkinOpRole.id },
            { employeeId: empMulti, roleId: financeRole.id }
        ]).onConflictDoNothing();

        // Overrides
        // empRole receives DENY on checkin.scan, GRANT on checkin.stats
        await db.insert(employeePermissionOverrides).values([
            { employeeId: empRole, permissionId: scanPerm.id, overrideType: 'DENY' },
            { employeeId: empRole, permissionId: statsPerm.id, overrideType: 'GRANT' }
        ]).onConflictDoNothing();


        console.log('2. Running Test Cases...');
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

        // 1. Employee sem role
        await assertTest('EMPLOYEE SEM ROLE -> deny', false, { userId: uEmpNoRole, organizerId: orgA, permissionKey: 'checkin.scan' });

        // 2. Role (checkin.open is part of CHECKIN_OPERATOR)
        await assertTest('ROLE BÁSICA -> allow', true, { userId: uEmpRole, organizerId: orgA, permissionKey: 'checkin.open' });

        // 3. Multi Role
        await assertTest('MULTI ROLE (Finance) -> allow', true, { userId: uEmpMultiRole, organizerId: orgA, permissionKey: 'finance.view' });
        await assertTest('MULTI ROLE (Checkin) -> allow', true, { userId: uEmpMultiRole, organizerId: orgA, permissionKey: 'checkin.open' });

        // 4. Override Grant
        await assertTest('OVERRIDE GRANT -> allow', true, { userId: uEmpRole, organizerId: orgA, permissionKey: 'checkin.stats' });

        // 5. Override Deny
        await assertTest('OVERRIDE DENY -> deny', false, { userId: uEmpRole, organizerId: orgA, permissionKey: 'checkin.scan' });

        // 6. ALL_EVENTS
        await assertTest('ALL_EVENTS scope -> allow', true, { userId: uEmpRole, organizerId: orgA, eventId: eventA2, permissionKey: 'checkin.open' });

        // 7. SELECTED_EVENTS
        await assertTest('SELECTED_EVENTS (Liberado) -> allow', true, { userId: uEmpMultiRole, organizerId: orgA, eventId: eventA1, permissionKey: 'checkin.open' });
        await assertTest('SELECTED_EVENTS (Não Liberado) -> deny', false, { userId: uEmpMultiRole, organizerId: orgA, eventId: eventA2, permissionKey: 'checkin.open' });

        // 8. CROSS TENANT
        await assertTest('CROSS TENANT (Employee de B em A) -> deny', false, { userId: uEmpCrossTenant, organizerId: orgA, permissionKey: 'checkin.open' });

        // 9. ORGANIZER FORJADO
        // uEmpRole is employee of orgA. If they try orgB, it should fail.
        await assertTest('ORGANIZER FORJADO -> deny', false, { userId: uEmpRole, organizerId: orgB, permissionKey: 'checkin.open' });

        // 10. MASTER
        await assertTest('MASTER -> bypass expected', true, { userId: uMaster, organizerId: orgA, permissionKey: 'finance.manage' });

        // 11. OWNER
        await assertTest('OWNER -> bypass expected', true, { userId: uOwner, organizerId: orgA, permissionKey: 'finance.manage' });


        console.log(`\nTest Results: ${passed} passed, ${failed} failed.`);

        console.log('3. Cleanup...');
        await db.execute(sql`DELETE FROM public.employees WHERE organizer_id IN (${orgA}, ${orgB})`);
        await db.execute(sql`DELETE FROM public.platform_masters WHERE user_id = ${uMaster}`);
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

runTests();
