
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, CheckCircle } from 'lucide-react';

const TermsPage = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');

    return (
        <MainLayout>
            <div className="bg-[#050505] min-h-screen py-20 relative overflow-hidden">
                {/* Background Visual Elements */}
                <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[150px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                                <Shield className="w-4 h-4 text-primary mr-2" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">Segurança & Transparência</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
                                Termos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Uso</span>
                            </h1>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                                Última atualização: {currentDate}
                            </p>
                        </div>

                        {/* Content Card */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500 opacity-50" />

                            <div className="prose prose-invert max-w-none space-y-8">
                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center mb-4">
                                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </span>
                                        1. Definições
                                    </h2>
                                    <div className="space-y-4 text-gray-400 leading-relaxed font-light">
                                        <p><strong className="text-white">Plataforma:</strong> A2 Tickets 360, solução digital para cadastro, gestão, venda, emissão e validação de ingressos e credenciais para eventos.</p>
                                        <p><strong className="text-white">Usuário:</strong> qualquer pessoa que acesse ou utilize a Plataforma.</p>
                                        <p><strong className="text-white">Organizador:</strong> Usuário que cria e gerencia eventos, vende ingressos e acessa funcionalidades para produção.</p>
                                        <p><strong className="text-white">Comprador/Participante:</strong> Usuário que adquire ingressos e/ou participa de eventos organizados por Organizadores na Plataforma.</p>
                                        <p><strong className="text-white">Conteúdo do Usuário:</strong> textos, imagens, logos, descrições de eventos, arquivos, fotos, vídeos, transmissões e demais materiais enviados à Plataforma.</p>
                                        <p><strong className="text-white">Provedores:</strong> terceiros integrados à Plataforma (meios de pagamento, antifraude, emissão fiscal, envio de e-mail/SMS, analytics, etc.).</p>
                                        <p><strong className="text-white">Ingresso:</strong> direito de acesso a um evento, físico ou digital.</p>
                                        <p><strong className="text-white">Chargeback:</strong> contestação de uma transação financeira pelo titular do cartão ou instituição financeira.</p>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center mb-4">
                                        <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mr-3">
                                            <CheckCircle className="w-4 h-4 text-indigo-400" />
                                        </span>
                                        2. Aceitação dos Termos
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        Ao criar uma conta ou usar a Plataforma, o Usuário concorda com estes Termos e com a Política de Privacidade. Se não concordar, não deverá utilizar a Plataforma.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">3. Elegibilidade e Cadastro</h2>
                                    <div className="space-y-4 text-gray-400 leading-relaxed font-light">
                                        <p><strong className="text-white">Idade mínima:</strong> 18 anos para Organizador. Compradores menores de idade devem adquirir/participar com responsável legal e observar a classificação indicativa e as regras do evento/venue.</p>
                                        <p><strong className="text-white">Verificação:</strong> A A2 Tickets 360 poderá solicitar dados e documentos (KYC/KYB) para verificação de identidade, risco e conformidade (ex.: CNPJ, contrato social, documentos de sócios, comprovantes, autorizações).</p>
                                        <p><strong className="text-white">Segurança da conta:</strong> O Usuário é responsável por manter a confidencialidade de suas credenciais e por toda atividade realizada na conta. Notifique imediatamente sobre uso não autorizado.</p>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">4. Papel da Plataforma</h2>
                                    <div className="space-y-4 text-gray-400 leading-relaxed font-light">
                                        <p><strong className="text-white">Intermediação tecnológica:</strong> A Plataforma facilita a criação, divulgação, gestão e venda de ingressos. Salvo quando explicitamente informado o contrário, a A2 Tickets 360 não é organizadora, promotora ou responsável pelos eventos dos Organizadores.</p>
                                        <p><strong className="text-white">Relação Organizador-Comprador:</strong> Obrigações sobre realização, conteúdo, cancelamento, remarcação, atendimento e reembolso de eventos pertencem ao Organizador, nos termos da legislação aplicável e políticas divulgadas na página do evento.</p>
                                        <p><strong className="text-white">Sem curadoria prévia:</strong> A A2 Tickets 360 não garante a veracidade, qualidade, segurança ou legalidade dos eventos, embora possa agir em caso de abuso, risco ou violação destes Termos.</p>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">5. Criação e Gestão de Eventos</h2>
                                    <p className="text-gray-400 leading-relaxed font-light mb-4">
                                        O Organizador deve fornecer informações claras, verdadeiras e completas sobre o evento (data, horário, local, classificação etária, acessibilidade, política de meia-entrada, itens proibidos, política de reembolso/cancelamento, contato de suporte).
                                    </p>
                                    <p className="text-gray-400 leading-relaxed font-light">
                                        Mudanças relevantes (data, local, line-up, formato) devem ser comunicadas aos Compradores com antecedência razoável e processadas conforme a legislação e políticas aplicáveis.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">6. Preços, Taxas e Pagamentos</h2>
                                    <div className="space-y-4 text-gray-400 leading-relaxed font-light">
                                        <p><strong className="text-white">Tarifas da Plataforma:</strong> A A2 Tickets 360 poderá cobrar taxas de serviço e/ou processamento, informadas no momento da contratação/ativação do evento/conta.</p>
                                        <p><strong className="text-white">Repasses:</strong> Repasses ao Organizador seguem prazos e condições definidos no painel e/ou contrato de adesão, incluindo retenções para riscos, disputas e chargebacks.</p>
                                        <p><strong className="text-white">Impostos:</strong> O Organizador é responsável por tributos incidentes sobre sua atividade.</p>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">10. Política de Uso Aceitável (PUA)</h2>
                                    <p className="text-gray-400 leading-relaxed font-light mb-4">É estritamente proibido:</p>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-400 font-light">
                                        <li>Fraude, lavagem de dinheiro, financiamento ilícito, e simulação de vendas.</li>
                                        <li>Publicar conteúdo ilegal, difamatório, ofensivo ou discriminatório.</li>
                                        <li>Enviar spam, phishing ou malware.</li>
                                        <li>Scraping massivo ou coleta não autorizada de dados de usuários.</li>
                                    </ul>
                                </section>

                                <section className="pt-8 border-t border-white/5">
                                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                                        <p className="text-sm text-gray-400 mb-0">
                                            Para dúvidas ou solicitações sobre estes termos, entre em contato através do nosso canal de suporte oficial.
                                        </p>
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

export default TermsPage;
