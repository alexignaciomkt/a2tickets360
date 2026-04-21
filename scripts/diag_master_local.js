import { Client, Databases, Storage, Users } from 'node-appwrite';

const MASTER_KEY = '7942f0b31397407a0f7cceb611bd27cb71c0b1111e8071491081548049d9ca814d3ef19f1d876afde166690e53eb09b892aa124af3009e170e772c8aa8a5c36c02aa920887d2f73cf87eed9d6f95e5be3321beca30e3b0685cdb4b834694d75ee0024a7a65804920bfcf6d75dae046067b501e011ff61f3a805b503e438d52ad';
const ENDPOINT = 'https://database.a2tickets360.com.br/v1';
const PROJECT_ID = 'a2tickets360';

async function diagnose() {
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(MASTER_KEY);

    const databases = new Databases(client);
    const storage = new Storage(client);
    const users = new Users(client);

    console.log('🚀 Iniciando Diagnóstico Master...');

    try {
        // 1. Testar conexão com Databases
        const dbs = await databases.list();
        console.log('✅ Databases encontradas:', dbs.total);
        if (dbs.total === 0) {
            console.error('❌ Nenhuma database encontrada. Verifique o endpoint ou ID do projeto.');
            return;
        }
        
        const dbId = 'a2tickets360-db';

        // 2. Verificar Coleções Críticas
        const collections = ['user_profiles', 'organizer_details', 'events', 'system_settings'];
        for (const coll of collections) {
            try {
                const info = await databases.getCollection(dbId, coll);
                console.log(`✅ Coleção [${coll}]: OK (Permissões: ${info.$permissions?.length || 0})`);
            } catch (e) {
                console.error(`❌ Erro na coleção [${coll}]:`, e.message);
            }
        }

        // 3. Verificar Storage
        try {
            const buckets = await storage.listBuckets();
            console.log('✅ Buckets encontrados:', buckets.total);
            const mediaBucket = buckets.buckets.find(b => b.name === 'media' || b.$id === 'media');
            if (mediaBucket) {
                console.log(`✅ Bucket [media] localizado: ${mediaBucket.$id}`);
            } else {
                console.log('⚠️ Bucket [media] não encontrado pelo nome, listando IDs:', buckets.buckets.map(b => b.$id).join(', '));
            }
        } catch (e) {
            console.error('❌ Erro no Storage:', e.message);
        }

        // 4. Verificar Usuários
        try {
            const userList = await users.list();
            console.log('✅ Usuários no Auth:', userList.total);
        } catch (e) {
            console.error('❌ Erro ao listar usuários:', e.message);
        }

        console.log('✨ Diagnóstico concluído com sucesso!');

    } catch (error) {
        console.error('💥 Erro Fatal no Diagnóstico:', error.message);
    }
}

diagnose();
