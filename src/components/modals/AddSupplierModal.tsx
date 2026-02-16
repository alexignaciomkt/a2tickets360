import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supplierService, SupplierCategory } from "@/services/supplierService";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";

interface Supplier {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    categoryId?: string;
    category?: string;
    document?: string;
    address?: string;
    contactName?: string;
    contactPhone?: string;
    status?: string;
}

interface AddSupplierModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    supplier?: Supplier; // If provided, we are in EDIT mode
}

export function AddSupplierModal({ open, onOpenChange, onSuccess, supplier }: AddSupplierModalProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<SupplierCategory[]>([]);
    const [comboOpen, setComboOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        categoryId: "",
        categoryName: "",
        document: "",
        address: "",
        contactName: "",
        contactPhone: "",
    });

    useEffect(() => {
        if (open) {
            supplierService.getCategories().then(setCategories);
            if (supplier) {
                setFormData({
                    name: supplier.name,
                    email: supplier.email || "",
                    phone: supplier.phone || "",
                    categoryId: supplier.categoryId || "",
                    categoryName: supplier.category || "",
                    document: supplier.document || "",
                    address: supplier.address || "",
                    contactName: supplier.contactName || "",
                    contactPhone: supplier.contactPhone || "",
                });
            } else {
                setFormData({
                    name: "", email: "", phone: "", categoryId: "", categoryName: "", document: "",
                    address: "", contactName: "", contactPhone: ""
                });
            }
        }
    }, [open, supplier]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalCategoryId = formData.categoryId;

            // If categoryId is empty but name is not, it's a new global category
            if (!finalCategoryId && formData.categoryName) {
                const newCat = await supplierService.addCategory(formData.categoryName);
                finalCategoryId = newCat.id;
            }

            if (supplier) {
                await supplierService.addSupplier({ // In mock, we can just call add for now or update it
                    ...supplier,
                    ...formData,
                    categoryId: finalCategoryId,
                    category: formData.categoryName,
                    status: (supplier.status as 'active' | 'inactive') || 'active'
                });
                toast({ title: "Perfil atualizado", description: "Os dados do fornecedor foram salvos." });
            } else {
                await supplierService.addSupplier({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    categoryId: finalCategoryId,
                    category: formData.categoryName,
                    document: formData.document,
                    address: formData.address,
                    contactName: formData.contactName,
                    contactPhone: formData.contactPhone,
                    status: 'active'
                });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <DialogHeader className="p-6 bg-indigo-600 text-white relative">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight pr-8">
                        {supplier ? "Editar Perfil do Fornecedor" : "Cadastrar Novo Fornecedor Estratégico"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Nome da Empresa / Profissional</Label>
                                <Input
                                    required
                                    placeholder="Ex: Mega Som & Eventos"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">E-mail</Label>
                                <Input
                                    type="email"
                                    placeholder="contato@empresa.com"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Telefone / WhatsApp</Label>
                                <Input
                                    placeholder="(00) 00000-0000"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Categoria (Colaborativa)</Label>
                                <Popover open={comboOpen} onOpenChange={setComboOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={comboOpen}
                                            className="w-full justify-between rounded-xl border-gray-100 bg-gray-50 font-bold text-gray-700 h-10 px-4"
                                        >
                                            {formData.categoryName || "Selecione ou digite uma nova categoria..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[450px] p-0 rounded-xl shadow-xl border-gray-100">
                                        <Command>
                                            <CommandInput
                                                placeholder="Pesquisar categoria..."
                                                className="font-bold"
                                                onValueChange={(val) => setFormData({ ...formData, categoryName: val, categoryId: "" })}
                                            />
                                            <CommandList>
                                                <CommandEmpty className="p-4">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="w-full justify-start gap-2 text-indigo-600 font-black uppercase text-xs"
                                                        onClick={() => {
                                                            setComboOpen(false);
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3" /> Criar nova categoria: "{formData.categoryName}"
                                                    </Button>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((cat) => (
                                                        <CommandItem
                                                            key={cat.id}
                                                            value={cat.name}
                                                            onSelect={(currentValue) => {
                                                                setFormData({
                                                                    ...formData,
                                                                    categoryName: currentValue,
                                                                    categoryId: cat.id
                                                                });
                                                                setComboOpen(false);
                                                            }}
                                                            className="font-bold p-3"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.categoryId === cat.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {cat.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <p className="text-[10px] text-gray-400 font-medium">Categorias criadas ficam disponíveis para todos os produtores.</p>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Endereço Completo</Label>
                                <Input
                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Pessoa de Contato (Nome)</Label>
                                <Input
                                    placeholder="Ex: João da Silva"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">Telefone do Contato</Label>
                                <Input
                                    placeholder="(00) 00000-0000"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">CNPJ / CPF</Label>
                                <Input
                                    placeholder="00.000.000/0001-00"
                                    className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                    value={formData.document}
                                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                />
                                <Label className="text-[10px] text-gray-400 font-medium italic">O CNPJ ajudará na validação fiscal e emissão de notas.</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full font-bold"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-full font-black uppercase tracking-tight shadow-lg shadow-indigo-100 px-8"
                            disabled={loading}
                        >
                            {loading ? "Processando..." : (supplier ? "Salvar Alterações" : "Cadastrar Fornecedor")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent >
        </Dialog >
    );
}
