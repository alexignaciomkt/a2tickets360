import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Loader2, RefreshCw } from 'lucide-react';
import { serviceCreditsService, ServiceCreditsResponse } from '@/services/serviceCreditsService';
import { FeaturedCreditsPurchaseModal } from '@/components/modals/FeaturedCreditsPurchaseModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const OrganizerCreditsAndServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [creditsData, setCreditsData] = useState<ServiceCreditsResponse | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const fetchCredits = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const data = await serviceCreditsService.getServiceCredits();
      setCreditsData(data);
      if (showToast) {
        toast({ title: 'Status Atualizado', description: 'O saldo de créditos foi atualizado.' });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      if (showToast) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o saldo.' });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCredits();
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { summary, credits } = creditsData || { 
    summary: { available: 0, reserved: 0, consumed: 0, cancelled: 0, total: 0 }, 
    credits: [] 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Créditos e Serviços</h2>
          <p className="text-slate-500 font-medium">Gerencie os créditos de serviços adquiridos pela sua produtora.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchCredits(true)}
          disabled={isRefreshing}
          className="rounded-xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-indigo-600 text-white overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Star className="w-48 h-48" />
          </div>
          
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="font-black text-xl uppercase tracking-widest flex items-center gap-2">
              <Star className="w-5 h-5 fill-current" />
              Créditos de Destaque
            </CardTitle>
            <CardDescription className="text-indigo-100 font-medium text-sm mt-2">
              Use seus créditos para colocar eventos em evidência nas principais áreas da A2Tickets360.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black tracking-tighter">{summary.available}</span>
              <span className="text-indigo-200 font-bold uppercase tracking-widest text-xs">Disponíveis</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-indigo-700/50 rounded-2xl p-4 border border-indigo-500/50">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Reservados</p>
                <p className="text-xl font-bold">{summary.reserved}</p>
              </div>
              <div className="bg-indigo-700/50 rounded-2xl p-4 border border-indigo-500/50">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Utilizados</p>
                <p className="text-xl font-bold">{summary.consumed}</p>
              </div>
            </div>

            <Button 
              onClick={() => setIsPurchaseModalOpen(true)}
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black uppercase tracking-widest rounded-xl py-6"
            >
              Comprar Créditos
            </Button>
          </CardContent>
        </Card>
      </div>

      {credits.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none rounded-3xl bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Star className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-700 uppercase tracking-tight mb-2">Você ainda não possui Créditos de Destaque.</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">Adquira créditos para utilizar nos seus próximos eventos e aumentar sua visibilidade.</p>
            <Button 
              onClick={() => setIsPurchaseModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl"
            >
              Comprar Créditos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-sm rounded-3xl mt-8">
          <CardHeader>
            <CardTitle className="font-black text-lg uppercase tracking-tight">Histórico de Créditos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {credits.map((credit) => (
                <div key={credit.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      credit.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' :
                      credit.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-600' :
                      credit.status === 'CONSUMED' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      <Star className={`w-5 h-5 ${credit.status === 'AVAILABLE' ? 'fill-current' : ''}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Crédito de Destaque</p>
                      <p className="text-xs text-slate-500">
                        Adquirido em {new Date(credit.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                      credit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                      credit.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' :
                      credit.status === 'CONSUMED' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {credit.status === 'AVAILABLE' ? 'Disponível' :
                       credit.status === 'RESERVED' ? 'Reservado' :
                       credit.status === 'CONSUMED' ? 'Utilizado' : 'Cancelado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <FeaturedCreditsPurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={() => fetchCredits(true)}
      />
    </div>
  );
};
