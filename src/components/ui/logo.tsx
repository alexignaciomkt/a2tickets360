import React from 'react';
import { Ticket } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'compact' | 'footer' | 'large';
  className?: string;
  showText?: boolean;
}

const Logo = ({
  variant = 'default',
  className = '',
  showText = true
}: LogoProps) => {
  const getIconSize = () => {
    switch (variant) {
      case 'compact': return 'w-6 h-6';
      case 'footer': return 'w-10 h-10';
      case 'large': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case 'compact': return 'text-lg';
      case 'footer': return 'text-4xl';
      case 'large': return 'text-5xl';
      default: return 'text-2xl';
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-center gap-2 font-bold tracking-tighter text-primary ${getTextSize()} ${className}`}>
      <img src="/assets/logo.png" alt="A2 Tickets 360º" className={`${getIconSize()} object-contain`} />
      {showText && !isCompact && <span>A2 Tickets 360º</span>}
      {isCompact && <span>A2</span>}
    </div>
  );
};

export default Logo;
