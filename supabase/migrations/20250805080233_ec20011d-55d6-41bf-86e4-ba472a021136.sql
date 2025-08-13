-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_referral_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.profiles 
    SET total_referrals = total_referrals + 1,
        points = points + 100
    WHERE user_id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$;