import { useState } from 'react';
import { ArrowUpDown, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Coin } from '@/types/crypto';
import { formatPrice, formatCurrency, formatPercentage, formatNumber } from '@/lib/formatters';
import { SparklineChart } from './SparklineChart';

interface CoinTableProps {
  coins: Coin[];
  onSelectCoin: (coin: Coin) => void;
}

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';

export const CoinTable = ({ coins, onSelectCoin }: CoinTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredCoins = coins
    .filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return (aVal - bVal) * modifier;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search coins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <p className="text-sm text-muted-foreground">
          Showing {filteredCoins.length} of {coins.length} coins
        </p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('current_price')} className="h-8 px-2">
                    Price <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('price_change_percentage_24h')} className="h-8 px-2">
                    24h % <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('market_cap')} className="h-8 px-2">
                    Market Cap <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Button variant="ghost" size="sm" onClick={() => handleSort('total_volume')} className="h-8 px-2">
                    Volume (24h) <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="hidden xl:table-cell w-32">Last 7 Days</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoins.map((coin) => (
                <TableRow 
                  key={coin.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectCoin(coin)}
                >
                  <TableCell className="font-medium">{coin.market_cap_rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                      <div>
                        <p className="font-medium">{coin.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(coin.current_price)}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatCurrency(coin.market_cap)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatCurrency(coin.total_volume)}</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {coin.sparkline_in_7d && (
                      <SparklineChart 
                        data={coin.sparkline_in_7d.price} 
                        positive={coin.price_change_percentage_24h >= 0}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCoin(coin);
                      }}
                    >
                      Trade
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
