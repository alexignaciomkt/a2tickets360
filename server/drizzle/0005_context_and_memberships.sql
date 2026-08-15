-- Migration: Context and Memberships (Fase 2)

-- 1. Tabela platform_masters
CREATE TABLE IF NOT EXISTS public.platform_masters (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela employees (Pessoa -> Produtora)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    access_scope TEXT NOT NULL DEFAULT 'ALL_EVENTS' CHECK (access_scope IN ('ALL_EVENTS', 'SELECTED_EVENTS')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unq_employee_membership UNIQUE (user_id, organizer_id)
);

-- 3. Tabela employee_event_access (para access_scope = SELECTED_EVENTS)
CREATE TABLE IF NOT EXISTS public.employee_event_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unq_employee_event_access UNIQUE (employee_id, event_id)
);

-- 4. Cross-Tenant Security Trigger
-- Garante que um funcionário só possa receber acesso a um evento que pertence à sua produtora.
CREATE OR REPLACE FUNCTION public.check_employee_event_tenant()
RETURNS trigger AS $$
DECLARE
    v_employee_organizer UUID;
    v_event_organizer UUID;
BEGIN
    -- Obter o organizer do employee
    SELECT organizer_id INTO v_employee_organizer
    FROM public.employees
    WHERE id = NEW.employee_id;

    -- Obter o organizer do event
    SELECT organizer_id INTO v_event_organizer
    FROM public.events
    WHERE id = NEW.event_id;

    -- Verificar tenant
    IF v_employee_organizer != v_event_organizer THEN
        RAISE EXCEPTION 'Security breach: Event does not belong to Employee Tenant';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_employee_event_access_insert ON public.employee_event_access;
CREATE TRIGGER on_employee_event_access_insert
  BEFORE INSERT OR UPDATE ON public.employee_event_access
  FOR EACH ROW EXECUTE PROCEDURE public.check_employee_event_tenant();
