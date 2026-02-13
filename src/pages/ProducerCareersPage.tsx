
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { candidateService } from '@/services/candidateService';
import { staffService } from '@/services/staffService';
import { StaffRole } from '@/interfaces/staff';
import Logo from '@/components/ui/logo';
import Footer from '@/components/layout/Footer';

const ProducerCareersPage = () => {
    const { slug } = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [roles, setRoles] = useState<StaffRole[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        portfolioUrl: '',
        experience: '',
        interestedRolesIds: [] as string[]
    });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        const data = await staffService.getRoles();
        setRoles(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.interestedRolesIds.length === 0) {
                toast({
                    variant: 'destructive',
                    title: 'Selecione uma área',
                    description: 'Por favor, selecione pelo menos uma área de interesse.',
                });
                setLoading(false);
                return;
            }

            await candidateService.apply({
                ...formData,
                organizerId: '1' // Mock ID based on slug
            });

            setSuccess(true);
            toast({
                title: 'Candidatura enviada!',
                description: 'Recebemos seu perfil e entraremos em contato em breve.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao enviar',
                description: 'Ocorreu um erro ao enviar sua candidatura. Tente novamente.',
            });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Sucesso!</h2>
                    <p className="text-gray-600">
                        Obrigado pelo interesse em trabalhar conosco. Seu perfil foi adicionado ao nosso banco de talentos.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => setSuccess(false)}>
                        Enviar outra candidatura
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header Simples */}
            <header className="border-b bg-white py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Logo />
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                        Voltar
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Trabalhe Conosco</h1>
                        <p className="text-lg text-gray-600">
                            Faça parte da equipe dos melhores eventos da região. Cadastre seu perfil abaixo.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-6 md:p-8 rounded-xl border">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input
                                        id="name"
                                        placeholder="Seu nome"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                <Input
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="role">Vaga de Interesse</Label>
                                <Select
                                    onValueChange={(value) => setFormData({ ...formData, interestedRolesIds: [value] })}
                                    value={formData.interestedRolesIds[0] || ""}
                                >
                                    <SelectTrigger id="role" className="w-full h-12 bg-white rounded-lg border-gray-200">
                                        <SelectValue placeholder="Selecione a vaga que deseja se candidatar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-bold">{role.name}</span>
                                                    <span className="text-xs text-gray-500">{role.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Resumo da Experiência</Label>
                                <Textarea
                                    id="experience"
                                    placeholder="Conte um pouco sobre seus trabalhos anteriores em eventos..."
                                    className="min-h-[120px]"
                                    required
                                    value={formData.experience}
                                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn (Opcional)</Label>
                                    <Input
                                        id="linkedin"
                                        placeholder="URL do perfil"
                                        value={formData.linkedinUrl}
                                        onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio">Portfólio / Instagram (Opcional)</Label>
                                    <Input
                                        id="portfolio"
                                        placeholder="URL do portfólio"
                                        value={formData.portfolioUrl}
                                        onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar Candidatura'}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProducerCareersPage;
