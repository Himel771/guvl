
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)))
    ON CONFLICT (username) DO UPDATE SET username = COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)) || '_' || substr(NEW.id::text, 1, 4);
    
    INSERT INTO public.balances (user_id, currency, amount)
    VALUES (NEW.id, 'USDT', 1000);
    
    RETURN NEW;
END;
$function$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
