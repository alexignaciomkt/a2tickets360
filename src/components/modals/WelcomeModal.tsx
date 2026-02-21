
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
    const navigate = useNavigate();

    const handleStartEvent = () => {
        onClose();
        navigate('/organizer/events/create');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles size={120} />
                    </div>

                    <DialogHeader className="relative z-10">
                        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                            <Sparkles className="text-white h-8 w-8" />
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">
                            Seja bem-vindo à Elite!
                        </DialogTitle>
                        <DialogDescription className="text-indigo-100 text-lg font-medium leading-tight">
                            Sua produtora agora faz parte do ecossistema de gestão mais avançado do mercado.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">Escalabilidade</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">Alta performance para vendas massivas sem lentidão.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Calendar size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">Gestão 360º</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">Controle total de staff, fornecedores e financeiro.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <ShieldCheck size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">Segurança</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">Proteção antifraude e validação ultra rápida.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-600 text-sm font-medium text-center px-4">
                            Estamos prontos para impulsionar seus eventos e profissionalizar sua gestão. Pronto para o próximo nível?
                        </p>

                        <Button
                            onClick={handleStartEvent}
                            className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-200 gap-3 border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Vamos começar seu primeiro evento?
                            <ArrowRight className="h-6 w-6" />
                        </Button>

                        <button
                            onClick={onClose}
                            className="w-full text-center text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Explorar o painel primeiro
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WelcomeModal;
