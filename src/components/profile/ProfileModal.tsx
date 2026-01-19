import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Wallet, TrendingUp, Calendar, Award } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  totalBalance: number;
  holdingsCount: number;
  transactionsCount: number;
  joinDate: string;
}

export const ProfileModal = ({
  isOpen,
  onClose,
  username,
  totalBalance,
  holdingsCount,
  transactionsCount,
  joinDate,
}: ProfileModalProps) => {
  const formattedDate = new Date(joinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-3xl font-bold text-black">{username[0].toUpperCase()}</span>
            </div>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white">
              Active
            </Badge>
          </div>

          {/* Username */}
          <div className="text-center">
            <h3 className="text-2xl font-bold">{username}</h3>
            <p className="text-sm text-muted-foreground">Crypto Trader</p>
          </div>

          {/* Stats Grid */}
          <div className="grid w-full grid-cols-2 gap-3">
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-col items-center gap-1 p-4">
                <Wallet className="h-5 w-5 text-amber-500" />
                <span className="text-lg font-bold">{formatCurrency(totalBalance)}</span>
                <span className="text-xs text-muted-foreground">Total Balance</span>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-col items-center gap-1 p-4">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-lg font-bold">{holdingsCount}</span>
                <span className="text-xs text-muted-foreground">Holdings</span>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-col items-center gap-1 p-4">
                <Award className="h-5 w-5 text-purple-500" />
                <span className="text-lg font-bold">{transactionsCount}</span>
                <span className="text-xs text-muted-foreground">Trades</span>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-col items-center gap-1 p-4">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-xs font-medium text-center">{formattedDate}</span>
                <span className="text-xs text-muted-foreground">Member Since</span>
              </CardContent>
            </Card>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
