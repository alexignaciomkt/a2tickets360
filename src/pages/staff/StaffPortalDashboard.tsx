
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    MapPin,
    Star,
    Clock,
    FileCheck,
    ChevronRight,
    TrendingUp,
    Briefcase,
    AlertCircle,
    Award
} from 'lucide-react';
import StaffPortalLayout from '@/components/layout/StaffPortalLayout';

const StaffPortalDashboard = () => {
    // Mock data for the worker
    const stats = [
        { label: 'Eventos Realizados', value: '12', icon: FileCheck, color: 'text-green-500' },
        { label: 'Nota Média', value: '4.9', icon: Star, color: 'text-yellow-500' },
        { label: 'Ganhos no Mês', value: 'R$ 1.250', icon: TrendingUp, color: 'text-blue-500' },
    ];

    const proposals = [
        {
            id: 'prop1',
            event: 'Festival de Verão 2025',
            organizer: 'A2 MKT Agência',
            role: 'Coordenador de Bar',
            pay: 'R$ 250/dia',
            date: '15 Jan - 18 Jan',
            status: 'pending'
        },
        {
            id: 'prop2',
            event: 'Congresso Tech Vale',
            organizer: 'Nexus Produtora',
            role: 'Hostess / Recepção',
            pay: 'R$ 180/dia',
            date: '22 Jan',
            status: 'pending'
        }
    ];

    const upcomingShifts = [
        {
            id: 'shift1',
            event: 'Show Jorge & Mateus',
            role: 'Staff de Apoio',
            time: '18:00 - 02:00',
            date: 'Amanhã',
            location: 'Arena Vale'
        }
    ];

    return (
        <StaffPortalLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Bem-vindo, <span className="text-primary not-italic">João!</span>
                        </h1>
                        <p className="text-gray-500 font-medium mt-2">Você tem <span className="text-white">2 novas propostas</span> de trabalho hoje.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs px-6 rounded-2xl shadow-lg shadow-primary/20">
                            Disponível para Trabalho
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="bg-[#0A0A0A] border-white/5 rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Area: Proposals */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" />
                                Novas Propostas
                            </h2>
                            <Button variant="link" className="text-primary text-xs font-bold uppercase tracking-widest">Ver Todas</Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {proposals.map((prop) => (
                                <Card key={prop.id} className="bg-[#0A0A0A] border-white/5 rounded-3xl overflow-hidden hover:bg-[#111] transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                                                    <img src={`https://source.unsplash.com/featured/?event,concert,${prop.id}`} alt="Event" className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                                                </div>
                                                <div>
                                                    <Badge className="mb-2 bg-primary/20 text-primary border-none text-[10px] font-black uppercase">Convite Aberto</Badge>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{prop.event}</h3>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">{prop.organizer} • {prop.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-white">{prop.pay}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                                                        <Calendar className="w-3 h-3" /> {prop.date}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" className="border-white/10 hover:bg-red-500/10 hover:text-red-400 text-xs font-black uppercase tracking-widest px-4 rounded-xl">Recusar</Button>
                                                    <Button className="bg-white text-black hover:bg-gray-200 text-xs font-black uppercase tracking-widest px-6 rounded-xl">Aceitar</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Area: Agenda & Health */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Próximo Trabalho
                        </h2>
                        {upcomingShifts.map(shift => (
                            <Card key={shift.id} className="bg-[#0A0A0A] border-primary/20 rounded-3xl overflow-hidden border-2 border-dashed">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-1">{shift.date}</p>
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight">{shift.event}</h4>
                                        </div>
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Clock className="w-4 h-4 text-gray-600" />
                                            <span className="font-bold text-gray-300">{shift.time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <MapPin className="w-4 h-4 text-gray-600" />
                                            <span className="font-bold text-gray-300">{shift.location}</span>
                                        </div>
                                    </div>

                                    <Button className="w-full bg-[#111] hover:bg-white hover:text-black border border-white/5 text-white text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl transition-all">
                                        Ver Instruções de Acesso
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Certifications Alert */}
                        <Card className="bg-gradient-to-br from-indigo-900/40 to-black border-indigo-500/30 rounded-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Award className="w-12 h-12 text-white" />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="text-white font-black uppercase tracking-tighter mb-2">Pefil Incompleto</h3>
                                <p className="text-indigo-200 text-xs font-medium mb-4 leading-relaxed">
                                    Adicione seus certificados **(NR-10, NR-35, etc)** para aumentar suas chances de contratação em grandes festivais.
                                </p>
                                <Button variant="link" className="text-white p-0 h-auto text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    Atualizar Agora <ChevronRight className="w-3 h-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </StaffPortalLayout>
    );
};

export default StaffPortalDashboard;
