import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction, Coin } from '@/types/crypto';
import { formatPrice, formatCryptoAmount, timeAgo } from '@/lib/formatters';

interface TransactionHistoryProps {
  transactions: Transaction[];
  coins: Coin[];
}

export const TransactionHistory = ({ transactions, coins }: TransactionHistoryProps) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownLeft className="h-4 w-4" />;
      case 'sell':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'swap':
        return <ArrowRightLeft className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-emerald-500/20 text-emerald-500';
      case 'sell':
        return 'bg-red-500/20 text-red-500';
      case 'swap':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const fromCoin = coins.find(c => c.symbol.toUpperCase() === tx.from_currency.toUpperCase());
              const toCoin = coins.find(c => c.symbol.toUpperCase() === tx.to_currency.toUpperCase());
              
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getTransactionColor(tx.type)}`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {tx.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{timeAgo(tx.created_at)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          {fromCoin && <img src={fromCoin.image} alt="" className="h-4 w-4 rounded-full" />}
                          <span>{formatCryptoAmount(tx.from_amount, tx.from_currency)}</span>
                        </div>
                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                        <div className="flex items-center gap-1">
                          {toCoin && <img src={toCoin.image} alt="" className="h-4 w-4 rounded-full" />}
                          <span>{formatCryptoAmount(tx.to_amount, tx.to_currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <p className="font-medium">{formatPrice(tx.price_at_transaction)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-medium">No Transactions Yet</h3>
            <p className="text-sm text-muted-foreground">
              Your trade history will appear here after you make your first trade.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
