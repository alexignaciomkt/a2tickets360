
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Truck,
    BookOpen,
    QrCode,
    Plus,
    Download,
    Zap,
    Clock,
    FileText,
    Camera,
    UserCheck,
    Database
} from 'lucide-react';

const staffMembers = [
    { id: '1', name: 'Ana Oliveira', role: 'Vendas', status: 'Ativo', photo: 'https://i.pravatar.cc/150?u=ana' },
    { id: '2', name: 'Marcos Souza', role: 'Montador', status: 'Ativo', photo: 'https://i.pravatar.cc/150?u=marcos' },
    { id: '3', name: 'Julia Lima', role: 'Promotora', status: 'Pendente', photo: 'https://i.pravatar.cc/150?u=julia' },
];

const leads = [
    { id: '1', name: 'Roberto Santos', email: 'roberto@empresa.com', role: 'Diretor de TI', company: 'Tech Corp', time: '14:20' },
    { id: '2', name: 'Carla Dias', email: 'carla@marketing.br', role: 'Gerente de Marketing', company: 'Creative Agency', time: '15:45' },
];

export default function ExhibitorDashboard() {
    const [activeTab, setActiveTab] = React.useState<'staff' | 'logistics' | 'manual' | 'leads'>('staff');
    const [isScanning, setIsScanning] = React.useState(false);
    const [scannedLead, setScannedLead] = React.useState<any>(null);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            const newLead = {
                id: Date.now().toString(),
                name: 'Fernando Costa',
                email: 'fernando@invest.com',
                role: 'Investidor Anjo',
                company: 'Venture Capital',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setScannedLead(newLead);
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic">Painel do Expositor</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Gerencie seu estande e capture leads em tempo real</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
                    {[
                        { id: 'staff', label: 'Staff', icon: <Users size={14} /> },
                        { id: 'logistics', label: 'Logística', icon: <Truck size={14} /> },
                        { id: 'manual', label: 'Manual', icon: <BookOpen size={14} /> },
                        { id: 'leads', label: 'Leads', icon: <Database size={14} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'staff' && (
                    <motion.div
                        key="staff"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-bold text-lg uppercase tracking-tight">Equipe do Estande</h3>
                                <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all text-xs uppercase tracking-widest">
                                    <Plus size={16} />
                                    Cadastrar Equipe
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {staffMembers.map((member) => (
                                    <div key={member.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative overflow-hidden group">
                                        <div className="flex items-center gap-4 mb-6">
                                            <img src={member.photo} alt={member.name} className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md" />
                                            <div>
                                                <h4 className="font-black uppercase tracking-tighter text-sm">{member.name}</h4>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${member.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {member.status}
                                            </span>
                                            <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                                Credencial <QrCode size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'logistics' && (
                    <motion.div
                        key="logistics"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-8 uppercase tracking-tight">Agendamento de Carga/Descarga</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-black uppercase tracking-widest text-[11px] text-gray-400">Janelas Disponíveis</h4>
                                    {['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00'].map((time, i) => (
                                        <button key={i} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center hover:border-primary transition-all group">
                                            <span className="font-bold text-sm">{time}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Reservar</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col justify-center items-center text-center">
                                    <Truck size={48} className="text-gray-200 mb-4" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhuma reserva ativa</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'manual' && (
                    <motion.div
                        key="manual"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-8 uppercase tracking-tight text-primary italic">Documentos e Manuais</h3>
                            <div className="space-y-3">
                                {[
                                    { title: "Regras de Montagem", size: "2.4 MB" },
                                    { title: "Planta Técnica Pavilhão", size: "5.1 MB" },
                                    { title: "Contatos de Emergência", size: "0.8 MB" },
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-primary" />
                                            <div>
                                                <h4 className="font-bold text-sm tracking-tight">{doc.title}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold">{doc.size}</p>
                                            </div>
                                        </div>
                                        <Download size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-primary p-8 rounded-3xl text-white flex flex-col justify-center shadow-xl shadow-primary/20">
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Suporte Especializado</h3>
                            <p className="text-white/80 text-sm font-medium mb-6">Dúvidas técnicas sobre seu estande? Nossa equipe de área está pronta para ajudar.</p>
                            <button className="w-full py-4 bg-white text-primary rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-xs">
                                <Zap size={16} /> Falar com Gerente de Área
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'leads' && (
                    <motion.div
                        key="leads"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-8"
                    >
                        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center">
                            <div className="max-w-md mx-auto">
                                <div className={`w-24 h-24 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 ${isScanning ? 'animate-pulse' : ''}`}>
                                    <Camera size={48} className={isScanning ? 'text-primary' : 'text-gray-200'} />
                                </div>
                                <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">Lead Retrieval</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Capture dados dos visitantes pelo QR Code</p>
                                <button
                                    onClick={handleScan}
                                    disabled={isScanning}
                                    className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    <Zap size={18} /> {isScanning ? 'Escaneando...' : 'Iniciar Scanner'}
                                </button>
                            </div>

                            <AnimatePresence>
                                {scannedLead && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                                <UserCheck size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Lead Capturado!</p>
                                                <h4 className="text-xl font-black uppercase tracking-tighter">{scannedLead.name}</h4>
                                                <p className="text-xs text-gray-500 font-bold">{scannedLead.role} @ {scannedLead.company}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Nota</button>
                                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all">Salvar</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg uppercase tracking-tight">Leads Capturados Hoje</h3>
                                <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                                    Exportar CSV <Download size={12} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {leads.map((lead) => (
                                    <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <Database size={20} className="text-gray-300" />
                                            <div>
                                                <h4 className="font-black uppercase tracking-tighter text-sm">{lead.name}</h4>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">{lead.role} • {lead.company}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-primary">{lead.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
