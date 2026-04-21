const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const BASE = 'https://database.a2tickets360.com.br/v1';
const PROJECT = 'a2tickets360';
const DB = 'a2tickets360-db';
const KEY = '294fd8a1a0da59c01b0d5ba0c4a00ec3556595a865e3946482291b10753b60e1e8af89c5fd9bc8c7555a19af4305a392b2e8b997d4bdded151bb5594f94b1b148cd19ebf69fb445df272b9a103991205203e3d54bc67d9ca817248dca5ae627e8d975de833d9052199f94b95db5b1f842d45f65e4f87fcb0cd42142ebf4acf1c';

function req(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY } }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); } catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function start() {
    try {
        const data = await req(`${BASE}/databases/${DB}/collections/events/attributes`);
        console.log('=== ATRIBUTOS EM EVENTS ===');
        (data.attributes || []).forEach(a => console.log(`- ${a.key} (${a.type}) [${a.status}]`));
    } catch (e) {
        console.error('Erro:', e.message);
    }
}
start();
