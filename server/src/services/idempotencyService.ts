import Redis from 'ioredis';

export interface OperationStatus {
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    eventId?: string;
    startedAt?: number;
    completedAt?: number;
    errorCode?: string;
}

class IdempotencyService {
    private redis: Redis | null = null;
    private memoryFallback = new Map<string, OperationStatus>();
    private isRedisConnected = false;

    constructor() {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            try {
                this.redis = new Redis(redisUrl, {
                    lazyConnect: true,
                    maxRetriesPerRequest: 1,
                    connectTimeout: 2000
                });
                
                this.redis.on('connect', () => {
                    this.isRedisConnected = true;
                    console.log('[IDEMPOTENCY] Connected to Redis successfully.');
                });

                this.redis.on('error', (err) => {
                    this.isRedisConnected = false;
                    if (process.env.NODE_ENV === 'production') {
                        console.error('[IDEMPOTENCY] Redis connection error:', err.message);
                    }
                });

                this.redis.connect().catch(() => {
                    this.isRedisConnected = false;
                });
            } catch (err: any) {
                console.error('[IDEMPOTENCY] Failed to initialize Redis client:', err.message);
            }
        }
    }

    private getKey(userId: string, operationId: string): string {
        return `idempotency:organizer-event:${userId}:${operationId}`;
    }

    /**
     * Tenta registrar a operação como PROCESSING.
     * Retorna true se adquiriu o lock (operação nova).
     * Retorna false se já existia (outra request já está processando ou concluiu).
     */
    async acquireLock(userId: string, operationId: string, ttlSeconds: number = 600): Promise<boolean> {
        const key = this.getKey(userId, operationId);
        const data: OperationStatus = { status: 'PROCESSING', startedAt: Date.now() };

        if (this.isRedisConnected && this.redis) {
            const result = await this.redis.set(key, JSON.stringify(data), 'EX', ttlSeconds, 'NX');
            return result === 'OK';
        }

        // Fallback para dev (ou produção sem Redis, assumindo risco)
        if (!this.memoryFallback.has(key)) {
            this.memoryFallback.set(key, data);
            setTimeout(() => this.memoryFallback.delete(key), ttlSeconds * 1000);
            return true;
        }
        return false;
    }

    async getStatus(userId: string, operationId: string): Promise<OperationStatus | null> {
        const key = this.getKey(userId, operationId);
        
        if (this.isRedisConnected && this.redis) {
            const dataStr = await this.redis.get(key);
            if (dataStr) {
                try {
                    return JSON.parse(dataStr) as OperationStatus;
                } catch {
                    return null;
                }
            }
            return null;
        }

        return this.memoryFallback.get(key) || null;
    }

    async setCompleted(userId: string, operationId: string, eventId: string, ttlSeconds: number = 600): Promise<void> {
        const key = this.getKey(userId, operationId);
        const data: OperationStatus = { status: 'COMPLETED', eventId, completedAt: Date.now() };

        if (this.isRedisConnected && this.redis) {
            await this.redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
            return;
        }

        this.memoryFallback.set(key, data);
        setTimeout(() => this.memoryFallback.delete(key), ttlSeconds * 1000);
    }

    async setFailed(userId: string, operationId: string, errorCode: string = 'UNKNOWN', ttlSeconds: number = 600): Promise<void> {
        const key = this.getKey(userId, operationId);
        const data: OperationStatus = { status: 'FAILED', errorCode, completedAt: Date.now() };

        if (this.isRedisConnected && this.redis) {
            await this.redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
            return;
        }

        this.memoryFallback.set(key, data);
        setTimeout(() => this.memoryFallback.delete(key), ttlSeconds * 1000);
    }
}

export const idempotencyService = new IdempotencyService();
