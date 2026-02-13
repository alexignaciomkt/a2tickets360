import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://ticketera_user:ticketera_pass_2025@localhost:5432/ticketera_prod';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
