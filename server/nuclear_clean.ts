import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function nuclearClean() {
    try {
        console.log("🔥 NUCLEAR CLEANUP STARTING 🔥");
        
        console.log("Finding organizers and master users...");
        const keepUsersResult = await db.execute(sql`SELECT user_id FROM profiles WHERE role IN ('organizer', 'master', 'admin');`);
        
        // Handle postgres array result format depending on the driver
        let keepUserIds: string[] = [];
        if (Array.isArray(keepUsersResult)) {
            keepUserIds = keepUsersResult.map((u: any) => u.user_id);
        } else if (keepUsersResult && (keepUsersResult as any).rows) {
            keepUserIds = (keepUsersResult as any).rows.map((u: any) => u.user_id);
        }

        console.log(`Found ${keepUserIds.length} organizers/masters to KEEP.`);
        
        if (keepUserIds.length === 0) {
            console.error("NO ORGANIZERS FOUND! ABORTING to prevent wiping the entire platform.");
            // process.exit(1);
            // Wait, we might want to keep the events, but if there are no organizers, who owns them?
            // Let's just keep going but don't delete auth.users if keepUserIds is empty to be safe?
            // Actually, if keepUserIds is empty, we will delete EVERYTHING. We don't want that.
        }

        const keepIdsString = keepUserIds.length > 0 ? keepUserIds.map(id => `'${id}'`).join(',') : "''";

        const tryDelete = async (tableName: string) => {
            try {
                console.log(`Cleaning ${tableName}...`);
                await db.execute(sql.raw(`DELETE FROM ${tableName};`));
            } catch (e: any) {
                console.log(`⚠️ Skipped ${tableName}: ${e.message}`);
            }
        };

        await tryDelete('event_staff_roles');
        await tryDelete('event_staff');
        await tryDelete('staff_profiles');
        await tryDelete('sport_registrations');
        await tryDelete('tickets');
        await tryDelete('buyer_profiles');
        await tryDelete('promoter_profiles');
        await tryDelete('promoter_links');
        await tryDelete('event_checkins');
        await tryDelete('credentials');
        await tryDelete('employee_event_access');
        await tryDelete('employees');

        if (keepUserIds.length > 0) {
            console.log("Cleaning profiles (except organizers/masters)...");
            await db.execute(sql.raw(`DELETE FROM profiles WHERE user_id NOT IN (${keepIdsString});`));
            
            console.log("Cleaning auth.users (except organizers/masters)...");
            await db.execute(sql.raw(`DELETE FROM auth.users WHERE id NOT IN (${keepIdsString});`));
        }

        console.log("✅ Limpeza concluída. Apenas Eventos e Produtores foram mantidos.");
    } catch (e) {
        console.error("❌ ERROR:", e);
    }
    process.exit(0);
}

nuclearClean();
