-- Add social tasks with 1000xp rewards
INSERT INTO public.quests (title, description, quest_type, requirements, points_reward, is_active) VALUES
('Follow us on Twitter', 'Follow our official Twitter account @yourhandle', 'social', '{"action": "follow_twitter", "url": "https://twitter.com/yourhandle"}', 1000, true),
('Join our Discord', 'Join our Discord community server', 'social', '{"action": "join_discord", "url": "https://discord.gg/yourserver"}', 1000, true),
('Share on Twitter', 'Share your referral link on Twitter', 'social', '{"action": "share_twitter", "min_followers": 10}', 1000, true),
('Join Telegram Channel', 'Join our official Telegram channel', 'social', '{"action": "join_telegram", "url": "https://t.me/yourchannel"}', 1000, true),
('Follow on LinkedIn', 'Follow our LinkedIn company page', 'social', '{"action": "follow_linkedin", "url": "https://linkedin.com/company/yourcompany"}', 1000, true);

-- Update referral bonuses to 1000xp for both sides
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  referrer_user_id uuid;
BEGIN
  -- Extract referred_by from user metadata
  referrer_user_id := (new.raw_user_meta_data ->> 'referred_by')::uuid;

  -- Insert profile with referral information
  INSERT INTO public.profiles (user_id, username, referred_by)
  VALUES (new.id, new.raw_user_meta_data ->> 'username', referrer_user_id);

  -- If this user was referred, process the referral
  IF referrer_user_id IS NOT NULL THEN
    -- Update referrer's total_referrals and give them 1000 points
    UPDATE public.profiles 
    SET total_referrals = COALESCE(total_referrals, 0) + 1,
        points = COALESCE(points, 0) + 1000
    WHERE user_id = referrer_user_id;

    -- Log referral activity for the referrer (1000xp)
    INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
    VALUES (
      referrer_user_id,
      'referral_completed',
      json_build_object(
        'referred_user_id', new.id,
        'referred_username', new.raw_user_meta_data ->> 'username'
      ),
      1000
    );

    -- Log referral bonus for the new user (1000xp)
    INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
    VALUES (
      new.id,
      'referral_bonus',
      json_build_object(
        'referrer_user_id', referrer_user_id,
        'bonus_type', 'signup_via_referral'
      ),
      1000
    );

    -- Give the new user 1000 referral bonus points
    UPDATE public.profiles 
    SET points = COALESCE(points, 0) + 1000
    WHERE user_id = new.id;
  END IF;

  RETURN new;
END;
$function$;