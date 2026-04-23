
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SystemModuleProps {
  title: string;
  icon: LucideIcon;
  description: string;
  url: string;
  onNavigate: (url: string) => void;
}

interface SystemCardProps {
  title: string;
  icon: LucideIcon;
  modules: SystemModuleProps[];
}

const SystemCard = ({ 
  title, 
  icon: Icon, 
  modules 
}: SystemCardProps) => {
  return (
    <Card className="col-span-1 md:col-span-3 border-gray-100 shadow-sm rounded-[2.5rem] overflow-hidden">
      <CardHeader className="pb-2 border-b border-gray-50 bg-gray-50/30">
        <CardTitle className="flex items-center text-sm font-black uppercase tracking-tighter text-slate-800">
          <Icon className="w-4 h-4 mr-2 text-indigo-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const ModuleIcon = module.icon;
            return (
              <div key={index} className="bg-white border border-gray-50 rounded-2xl p-5 hover:bg-gray-50 transition-colors group">
                <h3 className="text-[10px] font-black uppercase tracking-tight mb-3 flex items-center text-slate-900 leading-none">
                  <ModuleIcon className="w-3.5 h-3.5 mr-2 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                  {module.title}
                </h3>
                <p className="text-[9px] font-bold uppercase tracking-tight text-slate-400 mb-6 leading-tight">
                  {module.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-8 rounded-full font-black text-[9px] uppercase tracking-widest border-gray-100 bg-white group-hover:bg-white transition-all shadow-sm" 
                  onClick={() => module.onNavigate(module.url)}
                >
                  Visualizar
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemCard;
