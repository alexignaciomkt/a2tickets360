import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    FileText,
    Building2,
    Briefcase,
    CheckCircle2,
    Download,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { visitorService } from '@/services/visitorService';
import { organizerService } from '@/services/organizerService';
import { Event } from '@/interfaces/organizer';
import { Visitor } from '@/interfaces/visitor';

const VisitorRegistrationPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);
    const [registeredVisitor, setRegisteredVisitor] = useState<Visitor | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        company: '',
        role: ''
    });

    useEffect(() => {
        if (eventId) {
            loadEvent();
        }
    }, [eventId]);

    const loadEvent = async () => {
        try {
            const data = await organizerService.getEvent(eventId!);
            setEvent(data);
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            toast.error('Evento não encontrado ou indisponível.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            toast.error('Nome e E-mail são obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            const visitor = await visitorService.registerVisitor(eventId!, formData);
            setRegisteredVisitor(visitor);
            toast.success('Inscrição realizada com sucesso!');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao realizar inscrição.');
        } finally {
            setLoading(false);
        }
    };

    const downloadQRCode = () => {
        const svg = document.getElementById('visitor-qr-code');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `credencial-${registeredVisitor?.name}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
    };

    if (!event && !registeredVisitor) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
            {/* Background pattern */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="fixed inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

            <div className="relative max-w-4xl mx-auto pt-12 pb-24 px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {!registeredVisitor ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                        >
                            {/* Header */}
                            <div className="text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-block p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20"
                                >
                                    <CheckCircle2 className="h-8 w-8 text-indigo-400" />
                                </motion.div>
                                <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                                    Credenciamento de Visitante
                                </h1>
                                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                    Garanta seu acesso ao <span className="text-white font-semibold">{event?.title}</span>. Preencha os dados abaixo para gerar sua credencial digital.
                                </p>
                            </div>

                            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden shadow-2xl">
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <div className="p-8 space-y-6">
                                            <div className="space-y-4">
                                                <h2 className="text-xl font-bold flex items-center gap-2">
                                                    <User className="h-5 w-5 text-indigo-400" />
                                                    Dados Pessoais
                                                </h2>

                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Nome Completo</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                        <Input
                                                            id="name"
                                                            className="bg-slate-950/50 border-slate-800 pl-10 focus-visible:ring-indigo-500"
                                                            placeholder="Como na sua identidade"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">E-mail</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            className="bg-slate-950/50 border-slate-800 pl-10 focus-visible:ring-indigo-500"
                                                            placeholder="seu@parceiro.com"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone">Telefone</Label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                            <Input
                                                                id="phone"
                                                                className="bg-slate-950/50 border-slate-800 pl-10 focus-visible:ring-indigo-500"
                                                                placeholder="(00) 00000-0000"
                                                                value={formData.phone}
                                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="document">CPF</Label>
                                                        <div className="relative">
                                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                            <Input
                                                                id="document"
                                                                className="bg-slate-950/50 border-slate-800 pl-10 focus-visible:ring-indigo-500"
                                                                placeholder="000.000.000-00"
                                                                value={formData.document}
                                                                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-800/30 p-8 space-y-6 border-l border-slate-800">
                                            <div className="space-y-4">
                                                <h2 className="text-xl font-bold flex items-center gap-2">
                                                    <Building2 className="h-5 w-5 text-purple-400" />
                                                    Profissional
                                                </h2>

                                                <div className="space-y-2">
                                                    <Label htmlFor="company">Empresa / Instituição</Label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                        <Input
                                                            id="company"
                                                            className="bg-slate-950/50 border-slate-800 pl-10 focus-visible:ring-indigo-500"
                                                            placeholder="Nome da organização"
                                                            value={formData.company}
                                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="role">Cargo / Função</Label>
                                                    <div className="relative">
                                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                        <Input
                                                            id="role"
                                                            className="bg-slate-950/50 border-slate-800 pl-10 focus-visible:ring-indigo-500"
                                                            placeholder="Ex: Diretor, Gerente, Estudante"
                                                            value={formData.role}
                                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-6">
                                                    <Button
                                                        onClick={handleSubmit}
                                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                        ) : (
                                                            <>
                                                                Concluir Inscrição
                                                                <ArrowRight className="h-5 w-5 ml-2" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                                <p className="text-[10px] text-center text-slate-500 italic">
                                                    Ao se inscrever, você concorda com os termos de privacidade do evento.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="max-w-md mx-auto"
                        >
                            <Card className="bg-white text-slate-950 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)]">
                                <div className="bg-indigo-600 p-8 text-white text-center space-y-2">
                                    <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                        <CheckCircle2 className="h-10 w-10 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black italic tracking-tighter">SUA CREDENCIAL</h2>
                                    <p className="opacity-80 font-medium">Inscrição realizada com sucesso!</p>
                                </div>

                                <CardContent className="p-8 text-center space-y-6">
                                    <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 inline-block mx-auto mb-4">
                                        <QRCodeSVG
                                            id="visitor-qr-code"
                                            value={registeredVisitor.qrCodeData}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight uppercase tracking-tight">
                                            {registeredVisitor.name}
                                        </h3>
                                        <p className="text-indigo-600 font-bold tracking-widest text-xs uppercase">
                                            {registeredVisitor.role || 'Visitante'}
                                        </p>
                                        <p className="text-slate-400 text-sm font-medium">
                                            {registeredVisitor.company || 'Pessoa Física'}
                                        </p>
                                    </div>

                                    <div className="pt-6 flex flex-col gap-3">
                                        <Button
                                            onClick={downloadQRCode}
                                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl gap-2 font-bold"
                                        >
                                            <Download className="h-5 w-5" />
                                            Baixar Credencial
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setRegisteredVisitor(null)}
                                            className="text-slate-500 hover:text-indigo-600"
                                        >
                                            Voltar ao Formulário
                                        </Button>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 italic text-[10px] text-slate-400">
                                        Apresente este QR Code na entrada do evento para realizar seu check-in.
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VisitorRegistrationPage;
