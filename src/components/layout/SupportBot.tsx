
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Ticket, RefreshCw, UserPlus } from 'lucide-react';

export default function SupportBot() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState([
        { id: 1, type: 'bot', text: 'Olá! Sou o assistente virtual da A2 Tickets 360º. Como posso te ajudar hoje?' }
    ]);
    const [inputValue, setInputValue] = React.useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Simular resposta do bot (Pode ser integrado com Gemini futuramente)
        setTimeout(() => {
            let botResponse = "Desculpe, não entendi. Você pode tentar as opções rápidas abaixo?";
            if (inputValue.toLowerCase().includes('ingresso')) {
                botResponse = "Para reenviar seu ingresso, informe o e-mail utilizado na compra ou o número do pedido.";
            } else if (inputValue.toLowerCase().includes('titularidade')) {
                botResponse = "A troca de titularidade pode ser feita uma única vez até 24h antes do evento. Deseja iniciar o processo?";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
                        style={{ height: '500px' }}
                    >
                        {/* Header */}
                        <div className="bg-primary p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-tighter text-sm">Suporte A2</h3>
                                    <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Online agora</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.type === 'user'
                                            ? 'bg-primary text-white rounded-tr-none shadow-lg'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar scrollbar-hide">
                            {[
                                { icon: <RefreshCw size={14} />, label: "Reenviar Ingresso" },
                                { icon: <UserPlus size={14} />, label: "Trocar Titular" },
                                { icon: <Ticket size={14} />, label: "Meus Pedidos" },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    className="whitespace-nowrap px-3 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Digite sua dúvida..."
                                className="flex-grow bg-gray-50 border border-transparent rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                            />
                            <button
                                onClick={handleSend}
                                className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-primary-dark transition-all group"
            >
                {isOpen ? <X size={32} /> : <MessageSquare size={32} className="group-hover:rotate-12 transition-transform" />}
            </motion.button>
        </div>
    );
}
