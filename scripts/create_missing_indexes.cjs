const sdk = require('node-appwrite');

const client = new sdk.Client();
client
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69ad87225fa699a67720')
    .setKey('d8135786ca1279707378c3068d0cce4243e0b660e73fe19759cc37e17629b3faf685f829cbaa28c0ffe3b5b767ae0f821adfe908ab1fcaceb0616b298e192b98165d0288eb07b8225c0931d43d8e3abadb644b05747a8d259ce3a43d937e6e85067558946e04ccc2050ce2798b2e52ce1e78d7dfed13069478a69a7ad5f5ee9e');

const databases = new sdk.Databases(client);
const DB_ID = 'a2_tickets_360';

async function run() {
    try {
        console.log('🔄 Criando index userId em organizer_details...');
        await databases.createIndex(DB_ID, 'organizer_details', 'userId_index', 'key', ['userId'], ['ASC']);
        console.log('✅ Index userId criado!');
    } catch(e) {
        console.log('Aviso (organizer_details):', e.message);
    }

    try {
        console.log('🔄 Criando index status em events...');
        await databases.createIndex(DB_ID, 'events', 'status_index', 'key', ['status'], ['ASC']);
        console.log('✅ Index status criado!');
    } catch(e) {
        console.log('Aviso (events):', e.message);
    }
}
run();
