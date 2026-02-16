
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    MapPin,
    Info,
    ChevronRight,
    FileCheck,
    Smartphone,
    Navigation
} from 'lucide-react';
import StaffPortalLayout from '@/components/layout/StaffPortalLayout';

const AgendaPage = () => {
    const agendaItems = [
        {
            id: 'a1',
            event: 'Show Jorge & Mateus',
            role: 'Staff de Apoio',
            date: '02 Fev (Domingo)',
            time: '18:00 - 02:00',
            location: 'Arena Vale, São José dos Campos',
            status: 'confirmed',
            instructions: 'Entrada pelo portão 4 (Serviço). Traje: Camiseta preta lisa e calça jeans escura.',
            producer: 'GDO Produções'
        },
        {
            id: 'a2',
            event: 'Carnaval Antecipado SJC',
            role: 'Bartender Premium',
            date: '10 Fev (Sexta)',
            time: '20:00 - 04:00',
            location: 'Parque da Cidade',
            status: 'confirmed',
            instructions: 'Apresentar QR Code no check-in do staff até as 19:30. Kit uniforme será entregue no local.',
            producer: 'A2 MKT Agência'
        }
    ];

    return (
        <StaffPortalLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Minha Agenda</h1>
                        <p className="text-gray-500 font-medium lowercase">Seus próximos compromissos e instruções de trabalho.</p>
                    </div>
                    <Button variant="outline" className="border-white/10 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-2xl bg-white/5">
                        Sincronizar com Calendário
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {agendaItems.map((item) => (
                        <Card key={item.id} className="bg-[#0A0A0A] border-white/5 rounded-3xl overflow-hidden overflow-visible relative group">
                            <div className="absolute -left-1 top-0 bottom-0 w-2 bg-primary rounded-l-full group-hover:w-3 transition-all"></div>

                            <CardContent className="p-8 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="space-y-2">
                                        <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest mb-2">Próximo Evento</Badge>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{item.event}</h2>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <FileCheck className="w-4 h-4 text-primary" /> Contratado por: <span className="text-white">{item.producer}</span>
                                        </p>
                                    </div>

                                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex gap-6 shrink-0">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Horário</p>
                                            <p className="text-lg font-black text-white">{item.time}</p>
                                        </div>
                                        <div className="w-px bg-white/5 h-10 self-center"></div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Posição</p>
                                            <p className="text-lg font-black text-primary uppercase italic">{item.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/30">
                                                {item.date.split(' ')[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase text-lg leading-tight">{item.date.split('(')[1].replace(')', '')}</p>
                                                <p className="text-xs text-gray-400 font-medium">Data confirmada em contrato</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase text-lg leading-tight truncate max-w-[200px]">{item.location}</p>
                                                <Button variant="link" className="text-primary p-0 h-auto text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group">
                                                    Abrir no Waze <Navigation className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#050505] rounded-2xl p-4 border border-white/5 space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                                            <Info className="w-4 h-4" /> Instruções de Importantes
                                        </p>
                                        <p className="text-sm text-gray-300 font-medium leading-relaxed">
                                            {item.instructions}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button className="flex-1 bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest text-xs h-12 rounded-2xl shadow-xl">
                                        <Smartphone className="w-4 h-4 mr-2" /> Gerar QR Code de Acesso
                                    </Button>
                                    <Button variant="outline" className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs h-12 rounded-2xl">
                                        Ver Contrato Digital
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </StaffPortalLayout>
    );
};

export default AgendaPage;
