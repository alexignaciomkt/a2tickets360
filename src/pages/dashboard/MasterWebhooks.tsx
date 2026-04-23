
import { useState, useEffect } from 'react';
import { Share2, Plus, Trash2, CheckCircle, XCircle, Settings, ExternalLink, Activity, Zap, History, Globe, ChevronRight, Hash, Clock as ClockIcon, ShieldCheck, Database, Target, Cpu } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { webhookService, WebhookConfig } from '@/services/webhookService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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
        
        const interval = setInterval(loadLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadWebhooks = async () => {
        try {
            setIsLoading(true);
            const data = await webhookService.getWebhooks();
            setHooks(data);
        } catch (error) {
            toast({ title: 'Sync Error', description: 'Falha ao buscar configurações de nó do cluster.', variant: 'destructive' });
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
            toast({ title: 'Endpoint Required', variant: 'destructive' });
            return;
        }

        try {
            await webhookService.saveWebhook(newHook);
            toast({ title: 'Protocol Activated', description: 'Integração de nó ativa no cluster autorizado.' });
            setIsAddModalOpen(false);
            setNewHook({ eventKey: 'producer_registered', url: '', isActive: true });
            loadWebhooks();
        } catch (error) {
            toast({ title: 'Commit Failed', variant: 'destructive' });
        }
    };

    const handleToggle = async (hook: WebhookConfig) => {
        try {
            await webhookService.saveWebhook({ ...hook, isActive: !hook.isActive });
            toast({ 
                title: hook.isActive ? 'Node Deactivated' : 'Node Re-Activated',
                className: 'bg-slate-900 text-white border-none rounded-[2rem] font-black uppercase text-[10px] tracking-widest px-8 py-4'
            });
            loadWebhooks();
        } catch (error) {
            toast({ title: 'Status Toggle Error', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Confirm removal of this integration node?')) return;
        try {
            await webhookService.deleteWebhook(id);
            toast({ title: 'Node Pruned' });
            loadWebhooks();
        } catch (error) {
            toast({ title: 'Pruning Failed', variant: 'destructive' });
        }
    };

    const triggers = webhookService.getAvailableTriggers();

    return (
        <DashboardLayout userType="admin">
            <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
                
                {/* Webhooks Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-2">
                    <div className="space-y-1">
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Webhooks & Integrações</h1>
                        <p className="text-xs font-medium text-slate-500 max-w-2xl">
                            Configure e gerencie endpoints de saída para automações.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-8 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium px-3 shadow-sm transition-all rounded-md"
                        >
                            <Plus className="w-3 h-3 mr-1.5" /> Adicionar Webhook
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {hooks.length === 0 && !isLoading && (
                        <div className="col-span-full py-48 flex flex-col items-center justify-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100 animate-pulse">
                            <div className="w-28 h-28 rounded-[3rem] bg-white shadow-2xl flex items-center justify-center mb-10 border-4 border-white transition-transform group-hover:scale-110">
                                <Share2 className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Zero Active Integration Nodes Registry</h3>
                        </div>
                    )}

                    {hooks.map((hook) => (
                        <Card key={hook.id} className="bg-white border-gray-100 hover:border-slate-900 transition-all duration-1000 group shadow-sm hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden flex flex-col border-2 border-transparent hover:border-gray-100">
                            <CardHeader className="pb-6 border-b border-gray-50 bg-gray-50/20 px-10 py-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="w-14 h-14 bg-slate-900 rounded-[1.4rem] flex items-center justify-center text-white border-4 border-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-4">
                                        <Switch 
                                            checked={hook.isActive} 
                                            onCheckedChange={() => handleToggle(hook)}
                                            className="data-[state=checked]:bg-emerald-500 scale-100 shadow-sm"
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-12 w-12 rounded-full text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                                            onClick={() => handleDelete(hook.id)}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-slate-900 text-[14px] font-black uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                    {triggers.find(t => t.key === hook.eventKey)?.label || hook.eventKey}
                                </CardTitle>
                                <div className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter truncate bg-white px-4 py-2 rounded-xl mt-4 inline-block max-w-full border-2 border-gray-50 group-hover:text-slate-900 group-hover:border-slate-100 transition-all tabular-nums">
                                    {hook.url}
                                </div>
                            </CardHeader>
                            <CardContent className="px-10 py-10 flex-1 flex flex-col justify-between">
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-3 mb-8 opacity-80">{hook.description || triggers.find(t => t.key === hook.eventKey)?.description || 'No authorized description matrix defined.'}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <Badge className={`text-[9px] font-black uppercase tracking-[0.2em] border-none px-4 py-1.5 rounded-full shadow-sm transition-all ${
                                        hook.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-slate-300'
                                    }`}>
                                        {hook.isActive ? 'Matrix Online' : 'Standby Mode'}
                                    </Badge>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized v4.1</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="pt-12">
                    <Card className="rounded-[4rem] border-gray-100 shadow-sm bg-white overflow-hidden border-2 group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1000">
                        <CardHeader className="p-16 border-b border-gray-50 bg-gray-50/20 flex flex-row items-center justify-between px-16 py-12">
                           <div className="space-y-2">
                              <CardTitle className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-4">
                                 <History className="w-6 h-6 text-slate-900" /> Logic Flux Monitor
                              </CardTitle>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Real-time authorized node transaction logs and visual payload registry.</p>
                           </div>
                           <Button 
                              variant="outline" 
                              onClick={loadLogs} 
                              disabled={isLoadingLogs}
                              className="h-12 rounded-full border-2 border-gray-100 text-[10px] font-black uppercase tracking-widest px-10 transition-all hover:bg-gray-50 group/sync shadow-sm"
                           >
                              <Activity className={`w-5 h-5 mr-3 text-slate-300 group-hover:text-slate-900 transition-colors ${isLoadingLogs ? 'animate-spin' : ''}`} />
                              Sync Logic Flux
                           </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Matrix Status</th>
                                            <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Node Logic Trigger</th>
                                            <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Target Hierarchy</th>
                                            <th className="px-16 py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Synchronization</th>
                                            <th className="px-16 py-10 text-right text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Attributes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {logs.length === 0 && !isLoadingLogs ? (
                                            <tr>
                                                <td colSpan={5} className="px-16 py-32 text-center text-[12px] font-black uppercase tracking-[0.3em] text-slate-200">
                                                    Zero activity registered in the current matrix cluster cycle.
                                                </td>
                                            </tr>
                                        ) : logs.map((log) => (
                                            <tr key={log.$id} className="hover:bg-gray-50/30 transition-all duration-700 group cursor-pointer border-b border-transparent hover:border-gray-100">
                                                <td className="px-16 py-8">
                                                    <Badge className={`text-[9px] font-black uppercase tracking-[0.3em] border-none px-5 py-2 rounded-full shadow-sm ${
                                                        log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                        {log.status === 'success' ? 'Synchronized' : 'Alpha_Retry'}
                                                    </Badge>
                                                </td>
                                                <td className="px-16 py-8">
                                                    <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                                        {log.event}
                                                    </span>
                                                </td>
                                                <td className="px-16 py-8">
                                                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[280px] block group-hover:text-slate-900 transition-colors tabular-nums">
                                                        {log.url === 'N/A' ? 'Internal Core Loop' : log.url}
                                                    </span>
                                                </td>
                                                <td className="px-16 py-8">
                                                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase leading-none tabular-nums">
                                                       <ClockIcon className="w-4 h-4 opacity-40 group-hover:text-slate-900 transition-colors" />
                                                       {new Date(log.$createdAt).toLocaleString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="px-16 py-8 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-12 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-slate-900 hover:bg-gray-100 px-8 transition-all hover:scale-105"
                                                        onClick={() => {
                                                            toast({
                                                                title: `Audit Log: ${log.event}`,
                                                                description: 'Payload attributes visualized in kernel log registry.',
                                                            });
                                                        }}
                                                    >
                                                        Deep Inspect
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="bg-white border-none text-slate-900 rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,0.3)] p-16 max-w-xl animate-in zoom-in-95 duration-500 border-4 border-slate-50">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-6">
                                <div className="p-5 bg-slate-900 rounded-[1.8rem] text-white shadow-2xl group-hover:rotate-12 transition-transform border-4 border-white">
                                    <Cpu className="w-8 h-8" />
                                </div>
                                Activate Integration Node
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-5 leading-relaxed max-w-sm">
                                Configure a regra protocolar de disparo e endpoint de saída para o cluster.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-10 py-12">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 flex items-center gap-2">
                                   <Target className="w-3.5 h-3.5" /> Monitor Matrix Trigger
                                </Label>
                                <Select 
                                    value={newHook.eventKey} 
                                    onValueChange={(val) => setNewHook(prev => ({ ...prev, eventKey: val }))}
                                >
                                    <SelectTrigger className="h-16 rounded-[1.8rem] border-2 border-gray-50 bg-gray-50/30 text-[12px] font-black uppercase tracking-tight focus:ring-[10px] focus:ring-slate-50 focus:border-slate-900 transition-all px-8">
                                        <SelectValue placeholder="Escolha um trigger protocolar..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[2rem] border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.15)] p-3">
                                        {triggers.map(t => (
                                            <SelectItem key={t.key} value={t.key} className="text-[12px] font-black uppercase p-4 rounded-2xl focus:bg-slate-900 focus:text-white transition-all">{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 flex items-center gap-2">
                                   <Globe className="w-3.5 h-3.5" /> Target Endpoint Hierarchy (POST)
                                </Label>
                                <Input 
                                    placeholder="https://n8n.servidor.com/webhook/..." 
                                    className="h-16 rounded-[1.8rem] border-2 border-gray-50 bg-gray-50/30 text-[13px] font-medium focus:ring-[10px] focus:ring-slate-50 focus:border-slate-900 transition-all px-8"
                                    value={newHook.url}
                                    onChange={(e) => setNewHook(prev => ({ ...prev, url: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 flex items-center gap-2">
                                   <FileText className="w-3.5 h-3.5" /> Registry Description Label
                                </Label>
                                <Input 
                                    placeholder="Ex: Disparar para Nó de Automação Hub" 
                                    className="h-16 rounded-[1.8rem] border-2 border-gray-50 bg-gray-50/30 text-[12px] font-bold uppercase tracking-widest focus:ring-[10px] focus:ring-slate-50 focus:border-slate-900 transition-all px-8"
                                    value={newHook.description}
                                    onChange={(e) => setNewHook(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex-row gap-6">
                            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-14 rounded-full font-black text-[11px] uppercase tracking-[0.3em] hover:bg-gray-50 transition-all text-slate-400 hover:text-slate-900">Abort Loop</Button>
                            <Button onClick={handleSave} className="flex-1 h-14 rounded-full bg-slate-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 group">
                               Activate Node <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default MasterWebhooks;
