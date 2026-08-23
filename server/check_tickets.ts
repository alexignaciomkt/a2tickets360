import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function run() {
  const res = await db.execute(sql`
    SELECT pt.id, pt.qr_code_data, pt.validated_at, pt.validated_by, 
           ep.full_name as participant_name
    FROM purchased_tickets pt
    LEFT JOIN event_participants ep ON pt.participant_id = ep.id
    WHERE pt.event_id = 'cf475fbe-7420-4948-ae0c-da532d41e0cb'
    ORDER BY pt.created_at
  `);
  console.log(JSON.stringify(res, null, 2));
  
  const logs = await db.execute(sql`
    SELECT COUNT(*) as log_count FROM ticket_checkin_logs
    WHERE event_id = 'cf475fbe-7420-4948-ae0c-da532d41e0cb'
  `);
  console.log('Checkin logs:', JSON.stringify(logs, null, 2));
  
  process.exit(0);
}
run();
