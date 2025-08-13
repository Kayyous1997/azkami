-- Fix the daily checkin function to handle null streak_count properly
CREATE OR REPLACE FUNCTION public.handle_daily_checkin(user_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  SELECT checkin_date, COALESCE(streak_count, 1) INTO last_checkin_date, current_streak
  FROM public.daily_checkins
  WHERE user_id = user_uuid
  ORDER BY checkin_date DESC
  LIMIT 1;

  -- Calculate new streak - ensure it's never null
  IF last_checkin_date IS NOT NULL THEN
    IF last_checkin_date = CURRENT_DATE - INTERVAL '1 day' THEN
      current_streak := COALESCE(current_streak, 1) + 1;
    ELSIF last_checkin_date < CURRENT_DATE - INTERVAL '1 day' THEN
      current_streak := 1;
    END IF;
  ELSE
    current_streak := 1;
  END IF;

  -- Ensure current_streak is never null
  current_streak := COALESCE(current_streak, 1);

  -- Bonus points for streaks
  IF current_streak >= 7 THEN
    points_to_add := 25;
  ELSIF current_streak >= 3 THEN
    points_to_add := 15;
  END IF;

  -- Insert daily check-in with explicit values to avoid nulls
  INSERT INTO public.daily_checkins (user_id, checkin_date, points_earned, streak_count)
  VALUES (user_uuid, CURRENT_DATE, points_to_add, current_streak);

  -- Update user points
  UPDATE public.profiles 
  SET points = COALESCE(points, 0) + points_to_add
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
$function$