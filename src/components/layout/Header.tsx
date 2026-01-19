import { useState } from 'react';
import { Menu, X, Wallet, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShadowExchangeLogo } from '@/components/logo/ShadowExchangeLogo';

interface HeaderProps {
  username: string;
  totalBalance: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
  onProfileClick: () => void;
}

export const Header = ({ username, totalBalance, activeTab, onTabChange, alertCount, onProfileClick }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'markets', label: 'Markets' },
    { id: 'trade', label: 'Trade' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'history', label: 'History' },
    { id: 'alerts', label: 'Alerts' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <ShadowExchangeLogo size="sm" />
          <span className="text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Shadow</span>
            <span className="text-foreground"> Exchange</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTabChange(item.id)}
              className="relative"
            >
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
        <div className="hidden items-center gap-4 lg:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search coins..."
              className="w-64 pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5">
              <Wallet className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-secondary/50 cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-xs font-bold text-black">{username[0].toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium">{username}</span>
            </button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
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
                      {item.label}
                      {item.id === 'alerts' && alertCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {alertCount}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
