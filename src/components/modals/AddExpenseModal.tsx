import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supplierService, Supplier } from "@/services/supplierService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface AddExpenseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (expense: any) => void;
}

export function AddExpenseModal({ open, onOpenChange, onSuccess }: AddExpenseModalProps) {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        supplierId: "",
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (open) {
            supplierService.getSuppliers().then(setSuppliers);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);

            const newExpense = {
                id: Math.random().toString(36).substr(2, 9),
                date: formData.date,
                description: formData.description,
                amount: parseFloat(formData.amount),
                supplier: selectedSupplier?.name || "N/A",
                status: 'paid'
            };

            toast({
                title: "Despesa registrada",
                description: "A saída foi contabilizada com sucesso.",
            });

            onSuccess(newExpense);
            onOpenChange(false);
            setFormData({ description: "", amount: "", supplierId: "", date: new Date().toISOString().split('T')[0] });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <DialogHeader className="p-6 bg-red-600 text-white relative">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight pr-8">Registrar Nova Despesa</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-gray-400">Descrição da Despesa</Label>
                            <Input
                                required
                                placeholder="Ex: Aluguel de Gerador"
                                className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Valor (R$)</Label>
                                <Input
                                    required
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Data de Saída</Label>
                                <Input
                                    required
                                    type="date"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-gray-400">Fornecedor Vinculado</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, supplierId: val })} value={formData.supplierId}>
                                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50 font-bold">
                                    <SelectValue placeholder="Selecione o fornecedor..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="font-bold">{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-gray-400 font-medium italic">O custo será somado ao histórico do fornecedor.</p>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full font-bold"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 rounded-full font-black uppercase tracking-tight shadow-lg shadow-red-100 px-8"
                            disabled={loading}
                        >
                            {loading ? "Processando..." : "Lançar Despesa"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent >
        </Dialog >
    );
}
