import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { sponsorService } from '@/services/sponsorService';
import { SponsorType, SponsorFormData, SponsorStatus } from '@/interfaces/sponsor';
import { staffService } from '@/services/staffService';
import { StaffMember } from '@/interfaces/staff';
import { toast } from 'sonner';

interface AddSponsorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: string;
    organizerId: string;
    onSuccess: () => void;
}

export const AddSponsorModal = ({ open, onOpenChange, eventId, organizerId, onSuccess }: AddSponsorModalProps) => {
    const [loading, setLoading] = useState(false);
    const [types, setTypes] = useState<SponsorType[]>([]);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [formData, setFormData] = useState<SponsorFormData>({
        sponsorTypeId: '',
        soldByStaffId: '',
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        document: '',
        totalValue: 0,
        installments: 1,
        status: 'prospecting',
        notes: '',
    });

    const [newTypeMode, setNewTypeMode] = useState(false);
    const [newTypeData, setNewTypeData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (open) {
            loadTypes();
            loadStaff();
        }
    }, [open]);

    const loadTypes = async () => {
        try {
            const data = await sponsorService.getSponsorTypes(organizerId);
            setTypes(data);
        } catch (error) {
            console.error('Erro ao carregar tipos de patrocínio:', error);
        }
    };

    const loadStaff = async () => {
        try {
            const data = await staffService.getEventStaff(eventId);
            setStaffMembers(data);
        } catch (error) {
            console.error('Erro ao carregar staff:', error);
        }
    };

    const handleCreateType = async () => {
        if (!newTypeData.name) return;
        setLoading(true);
        try {
            const newType = await sponsorService.createSponsorType(organizerId, newTypeData);
            setTypes([...types, newType]);
            setFormData({ ...formData, sponsorTypeId: newType.id });
            setNewTypeMode(false);
            setNewTypeData({ name: '', description: '' });
            toast.success('Cota de patrocínio criada!');
        } catch (error) {
            toast.error('Erro ao criar cota.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.sponsorTypeId || !formData.companyName) {
            toast.error('Preencha os campos obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            const sponsor = await sponsorService.createSponsor(eventId, formData);

            // Se tiver parcelas, gerar automaticamente
            if (formData.installments > 1 && sponsor.id) {
                const installmentValue = Number(formData.totalValue) / formData.installments;
                const installments = Array.from({ length: formData.installments }).map((_, i) => ({
                    installmentNumber: i + 1,
                    value: installmentValue,
                    dueDate: new Date(new Date().setMonth(new Date().getMonth() + i)).toISOString(),
                    status: 'pending' as const
                }));
                await sponsorService.generateInstallments(sponsor.id, installments);
            }

            toast.success('Patrocinador cadastrado!');
            onSuccess();
            onOpenChange(false);
            setFormData({
                sponsorTypeId: '',
                soldByStaffId: '',
                companyName: '',
                contactName: '',
                contactEmail: '',
                contactPhone: '',
                document: '',
                totalValue: 0,
                installments: 1,
                status: 'prospecting',
                notes: '',
            });
        } catch (error) {
            toast.error('Erro ao cadastrar patrocinador.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-indigo-600" />
                        Novo Patrocinador
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="companyName">Nome da Empresa *</Label>
                            <Input
                                id="companyName"
                                placeholder="Ex: Banco do Brasil"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center">
                                <Label>Cota de Patrocínio *</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-6 text-[10px] text-indigo-600 hover:text-indigo-700"
                                    onClick={() => setNewTypeMode(!newTypeMode)}
                                >
                                    {newTypeMode ? 'Cancelar' : '+ Nova Cota'}
                                </Button>
                            </div>

                            {newTypeMode ? (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex gap-2 items-end animate-in fade-in slide-in-from-top-2">
                                    <div className="flex-1 space-y-1">
                                        <Input
                                            placeholder="Nome da Cota (ex: Ouro)"
                                            className="h-8 text-sm"
                                            value={newTypeData.name}
                                            onChange={(e) => setNewTypeData({ ...newTypeData, name: e.target.value })}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 bg-indigo-600 hover:bg-indigo-700"
                                        onClick={handleCreateType}
                                        disabled={loading}
                                    >
                                        Adicionar
                                    </Button>
                                </div>
                            ) : (
                                <Select
                                    value={formData.sponsorTypeId}
                                    onValueChange={(v) => setFormData({ ...formData, sponsorTypeId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a cota" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                        {types.length === 0 && (
                                            <SelectItem value="none" disabled>Nenhuma cota cadastrada</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Vendedor */}
                        <div className="space-y-2 md:col-span-2">
                            <Label className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-indigo-600" />
                                Vendedor Responsável
                            </Label>
                            <Select
                                value={formData.soldByStaffId || ''}
                                onValueChange={(v) => setFormData({ ...formData, soldByStaffId: v === 'none' ? '' : v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o vendedor (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sem vendedor</SelectItem>
                                    {staffMembers.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} — {s.eventFunction || s.role}</SelectItem>
                                    ))}
                                    {staffMembers.length === 0 && (
                                        <SelectItem value="empty" disabled>Nenhum staff cadastrado</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-slate-400">Staff deve ser cadastrado antes em Gestão de Staff.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalValue">Valor Total (R$)</Label>
                            <Input
                                id="totalValue"
                                type="number"
                                placeholder="0.00"
                                value={formData.totalValue}
                                onChange={(e) => setFormData({ ...formData, totalValue: Number(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="installments">Parcelas</Label>
                            <Select
                                value={formData.installments.toString()}
                                onValueChange={(v) => setFormData({ ...formData, installments: Number(v) })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                                        <SelectItem key={n} value={n.toString()}>{n}x</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactName">Responsável na Empresa</Label>
                            <Input
                                id="contactName"
                                placeholder="Nome do contato"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                placeholder="email@empresa.com"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v: SponsorStatus) => setFormData({ ...formData, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="prospecting">Prospecção</SelectItem>
                                    <SelectItem value="negotiating">Negociação</SelectItem>
                                    <SelectItem value="confirmed">Confirmado</SelectItem>
                                    <SelectItem value="delivered">Entregue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notes">Notas e Contrapartidas Iniciais</Label>
                            <Textarea
                                id="notes"
                                placeholder="Detalhes da negociação ou solicitações especiais..."
                                className="resize-none"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Patrocinador
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
