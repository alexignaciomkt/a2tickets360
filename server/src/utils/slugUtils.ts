export const RESERVED_SLUGS = [
    'admin', 'api', 'login', 'logout', 'register', 'cadastro', 'dashboard', 'master',
    'suporte', 'support', 'staff', 'promoter', 'promoters', 'evento', 'eventos', 'events',
    'produtora', 'produtor', 'producer', 'producers', 'checkout', 'ingresso', 'ingressos',
    'ticket', 'tickets', 'a2', 'a2tickets', 'a2tickets360', 'perfil', 'profile', 'profissionais'
];

export function normalizeSlug(value: string): string {
    if (!value) return '';
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/\s+/g, '-') // espaços para hífens
        .replace(/[^a-z0-9\-]/g, '') // somente a-z 0-9 e hífen
        .replace(/-+/g, '-') // sem hífens duplicados
        .replace(/^-+|-+$/g, ''); // sem hífen no início ou fim
}

export function validateSlug(slug: string): boolean {
    if (!slug || typeof slug !== 'string') return false;
    if (slug.length < 3 || slug.length > 40) return false;
    if (!/^[a-z0-9\-]+$/.test(slug)) return false;
    return true;
}

export function isReservedSlug(slug: string): boolean {
    return RESERVED_SLUGS.includes(slug.toLowerCase());
}
