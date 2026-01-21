import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Balance, Transaction, PriceAlert } from '@/types/crypto';

// Profile type (from profiles table)
export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = (userId: string | undefined) => {
  return useQuery<Profile | null>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
};

export const useBalances = (userId: string | undefined) => {
  return useQuery<Balance[]>({
    queryKey: ['balances', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useTransactions = (userId: string | undefined) => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Transaction[];
    },
    enabled: !!userId,
  });
};

export const usePriceAlerts = (userId: string | undefined) => {
  return useQuery<PriceAlert[]>({
    queryKey: ['price_alerts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as PriceAlert[];
    },
    enabled: !!userId,
  });
};

export const useExecuteTrade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      type,
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      priceAtTransaction,
    }: {
      userId: string;
      type: 'buy' | 'sell' | 'swap';
      fromCurrency: string;
      toCurrency: string;
      fromAmount: number;
      toAmount: number;
      priceAtTransaction: number;
    }) => {
      // Get current balances
      const { data: balances, error: balError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', userId);
      
      if (balError) throw balError;
      
      const fromBalance = balances?.find(b => b.currency.toUpperCase() === fromCurrency.toUpperCase());
      
      if (!fromBalance || fromBalance.amount < fromAmount) {
        throw new Error(`Insufficient ${fromCurrency} balance`);
      }
      
      // Update from balance
      const { error: updateFromError } = await supabase
        .from('balances')
        .update({ amount: fromBalance.amount - fromAmount })
        .eq('id', fromBalance.id);
      
      if (updateFromError) throw updateFromError;
      
      // Update or create to balance
      const toBalance = balances?.find(b => b.currency.toUpperCase() === toCurrency.toUpperCase());
      
      if (toBalance) {
        const { error: updateToError } = await supabase
          .from('balances')
          .update({ amount: toBalance.amount + toAmount })
          .eq('id', toBalance.id);
        
        if (updateToError) throw updateToError;
      } else {
        const { error: insertError } = await supabase
          .from('balances')
          .insert({
            user_id: userId,
            currency: toCurrency.toUpperCase(),
            amount: toAmount,
          });
        
        if (insertError) throw insertError;
      }
      
      // Record transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type,
          from_currency: fromCurrency.toUpperCase(),
          to_currency: toCurrency.toUpperCase(),
          from_amount: fromAmount,
          to_amount: toAmount,
          price_at_transaction: priceAtTransaction,
        });
      
      if (txError) throw txError;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useCreatePriceAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      currency,
      targetPrice,
      condition,
    }: {
      userId: string;
      currency: string;
      targetPrice: number;
      condition: 'above' | 'below';
    }) => {
      const { error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: userId,
          currency,
          target_price: targetPrice,
          condition,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price_alerts'] });
    },
  });
};

export const useDeletePriceAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price_alerts'] });
    },
  });
};
