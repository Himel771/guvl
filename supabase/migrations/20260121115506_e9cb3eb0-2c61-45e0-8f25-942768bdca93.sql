-- First, remove the foreign key constraints that point to public.users
ALTER TABLE public.balances DROP CONSTRAINT IF EXISTS balances_user_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.price_alerts DROP CONSTRAINT IF EXISTS price_alerts_user_id_fkey;
ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;

-- Clear old demo data
DELETE FROM public.watchlist;
DELETE FROM public.price_alerts;
DELETE FROM public.transactions;
DELETE FROM public.balances;

-- Drop the old users table (we'll use profiles linked to auth.users instead)
DROP TABLE IF EXISTS public.users CASCADE;

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)));
    
    -- Give new users 1000 USDT starting balance
    INSERT INTO public.balances (user_id, currency, amount)
    VALUES (NEW.id, 'USDT', 1000);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profiles timestamp trigger
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add new foreign key constraints to reference auth.users
ALTER TABLE public.balances ADD CONSTRAINT balances_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.price_alerts ADD CONSTRAINT price_alerts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old public policies and create auth-based policies for balances
DROP POLICY IF EXISTS "Allow public read for balances" ON public.balances;
DROP POLICY IF EXISTS "Allow public insert for balances" ON public.balances;
DROP POLICY IF EXISTS "Allow public update for balances" ON public.balances;

CREATE POLICY "Users can view their own balances"
ON public.balances FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balances"
ON public.balances FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balances"
ON public.balances FOR UPDATE
USING (auth.uid() = user_id);

-- Drop old public policies and create auth-based policies for transactions
DROP POLICY IF EXISTS "Allow public read for transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public insert for transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Drop old public policies and create auth-based policies for price_alerts
DROP POLICY IF EXISTS "Allow public read for price_alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Allow public insert for price_alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Allow public update for price_alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Allow public delete for price_alerts" ON public.price_alerts;

CREATE POLICY "Users can view their own alerts"
ON public.price_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
ON public.price_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.price_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON public.price_alerts FOR DELETE
USING (auth.uid() = user_id);

-- Drop old public policies and create auth-based policies for watchlist
DROP POLICY IF EXISTS "Allow public read for watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Allow public insert for watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Allow public delete for watchlist" ON public.watchlist;

CREATE POLICY "Users can view their own watchlist"
ON public.watchlist FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own watchlist"
ON public.watchlist FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist"
ON public.watchlist FOR DELETE
USING (auth.uid() = user_id);