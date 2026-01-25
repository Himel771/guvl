import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { Coin } from '@/types/crypto';

interface PriceData {
  price: number;
  priceChange24h: number;
  previousPrice?: number;
  direction: 'up' | 'down' | 'neutral';
  lastUpdate: number;
}

interface RealTimePriceContextType {
  prices: Map<string, PriceData>;
  isConnected: boolean;
  getPrice: (symbol: string) => PriceData | undefined;
  getEnhancedCoin: (coin: Coin) => Coin;
}

const RealTimePriceContext = createContext<RealTimePriceContextType | undefined>(undefined);

export const useRealTimePrices = () => {
  const context = useContext(RealTimePriceContext);
  if (!context) {
    throw new Error('useRealTimePrices must be used within a RealTimePriceProvider');
  }
  return context;
};

interface RealTimePriceProviderProps {
  children: ReactNode;
  symbols: string[];
}

export const RealTimePriceProvider = ({ children, symbols }: RealTimePriceProviderProps) => {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const previousPricesRef = useRef<Map<string, number>>(new Map());

  const connect = useCallback(() => {
    if (symbols.length === 0) return;

    // Convert symbols to Binance format (e.g., BTC -> btcusdt)
    const binanceSymbols = symbols
      .filter(s => s.toUpperCase() !== 'USDT' && s.toUpperCase() !== 'USDC')
      .slice(0, 50) // Binance limits streams
      .map(s => `${s.toLowerCase()}usdt@ticker`)
      .join('/');

    if (!binanceSymbols) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${binanceSymbols}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Binance WebSocket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const data = message.data;
        
        if (data && data.s && data.c) {
          const symbol = data.s.replace('USDT', '').toUpperCase();
          const newPrice = parseFloat(data.c);
          const priceChange24h = parseFloat(data.P);
          const previousPrice = previousPricesRef.current.get(symbol);
          
          let direction: 'up' | 'down' | 'neutral' = 'neutral';
          if (previousPrice !== undefined) {
            if (newPrice > previousPrice) direction = 'up';
            else if (newPrice < previousPrice) direction = 'down';
          }
          
          previousPricesRef.current.set(symbol, newPrice);
          
          setPrices(prev => {
            const newMap = new Map(prev);
            newMap.set(symbol, {
              price: newPrice,
              priceChange24h,
              previousPrice,
              direction,
              lastUpdate: Date.now(),
            });
            return newMap;
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    ws.onerror = (error) => {
      console.error('Binance WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Binance WebSocket closed');
      setIsConnected(false);
      
      // Attempt to reconnect
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... attempt ${reconnectAttemptsRef.current}`);
          connect();
        }, Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000));
      }
    };
  }, [symbols]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const getPrice = useCallback((symbol: string): PriceData | undefined => {
    return prices.get(symbol.toUpperCase());
  }, [prices]);

  // Enhance a coin with real-time price data
  const getEnhancedCoin = useCallback((coin: Coin): Coin => {
    const realtimeData = prices.get(coin.symbol.toUpperCase());
    if (realtimeData) {
      return {
        ...coin,
        current_price: realtimeData.price,
        price_change_percentage_24h: realtimeData.priceChange24h,
      };
    }
    return coin;
  }, [prices]);

  return (
    <RealTimePriceContext.Provider
      value={{
        prices,
        isConnected,
        getPrice,
        getEnhancedCoin,
      }}
    >
      {children}
    </RealTimePriceContext.Provider>
  );
};
