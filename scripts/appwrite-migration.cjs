const { Client, Databases } = require('node-appwrite');

/**
 * CONFIGURAÇÕES DO APPWRITE
 */
const client = new Client()
    .setEndpoint('https://banco.euattendo.com.br/v1')
    .setProject('69adea89bf3bdac8f7a6')
    .setKey('069d2f17bec3e7b6ca2870c7a517c60140e08da457bb0d2dbc624daf90643c40c6e081adf39ce71f02dbafccf93194fdcf7d8addc89b2155c13dac713f086647384ef0b503280fcf9431f42179f7398785890a199a65bcf11e4780ae8efef68499ea57affda64e541588a315f87b5259bca65af1c750a369eb2375d86d113a58');

const databases = new Databases(client);
const databaseId = '69adeac924490d77865d';

/**
 * FUNÇÕES AUXILIARES
 */
async function createString(coll, id, size = 255, required = false, xdefault = null) {
    try {
        await databases.createStringAttribute(databaseId, coll, id, size, required, xdefault);
        console.log(`✅ [${coll}] Atributo String '${id}' criado.`);
    } catch (e) {
        console.log(`⚠️ [${coll}] Atributo '${id}': ${e.message}`);
    }
}

async function createInt(coll, id, min = 0, max = 2147483647, required = false, xdefault = null) {
    try {
        await databases.createIntegerAttribute(databaseId, coll, id, required, min, max, xdefault);
        console.log(`✅ [${coll}] Atributo Integer '${id}' criado.`);
    } catch (e) {
        console.log(`⚠️ [${coll}] Atributo '${id}': ${e.message}`);
    }
}

async function createBool(coll, id, required = false, xdefault = false) {
    try {
        await databases.createBooleanAttribute(databaseId, coll, id, required, xdefault);
        console.log(`✅ [${coll}] Atributo Boolean '${id}' criado.`);
    } catch (e) {
        console.log(`⚠️ [${coll}] Atributo '${id}': ${e.message}`);
    }
}

async function createFloat(coll, id, required = false, xdefault = null) {
    try {
        await databases.createFloatAttribute(databaseId, coll, id, required, -1000000000, 1000000000, xdefault);
        console.log(`✅ [${coll}] Atributo Float '${id}' criado.`);
    } catch (e) {
        console.log(`⚠️ [${coll}] Atributo '${id}': ${e.message}`);
    }
}

async function createIdx(coll, key, type, attrs) {
    try {
        await databases.createIndex(databaseId, coll, key, type, attrs);
        console.log(`✅ [${coll}] Index '${key}' criado.`);
    } catch (e) {
        console.log(`⚠️ [${coll}] Index '${key}': ${e.message}`);
    }
}

/**
 * MIGRATION ENGINE
 */
async function migrate() {
    console.log('🚀 Iniciando Migração do Banco de Dados + Indexes A2 Tickets...');

    // 1. USER PROFILES
    const up = 'user_profiles';
    await createString(up, 'userId', 50, true);
    await createString(up, 'role', 20, true);
    await createString(up, 'status', 20, true, 'pending');
    await createIdx(up, 'idx_role', 'key', ['role']);
    await createIdx(up, 'idx_status', 'key', ['status']);
    await createIdx(up, 'idx_userId', 'key', ['userId']);

    // 2. EVENTS
    const ev = 'events';
    await createString(ev, 'organizerId', 50, true);
    await createString(ev, 'status', 50, false, 'pending');
    await createIdx(ev, 'idx_organizerId', 'key', ['organizerId']);
    await createIdx(ev, 'idx_status', 'key', ['status']);

    // 3. TICKETS
    const tk = 'tickets';
    await createString(tk, 'eventId', 50, true);
    await createIdx(tk, 'idx_eventId', 'key', ['eventId']);

    console.log('--- ✅ Migração de Atributos e Indexes Finalizada! ---');
}

migrate();
