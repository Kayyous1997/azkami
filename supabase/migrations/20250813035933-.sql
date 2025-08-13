-- Fix the handle_new_user function to properly process referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
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
    -- Update referrer's total_referrals and give them points
    UPDATE public.profiles 
    SET total_referrals = COALESCE(total_referrals, 0) + 1,
        points = COALESCE(points, 0) + 100
    WHERE user_id = referrer_user_id;

    -- Log referral activity for the referrer
    INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
    VALUES (
      referrer_user_id,
      'referral_completed',
      json_build_object(
        'referred_user_id', new.id,
        'referred_username', new.raw_user_meta_data ->> 'username'
      ),
      100
    );

    -- Log referral bonus for the new user (they get 50 points for joining via referral)
    INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
    VALUES (
      new.id,
      'referral_bonus',
      json_build_object(
        'referrer_user_id', referrer_user_id,
        'bonus_type', 'signup_via_referral'
      ),
      50
    );

    -- Give the new user referral bonus points
    UPDATE public.profiles 
    SET points = COALESCE(points, 0) + 50
    WHERE user_id = new.id;
  END IF;

  RETURN new;
END;
$$;