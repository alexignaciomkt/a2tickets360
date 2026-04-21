const { Client, Storage, Permission, Role } = require('node-appwrite');

/**
 * CONFIGURAÇÕES DO APPWRITE
 */
const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const storage = new Storage(client);

const bucketsToCreate = [
    { id: 'event_images', name: 'Event Images' },
    { id: 'user_documents', name: 'User Documents' },
    { id: 'company_logos', name: 'Company Logos' }
];

async function setupStorage() {
    console.log('🚀 Iniciando Configuração do Appwrite Storage...');

    for (const bucket of bucketsToCreate) {
        try {
            // Tenta criar o bucket
            await storage.createBucket(
                bucket.id,
                bucket.name,
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                false, // fileSecurity (false = usa as permissoes do bucket por definicao)
                true, // enabled
                undefined, // maximum file size
                undefined // allowed file extensions
            );
            console.log(`✅ Bucket '${bucket.name}' (${bucket.id}) criado com sucesso.`);
        } catch (error) {
            if (error.code === 409) {
                console.log(`⚠️ Bucket '${bucket.name}' (${bucket.id}) já existe. Atualizando permissões...`);
                try {
                    await storage.updateBucket(
                        bucket.id,
                        bucket.name,
                        [
                            Permission.read(Role.any()),
                            Permission.create(Role.users()),
                            Permission.update(Role.users()),
                            Permission.delete(Role.users())
                        ],
                        false,
                        true,
                        undefined,
                        undefined
                    );
                    console.log(`✅ Permissões de '${bucket.name}' atualizadas.`);
                } catch (updateError) {
                     console.error(`❌ Erro ao atualizar '${bucket.name}':`, updateError.message);
                }
            } else {
                console.error(`❌ Erro ao criar '${bucket.name}':`, error.message);
            }
        }
    }
    
    console.log('--- ✅ Configuração de Storage Finalizada! ---');
}

setupStorage();
