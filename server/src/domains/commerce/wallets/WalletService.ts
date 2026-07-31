import { db } from '../../db';
import { wallets, gateways } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export class WalletService {
    /**
     * Busca a wallet default ativa para um determinado owner
     */
    static async getActiveWallet(ownerId: string, ownerType: string) {
        const result = await db.select({
            wallet: wallets,
            gateway: gateways
        })
        .from(wallets)
        .innerJoin(gateways, eq(wallets.gatewayId, gateways.id))
        .where(
            and(
                eq(wallets.ownerId, ownerId),
                eq(wallets.ownerType, ownerType),
                eq(wallets.isActive, true),
                eq(wallets.isDefault, true),
                eq(gateways.status, 'active')
            )
        )
        .limit(1);

        if (!result || result.length === 0) {
            return null;
        }

        return result[0];
    }
}
