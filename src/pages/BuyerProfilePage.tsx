
import { useState, useEffect } from 'react';
import { Calendar, Ticket, Clock, MapPin, Star, History, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { users, PurchasedTicket, events, Event } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BuyerProfilePage = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
    const [visitedEvents, setVisitedEvents] = useState<Event[]>([]);
    const [activeTickets, setActiveTickets] = useState<PurchasedTicket[]>([]);

    useEffect(() => {
        if (user) {
            const userRecord = users.find((u) => u.id === user.id || u.email === user.email);
            if (userRecord) {
                setTickets(userRecord.tickets);

                // Active tickets
                setActiveTickets(userRecord.tickets.filter((t) => t.status === 'active'));

                // Visited places/events (used status)
                const usedTicketIds = userRecord.tickets.filter(t => t.status === 'used').map(t => t.eventId);
                const visited = events.filter(e => usedTicketIds.includes(e.id));
                setVisitedEvents(visited);
            }
        }
    }, [user]);

    return (
        <MainLayout>
            <div className="bg-[#F8FAFC] min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Sidebar: Profile Summary */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="rounded-2xl border-none shadow-premium overflow-hidden">
                                <div className="h-24 bg-gradient-to-r from-[#FF6B00] to-[#FF8533]"></div>
                                <CardContent className="p-6 -mt-12 text-center">
                                    <div className="relative inline-block mb-4">
                                        <img
                                            src={user?.photoUrl || 'https://i.pravatar.cc/300'}
                                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto object-cover"
                                            alt="Profile"
                                        />
                                        <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-sm border border-gray-100">
                                            <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{user?.role === 'admin' ? 'Master Admin' : 'Explorador de Eventos'}</p>

                                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                                        <div>
                                            <p className="text-xl font-black text-[#FF6B00]">{tickets.length}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Eventos</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-indigo-600">{visitedEvents.length}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Visitados</p>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full mt-8 font-bold rounded-xl border-gray-200 h-10">
                                        <SettingsIcon className="w-4 h-4 mr-2" /> Editar Perfil
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-none shadow-sm h-64 bg-white/50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-6">
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                    <Star className="w-6 h-6 text-indigo-500" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">A2 Community</h4>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">Siga seus produtores favoritos e receba convites exclusivos.</p>
                                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl h-9 text-xs">Descobrir Produtores</Button>
                            </Card>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3 space-y-8">
                            <Tabs defaultValue="tickets" className="w-full">
                                <TabsList className="bg-white p-1 rounded-2xl shadow-sm mb-6 border-none inline-flex">
                                    <TabsTrigger value="tickets" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white transition-all">
                                        <Ticket className="w-4 h-4 mr-2" /> Ingressos Ativos
                                    </TabsTrigger>
                                    <TabsTrigger value="history" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                                        <History className="w-4 h-4 mr-2" /> Lugares que você foi
                                    </TabsTrigger>
                                </TabsList>

                                {/* Active Tickets Tab */}
                                <TabsContent value="tickets" className="space-y-4 animate-fadeIn">
                                    {activeTickets.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activeTickets.map(ticket => (
                                                <Card key={ticket.id} className="rounded-2xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                                    <CardContent className="p-0 flex h-32">
                                                        <div className="w-32 h-full relative overflow-hidden">
                                                            <img
                                                                src={events.find(e => e.id === ticket.eventId)?.bannerUrl || 'https://picsum.photos/seed/ev/400'}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                alt="Event"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20"></div>
                                                        </div>
                                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="font-black text-gray-900 leading-tight mb-1">{ticket.eventTitle}</h4>
                                                                <p className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-tighter">{ticket.ticketName}</p>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <Badge variant="secondary" className="bg-green-50 text-green-600 font-bold border-none text-[10px]">VÁLIDO</Badge>
                                                                <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none font-bold text-[10px] h-7">VER QR CODE</Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Ticket className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h3 className="font-black text-gray-900 mb-1">Nenhum ingresso ativo</h3>
                                            <p className="text-sm text-gray-500">O que vamos curtir esse final de semana?</p>
                                            <Button className="mt-6 bg-[#FF6B00] hover:bg-[#E55A00] font-bold rounded-xl px-8 h-10">Explorar Eventos</Button>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Event History Tab: Lugares que você foi */}
                                <TabsContent value="history" className="space-y-6 animate-fadeIn">
                                    <div className="grid grid-cols-1 gap-6">
                                        {visitedEvents.map((event, index) => (
                                            <div key={event.id} className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-50 relative overflow-hidden group">
                                                {/* Connecting Line (for visual timeline effect) */}
                                                {index !== visitedEvents.length - 1 && (
                                                    <div className="absolute left-[34px] top-[90px] w-0.5 h-[60px] bg-gray-100 hidden md:block"></div>
                                                )}

                                                {/* Timeline Maker */}
                                                <div className="w-12 h-12 rounded-full bg-indigo-50 border-4 border-white shadow-sm flex items-center justify-center flex-shrink-0 z-10 transition-transform group-hover:scale-110">
                                                    <MapPin className="w-5 h-5 text-indigo-500" />
                                                </div>

                                                <div className="flex-1 flex flex-col md:flex-row gap-6 items-center w-full">
                                                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shadow-sm">
                                                        <img src={event.bannerUrl} className="w-full h-full object-cover" alt={event.title} />
                                                    </div>
                                                    <div className="flex-1 text-center md:text-left">
                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                                                            {new Date(event.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                                        </p>
                                                        <h3 className="text-xl font-black text-gray-900 mb-2 truncate max-w-md">{event.title}</h3>
                                                        <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-gray-500 font-bold uppercase tracking-tight">
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {typeof event.location === 'string' ? event.location : event.location.name}</span>
                                                            <span className="flex items-center gap-1"><Ticket className="w-3 h-3" /> Ingresso Utilizado</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                                        <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl h-10 px-6">Ver Fotos do Evento</Button>
                                                        <Button variant="outline" className="font-bold rounded-xl border-gray-200 h-10 px-6">Repetir Dose</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {visitedEvents.length === 0 && (
                                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <History className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <h3 className="font-black text-gray-900 mb-1">Seu histórico está vazio</h3>
                                                <p className="text-sm text-gray-500">As melhores memórias começam com um ingresso.</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Instagram Sanja Spotlight (The opinions call) */}
                            <div className="bg-gradient-to-r from-pink-500/5 to-purple-600/5 rounded-3xl p-8 border border-white relative overflow-hidden">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-[10px] font-bold uppercase tracking-tighter mb-4">
                                            <ImageIcon className="w-3 h-3" /> Insta A2 Tickets 360
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">Suas memórias em foco</h3>
                                        <p className="text-sm text-gray-600 max-w-md leading-relaxed font-medium">Suas fotos nos eventos A2 Tickets 360 aparecem aqui de forma otimizada. Nossa tecnologia permite que você guarde cada momento sem pesar seu armazenamento.</p>
                                    </div>
                                    <div className="flex -space-x-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                                <img src={`https://picsum.photos/seed/insta${i}/200`} className="w-full h-full object-cover" alt="Insta" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default BuyerProfilePage;
