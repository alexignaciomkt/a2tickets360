-- SCRIPT DE ATUALIZAÇÃO DO ESQUEMA SUPABASE
-- Adiciona colunas faltantes e corrige permissões de RLS para a tabela organizer_details

-- 1. ADICIONAR COLUNAS FALTANTES (SE NÃO EXISTIREM)
DO $$ 
BEGIN 
    -- Colunas de identificação e perfil
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='category') THEN
        ALTER TABLE public.organizer_details ADD COLUMN category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='rg') THEN
        ALTER TABLE public.organizer_details ADD COLUMN rg TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='birth_date') THEN
        ALTER TABLE public.organizer_details ADD COLUMN birth_date TEXT;
    END IF;

    -- Colunas de Endereço (Planificadas para o frontend)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='address') THEN
        ALTER TABLE public.organizer_details ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='city') THEN
        ALTER TABLE public.organizer_details ADD COLUMN city TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='state') THEN
        ALTER TABLE public.organizer_details ADD COLUMN state TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='postal_code') THEN
        ALTER TABLE public.organizer_details ADD COLUMN postal_code TEXT;
    END IF;

    -- URLs de Documentos e Redes Sociais
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='document_front_url') THEN
        ALTER TABLE public.organizer_details ADD COLUMN document_front_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='document_back_url') THEN
        ALTER TABLE public.organizer_details ADD COLUMN document_back_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='instagram_url') THEN
        ALTER TABLE public.organizer_details ADD COLUMN instagram_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='facebook_url') THEN
        ALTER TABLE public.organizer_details ADD COLUMN facebook_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='whatsapp_number') THEN
        ALTER TABLE public.organizer_details ADD COLUMN whatsapp_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='website_url') THEN
        ALTER TABLE public.organizer_details ADD COLUMN website_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='company_address') THEN
        ALTER TABLE public.organizer_details ADD COLUMN company_address TEXT;
    END IF;

    -- Rastreamento de Onboarding
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='organizer_details' AND COLUMN_NAME='last_step') THEN
        ALTER TABLE public.organizer_details ADD COLUMN last_step INTEGER DEFAULT 1;
    END IF;
END $$;

-- 2. CORREÇÃO DE POLÍTICAS DE RLS (Necessário para o Upsert do Frontend funcionar)

-- Remover políticas antigas para evitar conflito
DROP POLICY IF EXISTS "Organizers can insert own details" ON public.organizer_details;
DROP POLICY IF EXISTS "Organizers can update own details" ON public.organizer_details;

-- Política de INSERT: Permite que o usuário crie sua própria linha de detalhes
CREATE POLICY "Organizers can insert own details" 
ON public.organizer_details 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE: Permite que o usuário atualize sua própria linha
CREATE POLICY "Organizers can update own details" 
ON public.organizer_details 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política de SELECT (Geral): Já existe no setup original, mas repetimos para garantir
DROP POLICY IF EXISTS "Public can view organizer details" ON public.organizer_details;
CREATE POLICY "Public can view organizer details" 
ON public.organizer_details 
FOR SELECT 
USING (true);

-- 3. ATUALIZAÇÃO DA TABELA PROFILES (Permissões de Update)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Notificar o PostgREST para recarregar o cache (pode precisar ser executado manualmente)
NOTIFY pgrst, 'reload schema';
