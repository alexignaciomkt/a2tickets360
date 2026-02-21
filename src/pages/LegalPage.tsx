
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, ChevronLeft, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';
import ReactMarkdown from 'react-markdown';

const LegalPage = ({ slug: propSlug }: { slug?: string }) => {
    const { slug: paramSlug } = useParams<{ slug: string }>();
    const slug = propSlug || paramSlug;
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPage();
    }, [slug]);

    const loadPage = async () => {
        try {
            setLoading(true);
            const data = await api.get<any>(`/api/legal/${slug}`);
            setPage(data);
        } catch (error) {
            console.error('Erro ao carregar página legal:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Página não encontrada</h1>
                <p className="text-gray-500 mb-8">O conteúdo legal solicitado não existe.</p>
                <Button asChild variant="outline">
                    <Link to="/"><ChevronLeft className="mr-2 h-4 w-4" /> Voltar ao Início</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Navbar style */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        <span className="font-black uppercase tracking-tighter text-gray-900">Legal</span>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/"><ChevronLeft className="mr-2 h-4 w-4" /> Voltar</Link>
                    </Button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <Card className="p-8 md:p-12 rounded-3xl shadow-sm border-gray-100">
                    <div className="prose prose-indigo max-w-none">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-4">
                            <span className="bg-indigo-50 px-3 py-1 rounded-full">Atualizado em {new Date(page.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter uppercase">{page.title}</h1>
                        <div className="markdown-content text-gray-700 leading-relaxed space-y-4">
                            <ReactMarkdown>{page.content}</ReactMarkdown>
                        </div>
                    </div>
                </Card>

                <div className="mt-12 text-center text-sm text-gray-400 font-medium">
                    <p>© {new Date().getFullYear()} A2 Tickets 360. Todos os direitos reservados.</p>
                </div>
            </main>
        </div>
    );
};

export default LegalPage;
