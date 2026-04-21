const { Client, Databases } = require('node-appwrite');
const fs = require('fs');


const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const databases = new Databases(client);
const DB_ID = '69adeac924490d77865d';
const COLLECTION_ID = 'user_profiles';

async function checkSizes() {
    try {
        const attributes = await databases.listAttributes(DB_ID, COLLECTION_ID);
        let totalBytes = 0;
        
        let output = '--- TAMANHO DOS ATRIBUTOS ---\n';
        attributes.attributes.forEach(a => {
            if (a.status !== 'available') return;
            
            let bytes = 0;
            if (a.type === 'string') {
                bytes = a.size * 4; // utf8mb4 max size
            } else if (a.type === 'integer' || a.type === 'float') {
                bytes = 8;
            } else if (a.type === 'boolean') {
                bytes = 1;
            }
            
            output += `- ${a.key}: ${a.size || ''} (${bytes} bytes)\n`;
            totalBytes += bytes;
        });
        
        output += `\nTotal Estimado (Max MýSQL é ~65535): ${totalBytes} bytes`;
        fs.writeFileSync('sizes-node.txt', output);
        console.log('✅ Salvo em sizes-node.txt');
    } catch (err) {
        console.error('Erro:', err.message);
    }
}

checkSizes();
