
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Eye, Clock, Filter, Bell, CheckCircle, Info, MoreHorizontal, ShieldAlert, Zap, Search, ShieldCheck, Target, Database, Cpu, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: string;
  type: 'fraud' | 'suspicious' | 'security' | 'information';
  title: string;
  description: string;
  date: string;
  status: 'new' | 'pending' | 'resolved';
}

const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'fraud',
    title: 'Asset Duplication Detected',
    description: 'Múltiplas tentativas de uso do mesmo QR code em locais diferentes identificadas para o "Festival de Verão". Protocolo de contenção ativado no nó central.',
    date: '2025-01-15T14:32:00',
    status: 'new'
  },
  {
    id: 'alert-002',
    type: 'suspicious',
    title: 'Unauthorized Node Access',
    description: 'Tentativas de login incomuns na conta do organizador "Festas Premium" detectadas em IP internacional. Conta sob monitoramento e bloqueio parcial.',
    date: '2025-01-14T09:15:00',
    status: 'pending'
  },
  {
    id: 'alert-003',
    type: 'security',
    title: 'Brute Force Mitigation',
    description: 'Múltiplas tentativas consecutivas de login bloqueadas pelo firewall Master em massa de contas. IP banido permanentemente do cluster global.',
    date: '2025-01-12T22:48:00',
    status: 'resolved'
  },
  {
    id: 'alert-004',
    type: 'information',
    title: 'Cluster Scaling Event',
    description: 'O evento "Show Nacional" registrou pico de 15k acessos/sec. Recursos de infraestrutura escalados automaticamente pelo Kernel Alpha.',
    date: '2025-01-10T18:05:00',
    status: 'resolved'
  },
  {
    id: 'alert-005',
    type: 'fraud',
    title: 'Batch Ticket Cloning',
    description: 'Sistema identificou tentativa de clonagem massiva de ingressos para a "Festa de Réveillon". Bloqueio de sub-rede executado por protocolo de segurança.',
    date: '2025-01-08T10:22:00',
    status: 'pending'
  },
];

const AlertsPage = () => {
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(mockAlerts);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filterByStatus = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredAlerts(mockAlerts);
    } else {
      setFilteredAlerts(mockAlerts.filter(alert => alert.status === status));
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fraud':
        return <ShieldAlert className="h-7 w-7 text-rose-500" />;
      case 'suspicious':
        return <Eye className="h-7 w-7 text-amber-500" />;
      case 'security':
        return <Shield className="h-7 w-7 text-slate-900" />;
      case 'information':
        return <Info className="h-7 w-7 text-indigo-500" />;
      default:
        return <AlertTriangle className="h-7 w-7 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
        
        {/* Root Alert Monitor Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 px-4">
           <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Root Alert Hierarchy Monitor</h1>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 max-w-2xl leading-none">
                Auditoria protocolar de ameaças, prevenção atômica de fraudes e monitoramento de atividades críticas do kernel Ticketera.
              </p>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex bg-white p-2 rounded-full border-2 border-gray-100 shadow-sm transition-all hover:shadow-2xl">
                {[
                  { id: 'all', label: 'All Incidents' },
                  { id: 'new', label: 'Critical Node' },
                  { id: 'pending', label: 'Audit Wait' },
                  { id: 'resolved', label: 'Resolved' }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === tab.id ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-900'}`}
                    onClick={() => filterByStatus(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
           </div>
        </div>
        
        <div className="grid grid-cols-1 gap-10 px-2">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <Card key={alert.id} className="bg-white border-gray-100 shadow-sm rounded-[3.5rem] overflow-hidden group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-1000 border-2 border-l-[16px] hover:scale-[1.02]" style={{ 
                borderLeftColor: alert.status === 'new' ? '#f43f5e' : alert.status === 'pending' ? '#f59e0b' : '#0f172a'
              }}>
                <CardContent className="p-10">
                  <div className="flex items-start gap-12">
                    <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center shrink-0 border-4 border-white transition-all group-hover:scale-110 group-hover:rotate-6 shadow-[0_30px_60px_rgba(0,0,0,0.15)] ${
                      alert.type === 'fraud' ? 'bg-rose-50 border-rose-100' : 
                      alert.type === 'suspicious' ? 'bg-amber-50 border-amber-100' : 
                      alert.type === 'security' ? 'bg-slate-900 border-slate-800' : 'bg-indigo-50 border-indigo-100'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-grow space-y-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                        <div className="space-y-3">
                           <div className="flex items-center gap-5">
                              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none group-hover:text-slate-900 transition-colors">{alert.title}</h3>
                              <Badge className={`text-[9px] font-black uppercase tracking-[0.4em] border-none px-5 py-2 rounded-full shadow-sm ${
                                alert.status === 'new' ? 'bg-rose-500 text-white animate-pulse' : 
                                alert.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-900 text-white'
                              }`}>
                                {alert.status === 'new' ? 'CRITICAL_ALPHA_NODE' : alert.status === 'pending' ? 'WAITING_DEEP_AUDIT' : 'RESOLVED_MATRIX_ASSET'}
                              </Badge>
                           </div>
                           <div className="flex items-center gap-6">
                              <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-3 tabular-nums">
                                <Clock className="h-4 w-4 opacity-40" />
                                {formatDate(alert.date)}
                              </span>
                              <div className="w-px h-4 bg-gray-100" />
                              <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] tabular-nums">NODE_HASH: {alert.id.toUpperCase()}</span>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <Button variant="ghost" size="sm" className="h-14 rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-900 hover:bg-gray-100 px-10 transition-all group/inspect">
                              Deep Inspect <ChevronRight className="w-4 h-4 ml-3 group-hover/inspect:translate-x-2 transition-transform" />
                           </Button>
                           {alert.status !== 'resolved' && (
                             <Button size="sm" className="h-14 rounded-full bg-slate-900 text-white font-black uppercase text-[11px] tracking-[0.4em] px-12 hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 group/btn border-4 border-slate-800">
                                <CheckCircle className="w-5 h-5 mr-4 group-hover/btn:scale-125 transition-transform" />
                                Resolve Node
                             </Button>
                           )}
                        </div>
                      </div>
                      <p className="text-[14px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed max-w-4xl">{alert.description}</p>
                    </div>
                    
                    <div className="shrink-0 pt-4 opacity-20 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" className="h-14 w-14 rounded-full p-0 text-slate-300 hover:text-slate-900 hover:bg-gray-100 transition-all hover:scale-110">
                          <MoreHorizontal className="w-8 h-8" />
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-48 bg-gray-50/20 rounded-[4.5rem] border-4 border-dashed border-gray-100 animate-in zoom-in-95 duration-1500 group">
              <div className="w-36 h-36 rounded-[4rem] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] flex items-center justify-center mb-12 relative overflow-hidden group-hover:scale-110 group-hover:rotate-6 transition-all border-4 border-gray-50">
                 <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                 <ShieldCheck className="h-16 w-16 text-emerald-500 relative z-10" />
              </div>
              <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-[0.4em] mb-4 leading-none">Zero Critical Nodes Detected</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none opacity-60">
                Kernel status: <span className="text-emerald-500">Optimized</span>. Nenhuma anomalia identificada nos logs do cluster Alpha.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
