import { db } from './src/db';
import { staffFunctions } from './src/db/schema';
import { eq, and } from 'drizzle-orm';
async function testFuncs() {
    try {
        const organizerId = 'e467d60f-9ce8-46bf-81ab-b0cdfa2d3925'; // From the test_migration output
        const functions = await db.select().from(staffFunctions)
            .where(and(eq(staffFunctions.organizerId, organizerId), eq(staffFunctions.isActive, true)));
        console.log("Functions count:", functions.length);
    } catch(e) {
        console.error("ERROR:", e.message);
    }
    process.exit(0);
}
testFuncs();
