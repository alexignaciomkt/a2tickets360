
import React from 'react';
import { AlertTriangle, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AlertItemProps {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low'; // high = red, medium = yellow, low = gray
  icon?: LucideIcon;
}

interface AlertCardProps {
  alertCount: number;
  alerts: AlertItemProps[];
  onViewAllClick: () => void;
}

const AlertCard = ({ alertCount, alerts, onViewAllClick }: AlertCardProps) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bg: 'bg-red-50/50', iconColor: 'text-red-600', borderColor: 'border-red-100' };
      case 'medium':
        return { bg: 'bg-yellow-50/50', iconColor: 'text-yellow-600', borderColor: 'border-yellow-100' };
      case 'low':
      default:
        return { bg: 'bg-gray-50/50', iconColor: 'text-gray-600', borderColor: 'border-gray-100' };
    }
  };

  return (
    <Card className="col-span-1 md:col-span-3 border-gray-100 shadow-sm rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50 bg-gray-50/30">
        <CardTitle className="flex items-center text-sm font-black uppercase tracking-tighter text-slate-800">
          <AlertTriangle className="w-4 h-4 mr-2 text-rose-500" />
          Alertas de Segurança
        </CardTitle>
        <div className="bg-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-200 shadow-sm">
          {alertCount} novos alertas
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const { bg, iconColor, borderColor } = getSeverityStyles(alert.severity);
            const Icon = alert.icon || AlertTriangle;
            
            return (
              <div key={index} className={`flex items-center justify-between ${bg} border ${borderColor} p-4 rounded-2xl hover:brightness-95 transition-all group`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl ${bg} border ${borderColor} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-tight text-slate-900 leading-none mb-1">{alert.title}</h4>
                    <p className="text-[9px] font-bold uppercase tracking-tight text-slate-500 leading-tight">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" className="h-8 w-12 rounded-full font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-white transition-all">Ver</Button>
              </div>
            );
          })}
        </div>
        
        <Button 
          className="w-full h-10 mt-6 rounded-full font-black text-[10px] uppercase tracking-widest bg-white border-gray-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm" 
          variant="outline" 
          onClick={onViewAllClick}
        >
          Ver Todos os Alertas
        </Button>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
