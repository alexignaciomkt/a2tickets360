
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StatItemProps {
  label: string;
  value: string | number;
}

interface FunctionCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  stats: StatItemProps[];
  buttonText: string;
  onButtonClick: () => void;
}

const FunctionCard = ({ 
  title, 
  icon: Icon, 
  description, 
  stats, 
  buttonText, 
  onButtonClick 
}: FunctionCardProps) => {
  return (
    <Card className="col-span-1 border-gray-100 shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
      <CardHeader className="pb-2 border-b border-gray-50 bg-gray-50/30">
        <CardTitle className="flex items-center text-sm font-black uppercase tracking-tighter text-slate-800">
          <Icon className="w-4 h-4 mr-2 text-indigo-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400 mb-6 leading-tight">
          {description}
        </p>
        <div className="space-y-3 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-gray-50 pb-2 last:border-0 last:pb-0">
              <span className="text-slate-400">{stat.label}</span>
              <span className="text-slate-900">{stat.value}</span>
            </div>
          ))}
        </div>
        <Button 
          variant="outline"
          className="w-full h-9 rounded-full font-black text-[9px] uppercase tracking-widest border-gray-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm" 
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FunctionCard;
