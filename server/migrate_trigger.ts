import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Applying QR Code Trigger...");
    
    // 3. Create Trigger Function for secure QR code generation
    try {
        await db.execute(sql`
        CREATE OR REPLACE FUNCTION generate_secure_qr_code()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.qr_code_data IS NULL THEN
                NEW.qr_code_data := 'TKT_' || encode(gen_random_bytes(16), 'hex');
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_purchased_tickets_qr ON purchased_tickets;
        CREATE TRIGGER trg_purchased_tickets_qr
        BEFORE INSERT ON purchased_tickets
        FOR EACH ROW
        EXECUTE FUNCTION generate_secure_qr_code();
        `);
        console.log("Created trigger for secure QR code generation");
    } catch(e) {
        console.error(e);
    }
    
    process.exit(0);
}
main();
