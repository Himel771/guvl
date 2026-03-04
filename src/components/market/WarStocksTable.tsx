import { useState } from 'react';
import { ArrowUpDown, Shield, Cpu, Fuel, Pickaxe, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { warStocks, warStockSectors, type WarStock, type WarStockSector } from '@/data/warStocks';

const sectorIcons: Record<WarStockSector, React.ReactNode> = {
  Defense: <Shield className="h-4 w-4" />,
  Cybersecurity: <Cpu className="h-4 w-4" />,
  Energy: <Fuel className="h-4 w-4" />,
  Mining: <Pickaxe className="h-4 w-4" />,
  Shipping: <Ship className="h-4 w-4" />,
};

const sectorColors: Record<WarStockSector, string> = {
  Defense: 'bg-red-500/10 text-red-500 border-red-500/20',
  Cybersecurity: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Energy: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Mining: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Shipping: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

type SortKey = 'ticker' | 'name' | 'sector';

export const WarStocksTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSector, setActiveSector] = useState<WarStockSector | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('sector');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredStocks = warStocks
    .filter((stock) => {
      const matchesSearch =
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = activeSector === 'All' || stock.sector === activeSector;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return a[sortKey].localeCompare(b[sortKey]) * modifier;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredStocks.length} of {warStocks.length} stocks
          </p>
        </div>
      </div>

      {/* Sector filter chips */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeSector === 'All' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setActiveSector('All')}
        >
          All ({warStocks.length})
        </Badge>
        {warStockSectors.map((sector) => {
          const count = warStocks.filter((s) => s.sector === sector).length;
          return (
            <Badge
              key={sector}
              variant={activeSector === sector ? 'default' : 'outline'}
              className={`cursor-pointer gap-1 ${activeSector !== sector ? sectorColors[sector] : ''}`}
              onClick={() => setActiveSector(sector)}
            >
              {sectorIcons[sector]}
              {sector} ({count})
            </Badge>
          );
        })}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">#</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('ticker')} className="h-8 px-2">
                    Ticker <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="h-8 px-2">
                    Company <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort('sector')} className="h-8 px-2">
                    Sector <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Exchange</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>24h Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock, index) => (
                <TableRow key={stock.ticker} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <span className="font-mono font-bold">{stock.ticker}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{stock.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-1 ${sectorColors[stock.sector]}`}>
                      {sectorIcons[stock.sector]}
                      {stock.sector}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {stock.exchange || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">N/A</TableCell>
                  <TableCell className="text-muted-foreground">N/A</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
