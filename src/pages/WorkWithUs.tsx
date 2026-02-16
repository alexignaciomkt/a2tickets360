
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Briefcase, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';

const producers = [
    {
        id: '1',
        name: 'Bomba Produções',
        slug: 'bombaproducoes',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
        location: 'São José dos Campos, SP',
        category: 'Shows e Festivais',
        openRoles: 12
    },
    {
        id: '2',
        name: 'Tech Events',
        slug: 'techevents',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop',
        location: 'São Paulo, SP',
        category: 'Corporativo',
        openRoles: 5
    },
    {
        id: '3',
        name: 'Cultural Arts',
        slug: 'culturalarts',
        image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=400&h=400&fit=crop',
        location: 'Rio de Janeiro, RJ',
        category: 'Teatro e Arte',
        openRoles: 8
    }
];

const WorkWithUs = () => {
    return (
        <MainLayout>
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Badge className="bg-indigo-500 hover:bg-indigo-600 mb-6 text-sm px-4 py-1">Banco de Talentos A2</Badge>
                    <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
                        FAÇA PARTE <br />
                        <span className="flex items-center justify-center gap-4">
                            <span>DO</span>
                            <span className="text-yellow-400 text-3xl md:text-5xl italic tracking-[0.05em] drop-shadow-[0_2px_15px_rgba(250,204,21,0.6)]">ESPETÁCULO</span>
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                        Conecte-se com os maiores produtores de eventos do país. Do backstage ao palco, sua carreira começa aqui.
                    </p>

                    <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 flex gap-2 shadow-2xl">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Busque por produtora ou cidade..."
                                className="bg-transparent border-none text-white placeholder:text-gray-400 pl-12 h-12 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>
                        <Link to="/events">
                            <Button size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 font-bold">
                                Buscar Vagas
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Quem está contratando</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Explore as produtoras que utilizam a A2 Tickets para gerenciar seus times.
                        Envie seu perfil e entre para o banco de talentos exclusivo.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {producers.map((producer) => (
                        <div key={producer.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
                            <div className="h-32 bg-gray-100 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
                                <div className="absolute -bottom-10 left-8 p-1 bg-white rounded-2xl shadow-lg">
                                    <img src={producer.image} alt={producer.name} className="w-20 h-20 rounded-xl object-cover" />
                                </div>
                            </div>
                            <div className="pt-12 px-8 pb-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{producer.name}</h3>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                                        {producer.openRoles} vagas
                                    </Badge>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-2" /> {producer.location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Star className="w-4 h-4 mr-2" /> {producer.category}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                                    Equipe especializada em grandes festivais. Buscamos profissionais para Segurança, Bar e Logística.
                                </p>

                                <div className="mt-auto pt-6 border-t border-gray-50">
                                    <Link to={`/producer-page/${producer.slug}`}>
                                        <Button className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all group-hover:scale-105 active:scale-95">
                                            Ver Página e Candidatar <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-[3rem] p-12 shadow-xl flex flex-col md:flex-row items-center gap-12 border border-gray-100">
                        <div className="md:w-1/2">
                            <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                                Para Profissionais de Eventos
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                                Um perfil, múltiplas oportunidades.
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Não perca tempo preenchendo fichas de papel. Na A2 Tickets, seu perfil profissional fica salvo e você pode se aplicar para diferentes produtores com um clique.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 font-medium text-gray-700">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Briefcase className="w-4 h-4" /></div>
                                    Oportunidades em tempo real
                                </li>
                                <li className="flex items-center gap-3 font-medium text-gray-700">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                                    Conexão direta com quem contrata
                                </li>
                            </ul>
                            <Link to="/register">
                                <Button size="lg" variant="outline" className="border-2 border-gray-900 text-gray-900 font-bold rounded-full px-8 hover:bg-gray-900 hover:text-white transition-all">
                                    Criar meu Perfil
                                </Button>
                            </Link>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2.5rem] rotate-3 opacity-20"></div>
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop"
                                alt="Staff Working"
                                className="relative rounded-[2.5rem] shadow-2xl rotate-0 transition-transform hover:-rotate-2 duration-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default WorkWithUs;
