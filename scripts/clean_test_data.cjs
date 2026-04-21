const https = require('https');
const PROJECT_ID = 'a2tickets360';
const DATABASE_ID = 'a2tickets360-db';
const USER_PROFILES = 'user_profiles';
const ORGANIZER_DETAILS = 'organizer_details';
const API_KEY = '294fd8a1a0da59c01b0d5ba0c4a00ec3556595a865e3946482291b10753b60e1e8af89c5fd9bc8c7555a19af4305a392b2e8b997d4bdded151bb5594f94b1b148cd19ebf69fb445df272b9a103991205203e3d54bc67d9ca817248dca5ae627e8d975de833d9052199f94b95db5b1f842d45f65e4f87fcb0cd42142ebf4acf1c';

function httpRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'database.a2tickets360.com.br',
            port: 443,
            path: `/v1${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Key': API_KEY,
            },
            rejectUnauthorized: false,
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function deleteOrganizer(profileDocId) {
    // 1. Get user profile
    const profile = await httpRequest(`/databases/${DATABASE_ID}/collections/${USER_PROFILES}/documents/${profileDocId}`);
    if (profile.userId) {
        console.log(`Deleting organizer ${profile.email} (${profile.userId})...`);
        
        // 2. Find and delete details
        const detailsRes = await httpRequest(`/databases/${DATABASE_ID}/collections/${ORGANIZER_DETAILS}/documents`);
        if (detailsRes.documents) {
            const detailDoc = detailsRes.documents.find(d => d.userId === profile.userId);
            if (detailDoc) {
                console.log(`  - Deleting details doc ${detailDoc.$id}`);
                await httpRequest(`/databases/${DATABASE_ID}/collections/${ORGANIZER_DETAILS}/documents/${detailDoc.$id}`, 'DELETE');
            }
        }

        // 3. Delete profile
        console.log(`  - Deleting profile doc ${profileDocId}`);
        await httpRequest(`/databases/${DATABASE_ID}/collections/${USER_PROFILES}/documents/${profileDocId}`, 'DELETE');
        
        console.log(`  ✅ Done.`);
    }
}

async function main() {
    const ids = ['69caef1b001a6635095d', '69cb02cc0032dc241057'];
    for (const id of ids) {
        await deleteOrganizer(id);
    }
}

main().catch(console.error);
