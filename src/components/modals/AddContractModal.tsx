import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddContractModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierName: string;
    onSuccess: (contract: any) => void;
}

export function AddContractModal({ open, onOpenChange, supplierName, onSuccess }: AddContractModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        signedAt: new Date().toISOString().split('T')[0],
        validUntil: "",
        file: null as File | null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate upload
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Contrato adicionado",
                description: `O documento foi vinculado a ${supplierName}.`,
            });
            onSuccess({
                id: Math.random().toString(36).substr(2, 9),
                title: formData.title,
                signedAt: formData.signedAt,
                validUntil: formData.validUntil,
                status: 'signed'
            });
            onOpenChange(false);
            setFormData({ title: "", signedAt: new Date().toISOString().split('T')[0], validUntil: "", file: null });
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <DialogHeader className="p-6 bg-indigo-600 text-white relative">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2 pr-8">
                        <FileText className="w-5 h-5" /> Adicionar Novo Contrato
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <p className="text-xs font-bold text-indigo-900">Fornecedor:</p>
                            <p className="text-sm font-black text-indigo-600 uppercase tracking-tight">{supplierName}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-gray-400">Título do Documento</Label>
                            <Input
                                required
                                placeholder="Ex: Contrato de Prestação de Serviço - Som e Luz"
                                className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Data de Assinatura</Label>
                                <Input
                                    required
                                    type="date"
                                    className="rounded-xl border-gray-100 bg-gray-50 font-bold"
                                    value={formData.signedAt}
                                    onChange={(e) => setFormData({ ...formData, signedAt: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Validade</Label>
                                <Input
                                    required
                                    placeholder="Ex: Dez/2025"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-gray-400">Arquivo do Contrato (PDF)</Label>
                            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer relative group h-[120px]">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                />
                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                <p className="text-xs font-bold text-gray-500">
                                    {formData.file ? formData.file.name : "Clique para selecionar o contrato assinado"}
                                </p>
                            </div>
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
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-full font-black uppercase tracking-tight shadow-lg shadow-indigo-100 px-8"
                            disabled={loading}
                        >
                            {loading ? "Processando..." : "Anexar Contrato"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
