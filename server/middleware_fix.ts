
// Middleware CORS Global
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
}));

// Middleware de Autenticação (JWT)
const authMiddleware = jwt({
    secret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
    alg: 'HS256',
});

// Aplicar Auth APENAS em rotas protegidas
// Exemplo: app.use('/api/protected/*', authMiddleware);
// POR ENQUANTO: Vamos aplicar manualmente onde necessário ou criar grupos
// NÃO aplicar globalmente para evitar bloquear login/registro
