/**
 * REPAIR SCHEMA SCRIPT V2 - a2tickets360 Appwrite
 * Adjusts sizes to fit MariaDB row limits and creates missing attributes.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

const BASE_URL = 'https://database.a2tickets360.com.br';
const ENDPOINT = `${BASE_URL}/v1`;
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';
const API_KEY = '294fd8a1a0da59c01b0d5ba0c4a00ec3556595a865e3946482291b10753b60e1e8af89c5fd9bc8c7555a19af4305a392b2e8b997d4bdded151bb5594f94b1b148cd19ebf69fb445df272b9a103991205203e3d54bc67d9ca817248dca5ae627e8d975de833d9052199f94b95db5b1f842d45f65e4f87fcb0cd42142ebf4acf1c';

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function apiRequest(method, path, body = null) {
    return new Promise((resolve) => {
        const parsed = new URL(`${ENDPOINT}${path}`);
        const bodyStr = body ? JSON.stringify(body) : null;
        const req = https.request({
            hostname: parsed.hostname,
            port: 443,
            path: parsed.pathname + parsed.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Key': API_KEY,
                ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
            },
            rejectUnauthorized: false
        }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
                catch(e) { resolve({ status: res.statusCode, data: d }); }
            });
        });
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

// ─── MANOBRAS DE REPARO ──────────────────────────────────────────────────────

async function repairEventsCollection() {
    console.log('\n📁 Reparando coleção: events');
    
    // 1. Deletar campo gigante se existir (pra liberar linha no MySQL)
    console.log('    [Step 1] Redimensionando description de 15k para 5k...');
    const descCheck = await apiRequest('GET', `/databases/${DATABASE_ID}/collections/events/attributes/description`);
    if (descCheck.status === 200) {
        process.stdout.write('      Deletando antigo (15k)...');
        await apiRequest('DELETE', `/databases/${DATABASE_ID}/collections/events/attributes/description`);
        await sleep(5000); // Dar tempo para o MySQL processar a deleção
        console.log(' ✅');
    }

    // 2. Novos tamanhos otimizados
    const attributes = [
        ['string', { key: 'organizerId', size: 255, required: false }],
        ['string', { key: 'title', size: 500, required: false }],
        ['string', { key: 'description', size: 5000, required: false }], // Reduzido
        ['string', { key: 'category', size: 255, required: false }],
        ['string', { key: 'eventType', size: 255, required: false, default: 'paid' }],
        ['string', { key: 'date', size: 255, required: false }],
        ['string', { key: 'time', size: 255, required: false }],
        ['string', { key: 'endDate', size: 255, required: false }],
        ['string', { key: 'endTime', size: 255, required: false }],
        ['string', { key: 'duration', size: 255, required: false }],
        ['string', { key: 'status', size: 255, required: false, default: 'draft' }],
        ['string', { key: 'imageUrl', size: 500, required: false }], // Reduzido
        ['string', { key: 'floorPlanUrl', size: 500, required: false }], // Reduzido
        ['string', { key: 'locationName', size: 255, required: false }],
        ['string', { key: 'locationAddress', size: 500, required: false }],
        ['string', { key: 'locationCity', size: 255, required: false }],
        ['string', { key: 'locationState', size: 255, required: false }],
        ['string', { key: 'locationPostalCode', size: 255, required: false }],
        ['string', { key: 'featuredPaymentStatus', size: 255, required: false, default: 'none' }],
        ['integer', { key: 'capacity', required: false, default: 0 }],
        ['boolean', { key: 'isFeatured', required: false, default: false }],
        ['datetime', { key: 'featuredUntil', required: false }]
    ];

    for (const [type, attr] of attributes) {
        process.stdout.write(`    Checking ${attr.key}...`);
        const check = await apiRequest('GET', `/databases/${DATABASE_ID}/collections/events/attributes/${attr.key}`);
        if (check.status === 200) {
            console.log(' [OK]');
        } else {
            process.stdout.write(' [Missing] Creating...');
            const create = await apiRequest('POST', `/databases/${DATABASE_ID}/collections/events/attributes/${type}`, attr);
            if (create.status < 300) { console.log(' ✅'); await sleep(1500); }
            else { console.log(` ❌ (Erro ${create.status}: ${create.data?.message})`); }
        }
    }
}

async function main() {
    console.log('🛠️  Iniciando Reparo Avançado de Schema...');
    await repairEventsCollection();
    console.log('\n✅ Reparo concluído!');
}

main().catch(console.error);
