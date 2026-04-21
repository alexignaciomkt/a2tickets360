const fs = require('fs');
const path = require('path');

const ENDPOINT = 'https://banco.euattendo.com.br/v1';
const PROJECT_ID = '69adea89bf3bdac8f7a6';
const API_KEY = '069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58';

async function testUploadNative() {
    console.log('--- Iniciando Teste de Diagnóstico de Storage (Fetch API) ---');
    const bucketId = 'event_images';
    const testFilePath = path.join(__dirname, 'test-image.txt');
    
    try {
        // 1. Criar arquivo de teste local
        fs.writeFileSync(testFilePath, 'Este é um teste de upload para diagnosticar o erro do Appwrite.');
        console.log('1. Arquivo de teste local criado.');

        // 2. Preparar FormData manual (usando blob para Node < 18 compatibilidade ou FormData nativo no Node 18+)
        console.log(`\n2. Tentando upload para o bucket '${bucketId}' via HTTP direto...`);
        
        const fileContent = fs.readFileSync(testFilePath);
        const blob = new Blob([fileContent], { type: 'text/plain' });
        
        const formData = new FormData();
        formData.append('fileId', 'unique()');
        formData.append('file', blob, 'test-image.txt');

        // 3. Fazer o Request
        const response = await fetch(`${ENDPOINT}/storage/buckets/${bucketId}/files`, {
            method: 'POST',
            headers: {
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Key': API_KEY,
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
           console.error('\n❌ FALHA NO UPLOAD:');
           console.error('Status HTTP:', response.status);
           console.error('Resposta do Servidor:', data);
        } else {
           console.log('\n✅ UPLOAD BEM SUCEDIDO!');
           console.log('ID do Arquivo:', data.$id);
           
           // Limpar remotamente
           await fetch(`${ENDPOINT}/storage/buckets/${bucketId}/files/${data.$id}`, {
               method: 'DELETE',
               headers: {
                   'X-Appwrite-Project': PROJECT_ID,
                   'X-Appwrite-Key': API_KEY,
               }
           });
           console.log('Arquivo remoto apagado de teste.');
        }

    } catch (error) {
        console.error('\n❌ ERRO FATAL DE REDE/CÓDIGO:');
        console.error(error.message);
    } finally {
        if (fs.existsSync(testFilePath)) {
             fs.unlinkSync(testFilePath);
        }
    }
}

testUploadNative();
