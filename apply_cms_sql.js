
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osfnqpehvhznrecljjjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2NjkzNiwiZXhwIjoyMDkxNDQyOTM2fQ.k9Q17ZWfIo_sDhdOwdtx9tMqZtT25pun7p1TcyXwYmI';

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
-- Criar tabelas de Gestão Visual & CMS
CREATE TABLE IF NOT EXISTS site_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    bg_image TEXT,
    cta_text TEXT,
    cta_link TEXT,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir dados iniciais para o Staff e Produtor
INSERT INTO site_sections (section_key, title, subtitle, bg_image, cta_text, cta_link)
VALUES 
(
    'staff_section', 
    'Trabalhe nos Maiores Eventos', 
    'Crie seu perfil profissional no nosso Banco de Talentos e seja contratado pelos melhores produtores do país.',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070',
    'CADASTRAR MEU CURRÍCULO',
    '/work-with-us'
),
(
    'organizer_cta', 
    'Gestão 360º para o seu Negócio', 
    'A menor taxa do mercado, check-in 2FA visual e gestão completa de staff e fornecedores.',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200',
    'COMEÇAR AGORA',
    '/para-produtores'
) ON CONFLICT (section_key) DO NOTHING;
`;

async function applySql() {
  console.log('Aplicando SQL via REST API (tentativa)...');
  // O cliente JS não tem .sql(), então vamos tentar via RPC se existir ou apenas informar o sucesso do script
  // Como não temos um RPC de execução de SQL genérico (segurança), 
  // vamos usar o CLI ou pedir ao usuário.
  
  // Mas espera, eu posso usar o supabase-js para criar as tabelas? Não diretamente.
  
  console.log('Instrução: Por favor, execute o SQL acima no console do Supabase SQL Editor.');
}

applySql();
