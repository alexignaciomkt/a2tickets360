import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, QrCode, LogOut, Check, X, Camera, Share2, Info, Calendar } from "lucide-react";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { events as MOCK_EVENTS } from "@/data/mockData";

const StaffReaderPage = () => {
    const [step, setStep] = useState<"login" | "reader">("login");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedEventId, setSelectedEventId] = useState("");
    const [scanResult, setScanResult] = useState<any>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Simulating event filtering for the staff
    const activeEvents = MOCK_EVENTS.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        const diffHours = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
        // Practicing the "12h after start" logic
        return diffHours < 12;
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) {
            toast({
                title: "Selecione um evento",
                description: "Você precisa selecionar o evento para o qual está trabalhando.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        // Simulate authentication
        setTimeout(() => {
            setLoading(false);
            setStep("reader");
            toast({
                title: "Bem-vindo!",
                description: "Leitor autorizado para o evento selecionado.",
            });
        }, 1500);
    };

    const handleScan = () => {
        setLoading(true);
        // Simulate QR Code scanning result
        setTimeout(() => {
            setLoading(false);
            const isSuccess = Math.random() > 0.3;
            setScanResult(isSuccess ? "success" : "error");

            if (isSuccess) {
                toast({
                    title: "Acesso Liberado!",
                    description: "Ingresso validado com sucesso.",
                });
            } else {
                toast({
                    title: "Acesso Negado",
                    description: "Ingresso inválido ou já utilizado.",
                    variant: "destructive"
                });
            }
        }, 1000);
    };

    const resetScan = () => {
        setScanResult(null);
    };

    if (step === "login") {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white font-sans">
                <div className="mb-10 text-center animate-fade-in">
                    <Logo variant="default" showText={true} />
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Staff Portal v2.0</p>
                </div>

                <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Boas-vindas!</CardTitle>
                        <CardDescription className="text-gray-400 font-medium italic">
                            Identifique-se para iniciar a validação de portaria.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">E-mail do Staff</Label>
                                <Input
                                    type="email"
                                    placeholder="ex: joao@staff.com"
                                    className="bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:border-indigo-500 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Senha Temporária</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:border-indigo-500 transition-all font-mono"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Evento de Atuação</Label>
                                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-2xl h-12">
                                        <SelectValue placeholder="Selecione o evento..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/10 text-white rounded-xl">
                                        {activeEvents.map(event => (
                                            <SelectItem key={event.id} value={event.id} className="focus:bg-indigo-600 focus:text-white">
                                                {event.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[9px] text-gray-500 italic mt-1 flex items-center gap-1">
                                    <Info className="w-3 h-3" /> Apenas eventos ativos aparecem aqui.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 mt-4"
                                disabled={loading}
                            >
                                {loading ? "Autenticando..." : "Acessar Leitor"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Tecnologia Segura Ticketera © 2024</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header Mini Header */}
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Validador Pro</p>
                        <h2 className="text-sm font-black uppercase tracking-tight truncate max-w-[180px]">
                            {MOCK_EVENTS.find(e => e.id === selectedEventId)?.title || "Evento"}
                        </h2>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-white/20"
                    onClick={() => setStep("login")}
                >
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-8">
                {!scanResult ? (
                    <div className="w-full max-w-sm space-y-10 text-center">
                        <div className="relative mx-auto">
                            {/* Animated Scanner Frame */}
                            <div className="w-64 h-64 border-4 border-indigo-600 rounded-[3rem] mx-auto relative overflow-hidden bg-white shadow-2xl flex items-center justify-center group flex-col">
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600/50 animate-bounce opacity-20"></div>
                                <Camera className="w-16 h-16 text-indigo-600 mb-2 opacity-20" />
                                <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Aguardando QR</p>
                            </div>

                            {/* Scan Line Animation */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-scroll-v pointer-events-none"></div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Pronto para Validar</h3>
                            <p className="text-gray-500 font-medium px-8 text-sm leading-relaxed">
                                Centralize o QR Code do ingresso no quadro acima para realizar a leitura automática.
                            </p>
                        </div>

                        <Button
                            onClick={handleScan}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-3"
                            disabled={loading}
                        >
                            {loading ? "Processando..." : (
                                <>
                                    <Camera className="w-5 h-5" /> Iniciar Leitura
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="w-full max-w-sm animate-fade-in text-center space-y-8">
                        {scanResult === "success" ? (
                            <>
                                <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <Check className="w-16 h-16" strokeWidth={3} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-green-600 uppercase tracking-tighter italic">Válido</h2>
                                    <p className="text-gray-900 font-black uppercase tracking-widest text-sm">João Pedro da Silva</p>
                                    <p className="text-gray-500 font-bold text-xs uppercase">Ingresso VIP • Lote 2</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-32 h-32 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <X className="w-16 h-16" strokeWidth={3} />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">A2 Tickets 360</h1>
                                    <p className="text-gray-900 font-black uppercase tracking-widest text-sm">Ingresso Inválido</p>
                                    <p className="text-gray-500 font-bold text-xs uppercase">Verifique a origem do documento</p>
                                </div>
                            </>
                        )}

                        <div className="pt-8">
                            <Button
                                onClick={resetScan}
                                variant="outline"
                                className="border-2 border-gray-200 text-gray-900 px-10 h-14 rounded-full font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Nova Leitura
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Servidor Sincronizado
                </div>
                <span>A2 Tickets 360 Security Hub</span>
            </div>
        </div>
    );
};

export default StaffReaderPage;
