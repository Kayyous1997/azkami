-- Create table for daily check-ins
CREATE TABLE public.daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER NOT NULL DEFAULT 10,
  streak_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- Create table for user activities tracking
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for quests/tasks
CREATE TABLE public.quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER NOT NULL DEFAULT 0,
  quest_type TEXT NOT NULL DEFAULT 'daily',
  requirements JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user quest completions
CREATE TABLE public.user_quest_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, quest_id)
);

-- Enable Row Level Security
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_checkins
CREATE POLICY "Users can view their own checkins" 
ON public.daily_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins" 
ON public.daily_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_activities
CREATE POLICY "Users can view their own activities" 
ON public.user_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for quests (public readable)
CREATE POLICY "Quests are viewable by everyone" 
ON public.quests 
FOR SELECT 
USING (true);

-- Create RLS policies for user_quest_completions
CREATE POLICY "Users can view their own quest completions" 
ON public.user_quest_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quest completions" 
ON public.user_quest_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle daily check-in
CREATE OR REPLACE FUNCTION public.handle_daily_checkin(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  last_checkin_date DATE;
  current_streak INTEGER := 1;
  points_to_add INTEGER := 10;
  result JSON;
BEGIN
  -- Check if user already checked in today
  IF EXISTS (
    SELECT 1 FROM public.daily_checkins 
    WHERE user_id = user_uuid AND checkin_date = CURRENT_DATE
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Already checked in today',
      'points_earned', 0,
      'streak_count', 0
    );
  END IF;

  -- Get last check-in date to calculate streak
  SELECT checkin_date, streak_count INTO last_checkin_date, current_streak
  FROM public.daily_checkins
  WHERE user_id = user_uuid
  ORDER BY checkin_date DESC
  LIMIT 1;

  -- Calculate new streak
  IF last_checkin_date IS NOT NULL THEN
    IF last_checkin_date = CURRENT_DATE - INTERVAL '1 day' THEN
      current_streak := current_streak + 1;
    ELSIF last_checkin_date < CURRENT_DATE - INTERVAL '1 day' THEN
      current_streak := 1;
    END IF;
  END IF;

  -- Bonus points for streaks
  IF current_streak >= 7 THEN
    points_to_add := 25;
  ELSIF current_streak >= 3 THEN
    points_to_add := 15;
  END IF;

  -- Insert daily check-in
  INSERT INTO public.daily_checkins (user_id, checkin_date, points_earned, streak_count)
  VALUES (user_uuid, CURRENT_DATE, points_to_add, current_streak);

  -- Update user points
  UPDATE public.profiles 
  SET points = points + points_to_add
  WHERE user_id = user_uuid;

  -- Log activity
  INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
  VALUES (
    user_uuid,
    'daily_checkin',
    json_build_object('streak_count', current_streak, 'checkin_date', CURRENT_DATE),
    points_to_add
  );

  result := json_build_object(
    'success', true,
    'message', 'Check-in successful!',
    'points_earned', points_to_add,
    'streak_count', current_streak
  );

  RETURN result;
END;
$$;

-- Create function to log user activities
CREATE OR REPLACE FUNCTION public.log_user_activity(
  user_uuid UUID,
  activity_type_param TEXT,
  activity_data_param JSONB DEFAULT NULL,
  points_param INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
  VALUES (user_uuid, activity_type_param, activity_data_param, points_param);
  
  IF points_param > 0 THEN
    UPDATE public.profiles 
    SET points = points + points_param
    WHERE user_id = user_uuid;
  END IF;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quests_updated_at
BEFORE UPDATE ON public.quests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample quests
INSERT INTO public.quests (title, description, points_reward, quest_type, requirements) VALUES
('Daily Login', 'Login to the platform', 5, 'daily', '{"action": "login"}'),
('Complete Profile', 'Fill out your profile information', 50, 'onetime', '{"action": "profile_complete"}'),
('First Referral', 'Refer your first friend', 100, 'onetime', '{"action": "referral", "count": 1}'),
('Dashboard Explorer', 'Visit all dashboard sections', 25, 'daily', '{"action": "dashboard_visit", "sections": ["overview", "tasks", "rewards"]}');