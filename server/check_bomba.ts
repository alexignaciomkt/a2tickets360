import { db } from './src/db';
import { eq, like } from 'drizzle-orm';
import { profiles, staffProfiles, eventStaff, eventStaffRoles } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function checkData() {
    try {
        console.log("--- BUSCANDO DADOS DE ALEX BOMBA ---");
        
        // 1. Procurar no auth.users
        const authUsers = await db.execute(sql`SELECT id, email, created_at, confirmation_sent_at, email_confirmed_at, invited_at FROM auth.users WHERE email LIKE '%bomba%' OR email LIKE '%alex%';`);
        console.log("\nAUTH USERS:");
        console.log(authUsers);

        // 2. Procurar em profiles
        const profs = await db.execute(sql`SELECT * FROM profiles WHERE email LIKE '%bomba%' OR name ILIKE '%alex bomba%';`);
        console.log("\nPROFILES:");
        console.log(profs);

        // 3. Procurar em staff_profiles
        const sprofs = await db.execute(sql`SELECT * FROM staff_profiles WHERE full_name ILIKE '%alex bomba%';`);
        console.log("\nSTAFF PROFILES:");
        console.log(sprofs);

        let userIds = authUsers.map((u: any) => u.id);
        if (userIds.length === 0 && profs.length > 0) userIds = profs.map((p: any) => p.user_id);
        if (userIds.length === 0 && sprofs.length > 0) userIds = sprofs.map((sp: any) => sp.user_id);

        if (userIds.length > 0) {
            console.log(`\nVerificando vinculações para os user_ids encontrados: ${userIds.join(', ')}`);
            for (const uid of userIds) {
                // 4. event_staff
                const es = await db.select().from(eventStaff).where(eq(eventStaff.userId, uid));
                console.log(`\nEVENT STAFF para ${uid}:`);
                console.log(es);

                if (es.length > 0) {
                    for (const evs of es) {
                        const roles = await db.select().from(eventStaffRoles).where(eq(eventStaffRoles.eventStaffId, evs.id));
                        console.log(`\nEVENT STAFF ROLES para eventStaffId ${evs.id}:`);
                        console.log(roles);
                    }
                }
            }
        }
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
checkData();
