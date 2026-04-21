
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('🔍 Verificando tabela organizer_posts...');
    const { data, error } = await supabase.from('organizer_posts').select('*').limit(1);
    
    if (error) {
        console.error('❌ Erro ao acessar organizer_posts:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('🚨 TABELA NÃO EXISTE!');
        }
    } else {
        console.log('✅ Tabela organizer_posts existe e está acessível.');
    }
}

checkTable();
