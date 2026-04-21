/**
 * Diagnostic script - Appwrite connection & auth test
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

const BASE = 'https://database.a2tickets360.com.br/v1';
const PROJECT = 'a2tickets360';
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
                try { resolve({ status: res.statusCode, data: JSON.parse(d), setCookie: res.headers['set-cookie'] }); }
                catch (e) { resolve({ status: res.statusCode, data: d }); }
            });
        });
        r.on('error', (e) => { console.error('NET ERROR:', e.code, e.message); reject(e); });
        r.setTimeout(15000, () => { r.destroy(); reject(new Error('TIMEOUT after 15s')); });
        if (bodyStr) r.write(bodyStr);
        r.end();
    });
}

async function main() {
    console.log('====================================');
    console.log(' Appwrite Diagnostics');
    console.log(' Server: database.a2tickets360.com.br');
    console.log('====================================\n');

    // Test 1: Health check
    console.log('[1] Health check (no auth)...');
    const h = await httpReq('GET', BASE + '/health', null, {});
    console.log('    Status:', h.status);
    console.log('    Data:', JSON.stringify(h.data).substring(0, 200));

    // Test 2: API Key - list databases
    console.log('\n[2] Test API Key -> GET /databases...');
    const r2 = await httpReq('GET', BASE + '/databases', null, {
        'X-Appwrite-Project': PROJECT,
        'X-Appwrite-Key': API_KEY
    });
    console.log('    Status:', r2.status);
    console.log('    Data:', JSON.stringify(r2.data).substring(0, 400));

    // Test 3: Login with email/password
    console.log('\n[3] Test account login (email/password)...');
    const r3 = await httpReq('POST', BASE + '/account/sessions/email', {
        email: 'a2tickets360@gmail.com',
        password: 'Tickets010203#2026'
    }, { 'X-Appwrite-Project': PROJECT });
    console.log('    Status:', r3.status);
    console.log('    Error:', r3.data?.message || r3.data?.type || '(none)');
    if (r3.setCookie) console.log('    Session Cookie: OK (length=' + r3.setCookie.join('').length + ')');

    // Test 4: If API key works, check what databases exist
    if (r2.status === 200) {
        console.log('\n[4] Databases found:');
        const dbs = r2.data.databases || [];
        dbs.forEach(db => console.log('   -', db.$id, '|', db.name));
        if (dbs.length === 0) console.log('    (nenhum database criado ainda)');
    }
}

main().catch(e => {
    console.error('\nFATAL:', e.message);
    process.exit(1);
});
