const { Client, Databases } = require('node-appwrite');
const fs = require('fs');

const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const databases = new Databases(client);

async function dumpRaw() {
    console.log('📦 Buscando raw payload da coleção...');
    try {
        const attributes = await databases.listAttributes('69adeac924490d77865d', 'user_profiles');
        let output = '';
        attributes.attributes.forEach(a => {
            output += `${a.key} | status: ${a.status} | error: ${a.error || 'none'}\n`;
        });
        fs.writeFileSync('raw-attributes.txt', output);
        console.log('✅ Salvo em raw-attributes.txt');
    } catch (e) {
        console.error(e);
    }
}

dumpRaw();
