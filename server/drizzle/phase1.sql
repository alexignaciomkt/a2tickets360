CREATE TABLE IF NOT EXISTS tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    document text,
    status text DEFAULT 'active',
    settings jsonb,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gateways (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    provider text NOT NULL,
    status text DEFAULT 'active',
    configuration jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    owner_id uuid NOT NULL,
    owner_type text NOT NULL,
    gateway_id uuid REFERENCES gateways(id),
    gateway_wallet_id text,
    gateway_account_id text,
    label text,
    is_default boolean DEFAULT true,
    is_active boolean DEFAULT true,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id),
    key text UNIQUE NOT NULL,
    enabled boolean DEFAULT false,
    rollout_percentage integer DEFAULT 100,
    description text,
    environment text DEFAULT 'all',
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id),
    actor_id uuid NOT NULL,
    actor_type text NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    before_snapshot jsonb,
    after_snapshot jsonb,
    ip text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);
