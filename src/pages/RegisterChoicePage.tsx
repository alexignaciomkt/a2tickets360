
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { User, Briefcase, ChevronRight, Rocket } from 'lucide-react';

const RegisterChoicePage = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="bg-[#050505] min-h-screen py-20 flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-12">
                            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">Escolha seu Perfil</h1>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Seja você um profissional de elite ou um produtor de eventos épicos, temos o lugar certo para você.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                            {/* Opção Staff */}
                            <div
                                onClick={() => navigate('/register')} // Mantenho /register para staff conforme atual estrutura
                                className="group relative bg-[#0A0A0A] border border-white/5 p-10 rounded-3xl cursor-pointer transition-all hover:bg-white/[0.02] hover:border-primary/30 text-left overflow-hidden"
                            >
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 blur-[80px] group-hover:bg-primary/40 transition-colors" />

                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                                    <User className="w-8 h-8 text-primary" />
                                </div>

                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tight mb-4">Sou Staff</h2>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    Quero trabalhar em eventos, gerenciar check-ins, vendas locais ou atuar como suporte especializado.
                                </p>

                                <div className="flex items-center text-primary font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform">
                                    Cadastrar currículo <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>

                            {/* Opção Organizador */}
                            <div
                                onClick={() => navigate('/register-organizer')}
                                className="group relative bg-[#0A0A0A] border border-white/5 p-10 rounded-3xl cursor-pointer transition-all hover:bg-white/[0.02] hover:border-indigo-500/30 text-left overflow-hidden"
                            >
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/10 blur-[80px] group-hover:bg-indigo-500/20 transition-colors" />

                                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <Rocket className="w-8 h-8 text-indigo-400" />
                                </div>

                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tight mb-4">Sou Organizador</h2>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    Tenho uma produtora ou evento e quero vender ingressos, gerenciar minha marca e contratar equipes.
                                </p>

                                <div className="flex items-center text-indigo-400 font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform">
                                    Criar minha conta <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-16">
                            <Link to="/login" className="text-gray-500 hover:text-white transition-colors font-medium">
                                Já possui uma conta? <span className="text-primary font-bold">Entre aqui</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default RegisterChoicePage;
