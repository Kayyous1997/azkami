-- Fix conflicting RLS policies on profiles table
-- Remove the problematic policy that exposes other users' data
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- The remaining policies are:
-- 1. "Users can view their own complete profile" - allows users to see their own data
-- 2. Public data is accessible through the get_public_profiles() function for leaderboards
-- This ensures that sensitive data (wallet_address, bio, location, referral_code) 
-- is only accessible to the profile owner, while public leaderboard data 
-- (username, points, total_referrals) is available through the secure function