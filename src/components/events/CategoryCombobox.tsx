import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { organizerService, EventCategory } from '@/services/organizerService';

interface CategoryComboboxProps {
    value: string;
    onChange: (value: string) => void;
}

const CategoryCombobox = ({ value, onChange }: CategoryComboboxProps) => {
    const [categories, setCategories] = useState<EventCategory[]>([]);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await organizerService.getEventCategories();
            setCategories(Array.isArray(cats) ? cats : []);
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!search.trim()) return;
        setCreating(true);
        try {
            const newCat = await organizerService.createEventCategory(search.trim());
            if (newCat && newCat.name) {
                setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
                onChange(newCat.name);
                setSearch('');
                setIsOpen(false);
            }
        } catch (err) {
            console.error('Erro ao criar categoria:', err);
        } finally {
            setCreating(false);
        }
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const exactMatch = categories.some(
        c => c.name.toLowerCase() === search.trim().toLowerCase()
    );

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Buscar ou criar categoria..."
                    value={isOpen ? search : (value || search)}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Carregando categorias...</div>
                    ) : (
                        <>
                            {filtered.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(cat.name);
                                        setSearch('');
                                        setIsOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left text-sm
                    transition-colors hover:bg-indigo-50
                    ${value === cat.name ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}
                  `}
                                >
                                    <Tag className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span>{cat.name}</span>
                                </button>
                            ))}

                            {filtered.length === 0 && !search.trim() && (
                                <div className="p-4 text-center text-gray-400 text-sm">Nenhuma categoria encontrada</div>
                            )}

                            {search.trim() && !exactMatch && (
                                <div className="border-t border-gray-100 p-3">
                                    <Button
                                        type="button"
                                        onClick={handleCreateCategory}
                                        disabled={creating}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {creating ? 'Criando...' : `Criar "${search.trim()}"`}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryCombobox;
