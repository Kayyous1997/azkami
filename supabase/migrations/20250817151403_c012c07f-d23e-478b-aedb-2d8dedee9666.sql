-- Create a function to get total user count for analytics
CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER FROM public.profiles;
$$;

-- Create a function to get user role (to avoid infinite recursion in policies)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Create a policy to allow admins to access analytics functions
CREATE POLICY "Admins can view all profiles for analytics" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (auth.uid() = user_id OR public.get_current_user_role() = 'admin')
);