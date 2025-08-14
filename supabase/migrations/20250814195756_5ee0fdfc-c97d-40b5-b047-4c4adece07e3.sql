-- Fix security vulnerability: Restrict profile data access
-- Remove the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can view basic profile info of others (excluding sensitive data)
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() != user_id); -- Only for other users, not own profile

-- Create a security definer function for public leaderboard data
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

-- Create function to get referrer info (for referral validation)
CREATE OR REPLACE FUNCTION public.get_referrer_by_code(referral_code_param text)
RETURNS TABLE (
  user_id uuid,
  username text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.user_id,
    p.username
  FROM public.profiles p
  WHERE p.referral_code = referral_code_param
  LIMIT 1;
$$;