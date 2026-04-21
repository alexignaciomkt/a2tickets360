import { supabase } from '@/lib/supabase';

export interface WebhookConfig {
    id: string;
    eventKey: string;
    url: string;
    isActive: boolean;
    description?: string;
}

class WebhookService {
    async getWebhooks(): Promise<WebhookConfig[]> {
        try {
            const { data, error } = await supabase
                .from('webhook_configs')
                .select('*');

            if (error) throw error;

            return data.map(d => ({
                id: d.id,
                eventKey: d.event_key,
                url: d.url,
                isActive: d.is_active,
                description: d.description
            }));
        } catch (error) {
            console.error('Error fetching webhooks:', error);
            return [];
        }
    }

    async saveWebhook(hook: Partial<WebhookConfig>): Promise<void> {
        const data = {
            event_key: hook.eventKey,
            url: hook.url,
            is_active: hook.isActive ?? true,
            description: hook.description || ''
        };

        if (hook.id) {
            await supabase.from('webhook_configs').update(data).eq('id', hook.id);
        } else {
            await supabase.from('webhook_configs').insert(data);
        }
    }

    async deleteWebhook(id: string): Promise<void> {
        await supabase.from('webhook_configs').delete().eq('id', id);
    }

    async dispatch(eventKey: string, payload: any): Promise<void> {
        try {
            const hooks = await this.getWebhooks();
            const activeHooks = hooks.filter(h => h.eventKey === eventKey && h.isActive);
            
            console.log(`📡 Disparando Webhook [${eventKey}] para ${activeHooks.length} endpoints...`);

            if (activeHooks.length === 0) {
                await this.logActivity(eventKey, 'N/A', 'skipped', payload, 'Nenhum destinatário configurado.');
                return;
            }

            const promises = activeHooks.map(async (hook) => {
                try {
                    const response = await fetch(hook.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: eventKey,
                            timestamp: new Date().toISOString(),
                            source: 'a2tickets360',
                            data: payload
                        })
                    });

                    const responseData = await response.text();
                    await this.logActivity(
                        eventKey, 
                        hook.url, 
                        response.ok ? 'success' : 'failed', 
                        payload, 
                        responseData
                    );
                } catch (err: any) {
                    console.error(`❌ Falha no Webhook ${hook.url}:`, err);
                    await this.logActivity(eventKey, hook.url, 'error', payload, err.message);
                }
            });

            await Promise.all(promises);
        } catch (error) {
            console.error('Error dispatching webhooks:', error);
        }
    }

    private async logActivity(event: string, url: string, status: string, payload: any, response: string): Promise<void> {
        try {
            await supabase.from('webhook_logs').insert({
                event_key: String(event),
                url: String(url),
                status: String(status),
                payload: typeof payload === 'string' ? payload : payload,
                response: String(response).substring(0, 5000)
            });
        } catch (error) {
            console.warn('⚠️ Falha ao salvar log de webhook:', error);
        }
    }

    async getLogs(): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('webhook_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching webhook logs:', error);
            return [];
        }
    }

    getAvailableTriggers() {
        return [
            { key: 'onboarding_completed', label: 'Webhook - Documentos e dados do produtor', description: 'Dispara quando o produtor conclui o onboarding com todos os documentos e dados financeiros.' },
            { key: 'producer_registered', label: 'Novo Cadastro Iniciado', description: 'Dispara no início do processo de onboarding.' },
            { key: 'event_created', label: 'Novo Evento Criado', description: 'Dispara quando um evento é registrado (pendente ou publicado).' },
            { key: 'event_published', label: 'Evento Solicitou Publicação', description: 'Dispara quando o produtor clica em "Publicar Evento" e o evento entra na fila de análise.' },
            { key: 'producer_approved', label: 'Produtor Aprovado pelo Master', description: 'Dispara quando você aprova o produtor no painel.' },
            { key: 'ticket_sold', label: 'Ingresso Vendido', description: 'Relatório imediato de venda realizada.' }
        ];
    }
}

export const webhookService = new WebhookService();
export default webhookService;
