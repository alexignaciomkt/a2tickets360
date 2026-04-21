const { Client, Databases } = require('node-appwrite');
const fs = require('fs');


const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const databases = new Databases(client);

const DB_ID = '69adeac924490d77865d';
const COLLECTION_ID = 'user_profiles';

const expectedFields = [
    'name', 'cpf', 'rg', 'phone', 'birthDate', 'address', 'city', 'state', 'postalCode',
    'documentFrontUrl', 'documentBackUrl', 'companyName', 'cnpj', 'companyAddress',
    'logoUrl', 'bannerUrl', 'bio', 'asaasApiKey', 'slug', 'category',
    'instagramUrl', 'facebookUrl', 'whatsappNumber', 'websiteUrl', 'lastStep'
];

async function checkSchema() {
    console.log('🔍 Checando schema da coleção user_profiles...');
    try {
        const attributes = await databases.listAttributes(DB_ID, COLLECTION_ID);
        const existingKeys = attributes.attributes.map(a => a.key);
        
        let output = `\nAtributos existentes (${existingKeys.length}):\n${existingKeys.join(', ')}\n`;
        
        const missingFields = expectedFields.filter(f => !existingKeys.includes(f));
        output += `\n❌ Atributos Ausentes (${missingFields.length}):\n${missingFields.join(', ')}\n`;
        
        const failedKeys = attributes.attributes.filter(a => a.status === 'failed').map(a => a.key);
        output += `\n❌ Atributos com erro (failed) (${failedKeys.length}):\n${failedKeys.join(', ')}\n`;
        
        fs.writeFileSync('schema-report.txt', output);
        console.log('✅ Relatório salvo em schema-report.txt');
    } catch (err) {
        console.error('Erro ao buscar schema:', err.message);
    }
}

checkSchema();
