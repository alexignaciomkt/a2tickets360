const { Client, Databases, ID } = require('node-appwrite');

/**
 * CONFIGURAÇÃO: Altere estes valores conforme seu novo servidor
 */
const client = new Client()
    .setEndpoint('https://TESTE.banco.euattendo.com.br/v1') // Seu novo Endpoint
    .setProject('69adea89bf3bdac8f7a6')                  // Seu novo Project ID
    .setKey('SUA_API_KEY_AQUI');                          // Sua API Key (com permissão Database)

const databases = new Databases(client);
const databaseId = '69adeac924490d77865d'; // ID do Banco

async function setupSchema() {
    try {
        console.log('🚀 Iniciando criação do Schema...');

        // 1. Coleção User Profiles
        console.log('--- Criando user_profiles ---');
        await databases.createCollection(databaseId, 'user_profiles', 'User Profiles');
        const userFields = [
            { id: 'userId', type: 'string', size: 255, required: true },
            { id: 'name', type: 'string', size: 255, required: false },
            { id: 'email', type: 'string', size: 255, required: false },
            { id: 'role', type: 'string', size: 50, required: false },
            { id: 'status', type: 'string', size: 50, required: false },
            { id: 'cpf', type: 'string', size: 20, required: false },
            { id: 'cnpj', type: 'string', size: 20, required: false },
            { id: 'companyName', type: 'string', size: 255, required: false },
            { id: 'slug', type: 'string', size: 255, required: false },
            { id: 'profileComplete', type: 'boolean', required: false, default: false },
            { id: 'isActive', type: 'boolean', required: false, default: true },
        ];

        for (const field of userFields) {
            if (field.type === 'string') {
                await databases.createStringAttribute(databaseId, 'user_profiles', field.id, field.size, field.required);
            } else if (field.type === 'boolean') {
                await databases.createBooleanAttribute(databaseId, 'user_profiles', field.id, field.required, field.default);
            }
            console.log(`✅ Atributo ${field.id} criado.`);
        }

        // 2. Coleção Events
        console.log('--- Criando events ---');
        await databases.createCollection(databaseId, 'events', 'Events');
        const eventFields = [
            { id: 'title', type: 'string', size: 255, required: true },
            { id: 'description', type: 'string', size: 5000, required: false },
            { id: 'date', type: 'string', size: 50, required: false },
            { id: 'organizerId', type: 'string', size: 255, required: false },
            { id: 'status', type: 'string', size: 50, required: false },
            { id: 'category', type: 'string', size: 100, required: false },
            { id: 'bannerUrl', type: 'string', size: 500, required: false },
            { id: 'city', type: 'string', size: 100, required: false },
            { id: 'state', type: 'string', size: 2, required: false },
            { id: 'isFeatured', type: 'boolean', required: false, default: false },
        ];

        for (const field of eventFields) {
            if (field.type === 'string') {
                await databases.createStringAttribute(databaseId, 'events', field.id, field.size, field.required);
            } else if (field.type === 'boolean') {
                await databases.createBooleanAttribute(databaseId, 'events', field.id, field.required, field.default);
            }
        }

        // 3. Coleção Tickets
        console.log('--- Criando tickets ---');
        await databases.createCollection(databaseId, 'tickets', 'Tickets');
        const ticketFields = [
            { id: 'userId', type: 'string', size: 255, required: true },
            { id: 'eventId', type: 'string', size: 255, required: true },
            { id: 'ticketId', type: 'string', size: 255, required: true },
            { id: 'status', type: 'string', size: 50, required: false },
            { id: 'qrCodeData', type: 'string', size: 255, required: false },
            { id: 'photoId', type: 'string', size: 255, required: false },
        ];

        for (const field of ticketFields) {
            await databases.createStringAttribute(databaseId, 'tickets', field.id, field.size, field.required);
        }

        console.log('✨ Schema criado com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    }
}

setupSchema();
