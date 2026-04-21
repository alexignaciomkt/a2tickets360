import { Client, Users, Databases, ID } from 'node-appwrite';

const MASTER_KEY = '7942f0b31397407a0f7cceb611bd27cb71c0b1111e8071491081548049d9ca814d3ef19f1d876afde166690e53eb09b892aa124af3009e170e772c8aa8a5c36c02aa920887d2f73cf87eed9d6f95e5be3321beca30e3b0685cdb4b834694d75ee0024a7a65804920bfcf6d75dae046067b501e011ff61f3a805b503e438d52ad';
const ENDPOINT = 'https://database.a2tickets360.com.br/v1';
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';
const COLLECTION_ID = 'user_profiles';

async function createProducer() {
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(MASTER_KEY);

    const users = new Users(client);
    const databases = new Databases(client);

    const email = 'produtor_final@a2tickets360.com.br'; // Mudando para não dar conflito se o anterior foi criado parcialmente
    const password = 'A2Teste2024!';
    const name = 'Produtor de Teste Real';

    console.log(`🚀 Criando Produtor: ${email}...`);

    try {
        // 1. Criar no Auth
        let newUser;
        try {
             newUser = await users.create(ID.unique(), email, undefined, password, name);
             console.log(`✅ Usuário criado no Auth (ID: ${newUser.$id})`);
        } catch (e) {
            console.log('ℹ️ Usuário já existe no Auth ou erro:', e.message);
            // Tenta buscar o usuário se ele já existe
            const list = await users.list([`email=${email}`]);
            if (list.total > 0) {
                newUser = list.users[0];
            } else {
                throw e;
            }
        }

        // 2. Criar Perfil na Coleção (Removendo atributos inexistentes detected pelo check_attributes)
        const profile = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                userId: newUser.$id,
                name: name,
                role: 'organizer',
                status: 'pending',
                profileComplete: false,
                lastStep: 1,
                isActive: true,
                emailVerified: false
            }
        );

        console.log(`✅ Perfil de Produtor criado na base (ID: ${profile.$id})`);
        console.log('\n--- CREDENCIAIS PARA LOGIN ---');
        console.log(`URL: https://gestao.a2tickets360.com.br/ (ou localhost se estiver rodando)`);
        console.log(`Login: ${email}`);
        console.log(`Senha: ${password}`);
        console.log('------------------------------');

    } catch (error) {
        console.error('💥 Erro ao criar produtor:', error.message);
    }
}

createProducer();
