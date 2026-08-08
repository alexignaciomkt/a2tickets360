import app from '../src/index';
import { sign } from 'hono/jwt';

async function runRouteTests() {
    console.log('--- Iniciando Testes da Rota Hono: /api/integrations/sports/provision-event ---');

    // Assumindo que JWT_SECRET ou SUPABASE_JWT_SECRET está configurado. Se não, geramos um para o teste.
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'test_secret';

    const generateToken = async (role: string, sub: string) => {
        return await sign({ 
            sub, 
            role, 
            app_metadata: { role } // Formato comum Supabase
        }, secret);
    };

    const tokenOrganizer = await generateToken('organizer', 'test-user-id');
    const tokenUser = await generateToken('user', 'test-user-id'); // Invalid role

    // 1. Sem JWT
    let res = await app.request('/api/integrations/sports/provision-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: '123' })
    });
    console.log('[Rota Sem JWT -> 401]:', res.status === 401 ? 'PASS' : 'FAIL');

    // 2. Role inválida
    res = await app.request('/api/integrations/sports/provision-event', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenUser}`
        },
        body: JSON.stringify({ event_id: '123' })
    });
    console.log('[Rota Role Inválida -> 403]:', res.status === 403 ? 'PASS' : 'FAIL');

    // 3. Payload Inválido (sem event_id)
    res = await app.request('/api/integrations/sports/provision-event', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenOrganizer}`
        },
        body: JSON.stringify({})
    });
    console.log('[Rota Payload Inválido -> 400]:', res.status === 400 ? 'PASS' : 'FAIL');

    // O teste real no banco via rota requereria um banco mockado.
    // Como test_sports_integration testa o serviço e test_sports_concurrency testa o banco e o lock,
    // este script prova que o middleware de Autenticação e RBAC da Rota estão ativos e interceptando acessos indevidos.
    console.log('Testes de proteção de rota concluídos.');
    process.exit(0);
}

runRouteTests();
