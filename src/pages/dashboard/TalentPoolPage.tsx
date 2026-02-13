
import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Linkedin,
    Instagram,
    FileText,
    Briefcase,
    CheckCircle,
    XCircle,
    Clock,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { candidateService } from '@/services/candidateService';
import { staffService } from '@/services/staffService';
import { Candidate } from '@/interfaces/candidate';
import { StaffRole } from '@/interfaces/staff';
import { StaffModal } from '@/components/modals/StaffModal';

const TalentPoolPage = () => {
    const { toast } = useToast();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [roles, setRoles] = useState<StaffRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Hiring Flow State
    const [hiringCandidate, setHiringCandidate] = useState<Candidate | null>(null);
    const [staffModalOpen, setStaffModalOpen] = useState(false);
    const [events, setEvents] = useState<any[]>([]); // Mock events needed for modal

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [candidatesData, rolesData] = await Promise.all([
                candidateService.getCandidates('1'),
                staffService.getRoles()
            ]);
            setCandidates(candidatesData);
            setRoles(rolesData);

            // Mock loading events for the modal
            setEvents([
                { id: '1', title: 'Festival SanjaMusic 2025' },
                { id: '2', title: 'Tech Conference' }
            ]);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao carregar dados',
                description: 'Não foi possível carregar o banco de talentos.'
            });
        } finally {
            setLoading(false);
        }
    };

    const getRoleName = (roleId: string) => {
        return roles.find(r => r.id === roleId)?.name || roleId;
    };

    const handleStatusChange = async (candidateId: string, status: Candidate['status']) => {
        try {
            await candidateService.updateStatus(candidateId, status);
            setCandidates(candidates.map(c => c.id === candidateId ? { ...c, status } : c));
            toast({ title: 'Status atualizado!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao atualizar status' });
        }
    };

    const handleHire = (candidate: Candidate) => {
        setHiringCandidate(candidate);
        setStaffModalOpen(true);
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.experience.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Banco de Talentos</h1>
                        <p className="text-gray-500">Gerencie candidaturas e recrute novos membros.</p>
                    </div>
                    <Button variant="outline" onClick={() => window.open('/producer/sanja-music/careers', '_blank')}>
                        Ver Página Pública
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nome, habilidade ou experiência..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Candidates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCandidates.map((candidate) => (
                        <Card key={candidate.id} className={`h-full flex flex-col ${candidate.status === 'rejected' ? 'opacity-60 bg-gray-50' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                                        <CardDescription>{candidate.email}</CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            candidate.status === 'hired' ? 'default' :
                                                candidate.status === 'rejected' ? 'destructive' :
                                                    candidate.status === 'reviewed' ? 'secondary' : 'outline'
                                        }
                                    >
                                        {candidate.status === 'pending' && 'Pendente'}
                                        {candidate.status === 'reviewed' && 'Em Análise'}
                                        {candidate.status === 'hired' && 'Contratado'}
                                        {candidate.status === 'rejected' && 'Rejeitado'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {candidate.interestedRolesIds.map(roleId => (
                                        <Badge key={roleId} variant="secondary" className="text-xs font-normal">
                                            {getRoleName(roleId)}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md line-clamp-4">
                                    <p className="font-semibold text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Resumo
                                    </p>
                                    {candidate.experience}
                                </div>

                                <div className="flex gap-3 text-sm">
                                    {candidate.linkedinUrl && (
                                        <a href={`https://${candidate.linkedinUrl}`} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                                            <Linkedin className="w-3 h-3 mr-1" /> LinkedIn
                                        </a>
                                    )}
                                    {candidate.portfolioUrl && (
                                        <a href={`https://${candidate.portfolioUrl}`} target="_blank" rel="noreferrer" className="flex items-center text-pink-600 hover:underline">
                                            <Instagram className="w-3 h-3 mr-1" /> Portfólio
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 border-t bg-gray-50/50 flex justify-between">
                                <div className="text-xs text-gray-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(candidate.appliedAt).toLocaleDateString()}
                                </div>

                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'reviewed')}>
                                                Marcar como Visualizado
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'rejected')}>
                                                Rejeitar Candidato
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {candidate.status !== 'hired' && (
                                        <Button size="sm" onClick={() => handleHire(candidate)}>
                                            <Briefcase className="w-3 h-3 mr-2" /> Contratar
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}

                    {filteredCandidates.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhum candidato encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Staff Modal pre-filled */}
            {hiringCandidate && (
                <StaffModal
                    open={staffModalOpen}
                    onOpenChange={setStaffModalOpen}
                    events={events}
                    staff={undefined} // It's a new staff member
                    initialData={{
                        name: hiringCandidate.name,
                        email: hiringCandidate.email,
                        phone: hiringCandidate.phone,
                        roleId: hiringCandidate.interestedRolesIds[0] || ''
                    }}
                    onSuccess={() => {
                        handleStatusChange(hiringCandidate.id, 'hired');
                        setStaffModalOpen(false);
                        setHiringCandidate(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default TalentPoolPage;
