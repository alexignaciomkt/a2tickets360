import { useState, useEffect } from 'react';
import { Share2, Plus, Trash2, CheckCircle, XCircle, Settings, ExternalLink, Activity } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { webhookService, WebhookConfig } from '@/services/webhookService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const MasterWebhooks = () => {
    const { toast } = useToast();
    const [hooks, setHooks] = useState<WebhookConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newHook, setNewHook] = useState<Partial<WebhookConfig>>({
        eventKey: 'producer_registered',
        url: '',
        isActive: true,
        description: ''
    });

    const [logs, setLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    useEffect(() => {
        loadWebhooks();
        loadLogs();
        
        // Polling para logs (opcional, vamos deixar manual ou por refresh)
        const interval = setInterval(loadLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadWebhooks = async () => {
        try {
            setIsLoading(true);
            const data = await webhookService.getWebhooks();
            setHooks(data);
        } catch (error) {
            toast({
                title: 'Erro ao carregar webhooks',
                description: 'Não foi possível buscar as configurações.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            setIsLoadingLogs(true);
            const data = await webhookService.getLogs();
            setLogs(data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleSave = async () => {
        if (!newHook.url) {
            toast({ title: 'URL Obrigatória', variant: 'destructive' });
            return;
        }

        try {
            await webhookService.saveWebhook(newHook);
            toast({ title: 'Webhook Salvo!', description: 'Integração pronta para uso.' });
            setIsAddModalOpen(false);
            setNewHook({ eventKey: 'producer_registered', url: '', isActive: true });
            loadWebhooks();
        } catch (error) {
            toast({ title: 'Erro ao salvar', variant: 'destructive' });
        }
    };

    const handleToggle = async (hook: WebhookConfig) => {
        try {
            await webhookService.saveWebhook({
                ...hook,
                isActive: !hook.isActive
            });
            toast({ 
                title: hook.isActive ? 'Webhook Desativado' : 'Webhook Ativado',
                className: 'bg-zinc-900 text-white border-none'
            });
            loadWebhooks();
        } catch (error) {
            toast({ title: 'Erro ao alterar status', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja remover este webhook?')) return;
        try {
            await webhookService.deleteWebhook(id);
            toast({ title: 'Removido com sucesso' });
            loadWebhooks();
        } catch (error) {
            toast({ title: 'Erro ao remover', variant: 'destructive' });
        }
    };

    const triggers = webhookService.getAvailableTriggers();

    return (
        <DashboardLayout userType="admin">
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter mb-2 italic">Webhooks & Integrações</h1>
                        <p className="text-zinc-500 font-medium">Configure URLs para conectar a plataforma com N8N, Chatwoot e outras ferramentas.</p>
                    </div>
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white gap-2 font-black uppercase tracking-widest text-xs px-6 h-12 shadow-lg shadow-primary/20 rounded-xl"
                    >
                        <Plus className="w-4 h-4" /> Novo Webhook
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hooks.length === 0 && !isLoading && (
                        <Card className="col-span-full border-2 border-dashed border-zinc-200 bg-white/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                                    <Share2 className="w-10 h-10 text-zinc-300" />
                                </div>
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] max-w-sm">Nenhum webhook configurado. Adicione sua primeira integração para começar a automatizar o sistema.</p>
                            </CardContent>
                        </Card>
                    )}

                    {hooks.map((hook) => (
                        <Card key={hook.id} className="bg-white border-zinc-100 hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-xl rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b border-zinc-50 bg-zinc-50/50">
                                <div className="flex justify-between items-start">
                                    <div className="bg-primary/10 p-2.5 rounded-xl">
                                        <Activity className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Switch 
                                            checked={hook.isActive} 
                                            onCheckedChange={() => handleToggle(hook)}
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                            onClick={() => handleDelete(hook.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="mt-4 text-zinc-900 text-lg font-black uppercase tracking-tight">
                                    {triggers.find(t => t.key === hook.eventKey)?.label || hook.eventKey}
                                </CardTitle>
                                <CardDescription className="text-primary font-bold font-mono text-[10px] truncate bg-primary/5 px-2 py-1 rounded-md mt-1">
                                    {hook.url}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <p className="text-sm text-zinc-500 font-medium line-clamp-2 min-h-[40px]">{hook.description || triggers.find(t => t.key === hook.eventKey)?.description || 'Sem descrição definida para este gatilho.'}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                                        hook.isActive 
                                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                                            : 'text-zinc-400 bg-zinc-50 border-zinc-100'
                                    }`}>
                                        {hook.isActive ? (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5" /> Ativo
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3.5 h-3.5" /> Inativo
                                            </>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">N8N READY</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic">Monitor de Atividade</h2>
                            <p className="text-sm text-zinc-500 font-medium">Últimos 20 eventos processados pelo sistema.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={loadLogs} 
                            disabled={isLoadingLogs}
                            className="rounded-lg border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-widest gap-2"
                        >
                            <Activity className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                            Atualizar Agora
                        </Button>
                    </div>

                    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Evento</th>
                                        <th className="px-6 py-4">Destino</th>
                                        <th className="px-6 py-4">Data/Hora</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 overflow-y-auto max-h-[400px]">
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium text-sm italic">
                                                Nenhuma atividade registrada ainda.
                                            </td>
                                        </tr>
                                    )}
                                    {logs.map((log) => (
                                        <tr key={log.$id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase w-fit
                                                    ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {log.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-black text-zinc-900 uppercase tracking-tighter">
                                                    {log.event}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-zinc-500 font-mono truncate max-w-[200px] block">
                                                    {log.url === 'N/A' ? 'Sem Destino' : log.url}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-zinc-400 font-medium">
                                                    {new Date(log.$createdAt).toLocaleString('pt-BR')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 px-3 rounded-lg text-zinc-400 hover:text-primary hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest"
                                                    onClick={() => {
                                                        console.log('Payload:', JSON.parse(log.payload));
                                                        toast({
                                                            title: `Payload: ${log.event}`,
                                                            description: 'Dados enviados visualizados no console do navegador.',
                                                        });
                                                    }}
                                                >
                                                    Payload
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="bg-white border-zinc-200 text-zinc-900 max-w-md rounded-2xl shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <Settings className="w-6 h-6" />
                                </div>
                                Novo Gatilho
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 font-medium">
                                Defina qual evento do sistema disparará o webhook para o seu servidor.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 py-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-800 font-black uppercase text-[10px] tracking-widest ml-1">Evento Trigger</Label>
                                <Select 
                                    value={newHook.eventKey} 
                                    onValueChange={(val) => setNewHook(prev => ({ ...prev, eventKey: val }))}
                                >
                                    <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 h-12 rounded-xl focus:ring-primary">
                                        <SelectValue placeholder="Selecione o gatilho" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                                        {triggers.map(t => (
                                            <SelectItem key={t.key} value={t.key} className="font-bold">{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-800 font-black uppercase text-[10px] tracking-widest ml-1">URL de Destino (Hook)</Label>
                                <Input 
                                    placeholder="https://n8n.seuservidor.com/webhook/..." 
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900 h-12 rounded-xl focus:ring-primary font-medium"
                                    value={newHook.url}
                                    onChange={(e) => setNewHook(prev => ({ ...prev, url: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-800 font-black uppercase text-[10px] tracking-widest ml-1">Descrição</Label>
                                <Input 
                                    placeholder="Ex: Enviar boas-vindas no WhatsApp" 
                                    className="bg-zinc-50 border-zinc-200 text-zinc-900 h-12 rounded-xl focus:ring-primary font-medium"
                                    value={newHook.description}
                                    onChange={(e) => setNewHook(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-3 sm:gap-0 mt-2">
                            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
                            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs px-8 h-12 rounded-xl shadow-lg shadow-primary/20">Salvar Integração</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default MasterWebhooks;
