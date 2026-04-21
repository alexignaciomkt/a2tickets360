import { Client, Databases, Query } from 'node-appwrite';

const MASTER_KEY = '7942f0b31397407a0f7cceb611bd27cb71c0b1111e8071491081548049d9ca814d3ef19f1d876afde166690e53eb09b892aa124af3009e170e772c8auto-run: true;'; // Vou usar a chave que você me deu
const MASTER_KEY_REAL = '7942f0b31397407a0f7cceb611bd27cb71c0b1111e8071491081548049d9ca814d3ef19f1d876afde166690e53eb09b892aa124af3009e170e772c8aa8a5c36c02aa920887d2f73cf87eed9d6f95e5be3321beca30e3b0685cdb4b834694d75ee0024a7a65804920bfcf6d75dae046067b501e011ff61f3a805b503e438d52ad';
const ENDPOINT = 'https://database.a2tickets360.com.br/v1';
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';
const COLLECTION_ID = 'user_profiles';

async function testQuery() {
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(MASTER_KEY_REAL);

    const databases = new Databases(client);

    console.log('🔍 Testando query na coleção user_profiles...');

    try {
        // Tentativa 1: Sem filtro (para ver se é permissão)
        const res1 = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
        console.log('✅ Busca básica (sem filtro): OK. Total:', res1.total);

        // Tentativa 2: Com filtro de Role (o que o Dashboard faz)
        try {
            const res2 = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Query.equal('role', 'organizer')
            ]);
            console.log('✅ Busca com filtro [role]: OK. Total:', res2.total);
        } catch (e) {
            console.error('❌ Falha na busca por [role]:', e.message);
            if (e.message.includes('index')) {
                console.log('💡 DICA: Você precisa criar um índice "key" para o atributo "role" no Console do Appwrite.');
            }
        }

        // Tentativa 3: Com filtro de Status
        try {
            const res3 = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Query.equal('status', 'pending')
            ]);
            console.log('✅ Busca com filtro [status]: OK. Total:', res3.total);
        } catch (e) {
            console.error('❌ Falha na busca por [status]:', e.message);
        }

    } catch (error) {
        console.error('💥 Erro Crítico:', error.message);
    }
}

testQuery();
