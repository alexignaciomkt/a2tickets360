
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Briefcase,
    Calendar,
    MapPin,
    DollarSign,
    Search,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import StaffPortalLayout from '@/components/layout/StaffPortalLayout';

const ProposalsPage = () => {
    const proposals = [
        {
            id: 'prop1',
            event: 'Festival de Verão 2025',
            organizer: 'A2 MKT Agência',
            role: 'Coordenador de Bar',
            pay: 'R$ 250,00 / dia',
            date: '15 Jan - 18 Jan',
            location: 'Arena Multiplace, SP',
            status: 'pending',
            description: 'Responsável pela gestão de 4 bartenders, controle de estoque inicial e fechamento de caixa do setor lateral.'
        },
        {
            id: 'prop2',
            event: 'Congresso Tech Vale',
            organizer: 'Nexus Produtora',
            role: 'Hostess / Recepção',
            pay: 'R$ 180,00 / dia',
            date: '22 Jan',
            location: 'CENACON, SJC',
            status: 'pending',
            description: 'Credenciamento de palestrantes e entrega de kits. Exige inglês básico.'
        },
        {
            id: 'prop3',
            event: 'Show Jorge & Mateus',
            organizer: 'GDO Produções',
            role: 'Staff de Apoio',
            pay: 'R$ 150,00 / dia',
            date: '02 Fev',
            location: 'Estádio Martins Pereira',
            status: 'accepted',
            description: 'Auxílio na montagem das grades de contenção e orientação de fluxo de público.'
        }
    ];

    return (
        <StaffPortalLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Minhas Propostas</h1>
                        <p className="text-gray-500 font-medium lowercase">Gerencie seus convites de trabalho e oportunidades.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input placeholder="Filtrar eventos..." className="bg-white/5 border-white/10 pl-10 h-10 rounded-xl" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {proposals.map((prop) => (
                        <Card key={prop.id} className={`bg-[#0A0A0A] border-white/5 rounded-3xl overflow-hidden group transition-all duration-300 ${prop.status === 'accepted' ? 'border-primary/20 bg-primary/5' : 'hover:bg-[#111]'}`}>
                            <CardContent className="p-0">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Event Thumbnail */}
                                    <div className="lg:w-64 h-48 lg:h-auto relative overflow-hidden shrink-0">
                                        <img src={`https://source.unsplash.com/featured/?concert,event,${prop.id}`} alt="Event" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 lg:from-transparent to-transparent"></div>
                                        <Badge className={`absolute top-4 left-4 border-none font-black uppercase tracking-widest text-[10px] ${prop.status === 'accepted' ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                                            {prop.status === 'accepted' ? 'Confirmado' : 'Aguardando Resposta'}
                                        </Badge>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-6 lg:p-8 space-y-6">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div>
                                                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{prop.event}</h2>
                                                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mt-1">
                                                    <Briefcase className="w-3 h-3" /> {prop.organizer} • {prop.role}
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <div className="text-2xl font-black text-white flex items-center md:justify-end gap-1">
                                                    <DollarSign className="w-5 h-5 text-green-500" /> {prop.pay.split(' ')[1]}
                                                </div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Valor Líquido Estimado</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-y border-white/5">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span className="font-bold text-gray-200">{prop.date}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    <span className="font-bold text-gray-200">{prop.location}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Resumo da Vaga
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium leading-relaxed italic line-clamp-2">
                                                    "{prop.description}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-2">
                                            {prop.status === 'pending' ? (
                                                <>
                                                    <Button variant="ghost" className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest px-6 rounded-2xl">
                                                        <XCircle className="w-4 h-4 mr-2" /> Recusar Proposta
                                                    </Button>
                                                    <Button className="bg-white text-black hover:bg-gray-200 text-xs font-black uppercase tracking-widest px-8 rounded-2xl shadow-xl">
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Aceitar Convite
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button variant="outline" className="border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest px-6 rounded-2xl cursor-default">
                                                    Convite Aceito
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </StaffPortalLayout>
    );
};

export default ProposalsPage;
