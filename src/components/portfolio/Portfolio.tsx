import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Balance, Coin } from '@/types/crypto';
import { formatPrice, formatCryptoAmount } from '@/lib/formatters';

interface PortfolioProps {
  balances: Balance[];
  coins: Coin[];
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1'];

export const Portfolio = ({ balances, coins }: PortfolioProps) => {
  const getPortfolioValue = () => {
    return balances.reduce((total, balance) => {
      if (balance.currency === 'USDT') {
        return total + balance.amount;
      }
      const coin = coins.find(c => c.symbol.toUpperCase() === balance.currency.toUpperCase());
      return total + (coin ? balance.amount * coin.current_price : 0);
    }, 0);
  };

  const getPortfolioData = () => {
    return balances
      .map((balance) => {
        let value = 0;
        let change24h = 0;
        
        if (balance.currency === 'USDT') {
          value = balance.amount;
        } else {
          const coin = coins.find(c => c.symbol.toUpperCase() === balance.currency.toUpperCase());
          if (coin) {
            value = balance.amount * coin.current_price;
            change24h = coin.price_change_percentage_24h;
          }
        }
        
        return {
          currency: balance.currency,
          amount: balance.amount,
          value,
          change24h,
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const totalValue = getPortfolioValue();
  const portfolioData = getPortfolioData();

  const pieData = portfolioData.map((item, index) => ({
    name: item.currency,
    value: item.value,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Total Portfolio Value */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20">
              <Wallet className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-3xl font-bold">{formatPrice(totalValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Allocation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatPrice(value), 'Value']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No assets yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Holdings List */}
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.length > 0 ? (
                portfolioData.map((item, index) => {
                  const coin = coins.find(c => c.symbol.toUpperCase() === item.currency.toUpperCase());
                  return (
                    <div key={item.currency} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}
                        >
                          {coin ? (
                            <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                          ) : (
                            <span className="text-xs font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                              {item.currency[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.currency}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCryptoAmount(item.amount, item.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.value)}</p>
                        {item.currency !== 'USDT' && (
                          <div className={`flex items-center justify-end gap-1 text-xs ${item.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {item.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(item.change24h).toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">No holdings yet. Start trading!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
