
import React from 'react';
import { Link } from 'react-router-dom';
import {
    Zap,
    CheckCircle2,
    BarChart3,
    Users,
    Truck,
    DollarSign,
    ArrowRight,
    Globe,
    Smartphone,
    ShieldCheck,
    Award
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const ParaProdutores: React.FC = () => {
    return (
        <MainLayout>
            <div className="bg-white overflow-hidden">
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 bg-indigo-50">
                    <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 inline-block animate-bounce">
                                O Melhor Parceiro do Produtor
                            </span>
                            <h1 className="font-black text-gray-900 leading-tight mb-8 flex flex-col gap-2">
                                <span className="text-3xl md:text-5xl">Sua produtora com</span>
                                <span className="text-4xl md:text-6xl text-indigo-600 uppercase drop-shadow-sm">GESTÃO DE ELITE.</span>
                            </h1>
                            <p className="text-xl text-gray-600 font-medium mb-12 max-w-2xl leading-relaxed">
                                Dê adeus às planilhas bagunçadas. Controle staff, fornecedores, mailing e venda ingressos com a menor taxa do Brasil.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                                <Link
                                    to="/register?type=organizer"
                                    className="group bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95"
                                >
                                    Criar Minha Conta Grátis
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition" />
                                </Link>
                                <div className="flex items-center gap-4 text-gray-500 font-bold uppercase text-[10px]">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <img key={i} src={`https://i.pravatar.cc/100?u=${i + 10}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                                        ))}
                                    </div>
                                    <span>+500 Produtoras Ativas</span>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative group">
                            <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-3xl group-hover:bg-indigo-500/20 transition duration-1000"></div>
                            <img
                                src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop"
                                alt="Dashboard Preview"
                                className="relative rounded-[2.5rem] shadow-2xl border-4 border-white"
                            />
                            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-indigo-100 hidden md:block animate-float">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Economia de Taxas</p>
                                        <p className="text-2xl font-black text-gray-900 font-mono">R$ 12.450,00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vantagens Competitivas */}
                <section className="py-24 max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Por que escolher a A2 Tickets 360?</h2>
                        <p className="text-xl text-gray-500 font-medium">Focamos na sua lucratividade e no controle total do seu negócio.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Menores Taxas",
                                desc: "Cobramos apenas 6% a 8% por ingresso vendido. Deixe de dar dinheiro para plataformas caras.",
                                icon: DollarSign,
                                color: "text-green-600",
                                bg: "bg-green-50"
                            },
                            {
                                title: "A2 Tickets 360",
                                desc: "Controle sua equipe (Staff), gerencie fornecedores e tenha uma CRM poderosa dos seus participantes.",
                                icon: BarChart3,
                                color: "text-indigo-600",
                                bg: "bg-indigo-50"
                            },
                            {
                                title: "Site Próprio (Fan Page)",
                                desc: "Gere automaticamente um site para sua produtora com layout idêntico a uma Fan Page do Facebook.",
                                icon: Globe,
                                color: "text-blue-600",
                                bg: "bg-blue-50"
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group">
                                <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition shadow-inner`}>
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">{item.title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Seção ERP Detalhada */}
                <section className="py-24 bg-gray-950 text-white relative">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="font-black mb-8 leading-none tracking-tighter flex flex-col gap-2">
                                <span className="text-3xl md:text-4xl text-gray-400">Um verdadeiro</span>
                                <span className="text-5xl md:text-7xl text-indigo-400 uppercase drop-shadow-md">ECOSSISTEMA.</span>
                            </h2>
                            <div className="space-y-10 mt-12">
                                <div className="flex gap-8">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">Gestão de Staff</h4>
                                        <p className="text-gray-400 text-lg font-medium leading-relaxed">Atribua cargos, controle turnos e saiba quem está trabalhando no dia do evento.</p>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                                        <Truck className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">Painel de Fornecedores</h4>
                                        <p className="text-gray-400 text-lg font-medium leading-relaxed">Histórico de contratos, pagamentos e orçamentos centralizados em um só lugar.</p>
                                    </div>
                                </div>
                                <div className="flex gap-8">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                                        <Smartphone className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">Check-in Automático</h4>
                                        <p className="text-gray-400 text-lg font-medium leading-relaxed">Validação de ingressos ultra rápida via QR Code, offline ou online.</p>
                                    </div>
                                </div>
                            </div>
                            <Link
                                to="/register"
                                className="mt-16 inline-flex bg-white text-gray-950 px-12 py-6 rounded-[2rem] font-black text-2xl hover:scale-105 transition shadow-2xl animate-pulse"
                            >
                                Começar Gratuitamente
                            </Link>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                                    <p className="text-5xl font-black text-indigo-400 mb-4 font-mono">100%</p>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Seguro Asaas</p>
                                </div>
                                <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                                    <p className="text-5xl font-black text-indigo-400 mb-4 font-mono">0%</p>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Taxa Cadastro</p>
                                </div>
                            </div>
                            <div className="space-y-8 pt-16">
                                <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                                    <p className="text-5xl font-black text-indigo-400 mb-4 font-mono">24h</p>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Suporte VIP</p>
                                </div>
                                <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                                    <p className="text-5xl font-black text-indigo-400 mb-4 font-mono">6%</p>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Taxa Mínima</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recruitment Feature Highlight (New Phase 5) */}
                <section className="py-24 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 rounded-l-[4rem] -z-10"></div>
                    <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <span className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4 block">Novidade Exclusiva</span>
                            <h2 className="font-black text-gray-900 leading-[0.85] tracking-tighter mb-10 flex flex-col gap-1 uppercase">
                                <span className="text-2xl md:text-4xl">Encontre o</span>
                                <span className="text-5xl md:text-8xl text-indigo-600 drop-shadow-sm">Staff Ideal</span>
                                <span className="text-3xl md:text-5xl">em segundos.</span>
                            </h2>
                            <p className="text-xl text-gray-600 font-medium mb-10 leading-relaxed">
                                Esqueça grupos de WhatsApp e planilhas. Com o <strong>Banco de Talentos A2</strong>, você recebe candidaturas diretamente no seu painel, filtra por experiência e contrata com um clique.
                            </p>

                            <ul className="space-y-6 mb-12">
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold shrink-0">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900">Página de Carreiras Própria</h4>
                                        <p className="text-gray-500 font-medium">Seu link exclusivo "Trabalhe Conosco" para divulgar nas redes sociais.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold shrink-0">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900">Gestão de Candidatos</h4>
                                        <p className="text-gray-500 font-medium">Aprove, reprove e mantenha um histórico de quem já trabalhou com você.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold shrink-0">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900">Avaliação de Desempenho</h4>
                                        <p className="text-gray-500 font-medium">Classifique sua equipe após o evento e construa um time de elite.</p>
                                    </div>
                                </li>
                            </ul>

                            <Link
                                to="/register?type=organizer"
                                className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-xl hover:scale-105 active:scale-95"
                            >
                                Quero Contratar Melhor <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="relative z-10 bg-white p-4 rounded-[3rem] shadow-2xl border border-gray-100 rotate-2 hover:rotate-0 transition duration-500">
                                <img
                                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1632&auto=format&fit=crop"
                                    className="rounded-[2.5rem] w-full object-cover aspect-square"
                                    alt="Staff Management"
                                />
                                <div className="absolute bottom-10 -left-10 bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl border border-white/50 animate-bounce hidden md:block">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <img key={i} src={`https://i.pravatar.cc/100?u=${i + 50}`} className="w-10 h-10 rounded-full border-2 border-white" alt="Candidate" />
                                            ))}
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-white">+12</div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-800">
                                            <span className="text-green-600">Jonathan</span> aplicou para Segurança
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-pulse delay-700"></div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 px-4">
                    <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl animate-float">
                        <h2 className="text-4xl md:text-7xl font-black mb-10 relative z-10 leading-tight uppercase tracking-tighter">Pronto para o<br />próximo nível?</h2>
                        <p className="text-xl md:text-2xl text-indigo-100 mb-16 relative z-10 font-medium">Junte-se a centenas de produtores que já economizam tempo e dinheiro com a A2 Tickets 360.</p>
                        <Link
                            to="/register"
                            className="inline-flex bg-white text-indigo-600 px-16 py-8 rounded-[2rem] font-black text-3xl hover:scale-110 transition shadow-2xl relative z-10 active:scale-95"
                        >
                            CRIAR MINHA CONTA
                        </Link>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
};

export default ParaProdutores;
