-- Migration: RBAC and Contextual Authorization (Fase 3)

-- 1. Catálogo Global de Roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_key TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Catálogo Global de Permissões
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_key TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Permissões Padrão das Roles
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Atribuição de Roles aos Funcionários (Múltiplas Roles)
CREATE TABLE IF NOT EXISTS public.employee_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unq_employee_role UNIQUE (employee_id, role_id)
);

-- 5. Exceções de Permissão por Funcionário (Overrides)
CREATE TABLE IF NOT EXISTS public.employee_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    override_type TEXT NOT NULL CHECK (override_type IN ('GRANT', 'DENY')),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unq_employee_permission UNIQUE (employee_id, permission_id)
);

-- Nota de Compatibilidade e Bug Crítico:
-- A trigger check_employee_event_tenant compara employees.organizer_id (que aponta para auth.users)
-- com events.organizer_id (que na codebase ts aponta para organizers, mas na REALIDADE do PostgreSQL aponta para auth.users).
-- Como a realidade do DB bate as chaves (ambas são auth.users.id), a trigger FUNCIONA na prática.
-- A correção será um ajuste do schema typescript no futuro (Fase 4 ou 5) quando regularizarmos Tenant IDs,
-- portanto não aplicamos DROP de colunas aqui para não corromper os dados.
