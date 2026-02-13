
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
    <Card className="col-span-1 md:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Icon className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          {description}
        </p>
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{stat.label}</span>
              <span className="font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" onClick={onButtonClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FunctionCard;
