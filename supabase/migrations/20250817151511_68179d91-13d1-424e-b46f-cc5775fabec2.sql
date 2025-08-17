-- Drop the policy that depends on the function
DROP POLICY IF EXISTS "Admins can view all profiles for analytics" ON public.profiles;

-- Drop and recreate functions with proper search path
DROP FUNCTION IF EXISTS public.get_total_user_count();
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Create function to get total user count with proper search path
CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COUNT(*)::INTEGER FROM public.profiles;
$$;

-- Create function to get user role with proper search path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Recreate the policy using the updated function
CREATE POLICY "Admins can view all profiles for analytics" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (auth.uid() = user_id OR public.get_current_user_role() = 'admin')
);