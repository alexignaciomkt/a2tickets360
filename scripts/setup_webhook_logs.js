import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const MASTER_KEY = '7942f0b31397407a0f7cceb611bd27cb71c0b1111e8071491081548049d9ca814d3ef19f1d876afde166690e53eb09b892aa124af3009e170e772c8aa8a5c36c02aa920887d2f73cf87eed9d6f95e5be3321beca30e3b0685cdb4b834694d75ee0024a7a65804920bfcf6d75dae046067b501e011ff61f3a805b503e438d52ad';
const ENDPOINT = 'https://database.a2tickets360.com.br/v1';
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';

async function setup() {
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(MASTER_KEY);

    const databases = new Databases(client);

    console.log('🛠️ Iniciando Setup de Webhooks Logs...');

    try {
        const collectionName = 'Webhook Logs';
        const collectionId = 'webhook_logs';

        // 1. Criar Coleção
        try {
            await databases.getCollection(DATABASE_ID, collectionId);
            console.log('✅ Coleção [webhook_logs] já existe.');
        } catch (e) {
            console.log('📦 Criando coleção [webhook_logs]...');
            await databases.createCollection(
                DATABASE_ID, 
                collectionId, 
                collectionName,
                [
                    Permission.read(Role.any()), // Opcional: Master controla, mas vamos facilitar a leitura no Admin
                    Permission.update(Role.any()),
                    Permission.delete(Role.any()),
                ]
            );
        }

        // 2. Criar Atributos
        const attributes = [
            { key: 'event', type: 'string', size: 100 },
            { key: 'url', type: 'string', size: 255 },
            { key: 'status', type: 'string', size: 20 },
            { key: 'payload', type: 'string', size: 5000 },
            { key: 'response', type: 'string', size: 5000 },
        ];

        for (const attr of attributes) {
            try {
                await databases.createStringAttribute(DATABASE_ID, collectionId, attr.key, attr.size, false);
                console.log(`➕ Atributo [${attr.key}] criado.`);
                // Pequeno delay para evitar overload de schema no Appwrite
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                console.log(`ℹ️ Atributo [${attr.key}] já existe ou erro: ${e.message}`);
            }
        }

        console.log('✨ Setup finalizado! Aguardando o Appwrite processar os índices...');

    } catch (error) {
        console.error('💥 Erro no Setup:', error.message);
    }
}

setup();
