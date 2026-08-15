import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { QrCode, Download, ExternalLink, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { staffService } from '@/services/staffService';
import { Link } from 'react-router-dom';

const WorkerCredentialPage = () => {
    const { user } = useAuth();
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadJobs();
        }
    }, [user]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await staffService.getMyInvites();
            const active = data.filter(item => item.status === 'ACTIVE');
            
            // Sort by upcoming date
            const sortedJobs = active.sort((a, b) => {
                if (!a.shiftStart) return 1;
                if (!b.shiftStart) return -1;
                return new Date(a.shiftStart).getTime() - new Date(b.shiftStart).getTime();
            });

            setActiveJobs(sortedJobs);
        } catch (error) {
            console.error('Failed to load active jobs', error);
        } finally {
            setLoading(false);
        }
    };

    const nextJob = activeJobs.length > 0 ? activeJobs[0] : null;

    return (
        <DashboardLayout userType="customer">
            <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-4 sm:p-6 font-sans">
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Minha Credencial</h1>
                    <p className="text-slate-500 font-medium">Apresente este QR Code na portaria do evento.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Carregando credencial...</p>
                    </div>
                ) : !nextJob ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-100 rounded-[2rem] shadow-sm text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Credencial Bloqueada</h3>
                        <p className="text-slate-500 font-medium max-w-[280px] mb-8">
                            Sua credencial de Staff só será liberada após você aceitar o convite para um evento na sua tela inicial.
                        </p>
                        <Link to="/dashboard/staff/invites" className="w-full block">
                            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-md">
                                Ver Meus Convites
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <Card className="bg-white border-gray-100 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
                            <div className="bg-primary p-6 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <QrCode size={120} />
                                </div>
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg relative z-10 bg-white">
                                    <img src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Staff')}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-white text-xl font-black uppercase tracking-widest mt-4 text-center relative z-10">{user?.name}</h2>
                                <div className="bg-white/20 px-4 py-1 rounded-full mt-2 relative z-10 text-center">
                                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">{nextJob.eventName}</p>
                                    <p className="text-white text-xs font-black uppercase tracking-widest mt-1">{nextJob.role}</p>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col items-center justify-center bg-gray-50/50">
                                <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                                    {/* Fake QR for demo, or real QR generator if we add one */}
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${nextJob.id}`} alt="QR Code" className="w-full h-full opacity-90" />
                                </div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-6">STAFF ID: {nextJob.id.split('-')[0].toUpperCase()}</p>
                            </div>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-12 border-gray-200 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-50">
                                <Download className="w-4 h-4 mr-2" /> Salvar Foto
                            </Button>
                            <Button className="h-12 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-md">
                                <ExternalLink className="w-4 h-4 mr-2" /> Google Wallet
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default WorkerCredentialPage;
