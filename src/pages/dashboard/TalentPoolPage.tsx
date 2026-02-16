
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
    MoreHorizontal,
    Star,
    MapPin,
    User,
    Filter,
    FilterX,
    TrendingUp,
    Heart
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

    // Advanced Filters
    const [filterRole, setFilterRole] = useState('all');
    const [filterGender, setFilterGender] = useState('all');
    const [filterRating, setFilterRating] = useState('0');
    const [showFilters, setShowFilters] = useState(false);

    // Hiring Flow State
    const [hiringCandidate, setHiringCandidate] = useState<Candidate | null>(null);
    const [staffModalOpen, setStaffModalOpen] = useState(false);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const organizerId = '1';
            const [candidatesData, rolesData] = await Promise.all([
                candidateService.getCandidates(organizerId),
                staffService.getRoles()
            ]);

            // Enriquecendo dados mockados para a vitrine se não existirem
            const enrichedCandidates = candidatesData.map(c => ({
                ...c,
                rating: c.rating || Math.floor(Math.random() * 2) + 4, // 4-5 stars por padrão para o "ouro"
                photoUrl: c.photoUrl || `https://i.pravatar.cc/150?u=${c.id}`,
                gender: c.gender || (Math.random() > 0.5 ? 'M' : 'F'),
                birthDate: c.birthDate || '1995-05-15',
                city: c.city || 'São José dos Campos',
                state: c.state || 'SP'
            }));

            setCandidates(enrichedCandidates);
            setRoles(rolesData);

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

    const calculateAge = (birthDate?: string) => {
        if (!birthDate) return '--';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
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

    const handleSendProposal = async (candidateId: string) => {
        try {
            // Logic to send invitation would go here
            setCandidates(candidates.map(c =>
                c.id === candidateId ? { ...c, status: 'reviewed' as any } : c
            ));
            toast({
                title: 'Proposta enviada!',
                description: 'O candidato foi notificado e decidirá no portal dele.',
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao enviar proposta' });
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.experience.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || c.interestedRolesIds.includes(filterRole);
        const matchesGender = filterGender === 'all' || c.gender === filterGender;
        const matchesRating = (c.rating || 0) >= parseInt(filterRating);

        return matchesSearch && matchesRole && matchesGender && matchesRating;
    });

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                {/* Hero Vitrine Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-white/20 text-white border-none backdrop-blur-md font-black uppercase tracking-widest text-[10px]">Premium Recruitment</Badge>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Banco de Talentos de Elite</h1>
                        <p className="text-indigo-100 font-medium max-w-xl">
                            Sua vitrine privilegiada de profissionais qualificados. Encontre o staff perfeito filtrando por performance e dados demográficos.
                        </p>

                        <div className="flex gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                                <Users className="w-8 h-8 text-indigo-300" />
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-indigo-200">Total Talentos</div>
                                    <div className="text-2xl font-black">{candidates.length}</div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-green-300" />
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-green-200">Novos (30d)</div>
                                    <div className="text-2xl font-black">+12</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Abstract background shape */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar talentos por nome ou experiência..."
                                className="pl-10 rounded-full border-gray-200 bg-gray-50 font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={showFilters ? "secondary" : "outline"}
                                className="rounded-full font-black uppercase tracking-tight gap-2"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4" /> {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-full font-black text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                onClick={() => window.open('/producer/sanja-music/careers', '_blank')}
                            >
                                Publicar Vaga
                            </Button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Cargo/Área</label>
                                <Select value={filterRole} onValueChange={setFilterRole}>
                                    <SelectTrigger className="rounded-full bg-gray-50 border-none font-bold">
                                        <SelectValue placeholder="Selecione Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas as Áreas</SelectItem>
                                        {roles.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Sexo</label>
                                <Select value={filterGender} onValueChange={setFilterGender}>
                                    <SelectTrigger className="rounded-full bg-gray-50 border-none font-bold">
                                        <SelectValue placeholder="Gênero" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="M">Masculino</SelectItem>
                                        <SelectItem value="F">Feminino</SelectItem>
                                        <SelectItem value="Other">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mínima de Estrelas</label>
                                <Select value={filterRating} onValueChange={setFilterRating}>
                                    <SelectTrigger className="rounded-full bg-gray-50 border-none font-bold">
                                        <SelectValue placeholder="Rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Qualquer Rating</SelectItem>
                                        <SelectItem value="3">3+ Estrelas</SelectItem>
                                        <SelectItem value="4">4+ Estrelas</SelectItem>
                                        <SelectItem value="5">5 Estrelas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end pb-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-red-500 font-black uppercase text-[10px] tracking-widest gap-1"
                                    onClick={() => {
                                        setFilterRole('all');
                                        setFilterGender('all');
                                        setFilterRating('0');
                                    }}
                                >
                                    <FilterX className="w-3 h-3" /> Limpar Filtros
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Candidates Grid - The Vitrine */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {filteredCandidates.map((candidate) => (
                        <Card key={candidate.id} className="group overflow-hidden rounded-3xl border-none shadow-hover transition-all duration-300 hover:scale-[1.02] bg-white">
                            <div className="relative h-48">
                                <img
                                    src={candidate.photoUrl}
                                    alt={candidate.name}
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <div>
                                        <h3 className="text-white font-black uppercase tracking-tighter text-lg">{candidate.name}</h3>
                                        <div className="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-widest">
                                            <MapPin className="w-3 h-3 text-indigo-400" /> {candidate.city}, {candidate.state}
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/20">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                                        <span className="text-white text-xs font-black">{candidate.rating?.toFixed(1)}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-colors">
                                    <Heart className="w-4 h-4" />
                                </Button>
                            </div>

                            <CardContent className="p-5 space-y-4">
                                <div className="flex flex-wrap gap-1.5">
                                    {candidate.interestedRolesIds.map(roleId => (
                                        <Badge key={roleId} className="bg-indigo-50 text-indigo-600 border-none hover:bg-indigo-100 font-black uppercase text-[9px] tracking-wider px-2 py-0.5">
                                            {getRoleName(roleId)}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-50">
                                    <div className="text-center">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Idade</div>
                                        <div className="text-sm font-black text-gray-800">{calculateAge(candidate.birthDate)}</div>
                                    </div>
                                    <div className="text-center border-x border-gray-50">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Sexo</div>
                                        <div className="text-sm font-black text-gray-800">{candidate.gender === 'M' ? 'Masculino' : candidate.gender === 'F' ? 'Feminino' : 'Outro'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Vagas</div>
                                        <div className="text-sm font-black text-gray-800">03</div>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 font-medium italic line-clamp-2 leading-relaxed h-8">
                                    "{candidate.experience}"
                                </div>
                            </CardContent>

                            <CardFooter className="p-5 pt-0 flex justify-between gap-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex-1 rounded-full font-black uppercase text-[10px] tracking-widest border-gray-200">
                                            Ações
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48 p-2 rounded-2xl shadow-xl border-gray-100">
                                        <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest text-gray-400">Recrutamento</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'reviewed')} className="rounded-xl font-bold">
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Analisado
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'rejected')} className="rounded-xl font-bold text-red-600">
                                            <XCircle className="w-4 h-4 mr-2" /> Recusar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="rounded-xl font-bold">
                                            <FileText className="w-4 h-4 mr-2" /> Ver Currículo
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100"
                                    onClick={() => handleSendProposal(candidate.id)}
                                >
                                    <Briefcase className="w-4 h-4 mr-2" /> Enviar Proposta
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {filteredCandidates.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                <User className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Nenhum talento encontrado</h3>
                            <p className="text-gray-500 font-medium italic">Tente ajustar seus filtros ou publique uma nova vaga para atrair diamantes.</p>
                            <Button variant="outline" className="rounded-full px-8" onClick={() => {
                                setSearchTerm('');
                                setFilterRole('all');
                                setFilterGender('all');
                                setFilterRating('0');
                            }}>
                                Limpar Todos os Filtros
                            </Button>
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
                    staff={undefined}
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
