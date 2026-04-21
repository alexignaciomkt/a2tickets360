import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';

const MASTER_KEY = '7942f0b31397407a0f7cceb611bd27cb71c0b1111e8071491081548049d9ca814d3ef19f1d876afde166690e53eb09b892aa124af3009e170e772c8aa8a5c36c02aa920887d2f73cf87eed9d6f95e5be3321beca30e3b0685cdb4b834694d75ee0024a7a65804920bfcf6d75dae046067b501e011ff61f3a805b503e438d52ad';
const ENDPOINT = 'https://database.a2tickets360.com.br/v1';
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';

async function heal() {
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(MASTER_KEY);

    const databases = new Databases(client);
    const storage = new Storage(client);

    console.log('🩹 Iniciando Script de Auto-Cura de Permissões (v2)...');

    const collections = [
        'user_profiles', 
        'organizer_details', 
        'events', 
        'tickets', 
        'sales', 
        'event_categories', 
        'webhook_logs',
        'system_settings',
        'visitors'
    ];

    for (const collId of collections) {
        try {
            console.log(`🔍 Buscando metadados da coleção: ${collId}`);
            const currentColl = await databases.getCollection(DATABASE_ID, collId);
            
            // Permissões Sugeridas para Flexibilidade Máxima em Desenvolvimento
            const permissions = [
                Permission.read(Role.any()),      
                Permission.create(Role.users()), 
                Permission.update(Role.users()), 
                Permission.delete(Role.users()),
            ];

            await databases.updateCollection(
                DATABASE_ID, 
                collId, 
                currentColl.name, 
                permissions, 
                true
            );
            console.log(`✅ Coleção [${collId}] atualizada.`);
        } catch (e) {
            console.error(`⚠️ Erro ao ajustar [${collId}]:`, e.message);
        }
    }

    // Ajustar Storage
    try {
        console.log('🔍 Ajustando permissões do Bucket [media]...');
        await storage.updateBucket('media', 'Media', [
            Permission.read(Role.any()),    
            Permission.create(Role.users()), 
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ], true);
        console.log('✅ Bucket [media] atualizado para acesso público de leitura.');
    } catch (e) {
        console.error('⚠️ Erro ao ajustar Bucket [media]:', e.message);
    }

    console.log('✨ Auto-Cura finalizada!');
}

heal();
