import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MarketOverview } from '@/components/market/MarketOverview';
import { CoinTable } from '@/components/market/CoinTable';
import { TradePanel } from '@/components/trade/TradePanel';
import { Portfolio } from '@/components/portfolio/Portfolio';
import { TransactionHistory } from '@/components/history/TransactionHistory';
import { PriceAlerts } from '@/components/alerts/PriceAlerts';
import { useCoins, useGlobalData } from '@/hooks/useCryptoData';
import { 
  useUser, 
  useBalances, 
  useTransactions, 
  usePriceAlerts,
  useExecuteTrade,
  useCreatePriceAlert,
  useDeletePriceAlert,
} from '@/hooks/useUserData';
import { Coin } from '@/types/crypto';

const USERNAME = 'shadowHimel';

const Index = () => {
  const [activeTab, setActiveTab] = useState('markets');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  // Fetch crypto data
  const { data: coins = [], isLoading: coinsLoading } = useCoins();
  const { data: globalData } = useGlobalData();

  // Fetch user data
  const { data: user, isLoading: userLoading } = useUser(USERNAME);
  const { data: balances = [] } = useBalances(user?.id);
  const { data: transactions = [] } = useTransactions(user?.id);
  const { data: alerts = [] } = usePriceAlerts(user?.id);

  // Mutations
  const executeTrade = useExecuteTrade();
  const createAlert = useCreatePriceAlert();
  const deleteAlert = useDeletePriceAlert();

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return balances.reduce((total, balance) => {
      if (balance.currency === 'USDT') {
        return total + balance.amount;
      }
      const coin = coins.find(c => c.symbol.toUpperCase() === balance.currency.toUpperCase());
      return total + (coin ? balance.amount * coin.current_price : 0);
    }, 0);
  }, [balances, coins]);

  const activeAlerts = alerts.filter(a => a.is_active);

  const handleSelectCoin = (coin: Coin) => {
    setSelectedCoin(coin);
    setActiveTab('trade');
  };

  const handleTrade = async (params: Parameters<typeof executeTrade.mutateAsync>[0]) => {
    await executeTrade.mutateAsync(params);
  };

  const handleCreateAlert = async (params: Parameters<typeof createAlert.mutateAsync>[0]) => {
    await createAlert.mutateAsync(params);
  };

  const handleDeleteAlert = async (alertId: string) => {
    await deleteAlert.mutateAsync(alertId);
  };

  if (coinsLoading || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-500" />
          <p className="mt-4 text-muted-foreground">Loading CryptoSim...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500">User not found. Please check the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        username={user.username}
        totalBalance={totalBalance}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={activeAlerts.length}
      />
      
      <main className="container px-4 py-6">
        {activeTab === 'markets' && (
          <div className="space-y-6">
            <MarketOverview coins={coins} globalData={globalData} />
            <CoinTable coins={coins} onSelectCoin={handleSelectCoin} />
          </div>
        )}

        {activeTab === 'trade' && (
          <TradePanel
            selectedCoin={selectedCoin}
            coins={coins}
            balances={balances}
            userId={user.id}
            onTrade={handleTrade}
          />
        )}

        {activeTab === 'portfolio' && (
          <Portfolio balances={balances} coins={coins} />
        )}

        {activeTab === 'history' && (
          <TransactionHistory transactions={transactions} coins={coins} />
        )}

        {activeTab === 'alerts' && (
          <PriceAlerts
            alerts={alerts}
            coins={coins}
            userId={user.id}
            onCreateAlert={handleCreateAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
