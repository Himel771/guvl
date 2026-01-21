import { useEffect, useState, useRef, useCallback } from 'react';

interface PriceUpdate {
  symbol: string;
  price: number;
  priceChange24h: number;
}

interface BinanceTickerData {
  s: string; // Symbol
  c: string; // Last price
  P: string; // Price change percent
}

export const useBinanceWebSocket = (symbols: string[]) => {
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (symbols.length === 0) return;

    // Convert symbols to Binance format (e.g., BTC -> btcusdt)
    const binanceSymbols = symbols
      .filter(s => s.toUpperCase() !== 'USDT')
      .map(s => `${s.toLowerCase()}usdt@ticker`)
      .join('/');

    if (!binanceSymbols) return;

    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${binanceSymbols}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const data = message.data as BinanceTickerData;
        
        if (data && data.s && data.c) {
          const symbol = data.s.replace('USDT', '');
          setPrices(prev => {
            const newMap = new Map(prev);
            newMap.set(symbol, {
              symbol,
              price: parseFloat(data.c),
              priceChange24h: parseFloat(data.P),
            });
            return newMap;
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      
      // Attempt to reconnect
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
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

  const getPrice = useCallback((symbol: string): PriceUpdate | undefined => {
    return prices.get(symbol.toUpperCase());
  }, [prices]);

  return { prices, isConnected, getPrice };
};

// Hook for a single coin's real-time price
export const useBinancePrice = (symbol: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol || symbol.toUpperCase() === 'USDT') return;

    const binanceSymbol = `${symbol.toLowerCase()}usdt@ticker`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as BinanceTickerData;
        if (data.c) setPrice(parseFloat(data.c));
        if (data.P) setPriceChange(parseFloat(data.P));
      } catch (e) {
        // Ignore parse errors
      }
    };

    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, [symbol]);

  return { price, priceChange, isConnected };
};
