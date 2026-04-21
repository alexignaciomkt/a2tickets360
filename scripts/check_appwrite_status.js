/**
 * Script to verify Appwrite database state
 * Checks: databases, collections, attributes, indexes
 */

const ENDPOINT = 'https://banco.euattendo.com.br/v1';
const PROJECT_ID = '69adea89bf3bdac8f7a6';
const API_KEY = 'f8f66846bf2d47d6d170b84aa9bae8b95c05521f6ca50543b32147cd015f766a71faa5cb12897e81b83f93f6c86e5c841aad7ffbe9d396a876086f4a2147a0edd53e67e9154e225a9d9e9161a2a051b0a8514d8152e44334d657d7f9c6b4c7d83f78727a0cd9c14837124d8e6e422643570ee0c3de1bfe35944d02d1bbcb7225';

const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY,
};

async function fetchJSON(path) {
    const res = await fetch(`${ENDPOINT}${path}`, { headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
    return res.json();
}

async function main() {
    console.log('=== APPWRITE STATUS CHECK ===\n');

    // 1. List databases
    console.log('📦 DATABASES:');
    try {
        const dbs = await fetchJSON('/databases');
        for (const db of dbs.databases) {
            console.log(`  - ${db.name} (${db.$id})`);
        }
        console.log(`  Total: ${dbs.total}\n`);

        // 2. For each database, list collections
        for (const db of dbs.databases) {
            console.log(`📁 COLLECTIONS in "${db.name}" (${db.$id}):`);
            const cols = await fetchJSON(`/databases/${db.$id}/collections`);
            
            if (cols.total === 0) {
                console.log('  (nenhuma collection)\n');
                continue;
            }

            for (const col of cols.collections) {
                console.log(`\n  📋 ${col.name} (${col.$id})`);
                console.log(`     Enabled: ${col.enabled}, Document Security: ${col.documentSecurity}`);

                // 3. List attributes for each collection
                try {
                    const attrs = await fetchJSON(`/databases/${db.$id}/collections/${col.$id}/attributes`);
                    if (attrs.total > 0) {
                        console.log(`     Attributes (${attrs.total}):`);
                        for (const attr of attrs.attributes) {
                            const required = attr.required ? '(required)' : '(optional)';
                            const defaultVal = attr.default !== null && attr.default !== undefined ? ` [default: ${attr.default}]` : '';
                            console.log(`       - ${attr.key}: ${attr.type}${attr.size ? `(${attr.size})` : ''} ${required}${defaultVal}`);
                        }
                    }
                } catch (e) {
                    console.log(`     ⚠️ Could not fetch attributes: ${e.message}`);
                }

                // 4. List indexes
                try {
                    const indexes = await fetchJSON(`/databases/${db.$id}/collections/${col.$id}/indexes`);
                    if (indexes.total > 0) {
                        console.log(`     Indexes (${indexes.total}):`);
                        for (const idx of indexes.indexes) {
                            console.log(`       - ${idx.key}: ${idx.type} on [${idx.attributes.join(', ')}]`);
                        }
                    } else {
                        console.log(`     Indexes: (none)`);
                    }
                } catch (e) {
                    console.log(`     ⚠️ Could not fetch indexes: ${e.message}`);
                }
            }
            console.log('');
        }
    } catch (e) {
        console.error('❌ Error listing databases:', e.message);
    }

    // 5. Check storage buckets
    console.log('\n🗂️ STORAGE BUCKETS:');
    try {
        const buckets = await fetchJSON('/storage/buckets');
        for (const b of buckets.buckets) {
            console.log(`  - ${b.name} (${b.$id}) | Max Size: ${b.maximumFileSize}B | Allowed: ${b.allowedFileExtensions?.join(', ') || 'any'}`);
        }
        console.log(`  Total: ${buckets.total}`);
    } catch (e) {
        console.error('  ❌ Error:', e.message);
    }

    // 6. Check auth users count
    console.log('\n👥 AUTH USERS:');
    try {
        const users = await fetchJSON('/users?queries[]=limit(1)');
        console.log(`  Total users: ${users.total}`);
    } catch (e) {
        console.error('  ❌ Error:', e.message);
    }

    console.log('\n=== CHECK COMPLETE ===');
}

main().catch(console.error);
