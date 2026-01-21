import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddToWatchlist, useRemoveFromWatchlist, useIsInWatchlist } from '@/hooks/useWatchlist';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface WatchlistButtonProps {
  symbol: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'ghost' | 'outline' | 'default';
}

export const WatchlistButton = ({ 
  symbol, 
  size = 'icon',
  variant = 'ghost' 
}: WatchlistButtonProps) => {
  const isInWatchlist = useIsInWatchlist(symbol);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync(symbol);
        toast.success(`${symbol.toUpperCase()} removed from watchlist`);
      } else {
        await addToWatchlist.mutateAsync(symbol);
        toast.success(`${symbol.toUpperCase()} added to watchlist`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update watchlist');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
      className={isInWatchlist ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}
    >
      <motion.div
        initial={false}
        animate={isInWatchlist ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Star className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
      </motion.div>
    </Button>
  );
};
