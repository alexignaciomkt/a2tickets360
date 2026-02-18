
const { Client } = require('pg');

const connectionString = 'postgres://ticketera_user:ticketera_pass_2025@localhost:5432/ticketera_prod';
const client = new Client({ connectionString });

async function check() {
    try {
        await client.connect();
        console.log('✅ Conexão bem-sucedida!');

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('Tabelas encontradas:');
        res.rows.forEach(row => console.log(' - ' + row.table_name));

        await client.end();
    } catch (err) {
        console.error('❌ Erro de conexão:', err.message);
        process.exit(1);
    }
}

check();
