import { useState } from 'react';
import { Menu, X, Wallet, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  username: string;
  totalBalance: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

export const Header = ({ username, totalBalance, activeTab, onTabChange, alertCount }: HeaderProps) => {
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
            <span className="text-lg font-bold text-black">₿</span>
          </div>
          <span className="text-xl font-bold tracking-tight">CryptoSim</span>
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
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-xs font-bold text-black">{username[0].toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium">{username}</span>
            </div>
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
                <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-black">{username[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium">{username}</p>
                    <p className="text-sm text-muted-foreground">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
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
