/**
 * Verify Appwrite schema - lists all collections and their attributes
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

const BASE = 'https://database.a2tickets360.com.br/v1';
const PROJECT = 'a2tickets360';
const DB = 'a2tickets360-db';
const API_KEY = '294fd8a1a0da59c01b0d5ba0c4a00ec3556595a865e3946482291b10753b60e1e8af89c5fd9bc8c7555a19af4305a392b2e8b997d4bdded151bb5594f94b1b148cd19ebf69fb445df272b9a103991205203e3d54bc67d9ca817248dca5ae627e8d975de833d9052199f94b95db5b1f842d45f65e4f87fcb0cd42142ebf4acf1c';

function httpReq(method, url, body, headers) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const bodyStr = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: parsed.hostname,
            port: parsed.port || 443,
            path: parsed.pathname + parsed.search,
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            rejectUnauthorized: false
        };
        if (bodyStr) opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        const r = https.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
                catch (e) { resolve({ status: res.statusCode, data: d }); }
            });
        });
        r.on('error', reject);
        r.setTimeout(15000, () => { r.destroy(); reject(new Error('TIMEOUT')); });
        if (bodyStr) r.write(bodyStr);
        r.end();
    });
}

const H = { 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': API_KEY };

async function main() {
    console.log('====================================');
    console.log(' Appwrite Schema Verification');
    console.log('====================================\n');

    // List collections
    const r = await httpReq('GET', `${BASE}/databases/${DB}/collections?queries[]=limit(50)`, null, H);
    if (r.status !== 200) {
        console.error('Erro ao listar coleções:', r.status, JSON.stringify(r.data));
        return;
    }

    const collections = r.data.collections || [];
    console.log(`✅ ${collections.length} Coleção(ões) encontrada(s):\n`);

    for (const col of collections) {
        // Get attribute count
        const attrRes = await httpReq('GET', `${BASE}/databases/${DB}/collections/${col.$id}/attributes?queries[]=limit(100)`, null, H);
        const attrCount = attrRes.data?.total || 0;
        const attrList = attrRes.data?.attributes || [];
        const hasErrors = attrList.some(a => a.status === 'failed');

        // Get index count
        const idxRes = await httpReq('GET', `${BASE}/databases/${DB}/collections/${col.$id}/indexes`, null, H);
        const idxCount = idxRes.data?.total || 0;
        const idxList = idxRes.data?.indexes || [];
        const idxErrors = idxList.some(i => i.status === 'failed');

        const status = (hasErrors || idxErrors) ? '⚠️ ' : '✅';
        console.log(`${status} ${col.name} (${col.$id})`);
        console.log(`   Atributos: ${attrCount} | Índices: ${idxCount}`);

        if (hasErrors) {
            const failed = attrList.filter(a => a.status === 'failed');
            console.log(`   ❌ Atributos com falha: ${failed.map(a => a.key).join(', ')}`);
        }
        if (idxErrors) {
            const failedIdx = idxList.filter(i => i.status === 'failed');
            console.log(`   ❌ Índices com falha: ${failedIdx.map(i => i.key).join(', ')}`);
        }
    }

    // Check buckets
    console.log('\n--- Storage Buckets ---');
    const bucketsRes = await httpReq('GET', `${BASE}/storage/buckets`, null, H);
    const buckets = bucketsRes.data?.buckets || [];
    console.log(`✅ ${buckets.length} Bucket(s) encontrado(s):`);
    buckets.forEach(b => console.log(`   - ${b.$id} (${b.name}) | Max: ${(b.maximumFileSize / 1024 / 1024).toFixed(0)}MB`));

    console.log('\n====================================');
    console.log(' Verificação concluída!');
    console.log('====================================');
}

main().catch(e => {
    console.error('FATAL:', e.message);
    process.exit(1);
});
