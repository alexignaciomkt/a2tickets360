import { db } from './src/db';
import { sql } from 'drizzle-orm';
async function cleanDummyUsers() {
    try {
        console.log("Removendo dummy users...");
        await db.execute(sql`DELETE FROM event_staff WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'teste.%@a2tickets.com');`);
        await db.execute(sql`DELETE FROM staff_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'teste.%@a2tickets.com');`);
        await db.execute(sql`DELETE FROM profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'teste.%@a2tickets.com');`);
        await db.execute(sql`DELETE FROM auth.users WHERE email LIKE 'teste.%@a2tickets.com';`);
        console.log("Limpeza concluída.");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
cleanDummyUsers();
