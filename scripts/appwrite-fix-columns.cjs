const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const databases = new Databases(client);

const DB_ID = '69adeac924490d77865d';
const COLLECTION_ID = 'user_profiles';

// The missing fields we need to add, with safe sizes: URLs get 2048, others 255.
const fieldsToAdd = [
    { key: 'name', size: 255 },
    { key: 'address', size: 255 },
    { key: 'postalCode', size: 20 },
    { key: 'documentBackUrl', size: 2048 },
    { key: 'logoUrl', size: 2048 },
    { key: 'facebookUrl', size: 2048 }
];

async function createMissingAttributes() {
    console.log('🚀 Restaurando campos ausentes (Step 2 - Onboarding)...');
    
    for (const field of fieldsToAdd) {
        try {
            console.log(`Criando: ${field.key}...`);
            await databases.createStringAttribute(DB_ID, COLLECTION_ID, field.key, field.size, false, null);
            console.log(`✅ '${field.key}' enfileirado para criação.`);
        } catch (error) {
            console.error(`⚠️ Erro em '${field.key}':`, error.message);
        }
    }
    
    console.log('--- Criação finalizada. Eles podem levar alguns segundos para estarem fully avaliable. ---');
}

createMissingAttributes();
