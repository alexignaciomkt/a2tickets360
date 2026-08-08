import Redis from 'ioredis';
import crypto from 'crypto';

export interface TicketData {
    tickets_user_id: string;
    organizer_id: string;
    tickets_event_id: string;
    sports_championship_id: string;
    organizer_email: string;
    external_tenant_id: string;
    expires_at: number;
}

class TicketCacheService {
    private redis: Redis | null = null;
    private memoryMap = new Map<string, TicketData>();
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
                    console.log('[TICKET-CACHE] Connected to Redis successfully.');
                });

                this.redis.on('error', (err) => {
                    this.isRedisConnected = false;
                    // Silent Redis connection errors in dev, but log in production
                    if (process.env.NODE_ENV === 'production') {
                        console.error('[TICKET-CACHE] Redis connection error:', err.message);
                    }
                });

                this.redis.connect().catch(() => {
                    this.isRedisConnected = false;
                });
            } catch (err: any) {
                console.error('[TICKET-CACHE] Failed to initialize Redis client:', err.message);
            }
        }
    }

    private getHash(ticket: string): string {
        return crypto.createHash('sha256').update(ticket).digest('hex');
    }

    async set(ticket: string, data: TicketData, ttlSeconds: number): Promise<void> {
        const hash = this.getHash(ticket);
        
        if (this.isRedisConnected && this.redis) {
            await this.redis.set(`sso_ticket:${hash}`, JSON.stringify(data), 'EX', ttlSeconds);
            return;
        }

        // Fallback for non-production environments
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Redis is required in production but is currently offline or unconfigured.');
        }

        console.warn('[TICKET-CACHE] Redis offline. Using in-memory fallback cache (development only).');
        
        data.expires_at = Date.now() + (ttlSeconds * 1000);
        this.memoryMap.set(hash, data);

        // Auto clean memory map after TTL
        setTimeout(() => {
            this.memoryMap.delete(hash);
        }, ttlSeconds * 1000);
    }

    async getAndDelete(ticket: string): Promise<TicketData | null> {
        const hash = this.getHash(ticket);

        if (this.isRedisConnected && this.redis) {
            const dataStr = await this.redis.get(`sso_ticket:${hash}`);
            if (dataStr) {
                await this.redis.del(`sso_ticket:${hash}`);
                try {
                    return JSON.parse(dataStr);
                } catch {
                    return null;
                }
            }
            return null;
        }

        if (process.env.NODE_ENV === 'production') {
            throw new Error('Redis is required in production but is currently offline or unconfigured.');
        }

        const data = this.memoryMap.get(hash);
        if (data) {
            this.memoryMap.delete(hash);
            if (data.expires_at > Date.now()) {
                return data;
            }
        }
        return null;
    }
}

export const ticketCacheService = new TicketCacheService();
