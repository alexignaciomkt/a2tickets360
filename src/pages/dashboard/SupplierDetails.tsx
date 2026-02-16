import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    FileText,
    Download,
    History,
    Plus,
    DollarSign,
    Briefcase
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { supplierService, Supplier } from '@/services/supplierService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddSupplierModal } from '@/components/modals/AddSupplierModal';
import { AddQuoteModal } from '@/components/modals/AddQuoteModal';
import { AddContractModal } from '@/components/modals/AddContractModal';
import { toast } from '@/hooks/use-toast';

const SupplierDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [supplier, setSupplier] = useState<Supplier | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [contractModalOpen, setContractModalOpen] = useState(false);

    const fetchSupplier = async () => {
        if (id) {
            setLoading(true);
            const data = await supplierService.getSupplierById(id);
            setSupplier(data);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplier();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout userType="organizer">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 font-medium">Carregando detalhes do fornecedor...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!supplier) {
        return (
            <DashboardLayout userType="organizer">
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold">Fornecedor não encontrado</h2>
                    <Link to="/organizer/suppliers" className="text-indigo-600 hover:underline mt-4 inline-block">
                        Voltar para a lista
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                {/* Back Button & Header */}
                <div className="flex flex-col gap-4">
                    <Link to="/organizer/suppliers" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors w-fit group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-xs uppercase tracking-widest">Voltar para fornecedores</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">
                                {supplier.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{supplier.name}</h1>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">Ativo</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mt-1 text-gray-500 font-medium text-sm">
                                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {supplier.email}</span>
                                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {supplier.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="rounded-full border-gray-200 font-bold hover:bg-gray-50"
                                onClick={() => setEditModalOpen(true)}
                            >
                                Editar Perfil
                            </Button>
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold shadow-lg shadow-indigo-100"
                                onClick={() => setQuoteModalOpen(true)}
                            >
                                Nova Cotação
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Volume de Negócios</h3>
                        </div>
                        <div className="text-2xl font-black text-gray-900 tracking-tighter">
                            R$ {supplier.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Investimento total acumulado</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Status de Atendimento</h3>
                        </div>
                        <div className="text-2xl font-black text-gray-900 tracking-tighter">PREMIUM</div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Baseado em 12 contratos</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                                <History className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Última Entrega</h3>
                        </div>
                        <div className="text-xl font-black text-gray-900 tracking-tighter uppercase">{supplier.lastEvent || 'N/A'}</div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Janeiro, 2025</p>
                    </div>
                </div>

                {/* Tabs Content */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <Tabs defaultValue="contracts" className="w-full">
                        <div className="border-b border-gray-100 px-6 pt-6">
                            <TabsList className="bg-transparent gap-8 h-auto pb-4">
                                <TabsTrigger value="contracts" className="bg-transparent border-none p-0 h-auto data-[state=active]:text-indigo-600 data-[state=active]:shadow-none relative group">
                                    <span className="text-xs font-black uppercase tracking-widest pb-2">Contratos</span>
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform"></div>
                                </TabsTrigger>
                                <TabsTrigger value="history" className="bg-transparent border-none p-0 h-auto data-[state=active]:text-indigo-600 data-[state=active]:shadow-none relative group">
                                    <span className="text-xs font-black uppercase tracking-widest pb-2">Histórico</span>
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform"></div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="contracts" className="p-6 focus-visible:ring-0">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-black text-gray-900 uppercase">Documentos Ativos</h3>
                                    <Button
                                        variant="ghost"
                                        className="text-indigo-600 font-bold text-xs gap-1"
                                        onClick={() => setContractModalOpen(true)}
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Adicionar Contrato
                                    </Button>
                                </div>

                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 uppercase tracking-tighter">Contrato de Prestação de Serviço - Evento {i}</div>
                                                <div className="text-xs text-gray-500 font-medium">Assinado em 12/01/2025 • Validade: Dez/2025</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mr-2">Assinado</span>
                                            <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-white text-gray-400 hover:text-indigo-600">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="p-6 focus-visible:ring-0">
                            <div className="flex flex-col items-center justify-center py-10">
                                <History className="w-12 h-12 text-gray-200 mb-3" />
                                <p className="text-gray-500 font-medium text-sm">Histórico de interações disponível em breve.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {supplier && (
                <>
                    <AddSupplierModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        onSuccess={fetchSupplier}
                        supplier={supplier}
                    />

                    <AddQuoteModal
                        open={quoteModalOpen}
                        onOpenChange={setQuoteModalOpen}
                        supplierName={supplier.name}
                    />

                    <AddContractModal
                        open={contractModalOpen}
                        onOpenChange={setContractModalOpen}
                        supplierName={supplier.name}
                        onSuccess={() => {
                            toast({ title: "Contrato Vinculado", description: "O documento foi adicionado com sucesso." });
                            fetchSupplier();
                        }}
                    />
                </>
            )}
        </DashboardLayout>
    );
};

export default SupplierDetails;
