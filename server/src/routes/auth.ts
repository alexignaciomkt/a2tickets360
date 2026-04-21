import { Hono, Context } from 'hono';
import { sign } from 'jose';
import { appwriteDatabases, appwriteUsers, DB_ID, COLLECTIONS } from '../lib/appwrite';
import { Query } from 'node-appwrite';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Router — Appwrite-native authentication
// Replaces the bloated login blocks from index.ts
// ─────────────────────────────────────────────────────────────────────────────

const auth = new Hono();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRY = 60 * 60 * 24; // 24 hours

// Helper: encode secret for jose
const getSecret = () => new TextEncoder().encode(JWT_SECRET);

// Helper: build a signed JWT
async function buildToken(payload: Record<string, unknown>) {
  const { SignJWT } = await import('jose');
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${JWT_EXPIRY}s`)
    .setIssuedAt()
    .sign(getSecret());
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Accepts: { email, password }
// Strategy:
//   1. Check admins collection
//   2. Check user_profiles collection (organizers, staff, etc.)
//   Role is stored in the profile document itself.
// ─────────────────────────────────────────────────────────────────────────────
auth.post('/login', async (c: Context) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'E-mail e senha são obrigatórios.' }, 400);
  }

  try {
    // ── 1. Look in admins collection first ──────────────────────────────────
    const adminResult = await appwriteDatabases.listDocuments(DB_ID, COLLECTIONS.admins, [
      Query.equal('email', email),
      Query.limit(1),
    ]);

    if (adminResult.total > 0) {
      const admin = adminResult.documents[0];
      const isValid = await Bun.password.verify(password, admin.passwordHash as string);

      if (!isValid) return c.json({ error: 'E-mail ou senha incorretos.' }, 401);

      const token = await buildToken({ id: admin.$id, email: admin.email, role: admin.role || 'admin' });
      return c.json({
        token,
        user: { id: admin.$id, name: admin.name, email: admin.email, role: admin.role || 'admin' },
      });
    }

    // ── 2. Look in user_profiles (organizers, staff, buyers) ────────────────
    const profileResult = await appwriteDatabases.listDocuments(DB_ID, COLLECTIONS.userProfiles, [
      Query.equal('email', email),
      Query.limit(1),
    ]);

    if (profileResult.total === 0) {
      return c.json({ error: 'E-mail ou senha incorretos.' }, 401);
    }

    const profile = profileResult.documents[0];

    // Guard: profile must be active
    if (profile.isActive === false) {
      return c.json({ error: 'Conta desativada. Entre em contato com o suporte.' }, 403);
    }

    const isValid = await Bun.password.verify(password, profile.passwordHash as string);
    if (!isValid) return c.json({ error: 'E-mail ou senha incorretos.' }, 401);

    const token = await buildToken({ id: profile.$id, email: profile.email, role: profile.role });
    return c.json({
      token,
      user: {
        id: profile.$id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        profileComplete: profile.profileComplete ?? false,
      },
    });
  } catch (err: any) {
    console.error('[AUTH] Login error:', err);
    return c.json({ error: 'Erro interno. Tente novamente.' }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Register organizer — creates user_profiles document in Appwrite
// Accepts: { name, email, password, phone?, cpfCnpj?, slug? }
// ─────────────────────────────────────────────────────────────────────────────
auth.post('/register', async (c: Context) => {
  const { name, email, password, phone, cpfCnpj, slug } = await c.req.json();

  if (!name || !email || !password) {
    return c.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, 400);
  }

  try {
    // Check if email is already taken
    const existing = await appwriteDatabases.listDocuments(DB_ID, COLLECTIONS.userProfiles, [
      Query.equal('email', email),
      Query.limit(1),
    ]);
    if (existing.total > 0) {
      return c.json({ error: 'Já existe uma conta com este e-mail.' }, 409);
    }

    // Hash password
    const passwordHash = await Bun.password.hash(password);

    // Build slug from name if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Create profile document in Appwrite
    const { ID } = await import('node-appwrite');
    const doc = await appwriteDatabases.createDocument(DB_ID, COLLECTIONS.userProfiles, ID.unique(), {
      name,
      email,
      passwordHash,
      phone: phone || null,
      cpfCnpj: cpfCnpj || null,
      cnpj: cpfCnpj || null, // Duplicado temporariamente para retrocompatibilidade
      slug: finalSlug,
      role: 'organizer',
      status: 'pending',
      isActive: true,
      emailVerified: false,
      profileComplete: false,
    });

    return c.json({
      status: 'success',
      message: 'Cadastro realizado! Aguarde a ativação pelo administrador.',
      userId: doc.$id,
    }, 201);
  } catch (err: any) {
    console.error('[AUTH] Register error:', err);
    return c.json({ error: err.message || 'Erro ao criar conta.' }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected — requires Bearer token)
// ─────────────────────────────────────────────────────────────────────────────
auth.get('/me', async (c: Context) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Token ausente.' }, 401);
  }
  try {
    const { jwtVerify } = await import('jose');
    const token = authHeader.slice(7);
    const { payload } = await jwtVerify(token, getSecret());
    return c.json({ user: payload });
  } catch {
    return c.json({ error: 'Token inválido ou expirado.' }, 401);
  }
});

export default auth;
