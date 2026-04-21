import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Search, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft,
  Camera,
  User,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { staffService } from '@/services/staffService';
import { db } from '@/lib/offline-db';
import { useLiveQuery } from 'dexie-react-hooks';
import MainLayout from '@/components/layout/MainLayout';

const CheckInPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticket?: any;
    alreadyUsed?: boolean;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const lastScannedRef = useRef<string>('');
  const scanCooldownRef = useRef<boolean>(false);
  
  // Local tickets count for this event (simulated)
  const localTicketsCount = useLiveQuery(() => db.tickets.count()) || 0;
  const pendingSyncCount = useLiveQuery(() => db.tickets.where('synced').equals(0).count()) || 0;
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const audioSuccess = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"));
  const audioError = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3"));

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    // Auto-sync when coming back online
    if (isOnline && pendingSyncCount > 0) {
      handleSync();
    }

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(e => console.error("Failed to stop", e));
      }
    };
  }, [isOnline, pendingSyncCount, html5QrCode]);

  useEffect(() => {
    if (isAudioUnlocked) {
      // Pequeno delay para garantir que o React renderizou a div 'qr-reader'
      const timer = setTimeout(() => {
        const qrCodeInstance = new Html5Qrcode("qr-reader");
        
        qrCodeInstance.start(
          { facingMode: "environment" }, // Força a câmera traseira
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanFailure
        ).catch(err => {
          console.error("Erro ao iniciar câmera:", err);
          alert("Não foi possível iniciar a câmera. Verifique as permissões.");
        });

        setHtml5QrCode(qrCodeInstance);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAudioUnlocked]);

  const startScannerAndAudio = () => {
    // Unlocks audio context on mobile
    audioSuccess.current.volume = 0;
    audioSuccess.current.play().then(() => {
      audioSuccess.current.pause();
      audioSuccess.current.volume = 1;
      audioSuccess.current.currentTime = 0;
    }).catch(()=>{});

    audioError.current.volume = 0;
    audioError.current.play().then(() => {
      audioError.current.pause();
      audioError.current.volume = 1;
      audioError.current.currentTime = 0;
    }).catch(()=>{});

    setIsAudioUnlocked(true);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Anti-double-scan: ignora se estiver em cooldown ou se for o mesmo QR
    if (isLoading || scanCooldownRef.current) return;
    if (lastScannedRef.current === decodedText) return;
    
    scanCooldownRef.current = true;
    lastScannedRef.current = decodedText;
    setIsLoading(true);
    
    // Vibrate device if possible
    if (navigator.vibrate) navigator.vibrate(100);

    const result = await staffService.validateTicket(decodedText);
    setScanResult(result);
    setIsLoading(false);
    
    // Sons de Validação (Modo Polícia)
    if (result.success) {
      // Check-in realizado com sucesso
      audioSuccess.current.currentTime = 0;
      audioSuccess.current.play().catch(e => console.error("Erro ao tocar áudio sucesso:", e));
    } else if (result.alreadyUsed) {
      // Ingresso já foi utilizado — som neutro (não é fraude)
      audioSuccess.current.currentTime = 0;
      audioSuccess.current.play().catch(e => console.error("Erro ao tocar áudio:", e));
    } else {
      // Ingresso inválido / fraude — SIRENE!
      audioError.current.currentTime = 0;
      audioError.current.play().catch(e => console.error("Erro ao tocar sirene:", e));
    }
    
    // Cooldown de 5 segundos antes de aceitar outro scan
    setTimeout(() => {
      scanCooldownRef.current = false;
    }, 5000);
  };

  const onScanFailure = (error: any) => {
    // console.warn(`QR Code scan error: ${error}`);
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode) return;
    onScanSuccess(manualCode);
    setManualCode('');
  };

  const handleSync = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    const synced = await staffService.syncOfflineCheckins();
    setIsSyncing(false);
    if (synced > 0) {
      alert(`${synced} check-ins sincronizados com o servidor!`);
    }
  };

  const downloadEventData = async () => {
    if (!eventId) return;
    setIsLoading(true);
    const result = await staffService.syncEventTickets(eventId);
    setIsLoading(false);
    if (result.success) {
      alert(`${result.count} ingressos baixados para uso offline.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-10">
      {/* Header Fixo */}
      <div className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black uppercase tracking-widest text-indigo-400 leading-none">A2 Portaria</h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mt-1 truncate max-w-[150px]">Check-in em Tempo Real</p>
          </div>
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-6 space-y-6">
        {/* Sync Card */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
              <RefreshCw className={`w-6 h-6 text-white ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Banco de Dados Local</p>
              <p className="text-xl font-black text-white">{localTicketsCount} <span className="text-sm font-medium text-indigo-300/60 uppercase">Registros</span></p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             {pendingSyncCount > 0 && (
               <span className="text-[10px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest mb-1">
                 {pendingSyncCount} Pendentes
               </span>
             )}
             <button 
               onClick={isOnline ? handleSync : downloadEventData}
               className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
             >
               {isOnline ? 'Sincronizar Agora' : 'Baixar Lista'}
             </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="relative group">
           <div className="absolute inset-0 bg-indigo-600/5 blur-3xl group-hover:bg-indigo-600/10 transition-all"></div>
           <div className="relative bg-gray-900 border border-white/5 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
              {!isAudioUnlocked ? (
                <button 
                  onClick={startScannerAndAudio}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-sm px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-3"
                >
                  <Camera className="w-5 h-5" />
                  Iniciar Portaria Segura
                </button>
              ) : (
                <>
                  <div id="qr-reader" className="w-full rounded-[1.5rem] overflow-hidden border-2 border-white/5"></div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                    <Camera className="w-4 h-4" /> Posicione o QR Code no centro
                  </div>
                </>
              )}
           </div>
        </div>

        {/* Manual Input */}
        <form onSubmit={handleManualCheckIn} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="NOME, CPF OU CÓDIGO MANUAL..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="w-full bg-gray-900 border border-white/5 rounded-2xl pl-12 pr-4 py-4 font-black uppercase text-sm tracking-tighter focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </form>

        {/* Scan Result Overlay/Modal */}
        {scanResult && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl transform transition-all animate-in zoom-in duration-300 ${
              scanResult.success ? 'bg-green-600' : scanResult.alreadyUsed ? 'bg-amber-500' : 'bg-red-600'
            }`}>
              <div className="p-8 text-center space-y-6">
                 <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                    {scanResult.success ? (
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    ) : scanResult.alreadyUsed ? (
                      <Clock className="w-12 h-12 text-white" />
                    ) : (
                      <XCircle className="w-12 h-12 text-white" />
                    )}
                 </div>
                 
                 <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                      {scanResult.success ? 'Liberado!' : scanResult.alreadyUsed ? 'Já Entrou!' : 'Negado!'}
                    </h2>
                    <p className="text-white/80 font-bold uppercase text-xs tracking-widest">{scanResult.message}</p>
                 </div>

                 {scanResult.ticket && (
                   <div className="bg-black/10 rounded-3xl p-6 backdrop-blur flex flex-col items-center">
                      <div className="relative mb-4">
                        {scanResult.ticket.selfie_url ? (
                          <img 
                            src={scanResult.ticket.selfie_url} 
                            className="w-32 h-40 object-cover rounded-2xl border-4 border-white/30 shadow-xl" 
                            alt="Selfie Comprador" 
                          />
                        ) : (
                          <div className="w-32 h-40 bg-white/10 rounded-2xl flex items-center justify-center border-4 border-white/10">
                            <User className="w-12 h-12 text-white/40" />
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white text-gray-900 p-1.5 rounded-full shadow-lg">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xl font-black text-white uppercase tracking-tighter">{scanResult.ticket.buyer_name}</p>
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">{scanResult.ticket.ticket_name}</p>
                      <p className="text-xs font-mono text-white/40 mt-2">{scanResult.ticket.buyer_cpf}</p>
                   </div>
                 )}

                 <button 
                   onClick={() => {
                    setScanResult(null);
                    lastScannedRef.current = ''; // Permite re-escanear após fechar
                    scanCooldownRef.current = false;
                  }}
                   className="w-full bg-white text-gray-900 py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl active:scale-95 transition-transform"
                 >
                   Próximo Cliente
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
