
import { useState, useEffect } from 'react';
import { Plus, Search, Shield, Trash2, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StaffRole } from '@/interfaces/staff';
import { staffService } from '@/services/staffService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const StaffRolesPage = () => {
    const { toast } = useToast();
    const [roles, setRoles] = useState<StaffRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRole, setCurrentRole] = useState<Partial<StaffRole>>({
        name: '',
        description: '',
        color: '#3B82F6',
        permissions: {
            webDashboard: false,
            validatorApp: true,
            posSystem: false,
            canManageStaff: false
        }
    });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await staffService.getRoles();
            setRoles(data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao carregar cargos',
                description: 'Tente novamente mais tarde.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setCurrentRole({
            name: '',
            description: '',
            color: '#3B82F6',
            permissions: {
                webDashboard: false,
                validatorApp: true,
                posSystem: false,
                canManageStaff: false
            }
        });
        setIsEditing(true);
    };

    const handleEdit = (role: StaffRole) => {
        setCurrentRole({ ...role });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cargo?')) {
            await staffService.deleteRole(id);
            loadRoles();
            toast({ title: 'Cargo excluído com sucesso' });
        }
    };

    const handleSave = async () => {
        if (!currentRole.name) {
            toast({ variant: 'destructive', title: 'O nome do cargo é obrigatório' });
            return;
        }

        try {
            if (currentRole.id) {
                await staffService.updateRole(currentRole.id, currentRole);
                toast({ title: 'Cargo atualizado com sucesso' });
            } else {
                await staffService.createRole(currentRole as Omit<StaffRole, 'id'>);
                toast({ title: 'Cargo criado com sucesso' });
            }
            setIsEditing(false);
            loadRoles();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao salvar cargo' });
        }
    };

    return (
        <DashboardLayout userType="organizer">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Cargos e Permissões</h1>
                        <p className="text-gray-500">Defina os níveis de acesso e funções da sua equipe.</p>
                    </div>
                    {!isEditing && (
                        <Button onClick={handleCreateNew} className="bg-[#1877F2] hover:bg-[#1567d3]">
                            <Plus className="w-4 h-4 mr-2" /> Novo Cargo
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{currentRole.id ? 'Editar Cargo' : 'Novo Cargo'}</CardTitle>
                            <CardDescription>Configure as permissões de acesso para este cargo.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nome do Cargo</Label>
                                        <Input
                                            placeholder="Ex: Segurança Chefe"
                                            value={currentRole.name}
                                            onChange={e => setCurrentRole({ ...currentRole, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Descrição</Label>
                                        <Input
                                            placeholder="Breve descrição da função"
                                            value={currentRole.description}
                                            onChange={e => setCurrentRole({ ...currentRole, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cor de Identificação (Crachá/Sistema)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={currentRole.color}
                                                className="w-12 h-10 p-1 cursor-pointer"
                                                onChange={e => setCurrentRole({ ...currentRole, color: e.target.value })}
                                            />
                                            <Input
                                                value={currentRole.color}
                                                onChange={e => setCurrentRole({ ...currentRole, color: e.target.value })}
                                                className="uppercase"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Permissões de Acesso
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Painel Administrativo</Label>
                                            <p className="text-sm text-gray-500">Acesso ao dashboard web para gerenciar eventos.</p>
                                        </div>
                                        <Switch
                                            checked={currentRole.permissions?.webDashboard}
                                            onCheckedChange={c => setCurrentRole({
                                                ...currentRole,
                                                permissions: { ...currentRole.permissions!, webDashboard: c }
                                            })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">App Validador</Label>
                                            <p className="text-sm text-gray-500">Pode ler QR Codes na entrada.</p>
                                        </div>
                                        <Switch
                                            checked={currentRole.permissions?.validatorApp}
                                            onCheckedChange={c => setCurrentRole({
                                                ...currentRole,
                                                permissions: { ...currentRole.permissions!, validatorApp: c }
                                            })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Sistema PDV</Label>
                                            <p className="text-sm text-gray-500">Acesso ao caixa para vendas.</p>
                                        </div>
                                        <Switch
                                            checked={currentRole.permissions?.posSystem}
                                            onCheckedChange={c => setCurrentRole({
                                                ...currentRole,
                                                permissions: { ...currentRole.permissions!, posSystem: c }
                                            })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Gerenciar Equipe</Label>
                                            <p className="text-sm text-gray-500">Pode adicionar e remover outros membros.</p>
                                        </div>
                                        <Switch
                                            checked={currentRole.permissions?.canManageStaff}
                                            onCheckedChange={c => setCurrentRole({
                                                ...currentRole,
                                                permissions: { ...currentRole.permissions!, canManageStaff: c }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    <X className="w-4 h-4 mr-2" /> Cancelar
                                </Button>
                                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                    <Save className="w-4 h-4 mr-2" /> Salvar Cargo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map(role => (
                            <Card key={role.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: role.color }}
                                        >
                                            {role.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                                                <Edit className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="mt-4">{role.name}</CardTitle>
                                    <CardDescription>{role.description || 'Sem descrição'}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Acessos Permitidos</p>
                                        <div className="flex flex-wrap gap-2">
                                            {role.permissions.webDashboard && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Dashboard</span>}
                                            {role.permissions.validatorApp && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">App Validador</span>}
                                            {role.permissions.posSystem && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">PDV</span>}
                                            {role.permissions.canManageStaff && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Gerência</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StaffRolesPage;
