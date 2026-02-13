
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
        return { bg: 'bg-red-50', iconColor: 'text-red-600' };
      case 'medium':
        return { bg: 'bg-yellow-50', iconColor: 'text-yellow-600' };
      case 'low':
      default:
        return { bg: 'bg-gray-50', iconColor: 'text-gray-600' };
    }
  };

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Alertas de Segurança
        </CardTitle>
        <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {alertCount} novos alertas
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const { bg, iconColor } = getSeverityStyles(alert.severity);
            const Icon = alert.icon || AlertTriangle;
            
            return (
              <div key={index} className={`flex items-center justify-between ${bg} p-3 rounded-lg`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${iconColor} mt-1`} />
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-600">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Ver</Button>
              </div>
            );
          })}
        </div>
        
        <Button 
          className="w-full mt-4" 
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
