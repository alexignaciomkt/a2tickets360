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

    return (
        <div className="space-y-4">
            {tickets.map((ticket, idx) => (
                <div
                    key={ticket.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 transition-all hover:border-indigo-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${eventType === 'free' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                {idx + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-500">
                                {eventType === 'free' ? `Lote de Inscrição ${idx + 1}` : `Lote de Ingresso ${idx + 1}`}
                            </span>
                        </div>
                        {tickets.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeTicket(ticket.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nome</label>
                            <Input
                                value={ticket.name}
                                onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                                className="bg-gray-50 border-gray-200 text-gray-900 focus:bg-white transition-colors"
                                placeholder={eventType === 'free' ? "Ex: Credenciamento" : "Ex: Pista"}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                {eventType === 'free' ? 'Preço (Gratuito)' : 'Preço (R$)'}
                            </label>
                            <div className="relative">
                                <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${eventType === 'free' ? 'text-gray-300' : 'text-gray-400'}`} />
                                <Input
                                    type="number"
                                    step="0.01"
                                    disabled={eventType === 'free'}
                                    value={eventType === 'free' ? 0 : ticket.price}
                                    onChange={(e) => updateTicket(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                                    className={`pl-10 border-gray-200 text-gray-900 focus:bg-white transition-colors ${eventType === 'free' ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-gray-50'}`}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Quantidade</label>
                            <Input
                                type="number"
                                value={ticket.quantity}
                                onChange={(e) => updateTicket(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="bg-gray-50 border-gray-200 text-gray-900 focus:bg-white transition-colors"
                                placeholder="100"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Categoria</label>
                            <Select
                                value={ticket.category}
                                onValueChange={(val) => updateTicket(ticket.id, 'category', val)}
                            >
                                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus:bg-white transition-colors">
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
                className="w-full border-dashed border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-gray-50 gap-2 h-12"
            >
                <Plus className="h-4 w-4" />
                {eventType === 'free' ? 'Adicionar Novo Lote de Inscrição' : 'Adicionar Lote de Ingresso'}
            </Button>

            {tickets.length > 0 && (
                <div className={`${eventType === 'free' ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'} border rounded-xl p-4 flex items-center justify-between`}>
                    <span className="text-sm text-gray-600">Total de inscrições disponíveis:</span>
                    <span className={`text-lg font-black ${eventType === 'free' ? 'text-emerald-700' : 'text-indigo-700'}`}>
                        {tickets.reduce((sum, t) => sum + t.quantity, 0).toLocaleString('pt-BR')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TicketBuilder;
