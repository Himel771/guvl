import { useState } from 'react';
import { Menu, X, Wallet, Bell, Star, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShadowExchangeLogo } from '@/components/logo/ShadowExchangeLogo';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { Coin } from '@/types/crypto';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  username: string;
  totalBalance: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
  onProfileClick: () => void;
  onWalletClick: () => void;
  coins: Coin[];
  onSelectCoin: (coin: Coin) => void;
}

export const Header = ({ 
  username, 
  totalBalance, 
  activeTab, 
  onTabChange, 
  alertCount, 
  onProfileClick,
  onWalletClick,
  coins,
  onSelectCoin,
}: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const navItems = [
    { id: 'markets', label: 'Markets' },
    { id: 'trade', label: 'Trade' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'history', label: 'History' },
    { id: 'alerts', label: 'Alerts' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <ShadowExchangeLogo size="sm" />
          <span className="text-xl font-bold tracking-tight hidden sm:inline">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Shadow</span>
            <span className="text-foreground"> Exchange</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTabChange(item.id)}
              className="relative"
            >
              {item.icon && <item.icon className="h-4 w-4 mr-1" />}
              {item.label}
              {item.id === 'alerts' && alertCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {alertCount}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden items-center gap-4 xl:flex">
          <GlobalSearch coins={coins} onSelectCoin={onSelectCoin} />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeSelector />
          
          <div className="hidden items-center gap-3 md:flex">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onWalletClick}
              className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5 hover:bg-secondary transition-colors"
            >
              <Wallet className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </motion.button>
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-secondary/50 cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-xs font-bold text-black">{username[0].toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium hidden lg:inline">{username}</span>
            </button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-6 flex flex-col gap-4">
                <button
                  onClick={() => {
                    onProfileClick();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-black">{username[0].toUpperCase()}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{username}</p>
                    <p className="text-sm text-muted-foreground">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    onWalletClick();
                    setIsOpen(false);
                  }}
                >
                  <Wallet className="h-4 w-4 mr-2 text-amber-500" />
                  Wallet
                </Button>

                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'secondary' : 'ghost'}
                      className="justify-start"
                      onClick={() => {
                        onTabChange(item.id);
                        setIsOpen(false);
                      }}
                    >
                      {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                      {item.label}
                      {item.id === 'alerts' && alertCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {alertCount}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </nav>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
