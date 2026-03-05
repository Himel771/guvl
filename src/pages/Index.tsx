import { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/loading/LoadingScreen';
import { MarketOverview } from '@/components/market/MarketOverview';
import { CoinTable } from '@/components/market/CoinTable';
import { WarStocksTable } from '@/components/market/WarStocksTable';
import { TradePanel } from '@/components/trade/TradePanel';
import { Portfolio } from '@/components/portfolio/Portfolio';
import { TransactionHistory } from '@/components/history/TransactionHistory';
import { PriceAlerts } from '@/components/alerts/PriceAlerts';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { WatchlistPanel } from '@/components/watchlist/WatchlistPanel';
import { DepositWithdrawModal } from '@/components/wallet/DepositWithdrawModal';
import { Button } from '@/components/ui/button';
import { useCoins, useGlobalData } from '@/hooks/useCryptoData';
import { 
  useBalances, 
  useTransactions, 
  usePriceAlerts,
  useExecuteTrade,
  useCreatePriceAlert,
  useDeletePriceAlert,
} from '@/hooks/useUserData';
import { useAuth } from '@/contexts/AuthContext';
import { useClickSound } from '@/hooks/useClickSound';
import { RealTimePriceProvider, useRealTimePrices } from '@/contexts/RealTimePriceContext';
import { Coin } from '@/types/crypto';
import { Balance, Transaction, PriceAlert } from '@/types/crypto';
import { User } from '@supabase/supabase-js';

const MIN_LOADING_TIME = 1500;

// Inner component that has access to real-time prices for live wallet balance
interface IndexContentProps {
  coins: Coin[];
  balances: Balance[];
  transactions: Transaction[];
  alerts: PriceAlert[];
  globalData: any;
  user: User;
  profile: any;
  usdtBalance: number;
  executeTrade: ReturnType<typeof useExecuteTrade>;
  createAlert: ReturnType<typeof useCreatePriceAlert>;
  deleteAlert: ReturnType<typeof useDeletePriceAlert>;
}

const IndexContent = ({
  coins, balances, transactions, alerts, globalData, user, profile,
  usdtBalance, executeTrade, createAlert, deleteAlert,
}: IndexContentProps) => {
  const [activeTab, setActiveTab] = useState('markets');
  const [marketSubTab, setMarketSubTab] = useState<'crypto' | 'warstocks'>('crypto');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const { prices } = useRealTimePrices();

  // Live total balance using real-time WebSocket prices
  const totalBalance = useMemo(() => {
    return balances.reduce((total, balance) => {
      if (balance.currency === 'USDT') return total + balance.amount;
      // Try real-time price first, fall back to CoinGecko
      const rtPrice = prices.get(balance.currency.toUpperCase());
      if (rtPrice) return total + balance.amount * rtPrice.price;
      const coin = coins.find(c => c.symbol.toUpperCase() === balance.currency.toUpperCase());
      return total + (coin ? balance.amount * coin.current_price : 0);
    }, 0);
  }, [balances, coins, prices]);

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

  return (
    <>
      <Header 
        username={profile?.username || 'User'}
        totalBalance={totalBalance}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={activeAlerts.length}
        onProfileClick={() => setIsProfileOpen(true)}
        onWalletClick={() => setIsWalletOpen(true)}
        coins={coins}
        onSelectCoin={handleSelectCoin}
        avatarUrl={profile?.avatar_url}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        username={profile?.username || 'User'}
        totalBalance={totalBalance}
        holdingsCount={balances.filter(b => b.amount > 0).length}
        transactionsCount={transactions.length}
        joinDate={profile?.created_at || new Date().toISOString()}
        avatarUrl={profile?.avatar_url || null}
        userId={user.id}
      />

      <DepositWithdrawModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentBalance={usdtBalance}
      />

      <main className="container px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'markets' && (
              <div className="space-y-6">
                <MarketOverview coins={coins} globalData={globalData} />
                <div className="flex gap-2 border-b pb-1">
                  <Button
                    variant={marketSubTab === 'crypto' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMarketSubTab('crypto')}
                  >
                    Crypto
                  </Button>
                  <Button
                    variant={marketSubTab === 'warstocks' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMarketSubTab('warstocks')}
                  >
                    War Stocks Private Equity
                  </Button>
                </div>
                {marketSubTab === 'crypto' ? (
                  <CoinTable coins={coins} onSelectCoin={handleSelectCoin} />
                ) : (
                  <WarStocksTable />
                )}
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

            {activeTab === 'watchlist' && (
              <WatchlistPanel coins={coins} onSelectCoin={handleSelectCoin} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
};

const Index = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [loadingStartTime] = useState(Date.now());
  
  const { user, profile, isLoading: authLoading } = useAuth();
  
  useClickSound();

  const { data: coins = [], isLoading: coinsLoading } = useCoins();
  const { data: globalData } = useGlobalData();

  const { data: balances = [] } = useBalances(user?.id);
  const { data: transactions = [] } = useTransactions(user?.id);
  const { data: alerts = [] } = usePriceAlerts(user?.id);

  const executeTrade = useExecuteTrade();
  const createAlert = useCreatePriceAlert();
  const deleteAlert = useDeletePriceAlert();

  useEffect(() => {
    if (!coinsLoading && !authLoading) {
      const elapsed = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
      const timer = setTimeout(() => setShowLoading(false), remainingTime);
      return () => clearTimeout(timer);
    }
  }, [coinsLoading, authLoading, loadingStartTime]);

  const usdtBalance = useMemo(() => {
    return balances.find(b => b.currency === 'USDT')?.amount || 0;
  }, [balances]);

  // Stabilize symbols reference to prevent WebSocket reconnections
  const coinSymbolsStr = useMemo(() => coins.map(c => c.symbol.toUpperCase()).sort().join(','), [coins]);
  const coinSymbols = useMemo(() => coinSymbolsStr.split(',').filter(Boolean), [coinSymbolsStr]);

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (showLoading || coinsLoading || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <RealTimePriceProvider symbols={coinSymbols}>
      <div className="min-h-screen bg-background">
        <IndexContent
          coins={coins}
          balances={balances}
          transactions={transactions}
          alerts={alerts}
          globalData={globalData}
          user={user!}
          profile={profile}
          usdtBalance={usdtBalance}
          executeTrade={executeTrade}
          createAlert={createAlert}
          deleteAlert={deleteAlert}
        />
      </div>
    </RealTimePriceProvider>
  );
};

export default Index;
