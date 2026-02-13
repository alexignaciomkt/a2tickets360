
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
    <Card className="col-span-1 md:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Icon className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map((module, index) => {
            const ModuleIcon = module.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <ModuleIcon className="w-4 h-4 mr-2" />
                  {module.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {module.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
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
