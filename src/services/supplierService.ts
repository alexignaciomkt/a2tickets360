import { toast } from "@/hooks/use-toast";

export interface Supplier {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    category: string;
    categoryId?: string;
    document?: string;
    address?: string;
    contactName?: string;
    contactPhone?: string;
    status: 'active' | 'inactive';
    totalSpent: number;
    lastEvent?: string;
}

export interface SupplierCategory {
    id: string;
    name: string;
}

const MOCK_CATEGORIES: SupplierCategory[] = [
    { id: 'c1', name: 'Sonorização' },
    { id: 'c2', name: 'Cenografia' },
    { id: 'c3', name: 'Segurança' },
    { id: 'c4', name: 'Limpeza' },
    { id: 'c5', name: 'Buffet' },
    { id: 'c6', name: 'Papel Toalha' }
];

const MOCK_SUPPLIERS: Supplier[] = [
    {
        id: '1',
        name: 'Mega Som & Luz',
        email: 'contato@megasom.com',
        phone: '(11) 99999-1111',
        category: 'Sonorização',
        categoryId: 'c1',
        document: '12.345.678/0001-90',
        status: 'active',
        totalSpent: 45000.00,
        lastEvent: 'Festival de Verão 2025'
    },
    {
        id: '2',
        name: 'CenoArt Montagens',
        email: 'financeiro@cenoart.com.br',
        phone: '(11) 98888-2222',
        category: 'Cenografia',
        categoryId: 'c2',
        document: '98.765.432/0001-21',
        status: 'active',
        totalSpent: 120000.00,
        lastEvent: 'Expo Tech 2024'
    },
    {
        id: '3',
        name: 'SafeGuard Segurança',
        email: 'vendas@safeguard.com',
        phone: '(11) 97777-3333',
        category: 'Segurança',
        categoryId: 'c3',
        document: '45.678.912/0001-55',
        status: 'active',
        totalSpent: 15500.00,
        lastEvent: 'Festa da Uva'
    }
];

export const supplierService = {
    getSuppliers: async (): Promise<Supplier[]> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_SUPPLIERS), 500);
        });
    },

    getCategories: async (): Promise<SupplierCategory[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_CATEGORIES), 300);
        });
    },

    addCategory: async (name: string): Promise<SupplierCategory> => {
        const newCat = { id: `c${Date.now()}`, name };
        MOCK_CATEGORIES.push(newCat);
        return newCat;
    },

    getSupplierById: async (id: string): Promise<Supplier | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_SUPPLIERS.find(s => s.id === id)), 300);
        });
    },

    addSupplier: async (supplier: Omit<Supplier, 'id' | 'totalSpent'>): Promise<Supplier> => {
        const newSupplier: Supplier = {
            ...supplier,
            id: Math.random().toString(36).substr(2, 9),
            totalSpent: 0
        };

        // In a real app, this would be a POST request
        toast({
            title: "Sucesso!",
            description: "Fornecedor cadastrado com sucesso.",
        });

        return newSupplier;
    }
};
