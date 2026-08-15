import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';

const WorkerProfilePage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        bio: '',
        linkedin: '',
        instagram: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                city: user.city || '',
                state: user.state || '',
                bio: '',
                linkedin: '',
                instagram: ''
            });
            loadAdditionalProfileData();
        }
    }, [user]);

    const loadAdditionalProfileData = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('staff_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    bio: data.bio || '',
                    linkedin: data.linkedin || '',
                    instagram: data.instagram || '',
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Update main profile
            await supabase.from('profiles').update({
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                state: formData.state
            }).eq('user_id', user.id);

            // Update staff profile
            await supabase.from('staff_profiles').update({
                bio: formData.bio,
                linkedin: formData.linkedin,
                instagram: formData.instagram
            }).eq('user_id', user.id);

            toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao salvar perfil' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userType="customer">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-4 sm:p-6 font-sans">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Meu Perfil Profissional</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Atualize seus dados, biografia e redes sociais para conseguir mais trabalhos.
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase text-xs px-6 rounded-lg shadow-sm">
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avatar & Basic Info */}
                    <div className="space-y-6">
                        <Card className="bg-white border-gray-100 rounded-3xl overflow-hidden p-6 text-center shadow-sm">
                            <div className="relative inline-block group mb-4">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all">
                                    <img src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <button className="absolute bottom-2 right-2 p-2 bg-primary rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{formData.name || 'Seu Nome'}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Staff</p>

                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span className="truncate">{formData.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <Input 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder="(00) 00000-0000"
                                        className="h-8 border-transparent hover:border-gray-200 focus:border-primary text-sm px-2 -ml-2 transition-all shadow-none"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white border-gray-100 shadow-sm rounded-3xl p-6 space-y-4">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Redes Profissionais</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Linkedin className="w-4 h-4" />
                                    </div>
                                    <Input
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                                        placeholder="linkedin.com/in/seuperfil"
                                        className="bg-gray-50 border-gray-200 text-xs h-9"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                                        <Instagram className="w-4 h-4" />
                                    </div>
                                    <Input
                                        value={formData.instagram}
                                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                                        placeholder="@seuperfil"
                                        className="bg-gray-50 border-gray-200 text-xs h-9"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Detailed Info */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="bg-white border-gray-100 shadow-sm rounded-3xl p-6 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-sm font-black text-slate-900 uppercase tracking-tight">Biografia Operacional</Label>
                                <Textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    placeholder="Conte sua experiência no campo..."
                                    className="bg-gray-50 border-gray-200 min-h-[150px] rounded-2xl text-slate-700 focus:bg-white transition-all font-medium leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cidade de Atuação</Label>
                                    <Input 
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        placeholder="Ex: São Paulo" 
                                        className="bg-gray-50 border-gray-200 h-12 rounded-xl focus:bg-white transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs font-bold uppercase tracking-widest">Estado</Label>
                                    <Input 
                                        value={formData.state}
                                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                                        placeholder="Ex: SP" 
                                        className="bg-gray-50 border-gray-200 h-12 rounded-xl focus:bg-white transition-all" 
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white border-gray-100 shadow-sm rounded-3xl p-6 space-y-6 opacity-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        Certificações & Treinamentos
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Em breve você poderá anexar seus certificados.</p>
                                </div>
                                <Button disabled variant="outline" className="text-primary border-primary/20 text-xs font-black uppercase tracking-widest h-8 px-3 rounded-lg">
                                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WorkerProfilePage; WorkerProfilePage;
