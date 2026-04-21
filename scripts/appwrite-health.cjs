const { Client, Health } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const health = new Health(client);

async function checkHealthAndLimits() {
    console.log('🩺 Verificando Saúde e Limites do Servidor Appwrite...');
    try {
        const time = await health.getTime();
        console.log(`✅ Servidor Online. Tempo: ${time.remoteTime}`);

        // Try checking storage local path health (needs admin)
        const storageHealth = await health.getStorageLocal();
        console.log(`✅ Storage Health Ping: ${storageHealth.status} (Ping: ${storageHealth.ping}ms)`);
        
        // This won't show the exact limit env var, but confirms if storage volume is somewhat OK
        
        console.log('\n--- DIAGNÓSTICO DO PROBLEMA DE STORAGE ---');
        console.log('O erro "storage_invalid_file_size" e "valid range between 1 and 0" indica que a variável');
        console.log('_APP_STORAGE_LIMIT no arquivo .env do seu servidor Appwrite (Portainer) está configurada como 0');
        console.log('ou para um valor inválido, o que impede qualquer upload ou alteração de buckets.');
    } catch (error) {
         console.error('❌ Erro de Health Check:', error.message);
    }
}

checkHealthAndLimits();
