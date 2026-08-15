-- Migration: Staff Profile, Functions, Event Staff (Fase 4)

-- 1. Staff Profiles
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    document TEXT,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Staff Functions
CREATE TABLE IF NOT EXISTS public.staff_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    default_system_role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Event Staff (Vínculo e Convite Unificado)
CREATE TABLE IF NOT EXISTS public.event_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    staff_function_id UUID REFERENCES public.staff_functions(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_PROFILE' CHECK (status IN ('PENDING_PROFILE', 'PENDING_ACCEPTANCE', 'ACTIVE', 'DECLINED', 'CANCELLED', 'COMPLETED')),
    shift_start TIMESTAMP,
    shift_end TIMESTAMP,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    declined_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unq_event_staff UNIQUE (event_id, user_id)
);

-- 4. Event Staff Roles
CREATE TABLE IF NOT EXISTS public.event_staff_roles (
    event_staff_id UUID NOT NULL REFERENCES public.event_staff(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (event_staff_id, role_id)
);

-- 5. Event Staff Permission Overrides
CREATE TABLE IF NOT EXISTS public.event_staff_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_staff_id UUID NOT NULL REFERENCES public.event_staff(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    override_type TEXT NOT NULL CHECK (override_type IN ('GRANT', 'DENY')),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unq_event_staff_permission UNIQUE (event_staff_id, permission_id)
);
