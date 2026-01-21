import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export const DepositWithdrawModal = ({
  isOpen,
  onClose,
  currentBalance,
}: DepositWithdrawModalProps) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!user?.id || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (activeTab === 'withdraw' && numAmount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);

    try {
      // Get current USDT balance
      const { data: balanceData, error: fetchError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', 'USDT')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const newAmount = activeTab === 'deposit'
        ? (balanceData?.amount || 0) + numAmount
        : (balanceData?.amount || 0) - numAmount;

      if (balanceData) {
        // Update existing balance
        const { error } = await supabase
          .from('balances')
          .update({ amount: newAmount })
          .eq('id', balanceData.id);

        if (error) throw error;
      } else {
        // Create new balance
        const { error } = await supabase
          .from('balances')
          .insert({
            user_id: user.id,
            currency: 'USDT',
            amount: newAmount,
          });

        if (error) throw error;
      }

      // Record the transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: activeTab === 'deposit' ? 'buy' : 'sell',
        from_currency: activeTab === 'deposit' ? 'USD' : 'USDT',
        to_currency: activeTab === 'deposit' ? 'USDT' : 'USD',
        from_amount: numAmount,
        to_amount: numAmount,
        price_at_transaction: 1,
      });

      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      toast.success(
        activeTab === 'deposit'
          ? `Successfully deposited $${numAmount.toLocaleString()}`
          : `Successfully withdrew $${numAmount.toLocaleString()}`
      );

      setAmount('');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'deposit' | 'withdraw')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value={activeTab} asChild>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pt-4"
              >
                <div className="rounded-lg bg-secondary/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-amber-500">
                    ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {activeTab === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setAmount(quickAmount.toString())}
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>

                {activeTab === 'withdraw' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setAmount(currentBalance.toString())}
                  >
                    Max ({currentBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })})
                  </Button>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !amount}
                  className={`w-full ${
                    activeTab === 'deposit'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {activeTab === 'deposit' ? (
                        <>
                          <ArrowDownToLine className="mr-2 h-4 w-4" />
                          Deposit
                        </>
                      ) : (
                        <>
                          <ArrowUpFromLine className="mr-2 h-4 w-4" />
                          Withdraw
                        </>
                      )}
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  This is simulated. No real funds are involved.
                </p>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
