import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Loader2, Users, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { standService } from '@/services/standService';
import { StandCategory, StandStatus } from '@/interfaces/stand';
import { staffService } from '@/services/staffService';
import { StaffMember } from '@/interfaces/staff';
import { toast } from 'sonner';

interface AddStandModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: string;
    onSuccess: () => void;
}

export const AddStandModal = ({ open, onOpenChange, eventId, onSuccess }: AddStandModalProps) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<StandCategory[]>([]);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    const [formData, setFormData] = useState({
        identifier: '',
        categoryId: '',
        status: 'available' as StandStatus,
        notes: '',
        soldByStaffId: '',
        exhibitorName: '',
        exhibitorEmail: '',
        exhibitorPhone: '',
        exhibitorDocument: '',
    });

    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        size: '',
        price: 0,
    });

    useEffect(() => {
        console.log('AddStandModal state:', { open, eventId });
        if (open && eventId) {
            loadCategories();
            loadStaff();
        }
    }, [open, eventId]);

    const loadCategories = async () => {
        try {
            const data = await standService.getCategories(eventId);
            setCategories(data);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
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

    const handleCreateCategory = async () => {
        if (!categoryFormData.name || categoryFormData.price <= 0) {
            toast.error('Preencha os dados da categoria corretamente.');
            return;
        }

        setLoading(true);
        try {
            const newCategory = await standService.createCategory(eventId, categoryFormData);
            setCategories([...categories, newCategory]);
            setFormData({ ...formData, categoryId: newCategory.id });
            setShowCategoryForm(false);
            toast.success('Categoria criada com sucesso!');
        } catch (error) {
            toast.error('Erro ao criar categoria.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.identifier || !formData.categoryId) {
            toast.error('Preencha todos os campos obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            await standService.createStand(eventId, formData);
            toast.success('Stand cadastrado com sucesso!');
            onSuccess();
            onOpenChange(false);
            setFormData({
                identifier: '',
                categoryId: '',
                status: 'available',
                notes: '',
                soldByStaffId: '',
                exhibitorName: '',
                exhibitorEmail: '',
                exhibitorPhone: '',
                exhibitorDocument: '',
            });
        } catch (error) {
            toast.error('Erro ao cadastrar stand.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Novo Stand / Expositor</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="identifier">Identificador do Stand (Ex: A-01, B-15)</Label>
                        <Input
                            id="identifier"
                            placeholder="Digite o código do stand"
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="category">Categoria</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-xs text-primary"
                                onClick={() => setShowCategoryForm(!showCategoryForm)}
                            >
                                {showCategoryForm ? 'Cancelar' : 'Nova Categoria'}
                            </Button>
                        </div>

                        {showCategoryForm ? (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Nome (Ilha, Esquina...)</Label>
                                        <Input
                                            className="h-8 text-sm"
                                            value={categoryFormData.name}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tamanho (Ex: 3x3m)</Label>
                                        <Input
                                            className="h-8 text-sm"
                                            value={categoryFormData.size}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, size: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Preço de Venda (R$)</Label>
                                    <Input
                                        type="number"
                                        className="h-8 text-sm"
                                        value={categoryFormData.price}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, price: Number(e.target.value) })}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    className="w-full h-8 text-xs"
                                    onClick={handleCreateCategory}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" />}
                                    Salvar Categoria
                                </Button>
                            </div>
                        ) : (
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name} ({cat.size}) - R$ {Number(cat.price).toLocaleString('pt-BR')}
                                        </SelectItem>
                                    ))}
                                    {categories.length === 0 && (
                                        <SelectItem value="none" disabled>
                                            Nenhuma categoria criada
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status Inicial</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: StandStatus) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Disponível</SelectItem>
                                <SelectItem value="reserved">Reservado</SelectItem>
                                <SelectItem value="sold">Vendido</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(formData.status === 'sold' || formData.status === 'reserved') && (
                        <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Dados do Expositor
                            </h4>

                            {/* Vendedor */}
                            <div className="space-y-1">
                                <Label className="text-xs flex items-center gap-1">
                                    <UserCheck className="h-3 w-3 text-indigo-600" />
                                    Vendedor Responsável
                                </Label>
                                <Select
                                    value={formData.soldByStaffId || ''}
                                    onValueChange={(v) => setFormData({ ...formData, soldByStaffId: v === 'none' ? '' : v })}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Selecione o vendedor (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sem vendedor</SelectItem>
                                        {staffMembers.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name} — {s.eventFunction || s.role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-slate-400">Staff deve ser cadastrado antes em Gestão de Staff.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="exhibitorName" className="text-xs">Nome da Empresa / Expositor</Label>
                                <Input
                                    id="exhibitorName"
                                    placeholder="Ex: Gigante Pneus"
                                    className="h-9"
                                    value={formData.exhibitorName}
                                    onChange={(e) => setFormData({ ...formData, exhibitorName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="exhibitorEmail" className="text-xs">Email de Contato</Label>
                                    <Input
                                        id="exhibitorEmail"
                                        type="email"
                                        placeholder="contato@empresa.com"
                                        className="h-9"
                                        value={formData.exhibitorEmail}
                                        onChange={(e) => setFormData({ ...formData, exhibitorEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exhibitorPhone" className="text-xs">Telefone</Label>
                                    <Input
                                        id="exhibitorPhone"
                                        placeholder="(00) 00000-0000"
                                        className="h-9"
                                        value={formData.exhibitorPhone}
                                        onChange={(e) => setFormData({ ...formData, exhibitorPhone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exhibitorDocument" className="text-xs">CNPJ / CPF</Label>
                                <Input
                                    id="exhibitorDocument"
                                    placeholder="00.000.000/0000-00"
                                    className="h-9"
                                    value={formData.exhibitorDocument}
                                    onChange={(e) => setFormData({ ...formData, exhibitorDocument: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas Internas</Label>
                        <Input
                            id="notes"
                            placeholder="Observações sobre o stand"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || showCategoryForm}>
                            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Cadastrar Stand
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
