import { db } from './src/db';
import { sql } from 'drizzle-orm';
async function testAuthUsers() {
    try {
        const testId = 'f6a81b40-683d-4619-a619-957030fbbbd0';
        await db.execute(sql`
            INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
            VALUES (
                ${testId}, 
                'authenticated', 
                'authenticated', 
                'test.fake.user@example.com', 
                'none', 
                now(), 
                '{"provider": "email", "providers": ["email"]}', 
                '{}', 
                now(), 
                now(), 
                '', 
                '', 
                '', 
                ''
            )
        `);
        console.log("Mock user inserted into auth.users!");
    } catch (e) {
        console.error("Error inserting into auth.users:", e.message);
    }
    process.exit(0);
}
testAuthUsers();
