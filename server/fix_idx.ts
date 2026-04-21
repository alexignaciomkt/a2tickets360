import { appwriteDatabases, DB_ID, COLLECTIONS } from './src/lib/appwrite';

async function run() {
    try {
        console.log('🔄 Criando index userId em organizer_details...', DB_ID, COLLECTIONS.organizer_details);
        await appwriteDatabases.createIndex(DB_ID, COLLECTIONS.organizer_details, 'userId_index', 'key', ['userId'], ['ASC']);
        console.log('✅ Index userId criado!');
    } catch(e) {
        console.log('Aviso (organizer_details):', e.message);
    }

    try {
        console.log('🔄 Criando index status em events...');
        await appwriteDatabases.createIndex(DB_ID, COLLECTIONS.events, 'status_index', 'key', ['status'], ['ASC']);
        console.log('✅ Index status criado!');
    } catch(e) {
        console.log('Aviso (events):', e.message);
    }
}
run();
