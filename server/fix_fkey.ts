import { db } from './src/db/index';
import { sql } from 'drizzle-orm';
async function run() {
    try {
        console.log('Dropping bad constraint...');
        await db.execute(sql.raw("ALTER TABLE purchased_tickets DROP CONSTRAINT IF EXISTS purchased_tickets_parent_purchase_id_fkey;"));
        
        console.log('Adding correct constraint...');
        await db.execute(sql.raw("ALTER TABLE purchased_tickets ADD CONSTRAINT purchased_tickets_parent_purchase_id_fkey FOREIGN KEY (parent_purchase_id) REFERENCES sales(id) ON DELETE SET NULL;"));
        
        console.log('Constraint fixed successfully!');
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}
run();
