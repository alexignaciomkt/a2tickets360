// Test portaria with admin token impersonating the auth middleware behavior
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, ne } from 'drizzle-orm';
import { events, eventStaff, organizers, platformMasters } from './src/db/schema';
import { AuthorizationEngine } from './src/services/authorizationEngine';

const DATABASE_URL = process.env.DATABASE_URL!;
const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function test() {
    try {
        // The exact userId that the authMiddleware would extract for staff03
        const userId = 'c192249a-ca14-4292-ae73-54efb9ad3621';
        
        console.log('=== SIMULATING PORTARIA ROUTE with payload.id ===');
        console.log(`userId (payload.id) = ${userId}`);
        
        // Replicate portaria.ts logic exactly
        let candidateEventIds = new Set<string>();
        let isMaster = false;
        
        const masters = await db.select().from(platformMasters).where(and(eq(platformMasters.userId, userId), eq(platformMasters.status, 'active')));
        if (masters.length > 0) isMaster = true;
        console.log(`isMaster: ${isMaster}`);

        if (!isMaster) {
            // Owner
            const ownerOrgs = await db.select({ id: organizers.id }).from(organizers).where(eq(organizers.userId, userId));
            console.log(`Owner orgs: ${ownerOrgs.length}`);
            
            // Event Staff
            const staffRecords = await db.select({ eventId: eventStaff.eventId }).from(eventStaff).where(and(eq(eventStaff.userId, userId), eq(eventStaff.status, 'ACTIVE')));
            console.log(`Active event_staff records: ${staffRecords.length}`);
            staffRecords.forEach(s => candidateEventIds.add(s.eventId));
        }

        console.log(`Candidate event IDs: ${candidateEventIds.size}`);
        console.log(`IDs: ${Array.from(candidateEventIds).join(', ')}`);

        if (candidateEventIds.size === 0) {
            console.log('\n❌ No candidate events found. Portaria would return empty.');
            await client.end();
            return;
        }

        // Check permissions
        const operations = [];
        for (const eventId of Array.from(candidateEventIds)) {
            const ev = await db.select().from(events).where(eq(events.id, eventId));
            if (ev.length === 0) continue;
            const eventInfo = ev[0];

            console.log(`\nChecking hasPermission for event "${eventInfo.title}"...`);
            const hasPerm = await AuthorizationEngine.hasPermission({
                userId,
                organizerId: eventInfo.organizerId,
                eventId: eventInfo.id,
                permissionKey: 'checkin.scan'
            });
            console.log(`  checkin.scan = ${hasPerm}`);

            if (hasPerm) {
                operations.push({
                    id: eventInfo.id,
                    title: eventInfo.title,
                    slug: eventInfo.slug,
                    date: eventInfo.startDate,
                });
            }
        }

        console.log(`\n=== RESULT ===`);
        console.log(`Operations returned: ${operations.length}`);
        if (operations.length > 0) {
            console.log('✅ SUCESSO!');
            for (const op of operations) {
                console.log(`  - ${op.title} (slug: ${op.slug})`);
            }
        } else {
            console.log('❌ FALHA: Nenhuma operação autorizada.');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await client.end();
    }
}

test();
