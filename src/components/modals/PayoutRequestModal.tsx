import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Info, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PayoutRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableBalance: number;
}

export function PayoutRequestModal({ open, onOpenChange, availableBalance }: PayoutRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [amount, setAmount] = useState("");

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) return;

        setLoading(true);
        // Simulate Asaas API call for withdrawal
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            toast({
                title: "Solicitação Enviada",
                description: "O valor será creditado em sua conta em até 24h.",
            });
        }, 1500);
    };

    const closeAndReset = () => {
        onOpenChange(false);
        setTimeout(() => {
            setSuccess(false);
            setAmount("");
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl text-center">
                {!success ? (
                    <>
                        <DialogHeader className="p-6 bg-indigo-600 text-white relative">
                            <DialogTitle className="text-xl font-black uppercase tracking-tight pr-8">Solicitar Repasse de Saldo</DialogTitle>
                            <DialogDescription className="text-indigo-100 font-medium text-left">Asaas Withdrawal Logic Implementation</DialogDescription>
                        </DialogHeader>

                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="p-6 space-y-6">
                                {/* Balance Info */}
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center text-left">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Saldo Disponível</p>
                                        <p className="text-2xl font-black text-indigo-600 tracking-tighter">
                                            R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <Landmark className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>

                                <div className="space-y-4 text-left">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-gray-400">Valor para Transferência</Label>
                                        <Input
                                            required
                                            type="number"
                                            placeholder="0,00"
                                            className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-lg h-12"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-400 font-medium italic flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Taxa de repasse: R$ 5,00 (Descontado do valor final)
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
                                        <p className="text-xs font-black text-gray-900 uppercase">Conta de Destino (Asaas)</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium italic">Banco Inter (077)</span>
                                            <span className="font-bold text-gray-900">Ag: 0001 • CC: 12345-6</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-full font-black uppercase tracking-tight shadow-lg shadow-indigo-100"
                                            onClick={handleSubmit}
                                            disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
                                        >
                                            {loading ? "Processando..." : "Confirmar Solicitação"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full mt-2 rounded-full font-bold"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8 space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Solicitação Enviada!</h3>
                            <p className="text-sm text-gray-500 font-medium px-4">O valor de R$ {parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} será creditado em sua conta em até 24h úteis.</p>
                        </div>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 rounded-full font-black uppercase tracking-tight h-12"
                            onClick={closeAndReset}
                        >
                            Entendido
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
