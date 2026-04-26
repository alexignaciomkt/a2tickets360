
import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ChevronRight, 
  Image as ImageIcon, 
  MapPin, 
  AlignLeft, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Event } from '@/services/eventService';

interface ProducerAssistantProps {
  event: Event | null;
  onNavigate: (tab: string) => void;
}

const ProducerAssistant: React.FC<ProducerAssistantProps> = ({ event, onNavigate }) => {
  if (!event) return null;

  const checklist = [
    { 
      id: 'banner', 
      label: 'Capa do Evento', 
      completed: !!(event.heroImageUrl || event.bannerUrl),
      points: 25,
      target: 'info'
    },
    { 
      id: 'description', 
      label: 'Descrição Detalhada', 
      completed: event.description?.length > 50,
      points: 25,
      target: 'info'
    },
    { 
      id: 'location', 
      label: 'Mapa e Localização', 
      completed: !!(event.location?.address),
      points: 20,
      target: 'info'
    },
    { 
      id: 'faq', 
      label: 'Dúvidas Frequentes (FAQ)', 
      completed: false, // Simulando verificação
      points: 15,
      target: 'faq'
    },
    { 
      id: 'tickets', 
      label: 'Configuração de Ingressos', 
      completed: event.tickets?.length > 0,
      points: 15,
      target: 'tickets'
    }
  ];

  const score = checklist.reduce((acc, item) => item.completed ? acc + item.points : acc, 0);

  return (
    <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-white/5 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
      
      <div className="relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Assistente de Página</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">IA de Otimização 360</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-white leading-none">{score}%</span>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Pontuação Final</p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={score} className="h-3 bg-white/10 rounded-full" indicatorClassName="bg-indigo-500 rounded-full" />
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Faltam {100 - score}% para a vitrine perfeita</p>
            {score < 100 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>Melhore a conversão</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {checklist.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                item.completed 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => onNavigate(item.target)}
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
                <span className={`text-xs font-black uppercase tracking-tight ${item.completed ? 'text-emerald-500/80' : 'text-slate-300'}`}>
                  {item.label}
                </span>
              </div>
              {!item.completed && (
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-all group-hover:translate-x-1" />
              )}
            </div>
          ))}
        </div>

        {score === 100 ? (
          <div className="bg-indigo-600 rounded-2xl p-5 text-center shadow-lg shadow-indigo-600/20">
             <p className="text-white font-black text-xs uppercase tracking-widest">Sua página está impecável!</p>
             <p className="text-white/60 text-[10px] font-bold mt-1 uppercase">Pronta para converter 3x mais</p>
          </div>
        ) : (
          <Button 
            className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl"
            onClick={() => onNavigate('info')}
          >
            Completar agora
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProducerAssistant;
