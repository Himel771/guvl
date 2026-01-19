import { ShadowExchangeLogo } from '@/components/logo/ShadowExchangeLogo';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="animate-logo-fade-in">
          <div className="relative">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full scale-150" />
            <ShadowExchangeLogo size="lg" animated className="relative z-10" />
          </div>
        </div>
        
        {/* Brand name with staggered animation */}
        <div className="animate-logo-fade-in-delayed">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Shadow
            </span>
            <span className="text-foreground"> Exchange</span>
          </h1>
        </div>
        
        {/* Loading indicator */}
        <div className="animate-logo-fade-in-more-delayed flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        
        {/* Shimmer effect line */}
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent animate-shimmer overflow-hidden" />
      </div>
    </div>
  );
};
