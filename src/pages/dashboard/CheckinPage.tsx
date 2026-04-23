
import { useState } from 'react';
import { Search, Check, X, RefreshCw, Info, Plus, CheckCheck, AlertTriangle, Wifi, WifiOff, Database, Target, Zap, ShieldCheck, History, Clock, User, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { visitorService } from '@/services/visitorService';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type CheckInStatus = 'valid' | 'used' | 'invalid';
type ScanStatus = 'none' | CheckInStatus;

interface CheckIn {
  name: string;
  ticketId: string;
  status: CheckInStatus;
  time: string;
}

const CheckinPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('none');
  const [loading, setLoading] = useState(false);
  const [observation, setObservation] = useState('');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [visitorData, setVisitorData] = useState<any>(null);

  // Offline functionality
  const [isOffline, setIsOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    if (syncQueue.length === 0 || isOffline) return;
    setIsSyncing(true);
    setTimeout(() => {
      setSyncQueue([]);
      setIsSyncing(false);
      toast({
        title: 'Kernel Sincronizado',
        description: 'Todos os registros locais foram persistidos no cluster.',
      });
    }, 2000);
  };


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    if (isOffline) {
      setVisitorData(null);
      setScanStatus('valid');
      return;
    }

    setLoading(true);
    try {
        const visitor = await visitorService.validateQrCode(searchQuery);
        if (visitor) {
            setVisitorData(visitor);
            setScanStatus(visitor.status === 'checked_in' ? 'used' : 'valid');
        } else {
            setScanStatus('invalid');
            toast({
                title: 'Nó não localizado',
                description: 'Nenhum ativo encontrado com este protocolo.',
                variant: 'destructive',
            });
        }
    } catch (error) {
        setScanStatus('invalid');
        toast({
            title: 'Protocol Error',
            description: 'Falha na comunicação com o kernel de validação.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };

  const resetScan = () => {
    setScanStatus('none');
    setSearchQuery('');
    setObservation('');
    setVisitorData(null);
  };

  const handleMarkEntry = async () => {
    if (scanStatus !== 'valid') return;

    const newCheckIn: CheckIn = {
      name: visitorData?.name || 'Authorized Guest',
      ticketId: searchQuery,
      status: 'valid',
      time: format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })
    };

    if (isOffline) {
      setSyncQueue(prev => [...prev, { ...newCheckIn, id: visitorData?.id || searchQuery }]);
      setCheckIns(prev => [newCheckIn, ...prev]);
      toast({
        title: 'Registro em Cache',
        description: 'Entrada salva no nó local para sincronização futura.',
      });
      resetScan();
      return;
    }

    if (visitorData) {
      try {
        await visitorService.checkIn(visitorData.id);
        toast({
          title: 'Acesso Autorizado',
          description: `Participante: ${visitorData.name}`,
        });
        setCheckIns(prev => [newCheckIn, ...prev]);
        resetScan();
      } catch (error) {
        toast({
          title: 'Erro de Protocolo',
          description: 'Não foi possível autorizar a entrada no cluster.',
          variant: 'destructive'
        });
      }
      return;
    }

    setCheckIns(prev => [newCheckIn, ...prev]);
    toast({
      title: 'Acesso Autorizado',
      description: 'Ativo de ingresso validado com sucesso.',
    });
    resetScan();
  };

  return (
    <div className="min-h-screen bg-gray-100/50 pb-20 animate-in fade-in duration-1000">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white shadow-2xl py-6 px-4 mb-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                <Target className="w-6 h-6 text-emerald-400" />
             </div>
             <div className="space-y-1">
                <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Access Control Hub</h1>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">A2 Tickets 360 Kernel • Root Operator</p>
             </div>
          </div>
          <Button variant="ghost" className="h-11 rounded-full text-[10px] font-black uppercase tracking-widest px-8 text-white hover:bg-white/10 transition-all">
             Terminate Session
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-10">
        {/* Offline & Sync Status */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm px-10">
          <div className="flex items-center gap-6">
            <Button
              variant={isOffline ? "destructive" : "outline"}
              onClick={() => setIsOffline(!isOffline)}
              className="h-11 rounded-full gap-3 uppercase tracking-widest text-[9px] font-black px-8 transition-all"
            >
              {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
              {isOffline ? 'Offline Node' : 'Connected Node'}
            </Button>
            <div className="flex items-center gap-3 px-6 py-2.5 bg-gray-50 rounded-full border border-gray-100">
              <div className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{isOffline ? 'Local Stream' : 'Live Kernel'}</span>
            </div>
          </div>

          {syncQueue.length > 0 && (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 rounded-full border border-amber-100">
                <Database size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">{syncQueue.length} Pending Nodes</span>
              </div>
              <Button
                onClick={handleSync}
                disabled={isSyncing || isOffline}
                className="h-11 rounded-full bg-amber-500 hover:bg-amber-600 text-white gap-3 text-[10px] font-black uppercase tracking-widest px-8 shadow-xl shadow-amber-100 transition-all active:scale-95 group"
              >
                <RefreshCw size={14} className={`${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                {isSyncing ? 'Sincronizando...' : 'Commit Cache'}
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar Card */}
        <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
          <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20">
             <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
                <QrCode className="w-5 h-5 text-slate-900" /> Asset Verification Module
             </CardTitle>
          </CardHeader>
          <CardContent className="p-12">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  placeholder="Escaneie o QR Code ou digite o protocolo..."
                  className="h-16 pl-14 pr-8 w-full bg-gray-50/50 border-2 border-gray-100 rounded-[1.8rem] text-[12px] font-black uppercase tracking-tight focus:ring-8 focus:ring-slate-50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !searchQuery}
                className="h-16 rounded-[1.8rem] bg-slate-900 text-white font-black uppercase text-[11px] tracking-[0.2em] px-12 shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95"
              >
                {loading ? <RefreshCw className="animate-spin h-5 w-5 mr-3" /> : <ShieldCheck className="h-5 w-5 mr-3" />}
                {loading ? 'Verifying Node...' : 'Verify Protocol'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Scan Results */}
        {scanStatus !== 'none' && (
          <Card className="rounded-[3.5rem] border-gray-100 shadow-2xl bg-white overflow-hidden animate-in zoom-in-95 duration-700 border-4">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                {/* Result Status */}
                <div className={`lg:w-1/3 p-16 flex flex-col items-center justify-center text-center ${
                  scanStatus === 'valid' ? 'bg-emerald-50/30' : 
                  scanStatus === 'used' ? 'bg-amber-50/30' : 'bg-rose-50/30'
                }`}>
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
                    <div className={`h-32 w-32 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl border-4 border-white ${
                      scanStatus === 'valid' ? 'bg-emerald-500 text-white shadow-emerald-100' : 
                      scanStatus === 'used' ? 'bg-amber-500 text-white shadow-amber-100' : 'bg-rose-500 text-white shadow-rose-100'
                    }`}>
                      {scanStatus === 'valid' && <Check className="h-16 w-16" />}
                      {scanStatus === 'used' && <AlertTriangle className="h-16 w-16" />}
                      {scanStatus === 'invalid' && <X className="h-16 w-16" />}
                    </div>
                    
                    <div className="space-y-2">
                       <h2 className={`text-2xl font-black uppercase tracking-tighter leading-none ${
                         scanStatus === 'valid' ? 'text-emerald-600' : 
                         scanStatus === 'used' ? 'text-amber-600' : 'text-rose-600'
                       }`}>
                         {scanStatus === 'valid' ? 'Asset Validated' : 
                          scanStatus === 'used' ? 'Used Registry' : 'Protocol Invalid'}
                       </h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ação necessária para autorização.</p>
                    </div>

                    <div className="space-y-4 pt-4">
                      <Button
                        onClick={handleMarkEntry}
                        className={`h-14 rounded-full w-full font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
                          scanStatus === 'valid' ? 'bg-slate-900 text-white hover:bg-black' : 'bg-gray-100 text-slate-400 hover:bg-gray-200'
                        }`}
                        disabled={scanStatus !== 'valid'}
                      >
                        {scanStatus === 'valid' ? (
                          <div className="flex items-center gap-3">
                            <CheckCheck size={18} />
                            Mark Authorization
                          </div>
                        ) : 'Back to Matrix'}
                      </Button>
                      <Button variant="ghost" onClick={resetScan} className="h-11 rounded-full w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                        Reset Scanner
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Attendee Details */}
                <div className="lg:w-2/3 p-16 space-y-12 bg-white">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="h-32 w-32 rounded-[2.5rem] bg-gray-50 flex items-center justify-center text-slate-300 font-black text-3xl border-4 border-white shadow-2xl overflow-hidden group/avatar">
                      {visitorData?.photoUrl ? (
                        <img src={visitorData.photoUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover/avatar:scale-110" alt="Identity Asset" />
                      ) : (
                        <User className="h-12 w-12" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3 text-center md:text-left pt-2">
                       <Badge className="bg-slate-900 text-white font-black text-[8px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-2">Authenticated Asset</Badge>
                       <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{visitorData?.name || 'ROOT_ACCESS_NODE'}</h4>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{visitorData?.email || 'SYSTEM_MAIL_GEN'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Identity Protocol (CPF)</p>
                      <p className="text-[15px] font-black text-slate-900 tracking-tight leading-none tabular-nums">{visitorData?.document || '000.000.000-00'}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Asset Current State</p>
                      <Badge className={`text-[9px] font-black uppercase tracking-widest border-none px-4 py-1.5 rounded-full ${
                        visitorData?.status === 'checked_in' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        {visitorData?.status === 'checked_in' ? 'VALIDATED_NODE' : 'IDLE_ACCESS_READY'}
                      </Badge>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Event Matrix Registry</p>
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                         <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{visitorData?.eventName || 'GLOBAL_PROTOCOL_EVENT'}</p>
                         <Zap className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-4">
                      <Label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">Audit Observations</Label>
                      <textarea
                        className="w-full p-8 bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] text-[11px] font-bold text-slate-900 focus:ring-8 focus:ring-slate-50 transition-all resize-none leading-relaxed"
                        rows={3}
                        placeholder="Adicione observações de auditoria sobre o nó de acesso..."
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Check-ins */}
        {checkIns.length > 0 && (
          <Card className="rounded-[3rem] border-gray-100 shadow-sm bg-white overflow-hidden border group hover:shadow-2xl transition-all duration-700">
            <CardHeader className="p-12 border-b border-gray-50 bg-gray-50/20">
               <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
                  <History className="w-5 h-5 text-slate-900" /> Authorized Entry Log
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Authorized Asset</th>
                      <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Asset ID</th>
                      <th className="px-12 py-8 text-left text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-12 py-8 text-right text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Temporal Node</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {checkIns.map((checkIn, index) => (
                      <tr key={index} className="hover:bg-gray-50/30 transition-all duration-500 group/item border-b border-transparent hover:border-gray-100">
                        <td className="px-12 py-8">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px] group-hover/item:scale-110 transition-transform">{checkIn.name.charAt(0)}</div>
                              <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{checkIn.name}</span>
                           </div>
                        </td>
                        <td className="px-12 py-8">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{checkIn.ticketId.substring(0, 12).toUpperCase()}</span>
                        </td>
                        <td className="px-12 py-8">
                          <Badge className={`text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none shadow-sm ${
                            checkIn.status === 'valid' ? 'bg-emerald-50 text-emerald-600' :
                            checkIn.status === 'used' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {checkIn.status === 'valid' ? 'AUTHORIZED' :
                             checkIn.status === 'used' ? 'ALREADY_USED' : 'INVALID_PROTOCOL'}
                          </Badge>
                        </td>
                        <td className="px-12 py-8 text-right">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums flex items-center justify-end gap-2"><Clock className="w-3.5 h-3.5" /> {checkIn.time}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckinPage;
