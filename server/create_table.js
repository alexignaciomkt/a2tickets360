
const postgres = require('postgres');

const connectionString = 'postgres://ticketera_user:ticketera_pass_2025@localhost:5432/ticketera_prod';
const sql = postgres(connectionString);

async function createTable() {
    try {
        console.log('Criando tabela admins...');
        await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'master',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
        console.log('Tabela admins criada com sucesso.');
        process.exit(0);
    } catch (err) {
        console.error('Erro ao criar tabela:', err);
        process.exit(1);
    }
}

createTable();
