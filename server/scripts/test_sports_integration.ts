process.env.A2SPORTS_INTERNAL_API_KEY = 'test_key';
import { sportsIntegrationService } from '../src/services/sportsIntegrationService';

// Simple mock for fetch
const originalFetch = global.fetch;

async function runTests() {
    console.log('--- Iniciando Testes Unitários: SportsIntegrationService ---');
    process.env.A2SPORTS_INTERNAL_API_KEY = 'test_key';

    const mockEventId = 'event-123';
    const mockEventData = { title: 'Test Event', startDate: new Date().toISOString() };
    const mockOrganizer = { id: 'org-123', userId: 'user-123', name: 'Organizer Test' };

    // Cenário 1: 201 Created
    global.fetch = async () => ({
        status: 201,
        json: async () => ({ championship_id: 'champ-201' })
    }) as unknown as Promise<Response>;
    let res = await sportsIntegrationService.createChampionship(mockEventId, mockEventData, mockOrganizer);
    console.log('[Teste 201 Created]:', res.success === true && res.championshipId === 'champ-201' ? 'PASS' : 'FAIL');

    // Cenário 2: 200 Idempotente
    global.fetch = async () => ({
        status: 200,
        json: async () => ({ id: 'champ-200' })
    }) as unknown as Promise<Response>;
    res = await sportsIntegrationService.createChampionship(mockEventId, mockEventData, mockOrganizer);
    console.log('[Teste 200 Idempotent]:', res.success === true && res.championshipId === 'champ-200' ? 'PASS' : 'FAIL');

    // Cenário 3: 401 Unauthorized
    global.fetch = async () => ({ status: 401 }) as unknown as Promise<Response>;
    res = await sportsIntegrationService.createChampionship(mockEventId, mockEventData, mockOrganizer);
    console.log('[Teste 401 Unauthorized]:', res.errorCode === 'SPORTS_UNAUTHORIZED' ? 'PASS' : 'FAIL');

    // Cenário 4: 404 Not Found
    global.fetch = async () => ({ status: 404 }) as unknown as Promise<Response>;
    res = await sportsIntegrationService.createChampionship(mockEventId, mockEventData, mockOrganizer);
    console.log('[Teste 404 Not Found]:', res.errorCode === 'TENANT_MAPPING_NOT_FOUND' ? 'PASS' : 'FAIL');

    // Cenário 5: 409 Conflict
    global.fetch = async () => ({ status: 409 }) as unknown as Promise<Response>;
    res = await sportsIntegrationService.createChampionship(mockEventId, mockEventData, mockOrganizer);
    console.log('[Teste 409 Conflict]:', res.errorCode === 'EXTERNAL_EVENT_CONFLICT' ? 'PASS' : 'FAIL');

    // Cenário 6: 500 Internal Error (Mapeado para INVALID_RESPONSE neste caso pois não está explícito no catch de fetch ok)
    global.fetch = async () => ({ status: 500 }) as unknown as Promise<Response>;
    res = await sportsIntegrationService.createChampionship(mockEventId, mockEventData, mockOrganizer);
    console.log('[Teste 500 Error]:', res.errorCode === 'INVALID_RESPONSE' ? 'PASS' : 'FAIL');

    // Cenário 7: Timeout / Abort Error
    global.fetch = async () => { throw { name: 'AbortError' } };
    res = await sportsIntegrationService.createChampionship(mockEventId, mockEventData, mockOrganizer);
    console.log('[Teste Timeout]:', res.errorCode === 'TIMEOUT' ? 'PASS' : 'FAIL');

    // Cenário 8: Network falha (DNS)
    global.fetch = async () => { throw new Error('fetch failed') };
    res = await sportsIntegrationService.createChampionship(mockEventId, mockEventData, mockOrganizer);
    console.log('[Teste Network Fail]:', res.errorCode === 'SPORTS_UNAVAILABLE' ? 'PASS' : 'FAIL');

    // Restaurar ambiente original
    global.fetch = originalFetch;
}

runTests();
