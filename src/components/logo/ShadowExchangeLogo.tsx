import { cn } from '@/lib/utils';

interface ShadowExchangeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ShadowExchangeLogo = ({ size = 'md', animated = false, className }: ShadowExchangeLogoProps) => {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={cn(sizeClasses[size], animated && 'animate-logo-pulse', className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Definitions for gradients */}
        <defs>
          {/* Main shield gradient - dark purple to black */}
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270, 50%, 25%)" />
            <stop offset="50%" stopColor="hsl(270, 60%, 15%)" />
            <stop offset="100%" stopColor="hsl(0, 0%, 5%)" />
          </linearGradient>
          
          {/* Amber/Gold accent gradient */}
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(45, 93%, 58%)" />
            <stop offset="50%" stopColor="hsl(38, 92%, 50%)" />
            <stop offset="100%" stopColor="hsl(25, 95%, 53%)" />
          </linearGradient>
          
          {/* Glow effect */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Drop shadow */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="hsl(0, 0%, 0%)" floodOpacity="0.5"/>
          </filter>
        </defs>
        
        {/* Shield shape background */}
        <path
          d="M50 5 L90 20 L90 50 C90 75 70 90 50 95 C30 90 10 75 10 50 L10 20 Z"
          fill="url(#shieldGradient)"
          filter="url(#shadow)"
        />
        
        {/* Inner shield border with amber accent */}
        <path
          d="M50 10 L85 23 L85 50 C85 72 67 85 50 90 C33 85 15 72 15 50 L15 23 Z"
          fill="none"
          stroke="url(#accentGradient)"
          strokeWidth="1.5"
          opacity="0.6"
        />
        
        {/* Stylized "S" letter */}
        <g filter="url(#glow)">
          <path
            d="M62 28 
               C62 28 55 25 48 25 
               C38 25 32 31 32 38 
               C32 45 38 48 48 50 
               C58 52 68 56 68 65 
               C68 74 60 78 50 78 
               C40 78 32 74 32 74"
            fill="none"
            stroke="url(#accentGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* Decorative shadow lines */}
        <path
          d="M25 35 L30 35"
          stroke="url(#accentGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M70 65 L75 65"
          stroke="url(#accentGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};
