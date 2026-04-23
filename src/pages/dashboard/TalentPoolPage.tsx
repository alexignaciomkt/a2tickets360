
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
    Heart,
    Loader2,
    ChevronRight,
    ArrowRight,
    Target,
    Zap,
    ShieldCheck,
    Identity,
    Scale
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

            const enrichedCandidates = candidatesData.map(c => ({
                ...c,
                rating: c.rating || Math.floor(Math.random() * 2) + 4,
                photoUrl: c.photoUrl || `https://i.pravatar.cc/150?u=${c.id}`,
                gender: c.gender || (Math.random() > 0.5 ? 'M' : 'F'),
                birthDate: c.birthDate || '1995-05-15',
                city: c.city || 'São José dos Campos',
                state: c.state || 'SP'
            }));

            setCandidates(enrichedCandidates);
            setRoles(rolesData);
            setEvents([{ id: '1', title: 'Festival SanjaMusic 2025' }, { id: '2', title: 'Tech Conference' }]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: 'Não foi possível carregar o banco de talentos do cluster.' });
        } finally {
            setLoading(false);
        }
    };

    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || roleId;

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
            toast({ title: 'Status Protocol Updated' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Error' });
        }
    };

    const handleSendProposal = async (candidateId: string) => {
        try {
            setCandidates(candidates.map(c => c.id === candidateId ? { ...c, status: 'reviewed' as any } : c));
            toast({ title: 'Proposal Node Dispatched', description: 'O candidato foi notificado para revisão protocolar.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Dispatch Error' });
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
            <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
                
                {/* Executive Talent Hub Header */}
                <div className="bg-slate-900 rounded-[3.5rem] p-16 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-10">
                        <div className="space-y-3">
                            <Badge className="bg-emerald-500 text-white border-none font-black uppercase tracking-widest text-[9px] px-6 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">Recruitment Intelligence Hub</Badge>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Global Talent Matrix</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] max-w-2xl leading-relaxed">
                                Curadoria estratégica de profissionais qualificados. Filtragem por performance e clusterização demográfica de alta autoridade.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 flex items-center gap-6 transition-all hover:bg-white/10 group/card">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover/card:scale-110 transition-transform"><Users className="w-7 h-7" /></div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Assets</div>
                                    <div className="text-3xl font-black leading-none tabular-nums">{candidates.length}</div>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 flex items-center gap-6 transition-all hover:bg-white/10 group/card">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/card:scale-110 transition-transform"><TrendingUp className="w-7 h-7" /></div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Performance Growth</div>
                                    <div className="text-3xl font-black leading-none tabular-nums">+12.4%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Abstract design elements */}
                    <div className="absolute -right-24 -top-24 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute right-16 bottom-16 opacity-5 group-hover:opacity-10 transition-opacity duration-1000"><Users className="w-48 h-48" /></div>
                </div>

                {/* Filter Matrix Registry */}
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-8 group hover:shadow-2xl transition-all duration-700">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="relative flex-1 group/search">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within/search:text-slate-900 transition-colors" />
                            <Input
                                placeholder="Scan talent nodes by name or authorized expertise..."
                                className="pl-16 h-16 rounded-[1.8rem] border-2 border-gray-100 bg-gray-50/50 text-[12px] font-black uppercase tracking-tight focus:ring-8 focus:ring-slate-50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className={`h-16 rounded-full font-black uppercase text-[10px] tracking-widest gap-4 px-10 transition-all ${showFilters ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'text-slate-400 border-gray-100'}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4" /> {showFilters ? 'Hide Matrix' : 'Filter Matrix'}
                            </Button>
                            <Button
                                className="h-16 rounded-full bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest px-12 shadow-2xl shadow-slate-100 transition-all hover:scale-105 active:scale-95 group"
                                onClick={() => window.open('/producer/sanja-music/careers', '_blank')}
                            >
                                <Zap className="w-4 h-4 mr-3 group-hover:scale-125 transition-transform" /> Publish Role Asset
                            </Button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-gray-50 animate-in slide-in-from-top-4 duration-700">
                            {[
                              { l: 'Cluster Classification', v: filterRole, s: setFilterRole, items: roles.map(r => ({ id: r.id, n: r.name })), icon: Target },
                              { l: 'Identity Protocol', v: filterGender, s: setFilterGender, items: [{id:'M', n:'Masculino'}, {id:'F', n:'Feminino'}, {id:'Other', n:'Other'}], icon: User },
                              { l: 'Authorized Rating', v: filterRating, s: setFilterRating, items: [{id:'3', n:'3+ Estrelas'}, {id:'4', n:'4+ Estrelas'}, {id:'5', n:'5 Estrelas'}], icon: Star },
                            ].map((filter, i) => (
                              <div key={i} className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-4 flex items-center gap-2">
                                    <filter.icon className="w-3 h-3" /> {filter.l}
                                </label>
                                <Select value={filter.v} onValueChange={filter.s}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-2 border-transparent text-[11px] font-black uppercase tracking-tight focus:ring-0 focus:border-slate-900 transition-all px-6">
                                        <SelectValue placeholder="Select Protocol" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
                                        <SelectItem value="all" className="text-[11px] font-black uppercase px-6 py-3">All Modules</SelectItem>
                                        {filter.items.map(item => (
                                            <SelectItem key={item.id} value={item.id} className="text-[11px] font-black uppercase px-6 py-3">{item.n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                              </div>
                            ))}
                            <div className="flex items-end pb-1">
                                <Button
                                    variant="ghost"
                                    className="h-14 w-full rounded-2xl text-slate-400 hover:text-rose-500 font-black uppercase text-[10px] tracking-widest gap-3 hover:bg-rose-50 transition-all"
                                    onClick={() => { setFilterRole('all'); setFilterGender('all'); setFilterRating('0'); }}
                                >
                                    <FilterX className="w-4 h-4" /> Purge Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Candidates Grid - The Vitrine Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {filteredCandidates.map((candidate) => (
                        <Card key={candidate.id} className="group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-700 bg-white flex flex-col border border-transparent hover:border-gray-100">
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    src={candidate.photoUrl}
                                    alt={candidate.name}
                                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                    <div className="space-y-1.5">
                                        <h3 className="text-white font-black uppercase tracking-tighter text-xl leading-none">{candidate.name}</h3>
                                        <div className="flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-widest">
                                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {candidate.city}, {candidate.state}
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-white/10 backdrop-blur-xl rounded-full px-4 py-1.5 border border-white/20">
                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mr-2" />
                                        <span className="text-white text-[11px] font-black tabular-nums">{candidate.rating?.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="absolute top-8 right-8">
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[1.2rem] bg-white/10 backdrop-blur-xl text-white hover:bg-white hover:text-rose-500 transition-all shadow-2xl">
                                        <Heart className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <CardContent className="p-8 space-y-8 flex-1">
                                <div className="flex flex-wrap gap-2.5">
                                    {candidate.interestedRolesIds.map(roleId => (
                                        <Badge key={roleId} className="bg-gray-100 text-slate-500 border-none font-black uppercase text-[9px] tracking-widest px-4 py-1.5 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                            {getRoleName(roleId)}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-50 bg-gray-50/20 rounded-[1.5rem] px-4">
                                    <div className="text-center">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5 leading-none">Age Node</div>
                                        <div className="text-[13px] font-black text-slate-900 tabular-nums leading-none">{calculateAge(candidate.birthDate)}</div>
                                    </div>
                                    <div className="text-center border-x border-gray-100">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5 leading-none">Identity</div>
                                        <div className="text-[13px] font-black text-slate-900 uppercase leading-none">{candidate.gender || '--'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5 leading-none">Ops Log</div>
                                        <div className="text-[13px] font-black text-slate-900 tabular-nums leading-none">03</div>
                                    </div>
                                </div>

                                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tight line-clamp-3 leading-relaxed opacity-80 min-h-[3.5rem] px-2">
                                    {candidate.experience}
                                </div>
                            </CardContent>

                            <CardFooter className="p-8 pt-0 flex gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex-1 h-12 rounded-full font-black uppercase text-[10px] tracking-widest text-slate-400 border-gray-100 hover:text-slate-900 hover:bg-gray-50 transition-all">
                                            Protocol
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="bg-white border-gray-100 text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.2)] rounded-[2rem] p-3 min-w-[240px] animate-in zoom-in-95 duration-500">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 px-6 py-4">Audit & Control</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'reviewed')} className="rounded-2xl focus:bg-emerald-50 focus:text-emerald-600 font-black uppercase text-[11px] px-6 py-4 transition-all">
                                            <CheckCircle className="w-4 h-4 mr-4" /> Validate Node
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'rejected')} className="rounded-2xl focus:bg-rose-50 focus:text-rose-600 font-black uppercase text-[11px] px-6 py-4 transition-all">
                                            <XCircle className="w-4 h-4 mr-4" /> Reject Protocol
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-gray-50 my-2" />
                                        <DropdownMenuItem className="rounded-2xl focus:bg-slate-50 focus:text-slate-900 font-black uppercase text-[11px] px-6 py-4 transition-all">
                                            <FileText className="mr-4 h-4 w-4" /> Deep Registry View
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    className="flex-1 h-12 bg-slate-900 hover:bg-black text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 group/invite"
                                    onClick={() => handleSendProposal(candidate.id)}
                                >
                                    Invite Node <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {filteredCandidates.length === 0 && !loading && (
                        <div className="col-span-full py-48 text-center space-y-10">
                            <div className="bg-gray-50 w-32 h-32 rounded-[3.5rem] flex items-center justify-center mx-auto border-4 border-white shadow-2xl animate-pulse">
                                <Search className="w-12 h-12 text-slate-200" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Zero Talent Assets Located</h3>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Adjust matrix parameters to locate authorized talent nodes.</p>
                            </div>
                            <Button variant="outline" className="h-14 rounded-full px-12 font-black text-[11px] uppercase tracking-widest border-gray-100 shadow-sm hover:bg-gray-50" onClick={() => { setSearchTerm(''); setFilterRole('all'); setFilterGender('all'); setFilterRating('0'); }}>
                                Clean Search Registry
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
