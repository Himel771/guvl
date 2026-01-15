import { useState, useEffect } from 'react';
import { ArrowRightLeft, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Coin, Balance } from '@/types/crypto';
import { formatPrice, formatCryptoAmount } from '@/lib/formatters';
import { PriceChart } from './PriceChart';

interface TradePanelProps {
  selectedCoin: Coin | null;
  coins: Coin[];
  balances: Balance[];
  userId: string;
  onTrade: (params: {
    userId: string;
    type: 'buy' | 'sell' | 'swap';
    fromCurrency: string;
    toCurrency: string;
    fromAmount: number;
    toAmount: number;
    priceAtTransaction: number;
  }) => Promise<void>;
}

export const TradePanel = ({ selectedCoin, coins, balances, userId, onTrade }: TradePanelProps) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState(selectedCoin?.id || 'bitcoin');
  const { toast } = useToast();

  const coin = coins.find(c => c.id === selectedCoinId) || selectedCoin || coins[0];
  
  const usdtBalance = balances.find(b => b.currency === 'USDT')?.amount || 0;
  const coinBalance = balances.find(b => b.currency.toUpperCase() === coin?.symbol.toUpperCase())?.amount || 0;

  useEffect(() => {
    if (selectedCoin) {
      setSelectedCoinId(selectedCoin.id);
    }
  }, [selectedCoin]);

  const calculateReceive = () => {
    if (!amount || !coin) return 0;
    const numAmount = parseFloat(amount);
    if (tradeType === 'buy') {
      return numAmount / coin.current_price;
    }
    return numAmount * coin.current_price;
  };

  const handleTrade = async () => {
    if (!amount || !coin) return;
    
    const numAmount = parseFloat(amount);
    const receiveAmount = calculateReceive();

    if (tradeType === 'buy' && numAmount > usdtBalance) {
      toast({
        title: 'Insufficient USDT',
        description: `You need ${numAmount} USDT but only have ${usdtBalance.toFixed(2)} USDT`,
        variant: 'destructive',
      });
      return;
    }

    if (tradeType === 'sell' && numAmount > coinBalance) {
      toast({
        title: `Insufficient ${coin.symbol.toUpperCase()}`,
        description: `You need ${numAmount} ${coin.symbol.toUpperCase()} but only have ${coinBalance.toFixed(8)}`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onTrade({
        userId,
        type: tradeType,
        fromCurrency: tradeType === 'buy' ? 'USDT' : coin.symbol.toUpperCase(),
        toCurrency: tradeType === 'buy' ? coin.symbol.toUpperCase() : 'USDT',
        fromAmount: numAmount,
        toAmount: receiveAmount,
        priceAtTransaction: coin.current_price,
      });

      toast({
        title: 'Trade Successful!',
        description: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${formatCryptoAmount(tradeType === 'buy' ? receiveAmount : numAmount, coin.symbol)} at ${formatPrice(coin.current_price)}`,
      });
      setAmount('');
    } catch (error: any) {
      toast({
        title: 'Trade Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!coin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Select a coin to trade</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Coin Selector & Price Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {coins.slice(0, 50).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <img src={c.image} alt={c.name} className="h-5 w-5 rounded-full" />
                        <span>{c.symbol.toUpperCase()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <p className="text-2xl font-bold">{formatPrice(coin.current_price)}</p>
                <div className={`flex items-center gap-1 text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}% (24h)
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">24h High</p>
                <p className="font-medium text-emerald-500">{formatPrice(coin.high_24h)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">24h Low</p>
                <p className="font-medium text-red-500">{formatPrice(coin.low_24h)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <PriceChart coinId={coin.id} />

      {/* Trade Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Trade {coin.symbol.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                Sell
              </TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Amount (USDT)</Label>
                  <span className="text-xs text-muted-foreground">
                    Available: {usdtBalance.toFixed(2)} USDT
                  </span>
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <Button
                      key={pct}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setAmount((usdtBalance * pct / 100).toFixed(2))}
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You will receive</span>
                  <span className="font-medium">
                    ≈ {formatCryptoAmount(calculateReceive(), coin.symbol)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleTrade}
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
              >
                {isLoading ? 'Processing...' : `Buy ${coin.symbol.toUpperCase()}`}
              </Button>
            </TabsContent>
            <TabsContent value="sell" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Amount ({coin.symbol.toUpperCase()})</Label>
                  <span className="text-xs text-muted-foreground">
                    Available: {coinBalance.toFixed(8)} {coin.symbol.toUpperCase()}
                  </span>
                </div>
                <Input
                  type="number"
                  placeholder="0.00000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <Button
                      key={pct}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setAmount((coinBalance * pct / 100).toFixed(8))}
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You will receive</span>
                  <span className="font-medium">
                    ≈ ${calculateReceive().toFixed(2)} USDT
                  </span>
                </div>
              </div>
              <Button
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={handleTrade}
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
              >
                {isLoading ? 'Processing...' : `Sell ${coin.symbol.toUpperCase()}`}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
