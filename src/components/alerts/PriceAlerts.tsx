import { useState } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PriceAlert, Coin } from '@/types/crypto';
import { formatPrice, timeAgo } from '@/lib/formatters';

interface PriceAlertsProps {
  alerts: PriceAlert[];
  coins: Coin[];
  userId: string;
  onCreateAlert: (params: {
    userId: string;
    currency: string;
    targetPrice: number;
    condition: 'above' | 'below';
  }) => Promise<void>;
  onDeleteAlert: (alertId: string) => Promise<void>;
}

export const PriceAlerts = ({ alerts, coins, userId, onCreateAlert, onDeleteAlert }: PriceAlertsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!targetPrice) return;
    
    setIsLoading(true);
    try {
      await onCreateAlert({
        userId,
        currency: selectedCoin,
        targetPrice: parseFloat(targetPrice),
        condition,
      });
      toast({
        title: 'Alert Created',
        description: `You'll be notified when ${selectedCoin.toUpperCase()} goes ${condition} ${formatPrice(parseFloat(targetPrice))}`,
      });
      setIsOpen(false);
      setTargetPrice('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create alert',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      await onDeleteAlert(alertId);
      toast({
        title: 'Alert Deleted',
        description: 'Price alert has been removed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete alert',
        variant: 'destructive',
      });
    }
  };

  const activeAlerts = alerts.filter(a => a.is_active);
  const triggeredAlerts = alerts.filter(a => !a.is_active);

  return (
    <div className="space-y-6">
      {/* Create Alert Button */}
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Cryptocurrency</Label>
                <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coins.slice(0, 50).map((coin) => (
                      <SelectItem key={coin.id} value={coin.id}>
                        <div className="flex items-center gap-2">
                          <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full" />
                          <span>{coin.name}</span>
                          <span className="text-muted-foreground">({coin.symbol.toUpperCase()})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as 'above' | 'below')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <span>Price goes above</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="below">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span>Price goes below</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Price (USD)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
                {selectedCoin && (
                  <p className="text-xs text-muted-foreground">
                    Current price: {formatPrice(coins.find(c => c.id === selectedCoin)?.current_price || 0)}
                  </p>
                )}
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={isLoading || !targetPrice}>
                {isLoading ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts ({activeAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => {
                const coin = coins.find(c => c.id === alert.currency);
                const currentPrice = coin?.current_price || 0;
                const isClose = Math.abs((currentPrice - alert.target_price) / alert.target_price) < 0.05;
                
                return (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${isClose ? 'border-amber-500/50 bg-amber-500/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {coin && <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.currency.toUpperCase()}</span>
                          <Badge variant={alert.condition === 'above' ? 'default' : 'secondary'}>
                            {alert.condition === 'above' ? (
                              <TrendingUp className="mr-1 h-3 w-3" />
                            ) : (
                              <TrendingDown className="mr-1 h-3 w-3" />
                            )}
                            {alert.condition}
                          </Badge>
                          {isClose && <Badge variant="outline" className="text-amber-500 border-amber-500">Close!</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Target: {formatPrice(alert.target_price)} • Current: {formatPrice(currentPrice)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(alert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-medium">No Active Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Create price alerts to get notified when coins hit your targets.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              Triggered Alerts ({triggeredAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {triggeredAlerts.map((alert) => {
                const coin = coins.find(c => c.id === alert.currency);
                return (
                  <div key={alert.id} className="flex items-center justify-between rounded-lg border border-dashed p-4 opacity-60">
                    <div className="flex items-center gap-4">
                      {coin && <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" />}
                      <div>
                        <span className="font-medium">{alert.currency.toUpperCase()}</span>
                        <p className="text-sm text-muted-foreground">
                          Target: {formatPrice(alert.target_price)} • Triggered {alert.triggered_at ? timeAgo(alert.triggered_at) : ''}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(alert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
