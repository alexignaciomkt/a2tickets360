import { db } from '../db';
import { roles, permissions, rolePermissions } from '../db/schema';
import { sql } from 'drizzle-orm';

const INITIAL_ROLES = [
    { systemKey: 'CHECKIN_OPERATOR', displayName: 'Operador de Check-in', description: 'Portaria e validação de ingressos' },
    { systemKey: 'CHECKIN_SUPERVISOR', displayName: 'Supervisor de Check-in', description: 'Supervisão da portaria' },
    { systemKey: 'BOX_OFFICE', displayName: 'Bilheteria', description: 'Vendas presenciais' },
    { systemKey: 'STAFF_MANAGER', displayName: 'Gestor de Equipe', description: 'Gestão de staff' },
    { systemKey: 'FINANCIAL_MANAGER', displayName: 'Gestor Financeiro', description: 'Acesso às finanças' },
    { systemKey: 'EVENT_COORDINATOR', displayName: 'Coordenador de Evento', description: 'Coordenação geral' },
    { systemKey: 'PRODUCTION', displayName: 'Produção', description: 'Equipe de produção' },
    { systemKey: 'SECURITY', displayName: 'Segurança', description: 'Equipe de segurança' },
];

const INITIAL_PERMISSIONS = [
    // Staff
    { systemKey: 'staff.view', description: 'Visualizar equipe' },
    { systemKey: 'staff.manage', description: 'Gerenciar staff' },
    { systemKey: 'staff.invite', description: 'Convidar staff' },
    { systemKey: 'staff.assign', description: 'Atribuir vínculos' },
    
    // Check-in
    { systemKey: 'checkin.open', description: 'Abrir scanner' },
    { systemKey: 'checkin.scan', description: 'Ler e validar ingressos' },
    { systemKey: 'checkin.lookup', description: 'Consultar participante na lista' },
    { systemKey: 'checkin.stats', description: 'Visualizar estatísticas de portaria' },

    // Box Office
    { systemKey: 'boxoffice.view', description: 'Acessar módulo de bilheteria' },
    { systemKey: 'boxoffice.sell', description: 'Realizar vendas físicas' },

    // Finance
    { systemKey: 'finance.view', description: 'Visualizar painel financeiro' },
    { systemKey: 'finance.manage', description: 'Gerenciar finanças (saques, configurações)' },

    // Event
    { systemKey: 'event.view', description: 'Visualizar configurações do evento' },
    { systemKey: 'event.manage', description: 'Editar configurações do evento' },
];

// Mapeamento de Role para Permissions Padrão
const ROLE_PERMISSION_MAP: Record<string, string[]> = {
    'CHECKIN_OPERATOR': ['checkin.open', 'checkin.scan', 'checkin.lookup'],
    'CHECKIN_SUPERVISOR': ['checkin.open', 'checkin.scan', 'checkin.lookup', 'checkin.stats', 'staff.view'],
    'BOX_OFFICE': ['boxoffice.view', 'boxoffice.sell'],
    'STAFF_MANAGER': ['staff.view', 'staff.manage', 'staff.invite', 'staff.assign'],
    'FINANCIAL_MANAGER': ['finance.view', 'finance.manage'],
    'EVENT_COORDINATOR': [
        'staff.view', 'staff.manage', 
        'checkin.stats', 
        'boxoffice.view', 'boxoffice.sell', 
        'finance.view', 
        'event.view', 'event.manage'
    ],
    'PRODUCTION': ['event.view', 'staff.view'], // Acesso restrito inicial para segurança
    'SECURITY': ['checkin.lookup'] // Apenas consultar se a pessoa tem ingresso em caso de dúvida
};

export async function seedRbac() {
    console.log('🌱 Starting RBAC Seed...');

    try {
        // 1. Insert Roles (Idempotent)
        console.log('Inserting roles...');
        for (const role of INITIAL_ROLES) {
            await db.insert(roles)
                .values(role)
                .onConflictDoUpdate({
                    target: roles.systemKey,
                    set: { displayName: role.displayName, description: role.description }
                });
        }

        // 2. Insert Permissions (Idempotent)
        console.log('Inserting permissions...');
        for (const perm of INITIAL_PERMISSIONS) {
            await db.insert(permissions)
                .values(perm)
                .onConflictDoUpdate({
                    target: permissions.systemKey,
                    set: { description: perm.description }
                });
        }

        // 3. Map Roles to Permissions
        console.log('Mapping role permissions...');
        const allRoles = await db.select().from(roles);
        const allPerms = await db.select().from(permissions);

        const roleDict = Object.fromEntries(allRoles.map(r => [r.systemKey, r.id]));
        const permDict = Object.fromEntries(allPerms.map(p => [p.systemKey, p.id]));

        for (const [roleKey, permKeys] of Object.entries(ROLE_PERMISSION_MAP)) {
            const roleId = roleDict[roleKey];
            if (!roleId) continue;

            for (const pKey of permKeys) {
                const permId = permDict[pKey];
                if (!permId) continue;

                // Idempotent insert for many-to-many using ON CONFLICT DO NOTHING (if possible)
                // Since Drizzle PG doesn't have DO NOTHING directly on primary keys easily without raw query, we use raw SQL or ignore
                await db.execute(sql`
                    INSERT INTO public.role_permissions (role_id, permission_id) 
                    VALUES (${roleId}, ${permId}) 
                    ON CONFLICT (role_id, permission_id) DO NOTHING;
                `);
            }
        }

        console.log('✅ RBAC Seed completed successfully.');
    } catch (error) {
        console.error('❌ Error during RBAC Seed:', error);
        process.exit(1);
    }
}

// Execute directly if run via CLI
if (require.main === module) {
    seedRbac().then(() => process.exit(0));
}
