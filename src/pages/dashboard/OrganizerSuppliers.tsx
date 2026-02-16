import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FileText, MoreVertical, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supplierService, Supplier } from '@/services/supplierService';
import { AddSupplierModal } from '@/components/modals/AddSupplierModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ContractGallery } from '@/components/suppliers/ContractGallery';

const OrganizerSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [contractsOpen, setContractsOpen] = useState(false);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await supplierService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Painel de Fornecedores</h1>
                        <p className="text-gray-500 font-medium italic text-sm">Gerencie seus parceiros e o ecossistema estratégico do evento.</p>
                    </div>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 rounded-full font-black uppercase tracking-tight shadow-lg shadow-indigo-100 px-6"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" /> Novo Fornecedor
                    </Button>
                </div>

                {/* Filters/Search */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar por nome ou categoria..."
                            className="pl-10 rounded-full bg-gray-50 border-gray-200 font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="rounded-full flex items-center gap-2 border-gray-200 font-bold">
                        <Filter className="w-4 h-4" /> Filtros
                    </Button>
                </div>

                {/* Suppliers List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Fornecedor</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Categoria</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Último Evento</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Total Gasto</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-medium">Carregando parceiros...</td>
                                    </tr>
                                ) : filteredSuppliers.length > 0 ? (
                                    filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-md shadow-indigo-100">
                                                        {supplier.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tighter">{supplier.name}</div>
                                                        <div className="text-xs text-gray-500 font-medium">{supplier.email || 'Sem e-mail'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {supplier.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-bold uppercase tracking-tight">
                                                {supplier.lastEvent || '---'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-black text-gray-900">
                                                    R$ {supplier.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${supplier.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="group-hover:bg-white rounded-full">
                                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-gray-100">
                                                        <DropdownMenuItem className="p-2 gap-2 rounded-lg cursor-pointer" asChild>
                                                            <Link to={`/organizer/suppliers/${supplier.id}`} className="flex items-center gap-2">
                                                                <ExternalLink className="w-4 h-4" /> Ver Detalhes
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="p-2 gap-2 rounded-lg cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedSupplier(supplier);
                                                                setContractsOpen(true);
                                                            }}
                                                        >
                                                            <FileText className="w-4 h-4" /> Visualizar Contratos
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="p-2 gap-2 rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                                            Desativar Fornecedor
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic font-medium">Nenhum parceiro encontrado estrategicamente.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AddSupplierModal
                    open={addModalOpen}
                    onOpenChange={setAddModalOpen}
                    onSuccess={fetchSuppliers}
                />

                <Dialog open={contractsOpen} onOpenChange={setContractsOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Gestão de Documentos</DialogTitle>
                            <DialogDescription className="font-medium italic">
                                Contratos e propostas comerciais estratégicas.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedSupplier && (
                            <ContractGallery
                                supplierId={selectedSupplier.id}
                                supplierName={selectedSupplier.name}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default OrganizerSuppliers;
