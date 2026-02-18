import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Download,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserCheck,
    Mail,
    Phone,
    Copy,
    ExternalLink
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { visitorService } from '@/services/visitorService';
import { organizerService } from '@/services/organizerService';
import { Visitor, VisitorStatus } from '@/interfaces/visitor';
import { Event } from '@/interfaces/organizer';

const OrganizerVisitors = () => {
    const { eventId: paramEventId } = useParams<{ eventId: string }>();

    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(paramEventId || null);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const organizerId = '6d123456-789a-4bc3-d2e1-09876543210f'; // Mock p/ teste

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            loadVisitors(selectedEventId);
        }
    }, [selectedEventId]);

    const loadEvents = async () => {
        try {
            const data = await organizerService.getEvents(organizerId);
            setEvents(data);
            if (data.length > 0 && !selectedEventId) {
                setSelectedEventId(data[0].id);
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            toast.error('Erro ao carregar seus eventos.');
        }
    };

    const loadVisitors = async (id: string) => {
        setLoading(true);
        try {
            const data = await visitorService.getVisitors(id);
            setVisitors(data);
        } catch (error) {
            console.error('Erro ao carregar visitantes:', error);
            toast.error('Erro ao carregar os visitantes do evento.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (visitorId: string) => {
        try {
            await visitorService.checkIn(visitorId);
            toast.success('Check-in realizado com sucesso!');
            loadVisitors(selectedEventId!);
        } catch (error) {
            toast.error('Erro ao realizar check-in.');
        }
    };

    const copyRegistrationLink = () => {
        if (!selectedEventId) return;
        const url = `${window.location.origin}/events/${selectedEventId}/register`;
        navigator.clipboard.writeText(url);
        toast.success('Link de inscrição copiado!');
    };

    const filteredVisitors = visitors.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.document?.includes(searchTerm);

        const matchesFilter = filterStatus === 'all' || v.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: visitors.length,
        checkedIn: visitors.filter(v => v.status === 'checked_in').length,
        pending: visitors.filter(v => v.status !== 'checked_in').length,
    };

    const getStatusBadge = (status: VisitorStatus) => {
        switch (status) {
            case 'registered':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Inscrito</Badge>;
            case 'confirmed':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Confirmado</Badge>;
            case 'checked_in':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px] font-bold">Check-in Realizado</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Users className="h-6 w-6 text-indigo-600" />
                            Gestão de Visitantes & Credenciamento
                        </h1>
                        <p className="text-slate-500 mt-1">Acompanhe as inscrições públicas e realize o check-in na entrada.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" onClick={copyRegistrationLink} className="flex-1 md:flex-none">
                            <Copy className="h-4 w-4 mr-2" />
                            Link de Inscrição
                        </Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 flex-1 md:flex-none" onClick={() => window.open(`/events/${selectedEventId}/register`, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver Página Pública
                        </Button>
                    </div>
                </div>

                {/* Event Selection */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Evento:</span>
                    <select
                        className="flex-1 max-w-sm p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedEventId || ''}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        {events.map(event => (
                            <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total de Inscritos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-green-600 uppercase tracking-wider">Check-ins Realizados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.checkedIn}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pendentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Table */}
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nome, e-mail ou CPF..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="p-2 border rounded-md text-sm bg-slate-50 min-w-[200px]"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Todos os Status</option>
                                <option value="registered">Apenas Inscritos</option>
                                <option value="checked_in">penas com Check-in</option>
                            </select>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar CSV
                            </Button>
                        </div>

                        <div className="rounded-lg border border-slate-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-bold">Visitante</TableHead>
                                        <TableHead className="font-bold">Profissional</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="font-bold">Inscrição</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-400">QR Code</TableHead>
                                        <TableHead className="text-right font-bold">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center">
                                                <Clock className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                                <p className="text-slate-500">Carregando visitantes...</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredVisitors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic">
                                                Nenhum visitante encontrado para os critérios.
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredVisitors.map((visitor) => (
                                        <TableRow key={visitor.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {visitor.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{visitor.name}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" /> {visitor.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {visitor.company ? (
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-800">{visitor.company}</div>
                                                        <div className="text-xs text-slate-500">{visitor.role || 'N/A'}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 italic text-xs">Pessoa Física</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(visitor.status)}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-600">
                                                {new Date(visitor.registeredAt).toLocaleDateString()}
                                                {visitor.checkedInAt && (
                                                    <div className="text-[10px] text-green-600 font-medium">
                                                        Check-in: {new Date(visitor.checkedInAt).toLocaleTimeString()}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <code className="bg-slate-100 px-2 py-1 rounded text-[10px] font-mono text-slate-600">
                                                    {visitor.qrCodeData}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        {visitor.status !== 'checked_in' && (
                                                            <DropdownMenuItem onClick={() => handleCheckIn(visitor.id)} className="text-green-600 font-semibold focus:text-green-700 focus:bg-green-50">
                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                Confirmar Check-in
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => toast.info('Funcionalidade de reenvio em breve.')}>
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Reenviar Credencial
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">Excluir Registro</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default OrganizerVisitors;
