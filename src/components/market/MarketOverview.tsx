import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Coin } from '@/types/crypto';

interface MarketOverviewProps {
  coins: Coin[];
  globalData: any;
}

export const MarketOverview = ({ coins, globalData }: MarketOverviewProps) => {
  const topGainers = [...coins]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 3);

  const topLosers = [...coins]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 3);

  const totalMarketCap = globalData?.data?.total_market_cap?.usd || 0;
  const totalVolume = globalData?.data?.total_volume?.usd || 0;
  const marketCapChange = globalData?.data?.market_cap_change_percentage_24h_usd || 0;

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
              <DollarSign className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-xl font-bold">{formatCurrency(totalMarketCap)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p className="text-xl font-bold">{formatCurrency(totalVolume)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Change</p>
              <p className={`text-xl font-bold ${marketCapChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatPercentage(marketCapChange)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Coins</p>
              <p className="text-xl font-bold">{coins.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gainers & Losers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">Top Gainers (24h)</h3>
            </div>
            <div className="space-y-3">
              {topGainers.map((coin) => (
                <div key={coin.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                    <div>
                      <p className="font-medium">{coin.symbol.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{coin.name}</p>
                    </div>
                  </div>
                  <span className="font-medium text-emerald-500">
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">Top Losers (24h)</h3>
            </div>
            <div className="space-y-3">
              {topLosers.map((coin) => (
                <div key={coin.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                    <div>
                      <p className="font-medium">{coin.symbol.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{coin.name}</p>
                    </div>
                  </div>
                  <span className="font-medium text-red-500">
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
