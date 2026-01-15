-- Create users table for crypto trading accounts
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create balances table for holding different currencies
CREATE TABLE public.balances (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    currency TEXT NOT NULL,
    amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, currency)
);

-- Create transactions table for trade history
CREATE TABLE public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'swap')),
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    from_amount DECIMAL(20, 8) NOT NULL,
    to_amount DECIMAL(20, 8) NOT NULL,
    price_at_transaction DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_alerts table
CREATE TABLE public.price_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    currency TEXT NOT NULL,
    target_price DECIMAL(20, 8) NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create watchlist table
CREATE TABLE public.watchlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    currency TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, currency)
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Create public read policies (since this is a simulated trading demo without auth)
CREATE POLICY "Allow public read for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert for users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read for balances" ON public.balances FOR SELECT USING (true);
CREATE POLICY "Allow public insert for balances" ON public.balances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for balances" ON public.balances FOR UPDATE USING (true);

CREATE POLICY "Allow public read for transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert for transactions" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read for price_alerts" ON public.price_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert for price_alerts" ON public.price_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for price_alerts" ON public.price_alerts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for price_alerts" ON public.price_alerts FOR DELETE USING (true);

CREATE POLICY "Allow public read for watchlist" ON public.watchlist FOR SELECT USING (true);
CREATE POLICY "Allow public insert for watchlist" ON public.watchlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete for watchlist" ON public.watchlist FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_balances_updated_at
    BEFORE UPDATE ON public.balances
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert shadowHimel user with 250 USDT
INSERT INTO public.users (username) VALUES ('shadowHimel');

INSERT INTO public.balances (user_id, currency, amount)
SELECT id, 'USDT', 250 FROM public.users WHERE username = 'shadowHimel';