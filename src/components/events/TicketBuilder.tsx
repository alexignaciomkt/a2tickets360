import { Plus, Trash2, DollarSign, Ticket, AlertCircle } from 'lucide-react';
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
    registrationType: 'INDIVIDUAL' | 'DOUBLE' | 'TEAM';
    participantsPerRegistration: number;
    ticketPurpose: 'ADMISSION' | 'REGISTRATION' | 'REPECHAGE';
}

interface TicketBuilderProps {
    tickets: TicketTier[];
    onChange: (tickets: TicketTier[]) => void;
    eventType: 'paid' | 'free';
    capacity: number;
    categoryCode?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    'standard': 'Inteira',
    'vip': 'VIP',
    'early-bird': 'Lote Antecipado',
    'student': 'Meia-Entrada',
    'group': 'Grupo',
};

const REGISTRATION_TYPE_LABELS: Record<string, string> = {
    'INDIVIDUAL': 'Individual',
    'DOUBLE': 'Dupla',
    'TEAM': 'Equipe',
};

const TICKET_PURPOSE_LABELS: Record<string, string> = {
    'ADMISSION': 'Ingresso / Acesso',
    'REGISTRATION': 'Inscrição Esportiva',
    'REPECHAGE': 'Repescagem',
};

const TicketBuilder = ({ tickets, onChange, eventType, capacity, categoryCode }: TicketBuilderProps) => {
    const addTicket = () => {
        const newTicket: TicketTier = {
            id: `temp_${Date.now()}`,
            name: eventType === 'free' ? 'Inscrição Gratuita' : '',
            price: 0,
            quantity: 100,
            category: 'standard',
            registrationType: 'INDIVIDUAL',
            participantsPerRegistration: 1,
            ticketPurpose: 'ADMISSION',
        };
        onChange([...tickets, newTicket]);
    };

    const updateTicket = (id: string, field: keyof TicketTier, value: any) => {
        onChange(tickets.map(t => {
            if (t.id !== id) return t;
            
            const updated = { ...t, [field]: value };
            
            // Auto-adjust participants based on registration type
            if (field === 'registrationType') {
                if (value === 'INDIVIDUAL') updated.participantsPerRegistration = 1;
                else if (value === 'DOUBLE') updated.participantsPerRegistration = 2;
                else if (value === 'TEAM' && updated.participantsPerRegistration < 3) updated.participantsPerRegistration = 3;
            }
            
            // Enforce minimum participants for TEAM
            if (field === 'participantsPerRegistration' && updated.registrationType === 'TEAM') {
                if (value < 3) updated.participantsPerRegistration = 3;
            }
            
            // Força defaults neutros para ADMISSION
            if (field === 'ticketPurpose' && value === 'ADMISSION') {
                updated.registrationType = 'INDIVIDUAL';
                updated.participantsPerRegistration = 1;
            }

            return updated;
        }));
    };

    const removeTicket = (id: string) => {
        onChange(tickets.filter(t => t.id !== id));
    };

    const usedCapacity = tickets
        .filter(t => t.ticketPurpose === 'REGISTRATION')
        .reduce((sum, t) => sum + (t.quantity * t.participantsPerRegistration), 0);
    
    const remainingCapacity = capacity - usedCapacity;
    const isCapacityExceeded = usedCapacity > capacity;

    return (
        <div className="space-y-4">
            {/* Global Summary */}
            <div className={`p-5 rounded-xl border ${isCapacityExceeded ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'} flex flex-col md:flex-row items-center justify-between gap-4`}>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Visão Global do Evento</h4>
                    <div className="flex gap-8 text-sm">
                        <div>
                            <span className="text-slate-500 block text-xs">Capacidade Total</span>
                            <span className="font-bold text-slate-900">{capacity} pessoas</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-xs">Capacidade Utilizada</span>
                            <span className={`font-bold ${isCapacityExceeded ? 'text-red-600' : 'text-slate-900'}`}>{usedCapacity} pessoas</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-xs">Capacidade Restante</span>
                            <span className={`font-bold ${remainingCapacity < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{Math.max(0, remainingCapacity)} pessoas</span>
                        </div>
                    </div>
                </div>
                {isCapacityExceeded && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-100 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-bold">Capacidade excedida!</span>
                    </div>
                )}
            </div>

            {/* Sports Hint */}
            {categoryCode === 'SPORT_TRUCO' && (
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex gap-3 text-indigo-800 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 text-indigo-500" />
                    <div>
                        <strong className="block mb-1">Vai trabalhar com repescagem?</strong>
                        Crie um lote com a finalidade <strong>"Repescagem"</strong>. Esse lote não consumirá a capacidade do evento e será utilizado futuramente pela A2Sports360 para cobrar automaticamente a repescagem dos competidores elegíveis.
                    </div>
                </div>
            )}

            {tickets.map((ticket, idx) => {
                const capacityExcludingThis = usedCapacity - (ticket.ticketPurpose === 'REGISTRATION' ? (ticket.quantity * ticket.participantsPerRegistration) : 0);
                const maxAllowedInThis = ticket.ticketPurpose === 'REGISTRATION' 
                    ? Math.floor((capacity - capacityExcludingThis) / ticket.participantsPerRegistration)
                    : null;
                const isThisExceeded = ticket.ticketPurpose === 'REGISTRATION' && ticket.quantity > (maxAllowedInThis || 0);

                return (
                    <div
                        key={ticket.id}
                        className={`bg-white border ${isThisExceeded ? 'border-red-300' : 'border-gray-200'} rounded-xl p-5 transition-all shadow-sm`}
                    >
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${eventType === 'free' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {idx + 1}
                                </div>
                                <span className="text-sm font-bold text-gray-700">
                                    {eventType === 'free' ? `Lote de Inscrição ${idx + 1}` : `Lote Comercial ${idx + 1}`}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="lg:col-span-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nome</label>
                                <Input
                                    value={ticket.name}
                                    onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                                    className="bg-gray-50 border-gray-200 text-gray-900 focus:bg-white transition-colors"
                                    placeholder={eventType === 'free' ? "Ex: Credenciamento" : "Ex: Pista"}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
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
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Qtd. Disponível</label>
                                <Input
                                    type="number"
                                    value={ticket.quantity}
                                    onChange={(e) => updateTicket(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                                    className={`bg-gray-50 border-gray-200 text-gray-900 focus:bg-white transition-colors ${isThisExceeded ? 'border-red-400 focus:border-red-500 bg-red-50' : ''}`}
                                    placeholder="100"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Categoria</label>
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

                        {/* Motor de Inscrições / Regras Comerciais */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Finalidade</label>
                                <Select
                                    value={ticket.ticketPurpose}
                                    onValueChange={(val) => updateTicket(ticket.id, 'ticketPurpose', val)}
                                >
                                    <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:bg-white transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(TICKET_PURPOSE_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tipo de Inscrição</label>
                                <Select
                                    value={ticket.registrationType}
                                    onValueChange={(val) => updateTicket(ticket.id, 'registrationType', val)}
                                    disabled={ticket.ticketPurpose === 'ADMISSION'}
                                >
                                    <SelectTrigger className={`bg-white border-gray-200 text-gray-900 focus:bg-white transition-colors ${ticket.ticketPurpose === 'ADMISSION' ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(REGISTRATION_TYPE_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Pessoas por Inscrição</label>
                                <Input
                                    type="number"
                                    value={ticket.participantsPerRegistration}
                                    disabled={ticket.registrationType !== 'TEAM' || ticket.ticketPurpose === 'ADMISSION'}
                                    min={ticket.registrationType === 'TEAM' ? 3 : 1}
                                    onChange={(e) => updateTicket(ticket.id, 'participantsPerRegistration', parseInt(e.target.value) || 1)}
                                    className={`bg-white border-gray-200 text-gray-900 focus:bg-white transition-colors ${(ticket.registrationType !== 'TEAM' || ticket.ticketPurpose === 'ADMISSION') ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
                                />
                            </div>
                        </div>

                        {/* Summary por Lote */}
                        <div className="text-xs text-slate-500 flex flex-wrap gap-x-6 gap-y-2 mt-2 px-2">
                            <span><strong>Tipo:</strong> {REGISTRATION_TYPE_LABELS[ticket.registrationType]}</span>
                            <span><strong>Participantes:</strong> {ticket.participantsPerRegistration}</span>
                            <span><strong>Finalidade:</strong> {TICKET_PURPOSE_LABELS[ticket.ticketPurpose]}</span>
                            
                            {ticket.ticketPurpose === 'REGISTRATION' ? (
                                <span className={isThisExceeded ? 'text-red-600 font-bold' : 'text-slate-700 font-medium'}>
                                    <strong>Máximo permitido:</strong> {maxAllowedInThis} inscrições
                                </span>
                            ) : (
                                <span className="text-indigo-600 w-full mt-1">
                                    <em>Este lote não consome capacidade do evento. Será utilizado para vendas complementares de repescagem.</em>
                                </span>
                            )}
                        </div>

                    </div>
                );
            })}

            <Button
                type="button"
                onClick={addTicket}
                variant="outline"
                className="w-full border-dashed border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-gray-50 gap-2 h-12"
            >
                <Plus className="h-4 w-4" />
                {eventType === 'free' ? 'Adicionar Novo Lote de Inscrição' : 'Adicionar Lote Comercial'}
            </Button>
        </div>
    );
};

export default TicketBuilder;
