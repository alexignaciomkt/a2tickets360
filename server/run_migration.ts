import { db } from './src/db/index';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        console.log('Running migration...');
        const sqlPath = path.join(__dirname, 'drizzle', 'phase1.sql');
        const query = fs.readFileSync(sqlPath, 'utf8');

        
        // Split by statement if needed, or just execute raw
        await db.execute(sql.raw(query));
        console.log('Migration executed successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

runMigration();
