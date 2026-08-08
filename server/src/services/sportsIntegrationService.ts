import { db } from '../db';
import { events } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

export interface ProvisionEventResult {
    success: boolean;
    championshipId?: string;
    errorCode?: string;
    errorMessage?: string;
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
}

export const sportsIntegrationService = new SportsIntegrationService();
