import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Send, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddQuoteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierName: string;
}

export function AddQuoteModal({ open, onOpenChange, supplierName }: AddQuoteModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        amount: "",
        receivedAt: new Date().toISOString().split('T')[0],
        observations: "",
        file: null as File | null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate recording quote
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Orçamento Registrado",
                description: `A proposta de ${supplierName} foi arquivada para gestão.`,
            });
            onOpenChange(false);
            setFormData({ subject: "", amount: "", receivedAt: new Date().toISOString().split('T')[0], observations: "", file: null });
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="p-6 bg-indigo-600 text-white relative">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2 pr-8">
                            <FileText className="w-5 h-5" /> Registrar Orçamento Recebido
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fornecedor</p>
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{supplierName}</p>
                            </div>
                            <div className="text-right">
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest">Em Análise</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-gray-400">Título / Referência da Cotação</Label>
                            <Input
                                required
                                placeholder="Ex: Orçamento #2025-04 (Som e Luz)"
                                className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Valor Proposto (R$)</Label>
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
                                <Label className="text-xs font-black uppercase text-gray-400">Data de Recebimento</Label>
                                <Input
                                    required
                                    type="date"
                                    className="rounded-xl border-gray-100 bg-gray-50 font-bold"
                                    value={formData.receivedAt}
                                    onChange={(e) => setFormData({ ...formData, receivedAt: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-gray-400">Arquivo do Orçamento (PDF/Imagem)</Label>
                            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                />
                                <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                <p className="text-[10px] font-bold text-gray-500">
                                    {formData.file ? formData.file.name : "Clique para anexar a proposta comercial"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-gray-400">Observações Internas</Label>
                            <Textarea
                                placeholder="Notas sobre prazos, negociações ou itens inclusos..."
                                className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold min-h-[80px]"
                                value={formData.observations}
                                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            />
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
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-full font-black uppercase tracking-tight shadow-lg shadow-indigo-100 px-8 flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? "Salvando..." : (
                                <>
                                    <FileText className="w-4 h-4" /> Registrar Cotação
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
