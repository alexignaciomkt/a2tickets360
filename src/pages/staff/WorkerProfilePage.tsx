
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    User,
    Camera,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Instagram,
    Save,
    Award,
    Plus,
    Trash2,
    FileCheck
} from 'lucide-react';
import StaffPortalLayout from '@/components/layout/StaffPortalLayout';

const WorkerProfilePage = () => {
    return (
        <StaffPortalLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Meu Perfil Profissional</h1>
                    <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs px-6 rounded-2xl">
                        <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avatar & Basic Info */}
                    <div className="space-y-6">
                        <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl overflow-hidden p-6 text-center">
                            <div className="relative inline-block group mb-4">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/50 transition-all">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <button className="absolute bottom-2 right-2 p-2 bg-primary rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">João Porto</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Coordenador de Bar / Staff</p>

                            <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span className="truncate">joao@staff.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span>(12) 99876-5432</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>São José dos Campos, SP</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl p-6 space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-tighter">Redes Profissionais</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Linkedin className="w-4 h-4" />
                                    </div>
                                    <Input
                                        value="linkedin.com/in/joaoporto"
                                        className="bg-transparent border-white/10 text-xs h-9"
                                        readOnly
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                                        <Instagram className="w-4 h-4" />
                                    </div>
                                    <Input
                                        value="@joao_eventos"
                                        className="bg-transparent border-white/10 text-xs h-9"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Detailed Info */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl p-6 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-sm font-black text-white uppercase tracking-tighter">Biografia Operacional</Label>
                                <Textarea
                                    placeholder="Conte sua experiência no campo..."
                                    className="bg-white/5 border-white/10 min-h-[150px] rounded-2xl text-gray-300 focus:border-primary/50 transition-all font-medium leading-relaxed"
                                    defaultValue="Trabalho com eventos há mais de 5 anos, focado em coordenação de equipes de bar e atendimento VIP. Experiência em festivais de grande porte (Lollapalooza, Rock in Rio)."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-500 text-xs font-bold uppercase tracking-widest">Cidade de Atuação</Label>
                                    <Input defaultValue="São José dos Campos" className="bg-white/5 border-white/10 h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-500 text-xs font-bold uppercase tracking-widest">Estado</Label>
                                    <Input defaultValue="SP" className="bg-white/5 border-white/10 h-12 rounded-xl" />
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    Certificações & Treinamentos
                                </h4>
                                <Button variant="ghost" className="text-primary text-xs font-black uppercase tracking-widest h-8 px-3 rounded-lg hover:bg-primary/10">
                                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                                            <FileCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">NR-10 (Segurança em Eletricidade)</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Expira em: 20/05/2026</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                            <FileCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">Higiene e Manipulação de Alimentos</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Expira em: Permanente</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </StaffPortalLayout>
    );
};

export default WorkerProfilePage;
