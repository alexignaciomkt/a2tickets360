import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UserContext {
    type: 'master' | 'organizer' | 'employee' | 'staff';
    organizerId?: string;
    employeeId?: string;
    accessScope?: string;
}

export default function ContextSelector() {
    const [contexts, setContexts] = useState<UserContext[]>([]);
    const [activeContext, setActiveContext] = useState<UserContext | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContexts = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
                const response = await fetch(`${apiUrl}/api/me/contexts`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                
                const data = await response.json();
                if (data?.success && data.contexts) {
                    setContexts(data.contexts);
                    // Default to first context or one saved in localStorage
                    if (data.contexts.length > 0) {
                        const saved = localStorage.getItem('A2_active_context');
                        if (saved) {
                            try {
                                const parsed = JSON.parse(saved);
                                const exists = res.data.contexts.find(
                                    (c: UserContext) => c.type === parsed.type && c.organizerId === parsed.organizerId
                                );
                                setActiveContext(exists || res.data.contexts[0]);
                            } catch {
                                setActiveContext(res.data.contexts[0]);
                            }
                        } else {
                            setActiveContext(res.data.contexts[0]);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load contexts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContexts();
    }, []);

    const handleSelect = (ctx: UserContext) => {
        setActiveContext(ctx);
        localStorage.setItem('A2_active_context', JSON.stringify(ctx));
        setIsOpen(false);
        // Dispatch event or reload to update layout
        window.dispatchEvent(new Event('a2_context_changed'));
        // In a real app we might want to navigate to the default dashboard for that context
    };

    if (loading || contexts.length <= 1) {
        return null; // Don't render if 0 or 1 context
    }

    const getContextLabel = (ctx: UserContext) => {
        if (ctx.type === 'master') return 'Master Admin';
        if (ctx.type === 'organizer') return 'Produtor'; // Could fetch organizer name if needed
        if (ctx.type === 'employee') return 'Funcionário';
        if (ctx.type === 'staff') return 'Staff';
        return 'Contexto Desconhecido';
    };

    return (
        <div className="relative mb-4 mt-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Atuando como:</div>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <span className="text-sm font-semibold text-slate-800">
                    {activeContext ? getContextLabel(activeContext) : 'Selecione'}
                </span>
                <ChevronDown size={14} className="text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    {contexts.map((ctx, idx) => {
                        const isSelected = activeContext?.type === ctx.type && activeContext?.organizerId === ctx.organizerId;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(ctx)}
                                className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-indigo-50 transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600'}`}
                            >
                                <span>{getContextLabel(ctx)}</span>
                                {isSelected && <Check size={14} className="text-indigo-600" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
