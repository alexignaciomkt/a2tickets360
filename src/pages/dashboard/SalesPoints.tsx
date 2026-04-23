
import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Store, Users, DollarSign, Clock, CreditCard, User, Hash, Zap, ChevronRight, Search, Target, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PDVModal } from '@/components/modals/PDVModal';
import { SalesPoint } from '@/interfaces/staff';

const SalesPoints = () => {
  const { toast } = useToast();
  const [salesPoints, setSalesPoints] = useState<SalesPoint[]>([
    {
      id: '1',
      name: 'Loja Central',
      address: 'Rua Principal, 123 - Centro',
      manager: 'João Silva',
      phone: '(11) 99999-9999',
      email: 'joao@lojacentral.com',
      commission: 10,
      compensationType: 'percentage',
      compensationValue: 8,
      status: 'active',
      totalSales: 25000,
      ticketsSold: 150,
      cardMachines: [
        {
          id: '1',
          serialNumber: 'MC123456',
          model: 'Moderninha Pro',
          responsiblePerson: 'João Silva',
          responsiblePhone: '(11) 99999-9999'
        }
      ],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Shopping Norte',
      address: 'Av. Norte, 456 - Shopping Norte',
      manager: 'Maria Santos',
      phone: '(11) 88888-8888',
      email: 'maria@shoppingnorte.com',
      commission: 8,
      compensationType: 'fixed',
      compensationValue: 500,
      status: 'active',
      totalSales: 18500,
      ticketsSold: 95,
      cardMachines: [
        {
          id: '2',
          serialNumber: 'MC789012',
          model: 'Point Pro',
          responsiblePerson: 'Maria Santos',
          responsiblePhone: '(11) 88888-8888'
        },
        {
          id: '3',
          serialNumber: 'MC345678',
          model: 'Moderninha Smart',
          responsiblePerson: 'Carlos Oliveira',
          responsiblePhone: '(11) 77777-7777'
        }
      ],
      createdAt: '2024-01-20'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdvModalOpen, setPdvModalOpen] = useState(false);
  const [editingPdv, setEditingPdv] = useState<SalesPoint | undefined>();

  const filteredSalesPoints = salesPoints.filter(point =>
    point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSalesPoint = () => {
    setEditingPdv(undefined);
    setPdvModalOpen(true);
  };

  const handleEditSalesPoint = (point: SalesPoint) => {
    setEditingPdv(point);
    setPdvModalOpen(true);
  };

  const handleDeleteSalesPoint = (pointId: string) => {
    if (confirm('Tem certeza que deseja remover este ponto de venda?')) {
      setSalesPoints(salesPoints.filter(point => point.id !== pointId));
      toast({
        title: 'Status Sincronizado',
        description: 'Ponto de venda removido do ecossistema.',
      });
    }
  };

  const getCompensationDisplay = (point: SalesPoint) => {
    switch (point.compensationType) {
      case 'percentage':
        return `${point.compensationValue}%`;
      case 'fixed':
        return `R$ ${point.compensationValue.toFixed(2)}`;
      case 'per_ticket':
        return `R$ ${point.compensationValue.toFixed(2)}/un`;
      default:
        return `${point.compensationValue}%`;
    }
  };

  const totalSales = salesPoints.reduce((sum, point) => sum + point.totalSales, 0);
  const totalTickets = salesPoints.reduce((sum, point) => sum + point.ticketsSold, 0);
  const activePoints = salesPoints.filter(point => point.status === 'active').length;
  const totalMachines = salesPoints.reduce((sum, point) => sum + point.cardMachines.length, 0);

  const QuickStat = ({ title, value, sub, icon: Icon, color }: any) => (
    <Card className="rounded-[2rem] border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-700">
      <CardContent className="p-7 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">{title}</p>
          <h3 className="text-xl font-black tracking-tighter text-slate-900 leading-none tabular-nums">{value}</h3>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-1">{sub}</p>
        </div>
        <div className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-white/10 ${
          color === 'indigo' ? 'bg-slate-900 text-white shadow-lg' : 
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
          color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <DashboardLayout userType="organizer">
        <div className="space-y-10 animate-in fade-in duration-1000 pb-16">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
             <div className="space-y-1.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">POS Network (PDV)</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                  Gestão de rede de pontos de venda, terminais de pagamento e performance física.
                </p>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="relative group">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                   <Input
                     placeholder="Search POS nodes..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-64 h-11 pl-12 pr-6 bg-white border-gray-100 rounded-full shadow-sm text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-slate-50 transition-all border-2"
                   />
                </div>
                <Button 
                  onClick={handleAddSalesPoint}
                  className="h-11 rounded-full bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-10 shadow-2xl shadow-slate-100 transition-all hover:scale-105 active:scale-95 group"
                >
                  <Plus className="h-4 w-4 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                  Novo POS Node
                </Button>
             </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <QuickStat title="Active Nodes" value={activePoints} sub={`of ${salesPoints.length} total`} icon={Store} color="indigo" />
            <QuickStat title="Gross Volume" value={`R$ ${totalSales.toLocaleString('pt-BR')}`} sub="current cycle" icon={DollarSign} color="emerald" />
            <QuickStat title="Issued Units" value={totalTickets} sub="physical tickets" icon={Users} color="amber" />
            <QuickStat title="Avg Node Value" value={`R$ ${totalTickets > 0 ? Math.round(totalSales / totalTickets) : 0}`} sub="per asset" icon={Target} color="slate" />
            <QuickStat title="Terminals" value={totalMachines} sub="card machines" icon={CreditCard} color="rose" />
          </div>

          {/* Sales Points Table */}
          <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
            <CardHeader className="p-10 border-b border-gray-50 bg-gray-50/20 px-12 py-8">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">POS Inventory Registry</CardTitle>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Node Sync Live</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-12 py-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Node Identity</TableHead>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Geo Node</th>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Manager Node</th>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Protocol</th>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Terminals</th>
                    <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Performance</th>
                    <th className="px-12 py-8 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Audit</th>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {filteredSalesPoints.map((point) => (
                    <TableRow key={point.id} className="hover:bg-gray-50/30 transition-all duration-500 group/item cursor-pointer border-b border-transparent hover:border-gray-100">
                      <TableCell className="px-12 py-8">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-[1.2rem] bg-slate-900 text-white flex items-center justify-center shadow-xl border border-white/10 group-hover/item:scale-110 transition-transform">
                              <Store className="w-6 h-6" />
                           </div>
                           <div className="space-y-1">
                              <div className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{point.name}</div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none tabular-nums">NODE_ID: {point.id.padStart(4, '0')}</div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-12 py-8">
                        <div className="flex items-center gap-3">
                           <MapPin className="h-4 w-4 text-rose-400" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none max-w-[150px] truncate">{point.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-12 py-8">
                        <div className="space-y-1.5">
                           <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{point.manager}</div>
                           <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">{point.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-12 py-8">
                        <Badge className="bg-slate-900 text-white border-none font-black text-[8px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">{getCompensationDisplay(point)}</Badge>
                      </TableCell>
                      <TableCell className="px-12 py-8">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100"><CreditCard className="w-4 h-4" /></div>
                           <span className="text-[11px] font-black text-slate-900 tabular-nums">{point.cardMachines.length} Units</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-12 py-8">
                        <div className="space-y-2">
                           <div className="text-[12px] font-black text-slate-900 tracking-tight leading-none tabular-nums">R$ {point.totalSales.toLocaleString('pt-BR')}</div>
                           <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none flex items-center gap-1.5"><Zap className="w-3 h-3" /> {point.ticketsSold} Assets</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-12 py-8 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSalesPoint(point)}
                            className="h-10 w-10 rounded-full p-0 text-slate-200 hover:text-slate-900 hover:bg-gray-100 transition-all"
                          >
                            <Edit className="h-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSalesPoint(point.id)}
                            className="h-10 w-10 rounded-full p-0 text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="h-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSalesPoints.length === 0 && (
                <div className="text-center py-40 group/empty">
                  <div className="w-24 h-24 rounded-[3rem] bg-gray-50 border-4 border-dashed border-gray-100 flex items-center justify-center mx-auto mb-10 group-hover/empty:scale-110 transition-transform">
                     <Store className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] mb-2 leading-none">Zero POS Nodes Located</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 leading-none">
                    Comece adicionando seu primeiro ponto de venda autorizado ao cluster.
                  </p>
                  <Button onClick={handleAddSalesPoint} className="h-12 rounded-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-10 shadow-2xl shadow-slate-100">
                    <Plus className="h-4 w-4 mr-3" />
                    Initialize POS Node
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

      <PDVModal
        open={pdvModalOpen}
        onOpenChange={setPdvModalOpen}
        pdv={editingPdv}
        onSuccess={() => {
          setPdvModalOpen(false);
          loadDashboardData(); // This is just a placeholder as this component is mostly mock
        }}
      />
    </>
  );
};

export default SalesPoints;
