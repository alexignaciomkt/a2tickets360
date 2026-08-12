import { db } from '../db';
import { sportRegistrations, sportRegistrationPlayers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface ProvisionEventResult {
    success: boolean;
    championshipId?: string;
    errorCode?: string;
    errorMessage?: string;
}

export interface SyncRegistrationResult {
    registrationId: string;
    synced: boolean;
    created: boolean;
    error?: string;
}

export interface BackfillResult {
    total: number;
    synced: number;
    failed: number;
    failures: Array<{ registrationId: string; error: string }>;
}

export class SportsIntegrationService {
    private get baseUrl() {
        return process.env.A2SPORTS_BASE_URL || 'https://api.a2sports360.com.br';
    }

    private get apiKey() {
        return process.env.A2SPORTS_INTERNAL_API_KEY;
    }

    async createChampionship(
        eventId: string, 
        eventData: any, 
        organizerData: any,
        organizerEmail: string,
        organizerPhone?: string | null,
        organizerDocument?: string | null
    ): Promise<ProvisionEventResult> {
        const requestId = crypto.randomUUID();

        if (!this.apiKey) {
            console.error(`[SPORTS-INTEGRATION] [${requestId}] API Key is missing.`);
            return {
                success: false,
                errorCode: 'SERVER_CONFIGURATION_ERROR',
                errorMessage: 'A API Key de integração esportiva não está configurada.'
            };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const payload = {
            source_system: "A2TICKETS",
            external_event_id: eventId,
            tenant_external_id: organizerData.userId, // Identificador raiz do usuário/tenant
            organizer_external_id: organizerData.id,
            organizer_name: organizerData.companyName || organizerData.name || 'Organizador',
            organizer_email: organizerEmail,
            organizer_phone: organizerPhone || organizerData.phone || null,
            organizer_document: organizerDocument || organizerData.cnpj || organizerData.cpf || null,
            championship_name: eventData.title,
            modality: "truco_duplas", // Fixo por enquanto, pode ser estendido no futuro
            format: "one_table_demo",
            target_score: 12,
            starts_at: eventData.startDate,
            metadata: {
                version: "1.0",
                source: "A2TICKETS"
            }
        };

        try {
            console.log(`[SPORTS-INTEGRATION] [${requestId}] Provisionando evento esportivo: ${eventId}`);
            const startTime = Date.now();

            const response = await fetch(`${this.baseUrl}/api/internal/tickets/create-championship`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-A2-API-KEY': this.apiKey,
                    'X-Request-ID': requestId
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeout);
            const duration = Date.now() - startTime;
            
            // Tratamento de respostas de sucesso (201 e 200 idempotente)
            if (response.status === 201 || response.status === 200) {
                const responseData = await response.json();
                console.log(`[SPORTS-INTEGRATION] [${requestId}] Sucesso (${response.status}) em ${duration}ms. Retorno: OK.`);
                
                return {
                    success: true,
                    championshipId: responseData.championship_id || responseData.id
                };
            }

            // Tratamento de erros de domínio documentados
            if (response.status === 409) {
                console.error(`[SPORTS-INTEGRATION] [${requestId}] Conflito (409) em ${duration}ms.`);
                return { success: false, errorCode: 'EXTERNAL_EVENT_CONFLICT', errorMessage: 'O evento já possui integração ou conflita com outro existente.' };
            }

            if (response.status === 401) {
                console.error(`[SPORTS-INTEGRATION] [${requestId}] Não autorizado (401) em ${duration}ms.`);
                return { success: false, errorCode: 'SPORTS_UNAUTHORIZED', errorMessage: 'Credenciais de integração inválidas.' };
            }

            if (response.status === 404) {
                console.error(`[SPORTS-INTEGRATION] [${requestId}] Não encontrado (404) em ${duration}ms.`);
                return { success: false, errorCode: 'TENANT_MAPPING_NOT_FOUND', errorMessage: 'Mapeamento do produtor não encontrado.' };
            }

            // Qualquer outro erro não esperado (5xx, bad response)
            console.error(`[SPORTS-INTEGRATION] [${requestId}] Erro genérico (${response.status}) em ${duration}ms.`);
            return { success: false, errorCode: 'INVALID_RESPONSE', errorMessage: `Resposta inesperada da Sports (${response.status})` };

        } catch (error: any) {
            clearTimeout(timeout);
            
            // Captura timeout do AbortController
            if (error.name === 'AbortError') {
                console.error(`[SPORTS-INTEGRATION] [${requestId}] Timeout após 5s.`);
                return { success: false, errorCode: 'TIMEOUT', errorMessage: 'Tempo limite da integração excedido.' };
            }

            // Falhas de rede / DNS
            console.error(`[SPORTS-INTEGRATION] [${requestId}] Falha de rede:`, error.message);
            return { success: false, errorCode: 'SPORTS_UNAVAILABLE', errorMessage: 'A rede da integração está indisponível.' };
        }
    }

    // =========================================================================
    // Backfill — Sincronização de inscrições pagas
    // =========================================================================

    /**
     * Envia uma única inscrição esportiva para a A2Sports360.
     * Idempotente: a Sports responde 200 se a equipe já existir.
     */
    async syncRegistration(
        registration: {
            id: string;
            teamName: string | null;
            registrationType: string;
            players: Array<{ name: string; phone: string | null }>;
        },
        externalChampionshipId: string
    ): Promise<SyncRegistrationResult> {
        const requestId = crypto.randomUUID();

        if (!this.apiKey) {
            return { registrationId: registration.id, synced: false, created: false, error: 'API Key ausente.' };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);

        const payload = {
            external_team_id: registration.id,
            external_championship_id: externalChampionshipId,
            team_name: registration.teamName,
            players: registration.players.map(p => ({
                name: p.name,
                phone: p.phone,
            })),
        };

        try {
            console.log(`[SPORTS-BACKFILL] [${requestId}] Sincronizando inscrição ${registration.id}`);
            const startTime = Date.now();

            const response = await fetch(`${this.baseUrl}/api/internal/tickets/register-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-A2-API-KEY': this.apiKey,
                    'X-Request-ID': requestId,
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeout);
            const duration = Date.now() - startTime;

            if (response.status === 201) {
                console.log(`[SPORTS-BACKFILL] [${requestId}] Criada (201) em ${duration}ms.`);
                return { registrationId: registration.id, synced: true, created: true };
            }

            if (response.status === 200) {
                console.log(`[SPORTS-BACKFILL] [${requestId}] Já existia (200) em ${duration}ms.`);
                return { registrationId: registration.id, synced: true, created: false };
            }

            const errorBody = await response.text().catch(() => '');
            console.error(`[SPORTS-BACKFILL] [${requestId}] Erro (${response.status}) em ${duration}ms: ${errorBody}`);
            return {
                registrationId: registration.id,
                synced: false,
                created: false,
                error: `HTTP ${response.status}: ${errorBody}`.slice(0, 500),
            };
        } catch (error: any) {
            clearTimeout(timeout);
            const msg = error.name === 'AbortError' ? 'Timeout após 10s' : error.message;
            console.error(`[SPORTS-BACKFILL] [${requestId}] Falha: ${msg}`);
            return { registrationId: registration.id, synced: false, created: false, error: msg };
        }
    }

    /**
     * Backfill síncrono com falha parcial tolerada.
     *
     * Busca todas as inscrições elegíveis (status=paid, ticketPurpose=REGISTRATION)
     * do evento e as envia uma a uma para a A2Sports360.
     *
     * Falhas individuais NÃO interrompem o processo — são coletadas e retornadas
     * no array `failures` para auditoria.
     */
    async syncPaidRegistrationsForEvent(
        eventId: string,
        externalChampionshipId: string
    ): Promise<BackfillResult> {
        console.log(`[SPORTS-BACKFILL] Iniciando backfill para evento ${eventId} → championship ${externalChampionshipId}`);

        // Query com Drizzle relations: inscrições pagas de REGISTRATION + jogadores
        const registrations = await db.query.sportRegistrations.findMany({
            where: and(
                eq(sportRegistrations.eventId, eventId),
                eq(sportRegistrations.status, 'paid'),
                eq(sportRegistrations.ticketPurpose, 'REGISTRATION')
            ),
            with: {
                players: true,
            },
        });

        const total = registrations.length;
        console.log(`[SPORTS-BACKFILL] Encontradas ${total} inscrições elegíveis.`);

        if (total === 0) {
            return { total: 0, synced: 0, failed: 0, failures: [] };
        }

        let synced = 0;
        let failed = 0;
        const failures: Array<{ registrationId: string; error: string }> = [];

        for (const reg of registrations) {
            const result = await this.syncRegistration(
                {
                    id: reg.id,
                    teamName: reg.teamName,
                    registrationType: reg.registrationType,
                    players: reg.players.map(p => ({
                        name: p.name,
                        phone: p.phone,
                    })),
                },
                externalChampionshipId
            );

            if (result.synced) {
                synced++;
            } else {
                failed++;
                failures.push({
                    registrationId: result.registrationId,
                    error: result.error || 'Erro desconhecido',
                });
            }
        }

        console.log(`[SPORTS-BACKFILL] Concluído: total=${total}, synced=${synced}, failed=${failed}`);
        return { total, synced, failed, failures };
    }
}

export const sportsIntegrationService = new SportsIntegrationService();
