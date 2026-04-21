const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const databases = new Databases(client);
const DB_ID = '69adeac924490d77865d';
const COLLECTION_ID = 'user_profiles';

const newFields = [
    { key: 'fullName', size: 255 }, // mapped from name
    { key: 'addressStr', size: 255 }, // mapped from address
    { key: 'docFrontUrl', size: 1000 }, // mapped from documentFrontUrl
    { key: 'docBackUrl', size: 1000 }, // mapped from documentBackUrl
    { key: 'compAddress', size: 255 }, // mapped from companyAddress
    { key: 'companyLogoUrl', size: 1000 }, // mapped from logoUrl
    { key: 'fbUrl', size: 1000 } // mapped from facebookUrl
];

async function createNewFields() {
    console.log('🚀 Criando ATRIBUTOS ALTERNATIVOS para bypass de Redis lock...');
    
    for (const field of newFields) {
        try {
            console.log(`➕ Criando: ${field.key} (Size: ${field.size})...`);
            await databases.createStringAttribute(DB_ID, COLLECTION_ID, field.key, field.size, false, null);
        } catch (e) {
            console.error(`⚠️ Erro ao criar ${field.key}:`, e.message);
        }
    }
    
    console.log('✅ Finalizado Criação Alternate Fields!');
}

createNewFields();
