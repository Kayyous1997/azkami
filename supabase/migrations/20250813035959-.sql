-- Remove the redundant trigger since referral logic is now in handle_new_user
DROP TRIGGER IF EXISTS update_referrer_count ON public.profiles;