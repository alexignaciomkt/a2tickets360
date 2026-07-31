import { db } from './src/db/index';
import { tenants, gateways, featureFlags } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function seedPhase1() {
    try {
        console.log('Seeding Phase 1 data...');
        
        // 1. Tenant A2
        const [tenant] = await db.insert(tenants).values({
            name: 'A2',
            document: '00000000000100',
            status: 'active'
        }).returning();
        
        console.log(`Created Tenant A2 with ID: ${tenant.id}`);
        
        // 2. Gateways (Asaas Sandbox and Produção)
        await db.insert(gateways).values([
            {
                name: 'Asaas Sandbox',
                provider: 'ASAAS',
                status: 'active',
                configuration: { environment: 'sandbox' }
            },
            {
                name: 'Asaas Produção',
                provider: 'ASAAS',
                status: 'active',
                configuration: { environment: 'production' }
            }
        ]);
        console.log('Created Gateways');
        
        // 3. Feature Flags
        const flags = [
            { key: 'USE_NEW_COMMERCE_ENGINE', enabled: false, description: 'Habilita novo engine de commerce', tenantId: tenant.id },
            { key: 'USE_SPLIT_ENGINE', enabled: false, description: 'Habilita novo motor de split (Fase 2)', tenantId: tenant.id },
            { key: 'USE_PAYMENT_LEDGER', enabled: false, description: 'Habilita registro nativo em orders', tenantId: tenant.id },
            { key: 'USE_EVENT_BUS', enabled: false, description: 'Habilita o Commerce Event Bus', tenantId: tenant.id },
            { key: 'USE_CHANNELS', enabled: false, description: 'Habilita canais de venda', tenantId: tenant.id }
        ];
        
        await db.insert(featureFlags).values(flags);
        console.log('Created Feature Flags');
        
        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seedPhase1();
