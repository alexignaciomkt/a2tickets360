import { db } from '../../db';
import { featureFlags } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export class FeatureFlagService {
    /**
     * Verifica se uma feature flag está ativa globalmente ou para um ambiente específico
     */
    static async isEnabled(key: string, environment: string = 'all'): Promise<boolean> {
        const flag = await db.query.featureFlags.findFirst({
            where: and(
                eq(featureFlags.key, key),
                eq(featureFlags.environment, environment)
            )
        });

        // Tenta fallback para 'all' se a flag específica do ambiente não existir
        if (!flag && environment !== 'all') {
            const fallback = await db.query.featureFlags.findFirst({
                where: and(
                    eq(featureFlags.key, key),
                    eq(featureFlags.environment, 'all')
                )
            });
            if (fallback) {
                return fallback.enabled && fallback.rolloutPercentage === 100; // Rollout simplificado
            }
        }

        if (!flag) return false;

        return flag.enabled && flag.rolloutPercentage === 100;
    }
}
