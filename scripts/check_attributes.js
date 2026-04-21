import { Client, Databases } from 'node-appwrite';

const MASTER_KEY = '7942f0b31397407a0f7cceb611bd27cb71c0b1111e8071491081548049d9ca814d3ef19f1d876afde166690e53eb09b892aa124af3009e170e772c8aa8a5c36c02aa920887d2f73cf87eed9d6f95e5be3321beca30e3b0685cdb4b834694d75ee0024a7a65804920bfcf6d75dae046067b501e011ff61f3a805b503e438d52ad';
const ENDPOINT = 'https://database.a2tickets360.com.br/v1';
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';
const COLLECTION_ID = 'user_profiles';

async function checkAttributes() {
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(MASTER_KEY);

    const databases = new Databases(client);

    try {
        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        console.log('--- Atributos da Coleção user_profiles ---');
        collection.attributes.forEach(attr => {
            console.log(`- ${attr.key} (${attr.type})`);
        });
    } catch (error) {
        console.error('Erro ao buscar atributos:', error.message);
    }
}

checkAttributes();
