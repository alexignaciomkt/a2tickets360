import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, QrCode, LogOut, Check, X, Camera, Info, User, Lock, Mail } from "lucide-react";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "@/contexts/AuthContext";

const StaffReaderPage = () => {
    const { user, login, logout, loading: authLoading } = useAuth();
    const [step, setStep] = useState<"login" | "select_event" | "reader">("login");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedEventId, setSelectedEventId] = useState("");
    const [scanResult, setScanResult] = useState<"success" | "error" | null>(null);
    const [ticketData, setTicketData] = useState<any>(null);
    const [activeEvents, setActiveEvents] = useState<any[]>([]);
    const { toast } = useToast();
    const navigate = useNavigate();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Verifica status de autenticação e carrega os eventos adequados
    useEffect(() => {
        if (!authLoading) {
            if (user) {
                loadEventsForUser();
            } else {
                setStep("login");
            }
        }
    }, [user, authLoading]);

    const loadEventsForUser = async () => {
        if (!user) return;
        setLoading(true);

        try {
            let query = supabase.from('events').select('id, title').in('status', ['published', 'pending', 'finished']);

            if (user.role === 'organizer' || user.role === 'master') {
                query = query.eq('organizer_id', user.id);
            } else if (user.role === 'staff') {
                const { data: staffData } = await supabase.from('staff').select('event_id, organizer_id').eq('email', user.email).maybeSingle();
                if (staffData) {
                    if (staffData.event_id) {
                        query = query.eq('id', staffData.event_id);
                    } else {
                        query = query.eq('organizer_id', staffData.organizer_id);
                    }
                }
            }

            const { data } = await query;
            if (data && data.length > 0) {
                setActiveEvents(data);
                if (data.length === 1) {
                    setSelectedEventId(data[0].id);
                    setStep("reader");
                } else {
                    setStep("select_event");
                }
            } else {
                toast({ title: "Nenhum evento encontrado para esta conta", variant: "destructive" });
            }
        } catch (error) {
            console.error("Erro ao carregar eventos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ title: "Preencha e-mail e senha", variant: "destructive" });
            return;
        }

        setLoading(true);
        const success = await login(email, password);
        if (success) {
            toast({ title: "Login realizado com sucesso!" });
            // O useEffect vai detectar o `user` e chamar `loadEventsForUser`
        } else {
            setLoading(false);
        }
    };

    const handleEventSelect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) {
            toast({ title: "Selecione um evento", variant: "destructive" });
            return;
        }
        setStep("reader");
        toast({ title: "Modo Validação Ativo" });
    };

    const startScanner = () => {
        // Aguardar o DOM renderizar o elemento qr-reader
        setTimeout(() => {
            const element = document.getElementById("qr-reader");
            if (element && !scannerRef.current) {
                scannerRef.current = new Html5QrcodeScanner(
                    "qr-reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );
                scannerRef.current.render(onScanSuccess, onScanFailure);
            }
        }, 300);
    };

    const onScanSuccess = async (decodedText: string) => {
        if (loading || scanResult) return;
        
        console.log(`[SCAN] Código lido: ${decodedText}`);
        setLoading(true);
        try {
            // 1. Buscar Ingresso Real no Supabase
            const { data: ticket, error } = await supabase
                .from('purchased_tickets')
                .select(`
                    *,
                    profiles:user_id (name, email),
                    tickets:ticket_id (name)
                `)
                .eq('qr_code_data', decodedText)
                .maybeSingle();

            if (error || !ticket) {
                console.error("Erro ou ingresso não encontrado:", error);
                setScanResult("error");
                setLoading(false);
                return;
            }

            // 2. Validar se o ingresso é para ESTE evento
            if (ticket.event_id !== selectedEventId) {
                toast({ 
                    title: "Evento Incorreto", 
                    description: "Este ingresso pertence a outro evento.", 
                    variant: "destructive" 
                });
                setScanResult("error");
                setLoading(false);
                return;
            }

            // 3. Validar se já foi usado
            if (ticket.status === 'used') {
                setScanResult("error");
                setLoading(false);
                toast({ title: "Ingresso já utilizado!", variant: "destructive" });
                return;
            }

            // 4. Marcar como USADO e mostrar sucesso
            const { error: updateError } = await supabase
                .from('purchased_tickets')
                .update({ status: 'used' })
                .eq('id', ticket.id);

            if (updateError) throw updateError;

            setTicketData(ticket);
            setScanResult("success");
            
            // Vibrar dispositivo se disponível
            if (navigator.vibrate) navigator.vibrate(200);

        } catch (err) {
            console.error("Erro fatal na validação:", err);
            setScanResult("error");
        } finally {
            setLoading(false);
        }
    };

    const onScanFailure = (error: any) => {
        // Silencioso para não travar a UI
    };

    const resetScan = () => {
        setScanResult(null);
        setTicketData(null);
    };

    useEffect(() => {
        if (step === "reader") {
            startScanner();
        }
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Erro ao limpar scanner:", err));
                scannerRef.current = null;
            }
        };
    }, [step]);

    if (step === "login" || step === "select_event") {
        if (authLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Carregando...</div>;

        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white font-sans">
                <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl mt-4">
                    <CardHeader className="text-center pb-2">
                        <div className="flex items-center justify-center mx-auto mb-4">
                            <Logo variant="large" showText={false} />
                        </div>
                        <CardTitle className="text-3xl font-black text-white uppercase tracking-tight">Portaria Digital</CardTitle>
                        <CardDescription className="text-gray-400 font-medium italic">
                            {step === "login" ? "Identifique-se para validar acessos." : "Selecione o evento para iniciar as validações."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        {step === "login" ? (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">E-mail</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="seu@email.com"
                                                className="bg-white/5 border-white/10 text-white rounded-2xl h-12 pl-12 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="bg-white/5 border-white/10 text-white rounded-2xl h-12 pl-12 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 mt-4 transition-all active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? "Autenticando..." : "Entrar"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleEventSelect} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Evento Ativo</Label>
                                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:ring-indigo-500">
                                            <SelectValue placeholder="Selecione o evento..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                                            {activeEvents.map(event => (
                                                <SelectItem key={event.id} value={event.id}>
                                                    {event.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-full font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 mt-4 transition-all active:scale-95"
                                    >
                                        Acessar Leitor
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => logout()}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Sair da Conta
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Validador Pro</p>
                        <h2 className="text-sm font-black uppercase tracking-tight truncate max-w-[180px]">
                            {activeEvents.find(e => e.id === selectedEventId)?.title || "Evento"}
                        </h2>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20" onClick={() => {
                    setStep("select_event");
                    scannerRef.current?.clear();
                    scannerRef.current = null;
                }}>
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative bg-black">
                {!scanResult ? (
                    <div className="w-full max-w-sm p-4 space-y-6 text-center">
                        <div id="qr-reader" className="overflow-hidden rounded-[2.5rem] border-4 border-indigo-600 shadow-2xl bg-black"></div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Pronto para Validar</h3>
                            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest opacity-70">Aponte para o QR Code do ingresso</p>
                        </div>
                    </div>
                ) : (
                    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-white animate-in zoom-in duration-300 ${scanResult === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
                        <div className="w-full max-w-sm space-y-8 text-center">
                            {scanResult === "success" ? (
                                <>
                                    <div className="space-y-4">
                                        <div className="relative mx-auto w-48 h-48 md:w-56 md:h-56">
                                            <div className="absolute -inset-4 bg-white/20 rounded-full animate-pulse"></div>
                                            <div className="relative w-full h-full rounded-full border-4 border-white overflow-hidden shadow-2xl bg-emerald-800 flex items-center justify-center">
                                                {ticketData?.photo_url ? (
                                                    <img src={ticketData.photo_url} className="w-full h-full object-cover" alt="Titular" />
                                                ) : (
                                                    <User className="w-24 h-24 text-white/40" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-white text-emerald-600 p-3 rounded-full shadow-xl">
                                                <Check className="w-8 h-8" strokeWidth={4} />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <h2 className="text-4xl font-black uppercase tracking-tight leading-none mb-1 italic">Acesso Liberado</h2>
                                            <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs opacity-80">Conferência Visual Obrigatória</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 space-y-4">
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 opacity-70">Nome do Titular</p>
                                            <p className="text-2xl font-black uppercase tracking-tight truncate">{ticketData?.profiles?.name || 'Visitante'}</p>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                            <div className="text-left">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 opacity-70">Ingresso</p>
                                                <p className="text-lg font-bold">{ticketData?.tickets?.name || 'Padrão'}</p>
                                            </div>
                                            <Badge className="bg-white text-emerald-600 font-black border-none uppercase px-3 py-1">Check-in OK</Badge>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-32 h-32 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white/30">
                                        <X className="w-16 h-16" strokeWidth={4} />
                                    </div>
                                    <div className="space-y-4 text-center">
                                        <h1 className="text-4xl font-black uppercase tracking-tight leading-none">Acesso Negado</h1>
                                        <p className="text-red-100 font-medium px-10 leading-relaxed italic opacity-80">Ingresso já utilizado, inválido ou de outro evento.</p>
                                    </div>
                                </>
                            )}

                            <div className="pt-6">
                                <Button 
                                    onClick={resetScan} 
                                    className="bg-white text-gray-900 h-16 rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 w-full transition-all active:scale-95"
                                >
                                    Fazer Nova Leitura
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffReaderPage;
