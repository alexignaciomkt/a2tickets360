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
                if (d === '') {
                    resolve({ status: res.statusCode, data: null });
                } else {
                    try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
                    catch (e) { resolve({ status: res.statusCode, data: d }); }
                }
            });
        });
        r.on('error', reject);
        r.setTimeout(15000, () => { r.destroy(); reject(new Error('TIMEOUT')); });
        if (bodyStr) r.write(bodyStr);
        r.end();
    });
}

const H = { 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': API_KEY };

async function clearTestUsers() {
    console.log('Iniciando limpeza de usuários testes via REST API...');
    
    try {
        // 1. Apagar do Auth (Users API)
        console.log('\n--- Buscando Usuários (Auth API) ---');
        const usersReq = await httpReq('GET', `${BASE}/users?queries[]=limit(100)`, null, H);
        if (usersReq.status !== 200) {
            console.error('Erro ao listar usuários:', usersReq.data);
            return;
        }

        const allUsers = usersReq.data.users || [];
        console.log(`Encontrados ${allUsers.length} usuários.`);

        for (const user of allUsers) {
            if (user.email === 'admin@a2tickets360.com.br' || user.email === 'alexignaciomkt@gmail.com') {
                console.log(`✅ Poupando Admin Master: ${user.email}`);
                continue;
            }
            console.log(`❌ Deletando usuário: ${user.email} (${user.$id})`);
            const delRes = await httpReq('DELETE', `${BASE}/users/${user.$id}`, null, H);
            if (delRes.status >= 400) console.error('  Erro:', delRes.data);
        }

        // 2. Apagar de user_profiles
        console.log('\n--- Buscando Perfis (User Profiles) ---');
        const profilesReq = await httpReq('GET', `${BASE}/databases/${DB}/collections/user_profiles/documents?queries[]=limit(100)`, null, H);
        if (profilesReq.status !== 200) {
            console.error('Erro ao listar perfis:', profilesReq.data);
            return;
        }

        const profiles = profilesReq.data.documents || [];
        console.log(`Encontrados ${profiles.length} perfis.`);

        for (const doc of profiles) {
            if (doc.email === 'admin@a2tickets360.com.br' || doc.email === 'alexignaciomkt@gmail.com') {
                console.log(`✅ Poupando Perfil Master: ${doc.email}`);
                continue;
            }
            console.log(`❌ Deletando perfil: ${doc.email} (${doc.$id})`);
            const delRes = await httpReq('DELETE', `${BASE}/databases/${DB}/collections/user_profiles/documents/${doc.$id}`, null, H);
            if (delRes.status >= 400) console.error('  Erro:', delRes.data);
        }

        console.log('\nLimpeza concluída com sucesso!');
    } catch (e) {
        console.error('Erro na limpeza:', e);
    }
}

clearTestUsers();
