-- Add some sample quests for users to complete
INSERT INTO public.quests (title, description, quest_type, points_reward, requirements, is_active) VALUES
('Social Media Verification', 'Connect and verify your social media accounts', 'verification', 500, '{"required_platforms": ["twitter", "discord"]}', true),
('Daily Login Streak', 'Login daily for 7 consecutive days', 'daily', 300, '{"streak_required": 7}', true),
('Community Engagement', 'Make your first post in the community forum', 'engagement', 250, '{"action": "first_post"}', true),
('Profile Completion', 'Complete your profile with avatar and bio', 'profile', 200, '{"fields": ["avatar", "bio"]}', true),
('Referral Champion', 'Successfully refer 3 new members', 'referral', 1000, '{"referrals_required": 3}', true);

-- Add function to complete quests
CREATE OR REPLACE FUNCTION public.complete_quest(user_uuid uuid, quest_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  quest_record RECORD;
  points_reward INTEGER;
  result JSON;
BEGIN
  -- Check if quest exists and is active
  SELECT * INTO quest_record
  FROM public.quests
  WHERE id = quest_uuid AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Quest not found or inactive'
    );
  END IF;

  -- Check if user already completed this quest
  IF EXISTS (
    SELECT 1 FROM public.user_quest_completions 
    WHERE user_id = user_uuid AND quest_id = quest_uuid
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Quest already completed'
    );
  END IF;

  points_reward := quest_record.points_reward;

  -- Insert quest completion
  INSERT INTO public.user_quest_completions (user_id, quest_id, points_earned)
  VALUES (user_uuid, quest_uuid, points_reward);

  -- Update user points
  UPDATE public.profiles 
  SET points = COALESCE(points, 0) + points_reward
  WHERE user_id = user_uuid;

  -- Log activity
  INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
  VALUES (
    user_uuid,
    'quest_completed',
    json_build_object('quest_id', quest_uuid, 'quest_title', quest_record.title),
    points_reward
  );

  result := json_build_object(
    'success', true,
    'message', 'Quest completed successfully!',
    'points_earned', points_reward,
    'quest_title', quest_record.title
  );

  RETURN result;
END;
$function$