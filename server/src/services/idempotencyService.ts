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

    private async withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error(`Redis operation timed out after ${ms}ms`));
            }, ms);
        });

        try {
            return await Promise.race([promise, timeoutPromise]);
        } finally {
            clearTimeout(timeoutId!);
        }
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
            try {
                const result = await this.withTimeout(this.redis.set(key, JSON.stringify(data), 'EX', ttlSeconds, 'NX'));
                return result === 'OK';
            } catch (err) {
                console.warn('[IDEMPOTENCY] Redis acquireLock failed/timeout:', err);
                // Fallback to memory
            }
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
            try {
                const dataStr = await this.withTimeout(this.redis.get(key));
                if (dataStr) {
                    try {
                        return JSON.parse(dataStr) as OperationStatus;
                    } catch {
                        return null;
                    }
                }
                return null;
            } catch (err) {
                console.warn('[IDEMPOTENCY] Redis getStatus failed/timeout:', err);
                // Fallback to memory
            }
        }

        return this.memoryFallback.get(key) || null;
    }

    async setCompleted(userId: string, operationId: string, eventId: string, ttlSeconds: number = 600): Promise<void> {
        const key = this.getKey(userId, operationId);
        const data: OperationStatus = { status: 'COMPLETED', eventId, completedAt: Date.now() };

        if (this.isRedisConnected && this.redis) {
            try {
                await this.withTimeout(this.redis.set(key, JSON.stringify(data), 'EX', ttlSeconds));
                return;
            } catch (err) {
                console.warn('[IDEMPOTENCY] Redis setCompleted failed/timeout:', err);
            }
        }

        this.memoryFallback.set(key, data);
        setTimeout(() => this.memoryFallback.delete(key), ttlSeconds * 1000);
    }

    async setFailed(userId: string, operationId: string, errorCode: string = 'UNKNOWN', ttlSeconds: number = 600): Promise<void> {
        const key = this.getKey(userId, operationId);
        const data: OperationStatus = { status: 'FAILED', errorCode, completedAt: Date.now() };

        if (this.isRedisConnected && this.redis) {
            try {
                await this.withTimeout(this.redis.set(key, JSON.stringify(data), 'EX', ttlSeconds));
                return;
            } catch (err) {
                console.warn('[IDEMPOTENCY] Redis setFailed failed/timeout:', err);
            }
        }

        this.memoryFallback.set(key, data);
        setTimeout(() => this.memoryFallback.delete(key), ttlSeconds * 1000);
    }
}

export const idempotencyService = new IdempotencyService();
