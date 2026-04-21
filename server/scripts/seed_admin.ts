import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the server root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://database.a2tickets360.com.br/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'a2tickets360';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.APPWRITE_DATABASE_ID || 'a2tickets360-db';
const COLLECTION_ADMINS = 'admins';

if (!APPWRITE_API_KEY) {
  console.error('❌ APPWRITE_API_KEY not found in .env');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function seedAdmin() {
  const email = 'admin@a2tickets360.com.br';
  const password = 'A2Master@2026!';
  const name = 'Admin Geral';
  
  console.log(`🚀 Criando Admin Geral: ${email}...`);

  try {
    // Hash password using Bun's native password hasher
    const passwordHash = await Bun.password.hash(password);

    const doc = await databases.createDocument(
      DB_ID,
      COLLECTION_ADMINS,
      ID.unique(),
      {
        name,
        email,
        passwordHash,
        role: 'master'
      }
    );

    console.log('✅ Admin Geral criado com sucesso!');
    console.log('🆔 ID:', doc.$id);
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️ O Admin já existe no banco.');
    } else {
      console.error('❌ Erro ao criar admin:', error.message);
    }
  }
}

seedAdmin();
