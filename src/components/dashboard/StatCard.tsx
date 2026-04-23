
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, iconColor, iconBgColor, className = "" }: StatCardProps) => {
  return (
    <Card className={`rounded-[2rem] border-gray-100 shadow-sm ${className}`}>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">{title}</p>
          <h3 className="text-lg font-black tracking-tighter text-slate-900 leading-none">{value}</h3>
        </div>
        <div className={`rounded-2xl p-2.5 ${iconBgColor} bg-opacity-20`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
