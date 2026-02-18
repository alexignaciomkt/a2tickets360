import React, { useState, useEffect } from 'react';
import {
    Store,
    Plus,
    Map as MapIcon,
    Users,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Upload,
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AddStandModal } from '@/components/modals/AddStandModal';
import { standService } from '@/services/standService';
import { organizerService } from '@/services/organizerService';
import { Stand, StandStatus } from '@/interfaces/stand';
import { Event } from '@/interfaces/organizer';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';

const OrganizerStands = () => {
    const { eventId: paramEventId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(paramEventId || null);
    const [stands, setStands] = useState<Stand[]>([]);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [errorAlertOpen, setErrorAlertOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const organizerId = '6d123456-789a-4bc3-d2e1-09876543210f'; // Mock p/ teste

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            loadStands(selectedEventId);
            if (selectedEventId !== paramEventId) {
                navigate(`/organizer/events/${selectedEventId}/stands`);
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
            console.error('Erro ao carregar eventos:', error);
            toast.error('Erro ao carregar seus eventos.');
        }
    };

    const loadStands = async (id: string) => {
        setLoading(true);
        try {
            const data = await standService.getStands(id);
            setStands(data);
        } catch (error) {
            console.error('Erro ao carregar stands:', error);
            toast.error('Erro ao carregar os stands do evento.');
        } finally {
            setLoading(false);
        }
    };

    const updateStandStatus = async (standId: string, status: StandStatus) => {
        try {
            await standService.updateStand(standId, { status });
            toast.success('Status do stand atualizado!');
            loadStands(selectedEventId!);
        } catch (error) {
            toast.error('Erro ao atualizar status.');
        }
    };

    const handleDeleteStand = async (standId: string) => {
        if (!confirm('Tem certeza que deseja excluir este stand?')) return;
        try {
            await standService.deleteStand(standId);
            toast.success('Stand removido com sucesso.');
            loadStands(selectedEventId!);
        } catch (error) {
            toast.error('Erro ao remover stand.');
        }
    };

    const filteredStands = stands.filter(stand => {
        const matchesSearch = stand.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (stand.exhibitorName && stand.exhibitorName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filterStatus === 'all' || stand.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: stands.length,
        available: stands.filter(s => s.status === 'available').length,
        reserved: stands.filter(s => s.status === 'reserved').length,
        sold: stands.filter(s => s.status === 'sold').length,
    };

    const getStatusBadge = (status: StandStatus) => {
        switch (status) {
            case 'available':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disponível</Badge>;
            case 'reserved':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Reservado</Badge>;
            case 'sold':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Vendido</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Store className="h-6 w-6 text-indigo-600" />
                            Gestão de Stands & Expositores
                        </h1>
                        <p className="text-slate-500 mt-1">Configure o mapa do seu evento e gerencie as vendas de espaços.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                            if (!selectedEventId) {
                                setErrorAlertOpen(true);
                                return;
                            }
                            setAddModalOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Stand
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

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total de Stands</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-green-600 uppercase tracking-wider">Disponíveis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.available}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-amber-600 uppercase tracking-wider">Reservados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">{stats.reserved}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-blue-600 uppercase tracking-wider">Vendidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{stats.sold}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="list" className="space-y-4">
                    <TabsList className="bg-white border p-1 rounded-lg">
                        <TabsTrigger value="list" className="gap-2">
                            <Users className="h-4 w-4" />
                            Lista de Stands
                        </TabsTrigger>
                        <TabsTrigger value="map" className="gap-2">
                            <MapIcon className="h-4 w-4" />
                            Planta do Evento
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Buscar por identificador ou expositor..."
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="p-2 border rounded-md text-sm bg-slate-50 min-w-[150px]"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">Todos os Status</option>
                                        <option value="available">Disponíveis</option>
                                        <option value="reserved">Reservados</option>
                                        <option value="sold">Vendidos</option>
                                    </select>
                                </div>

                                <div className="rounded-lg border border-slate-100 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead className="font-bold">Stand</TableHead>
                                                <TableHead className="font-bold">Categoria</TableHead>
                                                <TableHead className="font-bold">Expositor</TableHead>
                                                <TableHead className="font-bold">Valor</TableHead>
                                                <TableHead className="font-bold">Status</TableHead>
                                                <TableHead className="font-bold">Vendedor</TableHead>
                                                <TableHead className="text-right font-bold">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        <Clock className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
                                                        Carregando stands...
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredStands.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500 text-sm italic">
                                                        Nenhum stand encontrado para os critérios.
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredStands.map((stand) => (
                                                <TableRow key={stand.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="font-bold text-slate-900">{stand.identifier}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="text-sm font-medium">{stand.category?.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{stand.category?.size}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {stand.exhibitorName ? (
                                                            <div>
                                                                <div className="text-sm font-semibold">{stand.exhibitorName}</div>
                                                                <div className="text-xs text-slate-500">{stand.exhibitorEmail}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 italic text-xs">Pendente</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm tabular-nums">
                                                        {Number(stand.category?.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(stand.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {stand.soldBy ? (
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                                <UserCheck className="h-3 w-3 text-indigo-500" />
                                                                {stand.soldBy.name}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 italic">N/A</span>
                                                        )}
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
                                                                <DropdownMenuItem onClick={() => updateStandStatus(stand.id, 'available')}>
                                                                    Marcar como Disponível
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updateStandStatus(stand.id, 'reserved')}>
                                                                    Marcar como Reservado
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updateStandStatus(stand.id, 'sold')}>
                                                                    Marcar como Vendido
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteStand(stand.id)}>
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Excluir Stand
                                                                </DropdownMenuItem>
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
                    </TabsContent>

                    <TabsContent value="map">
                        <Card className="border-none shadow-sm overflow-hidden bg-slate-50">
                            <CardContent className="p-12 text-center h-[500px] flex flex-col items-center justify-center">
                                {selectedEvent?.floorPlanUrl ? (
                                    <div className="w-full h-full relative group">
                                        <img
                                            src={selectedEvent.floorPlanUrl}
                                            alt="Planta Baixa"
                                            className="max-w-full max-h-full mx-auto shadow-2xl rounded-lg border-4 border-white"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                            <Button variant="secondary" onClick={() => toast.info('Funcionalidade de troca em breve.')}>
                                                Alterar Planta
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-md">
                                        <div className="bg-slate-200 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                            <MapIcon className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Sem Planta Baixa</h3>
                                        <p className="text-slate-500 mb-6">
                                            Você ainda não carregou a planta baixa para este evento. Carregue uma imagem do mapa para facilitar a visualização espacial dos stands.
                                        </p>
                                        <Button onClick={() => toast.info('Upload simulado na próxima versão.')}>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Carregar Planta (JPG/PNG)
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {selectedEventId && (
                    <AddStandModal
                        open={addModalOpen}
                        onOpenChange={setAddModalOpen}
                        eventId={selectedEventId}
                        onSuccess={() => loadStands(selectedEventId)}
                    />
                )}

                <AlertDialog open={errorAlertOpen} onOpenChange={setErrorAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                Evento Não Selecionado
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Você precisa selecionar um evento para poder cadastrar novos stands.
                                Se não houver eventos na lista, crie um primeiro no painel de eventos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction className="bg-indigo-600 hover:bg-indigo-700">
                                Entendi
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
};

export default OrganizerStands;
