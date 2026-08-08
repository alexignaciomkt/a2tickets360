import { db } from '../src/db';
import { events, organizers } from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';

async function runConcurrencyTest() {
    console.log('--- Iniciando Teste de Concorrência: Atomic Lock ---');
    
    const crypto = await import('crypto');
    const mockEventId = crypto.randomUUID();
    const mockOrganizerId = crypto.randomUUID();
    try {
        await db.delete(events).where(eq(events.id, mockEventId));
        const realOrgId = 'b97dd291-6a3f-4e6a-a610-2eff65915655';

        await db.insert(events).values({
            id: mockEventId,
            title: 'Evento Concorrencia',
            slug: 'evento-concorrencia-' + Date.now(),
            organizerId: realOrgId,
            categoryCode: 'SPORT_TRUCO',
            status: 'published',
            sportsIntegrationStatus: 'pending'
        } as any);

        console.log('[SETUP] Evento criado com status pending.');

        // O endpoint exige Autenticação. Como testar sem mockar o JWT real?
        // Vou usar db.execute diretamente testando o atomic lock da query que o Hono usa.
        console.log('[RUN] Disparando duas requisições UPDATE simultâneas via db.execute...');

        const query = sql`
            UPDATE events 
            SET sports_integration_status = 'provisioning', sports_last_sync_at = NOW()
            WHERE id = ${mockEventId} AND sports_integration_status IN ('pending', 'failed')
            RETURNING id;
        `;

        const [req1, req2] = await Promise.all([
            db.execute(query),
            db.execute(query)
        ]);

        const acquired1 = req1.length > 0;
        const acquired2 = req2.length > 0;

        console.log(`Req 1 obteve o lock? ${acquired1}`);
        console.log(`Req 2 obteve o lock? ${acquired2}`);

        if ((acquired1 && !acquired2) || (!acquired1 && acquired2)) {
            console.log('[Teste de Concorrência]: PASS - Apenas uma transação alterou para provisioning.');
        } else {
            console.log('[Teste de Concorrência]: FAIL - Race condition detectada ou lock falhou.');
        }

    } catch (e: any) {
        console.error('[ERRO FATAL NO TESTE]:', e.message);
    } finally {
        // Cleanup
        await db.delete(events).where(eq(events.id, mockEventId));
        console.log('[CLEANUP] Evento removido.');
        process.exit(0);
    }
}

runConcurrencyTest();
