const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const databases = new Databases(client);

const DB_ID = '69adeac924490d77865d';
const COLLECTION_ID = 'user_profiles';

const attrToDrop = ['bio', 'bannerUrl', 'documentFrontUrl', 'companyAddress'];

const attrToCreate = [
    // Recreating with optimized sizes
    { key: 'bio', size: 1000 },
    { key: 'bannerUrl', size: 1000 },
    { key: 'documentFrontUrl', size: 1000 },
    { key: 'companyAddress', size: 255 },
    
    // Adding the missing ones
    { key: 'name', size: 255 },
    { key: 'address', size: 255 },
    { key: 'postalCode', size: 20 },
    { key: 'documentBackUrl', size: 1000 },
    { key: 'logoUrl', size: 1000 },
    { key: 'facebookUrl', size: 1000 }
];

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function optimizeSchema() {
    console.log('🚀 Iniciando Otimização de Memória do Appwrite (Resolvendo Row Size Limit MySQL)...');
    
    for (const key of attrToDrop) {
        try {
            console.log(`🗑️ Dropando atributo oversized: ${key}...`);
            await databases.deleteAttribute(DB_ID, COLLECTION_ID, key);
        } catch (e) {
            console.log(`ℹ️ O atributo ${key} não exite ou já foi apagado.`);
        }
    }
    
    console.log('⏳ Aguardando limpeza do banco de dados (5s)...');
    await delay(5000); // Give appwrite some time to process drop operations
    
    for (const field of attrToCreate) {
        try {
            console.log(`➕ Criando atributo otimizado: ${field.key} (Size: ${field.size})...`);
            await databases.createStringAttribute(DB_ID, COLLECTION_ID, field.key, field.size, false, null);
        } catch (e) {
            console.error(`❌ Erro criar ${field.key}:`, e.message);
        }
    }
    
    console.log('\n✅ Script processado! Os atributos estarão fully available em alguns segundos.');
}

optimizeSchema();
