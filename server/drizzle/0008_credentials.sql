-- Migration: Staff Credentials, Employee Credentials, and Attendance (Fase 5)

-- 1. Staff Credentials (Temporárias por evento)
CREATE TABLE IF NOT EXISTS public.staff_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_staff_id UUID NOT NULL REFERENCES public.event_staff(id) ON DELETE CASCADE,
    credential_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
    issued_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Employee Credentials (Permanentes por produtora)
CREATE TABLE IF NOT EXISTS public.employee_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    credential_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
    issued_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Registro Operacional de Presença (Attendance)
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_staff_id UUID REFERENCES public.event_staff(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP NOT NULL DEFAULT NOW(),
    checked_in_by UUID REFERENCES auth.users(id), -- User ID of the scanner operator
    credential_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
