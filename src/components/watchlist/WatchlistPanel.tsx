import { TrendingUp, TrendingDown, Star, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchlist';
import { Coin } from '@/types/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklineChart } from '@/components/market/SparklineChart';

interface WatchlistPanelProps {
  coins: Coin[];
  onSelectCoin: (coin: Coin) => void;
}

export const WatchlistPanel = ({ coins, onSelectCoin }: WatchlistPanelProps) => {
  const { data: watchlist = [] } = useWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const watchlistCoins = coins.filter((coin) =>
    watchlist.some((w) => w.currency.toUpperCase() === coin.symbol.toUpperCase())
  );

  if (watchlistCoins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg">No coins in watchlist</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Add coins to your watchlist to track them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          Watchlist
          <span className="text-sm font-normal text-muted-foreground">
            ({watchlistCoins.length} coins)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {watchlistCoins.map((coin, index) => (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => onSelectCoin(coin)}
              >
                <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                    <span className="text-sm text-muted-foreground truncate">{coin.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      ${coin.current_price.toLocaleString()}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-xs ${
                        coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="w-20 h-8 hidden sm:block">
                  {coin.sparkline_in_7d && (
                    <SparklineChart
                      data={coin.sparkline_in_7d.price}
                      positive={coin.price_change_percentage_24h >= 0}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCoin(coin);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-amber-500 hover:text-red-500"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await removeFromWatchlist.mutateAsync(coin.symbol);
                    }}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};
