-- Fix security warnings: Add search_path to functions for security
-- Update get_public_profiles function with proper search_path
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  points integer,
  total_referrals integer,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.points,
    p.total_referrals,
    p.created_at
  FROM public.profiles p
  ORDER BY p.points DESC;
$$;

-- Update get_referrer_by_code function with proper search_path
CREATE OR REPLACE FUNCTION public.get_referrer_by_code(referral_code_param text)
RETURNS TABLE (
  user_id uuid,
  username text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO ''
AS $$
  SELECT 
    p.user_id,
    p.username
  FROM public.profiles p
  WHERE p.referral_code = referral_code_param
  LIMIT 1;
$$;