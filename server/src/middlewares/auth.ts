import { Context, Next } from 'hono';

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Token ausente.' }, 401);
    }
    const token = authHeader.slice(7);

    // Verify against Supabase Auth API
    try {

        const supabaseUrl = process.env.SUPABASE_URL || 'https://osfnqpehvhznrecljjjf.supabase.co';
        const anonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZm5xcGVodmh6bnJlY2xqampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjY5MzYsImV4cCI6MjA5MTQ0MjkzNn0.e5dGTLIwTErEACfDTAAn2aDagkm08Q0cd0n6ESXDStw';
        
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': anonKey
            }
        });

        if (res.status === 200) {
            const userData = await res.json();
            
            // Supabase stores custom user metadata (e.g. role).
            // We use 'customer' as a safe default. Business roles will be checked via DB memberships later.
            const role = userData.user_metadata?.role || 'customer';
            
            c.set('jwtPayload', {
                id: userData.id,
                email: userData.email,
                role: role
            });
            return await next();
        }
    } catch (supabaseErr) {
        console.error('[AUTH-MIDDLEWARE] Error verifying against Supabase Auth:', supabaseErr);
    }

    return c.json({ error: 'Token inválido ou expirado.' }, 401);
};

// Role-based Access Control Middleware (Temporary / Legacy support)
export const checkRole = (roles: string[]) => {
    return async (c: Context, next: Next) => {
        const payload = c.get('jwtPayload');
        if (!payload || !roles.includes(payload.role)) {
            return c.json({ error: 'Atividade não autorizada para seu nível de acesso' }, 403);
        }
        await next();
    };
};
