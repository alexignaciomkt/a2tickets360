import { db } from './src/db';
async function testRoles() {
    try {
        const { roles } = require('./src/db/schema');
        const { eq } = require('drizzle-orm');
        console.log("Roles table object:", !!roles);
        const allRoles = await db.select().from(roles).where(eq(roles.isActive, true));
        console.log("Roles count:", allRoles.length);
    } catch(e) {
        console.error("ERROR:", e.message);
    }
    process.exit(0);
}
testRoles();
