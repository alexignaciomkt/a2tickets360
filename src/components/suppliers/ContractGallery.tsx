
import { useState } from 'react';
import { FileText, Download, Trash2, Plus, File, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Contract {
    id: string;
    name: string;
    uploadDate: string;
    size: string;
    type: 'pdf' | 'doc' | 'image';
    status: 'active' | 'expired' | 'pending';
}

interface ContractGalleryProps {
    supplierId: string;
    supplierName: string;
}

export const ContractGallery = ({ supplierId, supplierName }: ContractGalleryProps) => {
    const { toast } = useToast();
    const [contracts, setContracts] = useState<Contract[]>([
        { id: '1', name: 'Contrato Social.pdf', uploadDate: '2024-12-20', size: '2.4MB', type: 'pdf', status: 'active' },
        { id: '2', name: 'Proposta_Comercial_Festival.pdf', uploadDate: '2025-01-05', size: '1.1MB', type: 'pdf', status: 'active' },
    ]);

    const handleUpload = () => {
        toast({
            title: "Simulação de Upload",
            description: "No MVP real, aqui abriria o seletor de arquivos para o contrato.",
        });
    };

    const handleDelete = (id: string) => {
        setContracts(contracts.filter(c => c.id !== id));
        toast({
            title: "Contrato Removido",
            description: "O documento foi removido da base estratégica.",
            variant: "destructive"
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Repositório de Contratos</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Documentos vinculados a {supplierName}</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-full font-black uppercase text-[10px] tracking-widest gap-2 bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100" onClick={handleUpload}>
                    <Plus className="w-3 h-3" /> Adicionar Doc
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {contracts.length > 0 ? (
                    contracts.map((contract) => (
                        <Card key={contract.id} className="border-none bg-gray-50 shadow-none hover:bg-gray-100 transition-colors group">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-900 uppercase tracking-tighter truncate max-w-[200px]">
                                            {contract.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                            <span>{contract.size}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-2.5 h-2.5" /> {new Date(contract.uploadDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-indigo-600 bg-white shadow-sm border border-gray-100">
                                        <Download className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 bg-white shadow-sm border border-gray-100">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 bg-white shadow-sm border border-gray-100" onClick={() => handleDelete(contract.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <File className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nenhum contrato arquivado</p>
                    </div>
                )}
            </div>
        </div>
    );
};
