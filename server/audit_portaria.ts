import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, ilike } from 'drizzle-orm';
import { 
    profiles, eventStaff, eventStaffRoles, events, 
    roles, rolePermissions, permissions, staffFunctions,
    platformMasters, organizers
} from './src/db/schema';

const DATABASE_URL = process.env.DATABASE_URL!;

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function audit() {
    try {
        // 1. Find staff03 user in profiles
        console.log('=== 1. PROFILES (staff03) ===');
        const profileResults = await db.select().from(profiles).where(ilike(profiles.email, '%staff03%'));
        console.log(JSON.stringify(profileResults, null, 2));

        if (profileResults.length === 0) {
            console.log('No profile with staff03 email. Listing all profiles...');
            const allP = await db.select().from(profiles);
            for (const p of allP) {
                console.log(`  userId=${p.userId} name=${p.name} email=${p.email} role=${p.role}`);
            }
        }

        const allP = await db.select().from(profiles);
        const staff03Profile = allP.find(p => p.email?.includes('staff03'));
        
        let userId: string;
        if (staff03Profile) {
            userId = staff03Profile.userId;
            console.log(`\nFound staff03: userId=${userId} profileId=${staff03Profile.id} name=${staff03Profile.name} email=${staff03Profile.email}`);
        } else {
            console.log('\nCould not find staff03 in profiles. Checking event_staff...');
            const allES = await db.select().from(eventStaff);
            for (const es of allES) {
                console.log(`  id=${es.id} userId=${es.userId} eventId=${es.eventId} orgId=${es.organizerId} status=${es.status}`);
            }
            await client.end();
            return;
        }

        // 2. event_staff
        console.log('\n=== 2. EVENT_STAFF ===');
        const staffRecords = await db.select().from(eventStaff).where(eq(eventStaff.userId, userId));
        console.log(JSON.stringify(staffRecords, null, 2));

        for (const staff of staffRecords) {
            // 3. event_staff_roles
            console.log(`\n=== 3. EVENT_STAFF_ROLES for eventStaff.id=${staff.id} ===`);
            const staffRoles = await db.select().from(eventStaffRoles).where(eq(eventStaffRoles.eventStaffId, staff.id));
            console.log(JSON.stringify(staffRoles, null, 2));

            for (const sr of staffRoles) {
                console.log(`\n=== 4. ROLE (role_id=${sr.roleId}) ===`);
                const roleData = await db.select().from(roles).where(eq(roles.id, sr.roleId));
                console.log(JSON.stringify(roleData, null, 2));

                console.log(`\n=== 5. ROLE_PERMISSIONS for role_id=${sr.roleId} ===`);
                const rp = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, sr.roleId));
                console.log(JSON.stringify(rp, null, 2));

                for (const perm of rp) {
                    const permData = await db.select().from(permissions).where(eq(permissions.id, perm.permissionId));
                    console.log(`  Permission: ${JSON.stringify(permData)}`);
                }
            }

            console.log(`\n=== 6. EVENT for event_id=${staff.eventId} ===`);
            const eventData = await db.select().from(events).where(eq(events.id, staff.eventId));
            if (eventData.length > 0) {
                const e = eventData[0];
                console.log(`  title=${e.title} slug=${e.slug} status=${e.status} organizerId=${e.organizerId} startDate=${e.startDate} endDate=${e.endDate}`);
            }

            if (staff.staffFunctionId) {
                console.log(`\n=== 7. STAFF_FUNCTION for id=${staff.staffFunctionId} ===`);
                const funcData = await db.select().from(staffFunctions).where(eq(staffFunctions.id, staff.staffFunctionId));
                console.log(JSON.stringify(funcData, null, 2));
            }
        }

        // 8. permission checkin.scan
        console.log('\n=== 8. PERMISSION checkin.scan ===');
        const checkinPerm = await db.select().from(permissions).where(eq(permissions.systemKey, 'checkin.scan'));
        console.log(JSON.stringify(checkinPerm, null, 2));

        // 9. Simulate AuthorizationEngine
        if (staffRecords.length > 0 && checkinPerm.length > 0) {
            const staff = staffRecords[0];
            const ev = (await db.select().from(events).where(eq(events.id, staff.eventId)))[0];
            
            console.log('\n=== 9. AUTHORIZATION ENGINE SIMULATION ===');
            console.log(`hasPermission({ userId="${userId}", organizerId="${ev?.organizerId}", eventId="${staff.eventId}", permissionKey="checkin.scan" })`);
            
            // Step A: Master bypass?
            const masterCheck = await db.select().from(platformMasters).where(and(eq(platformMasters.userId, userId), eq(platformMasters.status, 'active')));
            console.log(`  [1] Master bypass: ${masterCheck.length > 0}`);
            
            // Step B: Owner bypass?
            if (ev) {
                const ownerCheck = await db.select().from(organizers).where(and(eq(organizers.userId, userId), eq(organizers.id, ev.organizerId)));
                console.log(`  [2] Owner bypass: ${ownerCheck.length > 0}`);
            }
            
            // Step C: checkEventStaffAuthorization
            if (ev) {
                console.log(`\n  [4] checkEventStaffAuthorization:`);
                console.log(`      Query: eventStaff WHERE userId="${userId}" AND organizerId="${ev.organizerId}" AND eventId="${staff.eventId}" AND status="ACTIVE"`);
                console.log(`      eventStaff.organizerId in DB: "${staff.organizerId}"`);
                console.log(`      events.organizerId in DB: "${ev.organizerId}"`);
                console.log(`      Match? ${staff.organizerId === ev.organizerId}`);
                
                const simResult = await db.select().from(eventStaff).where(and(
                    eq(eventStaff.userId, userId),
                    eq(eventStaff.organizerId, ev.organizerId),
                    eq(eventStaff.eventId, staff.eventId),
                    eq(eventStaff.status, 'ACTIVE')
                ));
                console.log(`      eventStaff records found: ${simResult.length}`);
                
                if (simResult.length > 0) {
                    const sRoles = await db.select().from(eventStaffRoles).where(eq(eventStaffRoles.eventStaffId, simResult[0].id));
                    console.log(`      eventStaffRoles found: ${sRoles.length}`);
                    console.log(`      Roles: ${JSON.stringify(sRoles)}`);
                    
                    for (const sr of sRoles) {
                        const rp = await db.select().from(rolePermissions).where(and(
                            eq(rolePermissions.roleId, sr.roleId),
                            eq(rolePermissions.permissionId, checkinPerm[0].id)
                        ));
                        console.log(`      rolePermissions match (roleId=${sr.roleId}, permId=${checkinPerm[0].id}): ${rp.length}`);
                    }
                }
            }
        }

        // 10. The portaria route perspective
        console.log('\n=== 10. PORTARIA ROUTE PERSPECTIVE ===');
        console.log(`JWT payload.sub = auth.users.id`);
        console.log(`profiles.userId = ${staff03Profile?.userId}`);
        console.log(`profiles.id = ${staff03Profile?.id}`);
        console.log(`Are profiles.userId and profiles.id the same? ${staff03Profile?.userId === staff03Profile?.id}`);
        console.log(`event_staff.userId = ${staffRecords[0]?.userId}`);
        
        // The critical question: portaria line 19 uses payload.sub
        // Is payload.sub = profiles.userId = event_staff.userId?
        console.log(`\nCRITICAL: Does payload.sub match event_staff.userId?`);
        console.log(`  payload.sub (auth.users.id) = ${staff03Profile?.userId}`);
        console.log(`  event_staff.userId = ${staffRecords[0]?.userId}`);
        console.log(`  MATCH: ${staff03Profile?.userId === staffRecords[0]?.userId}`);

    } catch (err) {
        console.error('Audit error:', err);
    } finally {
        await client.end();
    }
}

audit();
