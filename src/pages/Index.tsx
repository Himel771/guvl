import { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/loading/LoadingScreen';
import { MarketOverview } from '@/components/market/MarketOverview';
import { CoinTable } from '@/components/market/CoinTable';
import { TradePanel } from '@/components/trade/TradePanel';
import { Portfolio } from '@/components/portfolio/Portfolio';
import { TransactionHistory } from '@/components/history/TransactionHistory';
import { PriceAlerts } from '@/components/alerts/PriceAlerts';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { WatchlistPanel } from '@/components/watchlist/WatchlistPanel';
import { DepositWithdrawModal } from '@/components/wallet/DepositWithdrawModal';
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
import { Coin } from '@/types/crypto';

const MIN_LOADING_TIME = 1500;

const Index = () => {
  const [activeTab, setActiveTab] = useState('markets');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [loadingStartTime] = useState(Date.now());
  
  const { user, profile, isLoading: authLoading } = useAuth();
  
  // Initialize click sound
  useClickSound();

  // Fetch crypto data
  const { data: coins = [], isLoading: coinsLoading } = useCoins();
  const { data: globalData } = useGlobalData();

  // Fetch user data using auth user id
  const { data: balances = [] } = useBalances(user?.id);
  const { data: transactions = [] } = useTransactions(user?.id);
  const { data: alerts = [] } = usePriceAlerts(user?.id);

  // Mutations
  const executeTrade = useExecuteTrade();
  const createAlert = useCreatePriceAlert();
  const deleteAlert = useDeletePriceAlert();

  // Handle loading with minimum display time
  useEffect(() => {
    if (!coinsLoading && !authLoading) {
      const elapsed = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
      
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, remainingTime);
      
      return () => clearTimeout(timer);
    }
  }, [coinsLoading, authLoading, loadingStartTime]);

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

  // Get USDT balance for wallet modal
  const usdtBalance = useMemo(() => {
    return balances.find(b => b.currency === 'USDT')?.amount || 0;
  }, [balances]);

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

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (showLoading || coinsLoading || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
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
      />
      
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        username={profile?.username || 'User'}
        totalBalance={totalBalance}
        holdingsCount={balances.filter(b => b.amount > 0).length}
        transactionsCount={transactions.length}
        joinDate={profile?.created_at || new Date().toISOString()}
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
                <CoinTable coins={coins} onSelectCoin={handleSelectCoin} />
              </div>
            )}

            {activeTab === 'trade' && user && (
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

            {activeTab === 'alerts' && user && (
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
    </div>
  );
};

export default Index;
