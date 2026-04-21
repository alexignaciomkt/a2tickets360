-- CONFIGURAÇÃO INICIAL TICKETERA v2 (SUPABASE) - VERSÃO COMPLETA

-- 1. LIMPEZA TOTAL (PARA GARANTIR ESTADO ZERADO)
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.webhook_configs CASCADE;
DROP TABLE IF EXISTS public.webhook_logs CASCADE;
DROP TABLE IF EXISTS public.checkins CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.sponsors CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.stands CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.organizer_details CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABELA DE PERFIS (Extensão do auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('master', 'organizer', 'staff', 'exhibitor', 'customer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. DETALHES DO ORGANIZADOR
CREATE TABLE public.organizer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT,
  slug TEXT UNIQUE,
  cnpj TEXT,
  cpf TEXT,
  phone TEXT,
  bio TEXT,
  asaas_key TEXT,
  logo_url TEXT,
  banner_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  address_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. EVENTOS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'finished', 'cancelled')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location_name TEXT,
  address TEXT,
  banner_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STAFF (EQUIPE)
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'operator',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VENDAS (SALES)
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  asaas_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LOGS DE WEBHOOK
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT NOT NULL,
  url TEXT,
  status TEXT,
  payload JSONB,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HABILITAR RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 9. POLÍTICAS DE SEGURANÇA (RLS)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- Criar função de verificação segura (ignorando RLS) para evitar recursão infinita
CREATE OR REPLACE FUNCTION public.is_master() 
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (role = 'master')
    FROM public.profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Masters can view all profiles" ON public.profiles FOR SELECT USING (public.is_master());

CREATE POLICY "Public can view organizer details" ON public.organizer_details FOR SELECT USING (true);
CREATE POLICY "Organizers can update own details" ON public.organizer_details FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Organizers can manage own events" ON public.events FOR ALL USING (auth.uid() = organizer_id);
CREATE POLICY "Admins can manage all events" ON public.events FOR ALL USING (public.is_master());

CREATE POLICY "Masters can view logs" ON public.webhook_logs FOR SELECT USING (public.is_master());

-- 10. FUNÇÃO PARA ATUALIZAR TIMESTAMPS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. TABELA DE CATEGORIAS
CREATE TABLE public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'tag',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABELA DE INGRESSOS (TICKETS)
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantity INTEGER NOT NULL,
  remaining INTEGER NOT NULL,
  category TEXT DEFAULT 'standard',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. HABILITAR RLS ADICIONAL
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 14. POLÍTICAS ADICIONAIS
CREATE POLICY "Public can view categories" ON public.event_categories FOR SELECT USING (true);
CREATE POLICY "Public can view active tickets" ON public.tickets FOR SELECT USING (is_active = true);
CREATE POLICY "Organizers can manage own tickets" ON public.tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
);

-- 15. TRIGGER TICKETS
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 16. INGRESSOS EMITIDOS (PURCHASED_TICKETS)
CREATE TABLE public.purchased_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
  photo_url TEXT,
  qr_code_data TEXT NOT NULL UNIQUE,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. POSTS DO ORGANIZADOR (FEED DA FANPAGE)
CREATE TABLE public.organizer_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  has_caption BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.purchased_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchased tickets" ON public.purchased_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organizers can view tickets for their events" ON public.purchased_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
);

-- Políticas para Posts do Organizer
CREATE POLICY "Public can view organizer posts" ON public.organizer_posts FOR SELECT USING (true);
CREATE POLICY "Organizers can manage own posts" ON public.organizer_posts FOR ALL USING (auth.uid() = organizer_id);
