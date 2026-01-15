import { useQuery } from '@tanstack/react-query';
import { Coin, ChartData } from '@/types/crypto';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const useCoins = (page = 1, perPage = 100) => {
  return useQuery<Coin[]>({
    queryKey: ['coins', page, perPage],
    queryFn: async () => {
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=7d`
      );
      if (!response.ok) throw new Error('Failed to fetch coins');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
};

export const useCoinDetails = (coinId: string) => {
  return useQuery({
    queryKey: ['coin', coinId],
    queryFn: async () => {
      const response = await fetch(`${COINGECKO_API}/coins/${coinId}`);
      if (!response.ok) throw new Error('Failed to fetch coin details');
      return response.json();
    },
    enabled: !!coinId,
  });
};

export const useCoinChart = (coinId: string, days = 7) => {
  return useQuery<ChartData>({
    queryKey: ['chart', coinId, days],
    queryFn: async () => {
      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      if (!response.ok) throw new Error('Failed to fetch chart data');
      return response.json();
    },
    enabled: !!coinId,
  });
};

export const useGlobalData = () => {
  return useQuery({
    queryKey: ['global'],
    queryFn: async () => {
      const response = await fetch(`${COINGECKO_API}/global`);
      if (!response.ok) throw new Error('Failed to fetch global data');
      return response.json();
    },
    refetchInterval: 60000,
  });
};

export const useTrendingCoins = () => {
  return useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await fetch(`${COINGECKO_API}/search/trending`);
      if (!response.ok) throw new Error('Failed to fetch trending');
      return response.json();
    },
    refetchInterval: 120000,
  });
};
