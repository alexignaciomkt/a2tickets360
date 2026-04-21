
import { jwt } from 'hono/jwt';
import { Context, Next } from 'hono';

export const authMiddleware = jwt({
    secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
    alg: 'HS256',
});

// Role-based Access Control Middleware
export const checkRole = (roles: string[]) => {
    return async (c: Context, next: Next) => {
        const payload = c.get('jwtPayload');
        if (!payload || !roles.includes(payload.role)) {
            return c.json({ error: 'Atividade não autorizada para seu nível de acesso' }, 403);
        }
        await next();
    };
};
