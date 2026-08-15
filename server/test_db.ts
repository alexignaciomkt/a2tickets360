import { db } from './src/db';
import { sql } from 'drizzle-orm';
async function check() {
  try {
    const res = await db.execute(sql`
      SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'staff_profiles';
    `);
    console.log(res);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
check();
