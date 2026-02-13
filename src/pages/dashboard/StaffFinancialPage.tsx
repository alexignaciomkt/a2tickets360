
import { useState, useEffect } from 'react';
import { DollarSign, Users, Clock, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { staffService } from '@/services/staffService';
import { organizerService } from '@/services/organizerService';
import { useToast } from '@/hooks/use-toast';

const StaffFinancialPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<string>('all');
    const [summary, setSummary] = useState<{
        totalCost: number;
        totalStaff: number;
        hourlyStaff: number;
        fixedStaff: number;
        roleBreakdown: { roleName: string; count: number; cost: number; color: string }[];
    } | null>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        loadFinancials();
    }, [selectedEvent]);

    const loadEvents = async () => {
        try {
            const organizerId = '1'; // Mock
            const eventsData = await organizerService.getEvents(organizerId);
            setEvents(eventsData);
        } catch (error) {
            console.error('Failed to load events');
        }
    };

    const loadFinancials = async () => {
        setLoading(true);
        try {
            const data = await staffService.getFinancialSummary(selectedEvent);
            setSummary(data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro de carregamento',
                description: 'Não foi possível calcular os custos.',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Financeiro de Pessoal</h1>
                        <p className="text-gray-500">Estimativa de custos com equipe e folha de pagamento.</p>
                    </div>

                    <div className="w-full md:w-[250px]">
                        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por evento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os eventos</SelectItem>
                                {events.map((event) => (
                                    <SelectItem key={event.id} value={event.id}>
                                        {event.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {summary && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Custo Total Estimado</CardTitle>
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</div>
                                    <p className="text-xs text-muted-foreground">Baseado nos contratos ativos</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Equipe Total</CardTitle>
                                    <Users className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{summary.totalStaff}</div>
                                    <p className="text-xs text-muted-foreground">Membros cadastrados</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Contratos Fixos</CardTitle>
                                    <Briefcase className="h-4 w-4 text-orange-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{summary.fixedStaff}</div>
                                    <p className="text-xs text-muted-foreground">Diárias ou CLT</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Horistas</CardTitle>
                                    <Clock className="h-4 w-4 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{summary.hourlyStaff}</div>
                                    <p className="text-xs text-muted-foreground">Pagamento por hora</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Breakdown by Role (Detailed List) */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Detalhamento por Cargo</CardTitle>
                                    <CardDescription>Custos agrupados por função no evento.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        {summary.roleBreakdown.map((role) => (
                                            <div key={role.roleName} className="flex items-center">
                                                <div
                                                    className="w-2 h-9 rounded-full mr-4"
                                                    style={{ backgroundColor: role.color }}
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none">{role.roleName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {role.count} colaboradores
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{formatCurrency(role.cost)}</div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {((role.cost / (summary.totalCost || 1)) * 100).toFixed(1)}% do total
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {summary.roleBreakdown.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                Nenhum custo registrado para este período.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cost Distribution (Visual Representation) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribuição</CardTitle>
                                    <CardDescription>Para onde vai o orçamento</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {summary.roleBreakdown.map((role) => (
                                            <div key={role.roleName} className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span>{role.roleName}</span>
                                                    <span className="text-gray-500">{((role.cost / (summary.totalCost || 1)) * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${(role.cost / (summary.totalCost || 1)) * 100}%`,
                                                            backgroundColor: role.color
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-900">Insight</h4>
                                                <p className="text-xs text-blue-800 mt-1">
                                                    O custo médio por colaborador está em {formatCurrency(summary.totalCost / (summary.totalStaff || 1))}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StaffFinancialPage;
