import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealTimePrices } from '@/contexts/RealTimePriceContext';
import { formatPrice } from '@/lib/formatters';

interface LivePriceCellProps {
  symbol: string;
  fallbackPrice: number;
}

export const LivePriceCell = ({ symbol, fallbackPrice }: LivePriceCellProps) => {
  const { getPrice } = useRealTimePrices();
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  
  const priceData = getPrice(symbol);
  const currentPrice = priceData?.price ?? fallbackPrice;
  const direction = priceData?.direction ?? 'neutral';

  useEffect(() => {
    if (direction !== 'neutral') {
      setFlash(direction);
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [priceData?.lastUpdate, direction]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentPrice}
        initial={{ opacity: 0.7 }}
        animate={{ 
          opacity: 1,
          color: flash === 'up' ? 'rgb(16, 185, 129)' : flash === 'down' ? 'rgb(239, 68, 68)' : undefined
        }}
        transition={{ duration: 0.3 }}
        className={`font-medium tabular-nums transition-colors duration-300 ${
          flash === 'up' ? 'text-emerald-500' : flash === 'down' ? 'text-red-500' : ''
        }`}
      >
        {formatPrice(currentPrice)}
      </motion.span>
    </AnimatePresence>
  );
};
