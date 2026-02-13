
import React from 'react';
import { Link } from 'react-router-dom';
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
  // If variant is footer, we might want different colors or handle it via className prop

  return (
    <Link to="/" className={`flex items-center gap-2 font-bold tracking-tighter text-primary ${getTextSize()} ${className}`}>
      <Ticket className={`${getIconSize()}`} />
      {showText && !isCompact && <span>A2Tickets</span>}
      {isCompact && <span>A2Tickets</span>} {/* Compact mode can show text if needed, or adjust logic */}
    </Link>
  );
};

export default Logo;