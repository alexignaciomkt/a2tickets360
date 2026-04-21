const { Client, Storage, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const storage = new Storage(client);

const bucketsToFix = [
    { id: 'event_images', name: 'Event Images' },
    { id: 'user_documents', name: 'User Documents' },
    { id: 'company_logos', name: 'Company Logos' }
];

async function fixStorageLimits() {
    console.log('🚀 Iniciando Correção de Limites de Storage...');
    
    // 50MB in bytes
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    
    // Allow all extensions for now (empty array means all allowed in newer Appwrite versions, or we omit it)
    // Actually, according to docs, passing an empty array or omitting it allows all. We'll pass an empty array or typical extensions.
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'pdf'];

    for (const bucket of bucketsToFix) {
        try {
            // 1. Tentar deletar o bucket
            try {
                 await storage.deleteBucket(bucket.id);
                 console.log(`🗑️ Bucket antigo '${bucket.name}' apagado.`);
            } catch (e) {
                 console.log(`ℹ️ Bucket '${bucket.name}' não existia ou erro ignorado.`);
            }

            // 2. Criar novamente do zero com as permissões e limites certos
            await storage.createBucket(
                bucket.id,
                bucket.name,
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                false, // fileSecurity
                true,  // enabled
                30000000, // maximum file size (Must be exactly <= _APP_STORAGE_LIMIT)
                [] // allowed file extensions
            );
            console.log(`✅ Bucket '${bucket.name}' CRIADO COM SUCESSO! (Máx: 30MB)`);
        } catch (error) {
            console.error(`❌ Erro FATAL ao recriar '${bucket.name}':`, error.message);
        }
    }
    
    console.log('--- ✅ Correção Finalizada! ---');
}

fixStorageLimits();
