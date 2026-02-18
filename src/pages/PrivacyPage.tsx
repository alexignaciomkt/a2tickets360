
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, FileText, Activity, Server, ShieldCheck, Mail, Globe } from 'lucide-react';

const PrivacyPage = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');

    return (
        <MainLayout>
            <div className="bg-[#050505] min-h-screen py-20 relative overflow-hidden">
                {/* Background Visual Elements */}
                <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[150px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[150px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                                <Lock className="w-4 h-4 text-emerald-400 mr-2" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">Sua Privacidade em Primeiro Lugar</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
                                Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Privacidade</span>
                            </h1>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                                Última atualização: {currentDate}
                            </p>
                        </div>

                        {/* Content Card */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-50" />

                            <div className="prose prose-invert max-w-none space-y-8">
                                <p className="text-gray-400 leading-relaxed font-light text-lg">
                                    Esta Política explica como coletamos, usamos, compartilhamos e protegemos seus dados pessoais quando você utiliza a A2 Tickets 360. Nosso compromisso é com a transparência, a segurança e a conformidade com a legislação aplicável de proteção de dados, incluindo a Lei Geral de Proteção de Dados Pessoais (LGPD – Lei 13.709/2018), quando aplicável.
                                </p>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center mb-4">
                                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                                            <FileText className="w-4 h-4 text-emerald-400" />
                                        </span>
                                        1. Controlador e Contatos
                                    </h2>
                                    <div className="space-y-4 text-gray-400 leading-relaxed font-light">
                                        <p><strong className="text-white">Controlador:</strong> [Razão Social da A2 Tickets 360], CNPJ [inserir], com sede em [endereço completo].</p>
                                        <p><strong className="text-white">Encarregado/DPO:</strong> [nome, se houver], contato: [e-mail do DPO].</p>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="font-bold text-white mb-2 text-sm uppercase tracking-widest">Observação de papéis:</p>
                                            <ul className="list-disc pl-5 space-y-2">
                                                <li><strong>Como Controladora:</strong> para dados necessários à operação da Plataforma (cadastro de contas, antifraude, faturamento, suporte, analytics etc.).</li>
                                                <li><strong>Como Operadora/Processadora:</strong> para determinados tratamentos realizados em nome dos Organizadores (ex.: gestão de listas de participantes, check-in), conforme instruções do Organizador e contrato aplicável.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center mb-4">
                                        <span className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-3">
                                            <Activity className="w-4 h-4 text-cyan-400" />
                                        </span>
                                        2. Dados que Coletamos
                                    </h2>
                                    <ul className="space-y-6 text-gray-400 leading-relaxed font-light list-none pl-0">
                                        <li>
                                            <strong className="text-white block mb-1">2.1. Dados de cadastro e conta:</strong>
                                            Nome, CPF/CNPJ, razão social, nome fantasia, data de nascimento, endereço, e-mail, telefone, senha (hash), cargo/função. Documentos para verificação/KYC/KYB.
                                        </li>
                                        <li>
                                            <strong className="text-white block mb-1">2.2. Dados de evento e transacionais:</strong>
                                            Informações do evento, categorias, lotes, preços, políticas de reembolso. Dados de compra: itens, quantidades, valores. Dados de pagamento processados por Provedores (não armazenamos dados sensíveis de cartão).
                                        </li>
                                        <li>
                                            <strong className="text-white block mb-1">2.3. Dados de Participantes:</strong>
                                            Nome, e-mail, documento (para meia-entrada/identificação), telefone, preferências, check-in.
                                        </li>
                                        <li>
                                            <strong className="text-white block mb-1">2.4. Dados técnicos e de uso:</strong>
                                            Endereço IP, identificadores de dispositivo, navegador, sistema operacional, cookies, logs de acesso e segurança.
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">3. Bases Legais e Finalidades</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                            <h3 className="text-white font-bold mb-3 uppercase text-xs tracking-widest">Bases Legais</h3>
                                            <ul className="list-disc pl-4 space-y-2 text-sm text-gray-400">
                                                <li>Execução de contrato</li>
                                                <li>Cumprimento de obrigação legal</li>
                                                <li>Legítimo interesse (segurança, antifraude)</li>
                                                <li>Consentimento (marketing, cookies)</li>
                                                <li>Exercício regular de direitos</li>
                                            </ul>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                            <h3 className="text-white font-bold mb-3 uppercase text-xs tracking-widest">Finalidades</h3>
                                            <ul className="list-disc pl-4 space-y-2 text-sm text-gray-400">
                                                <li>Operar e manter a Plataforma</li>
                                                <li>Prevenir e detectar fraudes</li>
                                                <li>Atender solicitações e suporte</li>
                                                <li>Personalizar experiência</li>
                                                <li>Produzir estatísticas (anonimizadas)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">4. Compartilhamento de Dados</h2>
                                    <p className="text-gray-400 leading-relaxed font-light mb-4">Podemos compartilhar dados com:</p>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-400 font-light">
                                        <li><strong>Provedores:</strong> pagamento, antifraude, emissão fiscal, nuvem, suporte.</li>
                                        <li><strong>Organizadores:</strong> dados necessários para gestão do evento e check-in.</li>
                                        <li><strong>Autoridades públicas:</strong> quando exigido por lei.</li>
                                        <li><strong>Parceiros comerciais:</strong> mediante consentimento ou base legal.</li>
                                    </ul>
                                    <p className="text-emerald-400 font-bold mt-4 text-sm uppercase tracking-widest">Não vendemos dados pessoais.</p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4 flex items-center">
                                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        </span>
                                        8. Segurança da Informação
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-light mb-4">
                                        Adotamos medidas técnicas e organizacionais para proteger dados, incluindo:
                                    </p>
                                    <ul className="grid md:grid-cols-2 gap-4">
                                        <li className="bg-white/5 p-3 rounded-lg text-sm text-gray-300 border border-white/5 flex items-center">
                                            <Lock className="w-4 h-4 mr-2 text-emerald-400" /> Criptografia em trânsito e repouso
                                        </li>
                                        <li className="bg-white/5 p-3 rounded-lg text-sm text-gray-300 border border-white/5 flex items-center">
                                            <Server className="w-4 h-4 mr-2 text-emerald-400" /> Controle de acesso rigoroso
                                        </li>
                                        <li className="bg-white/5 p-3 rounded-lg text-sm text-gray-300 border border-white/5 flex items-center">
                                            <Activity className="w-4 h-4 mr-2 text-emerald-400" /> Monitoramento contínuo
                                        </li>
                                        <li className="bg-white/5 p-3 rounded-lg text-sm text-gray-300 border border-white/5 flex items-center">
                                            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> Auditoria de fornecedores
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">14. Contatos</h2>
                                    <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-8 border border-emerald-500/20">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-widest flex items-center">
                                                    <Globe className="w-4 h-4 mr-2 text-cyan-400" /> Controlador
                                                </h3>
                                                <p className="text-gray-400 text-sm mb-1">[Razão Social]</p>
                                                <p className="text-gray-400 text-sm mb-1">CNPJ: [inserir]</p>
                                                <p className="text-gray-400 text-sm">[Endereço]</p>
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-widest flex items-center">
                                                    <Mail className="w-4 h-4 mr-2 text-emerald-400" /> Fale Conosco
                                                </h3>
                                                <p className="text-gray-400 text-sm mb-1"><strong>DPO:</strong> [nome]</p>
                                                <p className="text-gray-400 text-sm mb-1"><strong>E-mail:</strong> [e-mail]</p>
                                                <p className="text-gray-400 text-sm"><strong>Ajuda:</strong> [URL da Central]</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </div>
                        </div>

                        <div className="mt-12 text-center text-gray-600 text-sm italic uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} A2 Tickets 360 &bull; Todos os direitos reservados
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default PrivacyPage;
