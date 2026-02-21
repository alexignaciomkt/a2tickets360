import { Plus, Trash2, DollarSign, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface TicketTier {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: 'standard' | 'vip' | 'early-bird' | 'student' | 'group';
}

interface TicketBuilderProps {
    tickets: TicketTier[];
    onChange: (tickets: TicketTier[]) => void;
    eventType: 'paid' | 'free';
}

const CATEGORY_LABELS: Record<string, string> = {
    'standard': 'Inteira',
    'vip': 'VIP',
    'early-bird': 'Lote Antecipado',
    'student': 'Meia-Entrada',
    'group': 'Grupo',
};

const TicketBuilder = ({ tickets, onChange, eventType }: TicketBuilderProps) => {
    const addTicket = () => {
        const newTicket: TicketTier = {
            id: `temp_${Date.now()}`,
            name: eventType === 'free' ? 'Inscrição Gratuita' : '',
            price: 0,
            quantity: 100,
            category: 'standard',
        };
        onChange([...tickets, newTicket]);
    };

    const updateTicket = (id: string, field: keyof TicketTier, value: any) => {
        onChange(tickets.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const removeTicket = (id: string) => {
        onChange(tickets.filter(t => t.id !== id));
    };

    if (eventType === 'free') {
        return (
            <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Ticket className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="text-gray-900 font-medium">Inscrição Gratuita</h4>
                            <p className="text-xs text-gray-500">Configure como os participantes se inscreverão</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Nome do Ingresso</label>
                            <Input
                                value={tickets[0]?.name || 'Inscrição Gratuita'}
                                onChange={(e) => {
                                    if (tickets.length === 0) {
                                        onChange([{ id: `temp_${Date.now()}`, name: e.target.value, price: 0, quantity: 100, category: 'standard' }]);
                                    } else {
                                        updateTicket(tickets[0].id, 'name', e.target.value);
                                    }
                                }}
                                className="bg-white border-gray-300 text-gray-900"
                                placeholder="Ex: Credenciamento"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Limite de Inscrições</label>
                            <Input
                                type="number"
                                value={tickets[0]?.quantity || 100}
                                onChange={(e) => {
                                    if (tickets.length === 0) {
                                        onChange([{ id: `temp_${Date.now()}`, name: 'Inscrição Gratuita', price: 0, quantity: parseInt(e.target.value) || 0, category: 'standard' }]);
                                    } else {
                                        updateTicket(tickets[0].id, 'quantity', parseInt(e.target.value) || 0);
                                    }
                                }}
                                className="bg-white border-gray-300 text-gray-900"
                                placeholder="100"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket, idx) => (
                <div
                    key={ticket.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all hover:border-indigo-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-600">
                                {idx + 1}
                            </div>
                            <span className="text-sm text-gray-500">Lote {idx + 1}</span>
                        </div>
                        {tickets.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTicket(ticket.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Nome</label>
                            <Input
                                value={ticket.name}
                                onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                                className="bg-white border-gray-300 text-gray-900"
                                placeholder="Ex: Pista"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Preço (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={ticket.price}
                                    onChange={(e) => updateTicket(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                                    className="pl-10 bg-white border-gray-300 text-gray-900"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Quantidade</label>
                            <Input
                                type="number"
                                value={ticket.quantity}
                                onChange={(e) => updateTicket(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="bg-white border-gray-300 text-gray-900"
                                placeholder="100"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Tipo</label>
                            <Select
                                value={ticket.category}
                                onValueChange={(val) => updateTicket(ticket.id, 'category', val)}
                            >
                                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            ))}

            <Button
                type="button"
                onClick={addTicket}
                variant="outline"
                className="w-full border-dashed border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 gap-2"
            >
                <Plus className="h-4 w-4" />
                Adicionar Lote de Ingresso
            </Button>

            {tickets.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de ingressos disponíveis:</span>
                    <span className="text-lg font-bold text-gray-900">
                        {tickets.reduce((sum, t) => sum + t.quantity, 0).toLocaleString('pt-BR')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TicketBuilder;
