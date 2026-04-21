
import { Client, Users } from "node-appwrite";
import fs from 'fs';

const envContent = fs.readFileSync('mcp-appwrite/.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length) env[key.trim()] = value.join('=').trim();
});

const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

const users = new Users(client);

async function checkMaster() {
    console.log("🔍 Verificando usuários no Appwrite...\n");

    try {
        const usersList = await users.list();
        console.log(`Total de usuários: ${usersList.total}\n`);

        for (const user of usersList.users) {
            console.log(`📧 ${user.email}`);
            console.log(`   ID: ${user.$id}`);
            console.log(`   Nome: ${user.name}`);
            console.log(`   Status: ${user.status ? 'Ativo' : 'Inativo'}`);
            console.log(`   Email Verificado: ${user.emailVerification}`);
            console.log(`   Prefs: ${JSON.stringify(user.prefs)}`);
            console.log('---');
        }
    } catch (e) {
        console.error("Erro:", e.message);
    }
}

checkMaster();
