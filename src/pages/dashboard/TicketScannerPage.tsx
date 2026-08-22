import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ticketCheckinService, CheckinValidationResponse } from '@/services/ticketCheckinService';
import { portariaService } from '@/services/portariaService';
import { Camera, CheckCircle, AlertTriangle, XCircle, RotateCcw, Keyboard, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function TicketScannerPage() {
    const { slug } = useParams<{ slug: string }>();
    const { toast } = useToast();
    const [eventId, setEventId] = useState<string | null>(null);
    const [eventName, setEventName] = useState<string>('');
    const [scanning, setScanning] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<CheckinValidationResponse | null>(null);
    const [undoReason, setUndoReason] = useState('');
    
    const qrCodeRegionId = "html5qr-code-full-region";
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const stopInProgressRef = useRef(false);

    // Load Event ID from slug
    useEffect(() => {
        const loadEvent = async () => {
            try {
                if (!slug) return;
                const events = await portariaService.getCurrentOperations();
                const event = events.find(e => e.slug === slug || e.id === slug);
                if (event) {
                    setEventId(event.id);
                    setEventName(event.title);
                } else {
                    toast({ title: "Evento não encontrado na sua operação", variant: "destructive" });
                }
            } catch (err) {
                console.error(err);
                toast({ title: "Erro ao carregar evento", variant: "destructive" });
            }
        };
        loadEvent();
    }, [slug]);

    useEffect(() => {
        let mounted = true;

        const handleScanner = async () => {
            if (scanning) {
                await startScanner(mounted);
            } else {
                await stopScanner();
            }
        };

        handleScanner();

        return () => {
            mounted = false;
            stopScanner();
        };
    }, [scanning]);

    const startScanner = async (mounted: boolean) => {
        if (stopInProgressRef.current) {
            // Se está parando, aguarde a parada completa antes de iniciar
            setTimeout(() => startScanner(mounted), 100);
            return;
        }

        try {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
            }
            if (!html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    onScanSuccess,
                    () => {} // ignore scan failures
                );
            }
        } catch (err) {
            if (!mounted) return;
            console.error("Camera error", err);
            toast({ title: "Erro ao acessar câmera", variant: "destructive" });
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning && !stopInProgressRef.current) {
            stopInProgressRef.current = true;
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (error) {
                console.error("Erro ao parar o scanner:", error);
            } finally {
                stopInProgressRef.current = false;
            }
        }
    };

    const onScanSuccess = (decodedText: string) => {
        // Pausar scanner durante processamento
        setScanning(false);
        handleValidate(decodedText);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput) {
            handleValidate(manualInput);
        }
    };

    const handleValidate = async (qrData: string) => {
        if (!eventId) return;
        setProcessing(true);
        setResult(null);
        setUndoReason('');
        try {
            const res = await ticketCheckinService.validateTicket(qrData, eventId);
            setResult(res);
            if (res.code === 'VALID') {
                toast({ title: "Acesso Liberado!" });
            }
        } catch (err: any) {
            setResult({
                code: 'INVALID_QR',
                message: err.message || 'Erro ao validar'
            });
        } finally {
            setProcessing(false);
            setManualInput('');
        }
    };

    const handleUndo = async () => {
        if (!result?.ticket || !eventId || !undoReason) return;
        try {
            setProcessing(true);
            await ticketCheckinService.undoCheckin(result.ticket.id, eventId, undoReason);
            toast({ title: "Check-in desfeito" });
            setResult(null);
        } catch (err: any) {
            toast({ title: err.message, variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (code: string) => {
        switch (code) {
            case 'VALID': return 'bg-green-500';
            case 'ALREADY_USED': return 'bg-yellow-500';
            default: return 'bg-red-500';
        }
    };

    const getStatusIcon = (code: string) => {
        switch (code) {
            case 'VALID': return <CheckCircle className="w-16 h-16 text-white" />;
            case 'ALREADY_USED': return <AlertTriangle className="w-16 h-16 text-white" />;
            default: return <XCircle className="w-16 h-16 text-white" />;
        }
    };

    if (!eventId) {
        return <div className="p-8 text-center">Carregando evento...</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Controle de Acesso</h1>
                <p className="text-muted-foreground">{eventName}</p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {scanning ? <Camera className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
                        Leitor de Ingressos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!result && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            {/* ESTÁVEL: Mantemos a div renderizada, apenas escondemos/mostramos com CSS */}
                            <div className={`w-full max-w-sm rounded-lg overflow-hidden border bg-black ${scanning ? 'block' : 'hidden'}`}>
                                <div id={qrCodeRegionId} className="w-full min-h-[250px]" />
                            </div>

                            {!scanning && (
                                <div className="w-full max-w-sm p-8 border-2 border-dashed rounded-lg text-center bg-muted/20">
                                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground">Câmera pausada</p>
                                </div>
                            )}

                            <Button 
                                onClick={() => setScanning(!scanning)} 
                                variant={scanning ? "destructive" : "default"}
                                className="w-full max-w-sm"
                            >
                                {scanning ? 'Pausar Câmera' : 'Abrir Câmera'}
                            </Button>

                            <div className="w-full max-w-sm flex items-center gap-2 my-4">
                                <div className="h-px bg-border flex-1"></div>
                                <span className="text-xs text-muted-foreground uppercase">OU</span>
                                <div className="h-px bg-border flex-1"></div>
                            </div>

                            <form onSubmit={handleManualSubmit} className="w-full max-w-sm flex gap-2">
                                <Input 
                                    placeholder="Digite o código (TKT_...)" 
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    disabled={processing}
                                />
                                <Button type="submit" disabled={processing || !manualInput}>Validar</Button>
                            </form>
                        </div>
                    )}

                    {processing && !result && (
                        <div className="text-center p-8">Processando...</div>
                    )}

                    {result && (
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className={`p-6 rounded-full shadow-lg ${getStatusColor(result.code)} animate-in zoom-in duration-300`}>
                                {getStatusIcon(result.code)}
                            </div>
                            
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-wider mb-2">
                                    {result.message}
                                </h2>
                                
                                {result.code === 'VALID' && result.ticket && (
                                    <div className="space-y-1 text-muted-foreground">
                                        <p className="text-lg text-foreground font-semibold">{result.ticket.ticketName || result.ticket.buyerName}</p>
                                        <p className="font-mono text-sm">Ticket ID: {result.ticket.ticketId}</p>
                                        {result.ticket.isCourtesy && (
                                            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mt-2 font-bold uppercase">Cortesia</span>
                                        )}
                                    </div>
                                )}

                                {result.code === 'ALREADY_USED' && result.validatedAt && (
                                    <div className="mt-4 p-4 rounded-lg bg-muted text-sm space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="font-semibold">Primeiro Check-in:</span>
                                            {format(new Date(result.validatedAt), "dd/MM HH:mm:ss")}
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="font-semibold">Operador:</span>
                                            {result.operatorId}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(result.code === 'ALREADY_USED' || result.code === 'VALID') && result.ticket && (
                                <div className="w-full max-w-sm mt-8 border-t pt-6">
                                    <p className="text-xs text-muted-foreground mb-2 text-left">Ação Administrativa (Owner)</p>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Motivo para desfazer" 
                                            value={undoReason}
                                            onChange={(e) => setUndoReason(e.target.value)}
                                            className="text-sm"
                                        />
                                        <Button 
                                            variant="destructive" 
                                            size="icon"
                                            onClick={handleUndo}
                                            disabled={!undoReason || processing}
                                            title="Desfazer Check-in"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                {result && (
                    <CardFooter className="justify-center border-t bg-muted/10 p-4">
                        <Button size="lg" onClick={() => { setResult(null); setScanning(true); }} className="w-full max-w-sm">
                            Nova Leitura
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
