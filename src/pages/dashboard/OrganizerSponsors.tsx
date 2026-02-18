import React, { useState, useEffect } from 'react';
import {
    Handshake,
    Plus,
    Search,
    Filter,
    DollarSign,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreHorizontal,
    ChevronRight,
    Building2,
    Mail,
    Phone,
    FileText,
    BadgeCheck,
    UserCheck
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AddSponsorModal } from '@/components/modals/AddSponsorModal';
import { sponsorService } from '@/services/sponsorService';
import { organizerService } from '@/services/organizerService';
import { Sponsor, SponsorStatus } from '@/interfaces/sponsor';
import { Event } from '@/interfaces/organizer';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';

const OrganizerSponsors = () => {
    const { eventId: paramEventId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(paramEventId || null);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const organizerId = '6d123456-789a-4bc3-d2e1-09876543210f'; // Mock

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            loadSponsors(selectedEventId);
            if (selectedEventId !== paramEventId) {
                navigate(`/organizer/events/${selectedEventId}/sponsors`);
            }
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
            toast.error('Erro ao carregar eventos.');
        }
    };

    const loadSponsors = async (id: string) => {
        setLoading(true);
        try {
            const data = await sponsorService.getSponsors(id);
            setSponsors(data);
        } catch (error) {
            toast.error('Erro ao carregar patrocinadores.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: SponsorStatus) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'negotiating': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'prospecting': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'delivered': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const statusMap: Record<SponsorStatus, string> = {
        prospecting: 'Prospecção',
        negotiating: 'Negociação',
        confirmed: 'Confirmado',
        delivered: 'Entregue',
        cancelled: 'Cancelado'
    };

    const filteredSponsors = sponsors.filter(s => {
        const matchesSearch = s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.contactName && s.contactName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        totalRevenue: sponsors.reduce((acc, s) => acc + Number(s.totalValue), 0),
        confirmedRevenue: sponsors.filter(s => s.status === 'confirmed' || s.status === 'delivered')
            .reduce((acc, s) => acc + Number(s.totalValue), 0),
        activeSponsors: sponsors.filter(s => s.status === 'confirmed' || s.status === 'delivered').length,
        pendingDeliverables: sponsors.reduce((acc, s) => acc + (s.deliverables?.filter(d => !d.isCompleted).length || 0), 0)
    };

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Handshake className="h-6 w-6 text-indigo-600" />
                            Gestão de Patrocinadores
                        </h1>
                        <p className="text-slate-500 mt-1">Gerencie cotas, contratos e entregas dos seus parceiros.</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                        if (!selectedEventId) {
                            toast.error('Selecione um evento primeiro.');
                            return;
                        }
                        setAddModalOpen(true);
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Patrocinador
                    </Button>
                </div>

                {/* Event Selector & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="col-span-1 md:col-span-1 border-none shadow-sm flex flex-col justify-center p-4">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2">Evento Ativo</label>
                        <select
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedEventId || ''}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                        >
                            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                        </select>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-slate-500 uppercase">Receita Projetada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Total de todos os contratos</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-green-600 uppercase">Receita Confirmada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.confirmedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            <Progress value={(stats.confirmedRevenue / (stats.totalRevenue || 1)) * 100} className="h-1 mt-2" />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-indigo-600 uppercase">Contrapartidas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600">
                                {stats.pendingDeliverables} pendentes
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">De {stats.activeSponsors} patrocinadores ativos</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Tabs */}
                <Tabs defaultValue="all" className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <TabsList className="bg-white border p-1 rounded-lg">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="active">Confirmados</TabsTrigger>
                            <TabsTrigger value="pending">Em Negociação</TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar empresa..."
                                    className="pl-10 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="all">
                        <Card className="border-none shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>Cota</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Vendedor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Progresso</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-10">Carregando...</TableCell></TableRow>
                                    ) : filteredSponsors.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400 italic">Nenhum patrocinador encontrado.</TableCell></TableRow>
                                    ) : filteredSponsors.map(sponsor => (
                                        <TableRow key={sponsor.id} className="group hover:bg-slate-50/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{sponsor.companyName}</div>
                                                        <div className="text-xs text-slate-500">{sponsor.contactName}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-semibold">{sponsor.type?.name}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm tabular-nums">
                                                {Number(sponsor.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(sponsor.status)}>
                                                    {statusMap[sponsor.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {sponsor.soldBy ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <UserCheck className="h-3 w-3 text-indigo-500" />
                                                        {sponsor.soldBy.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="w-[150px]">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>Entregas</span>
                                                        <span>
                                                            {sponsor.deliverables?.filter(d => d.isCompleted).length || 0}/
                                                            {sponsor.deliverables?.length || 0}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={
                                                            sponsor.deliverables && sponsor.deliverables.length > 0
                                                                ? (sponsor.deliverables.filter(d => d.isCompleted).length / sponsor.deliverables.length) * 100
                                                                : 0
                                                        }
                                                        className="h-1"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Gestão</DropdownMenuLabel>
                                                        <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Visualizar Contrato</DropdownMenuItem>
                                                        <DropdownMenuItem><BadgeCheck className="h-4 w-4 mr-2" /> Gerenciar Entregas</DropdownMenuItem>
                                                        <DropdownMenuItem><DollarSign className="h-4 w-4 mr-2" /> Verificar Parcelas</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">Remover</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>

                {selectedEventId && (
                    <AddSponsorModal
                        open={addModalOpen}
                        onOpenChange={setAddModalOpen}
                        eventId={selectedEventId}
                        organizerId={organizerId}
                        onSuccess={() => loadSponsors(selectedEventId)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrganizerSponsors;
