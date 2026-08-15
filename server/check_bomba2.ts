import { db } from './src/db';
import { eq } from 'drizzle-orm';
import { profiles, staffProfiles, eventStaff, eventStaffRoles } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function checkData() {
    try {
        const uid = '5757debe-1c6d-4797-b708-da95e7b328a5';
        
        console.log(`Verificando auth.users para ${uid}...`);
        const au = await db.execute(sql`SELECT id, email, created_at, confirmation_sent_at, email_confirmed_at, invited_at FROM auth.users WHERE id = ${uid};`);
        console.log(au);

        console.log(`\nVerificando profiles para ${uid}...`);
        const p = await db.select().from(profiles).where(eq(profiles.userId, uid));
        console.log(p);

        console.log(`\nVerificando event_staff para ${uid}...`);
        const es = await db.select().from(eventStaff).where(eq(eventStaff.userId, uid));
        console.log(es);

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
checkData();
