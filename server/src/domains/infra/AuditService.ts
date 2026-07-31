import { db } from '../../db';
import { auditLogs } from '../../db/schema';

export class AuditService {
    /**
     * Registra uma ação no audit log
     */
    static async logAction(data: {
        tenantId?: string;
        actorId: string;
        actorType: string;
        action: string;
        entityType: string;
        entityId: string;
        beforeSnapshot?: any;
        afterSnapshot?: any;
        ip?: string;
        userAgent?: string;
    }) {
        await db.insert(auditLogs).values({
            ...data,
            beforeSnapshot: data.beforeSnapshot || null,
            afterSnapshot: data.afterSnapshot || null
        });
    }
}
