-- Create referral rewards table
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier_level TEXT NOT NULL,
  referrals_required INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for referral rewards
CREATE POLICY "Users can view their own rewards" 
ON public.referral_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards" 
ON public.referral_rewards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards" 
ON public.referral_rewards 
FOR INSERT 
WITH CHECK (true);

-- Create function to initialize referral rewards for users
CREATE OR REPLACE FUNCTION public.initialize_referral_rewards(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert default referral reward tiers for the user
  INSERT INTO public.referral_rewards (user_id, tier_level, referrals_required, bonus_points)
  VALUES 
    (user_uuid, 'Bronze', 1, 500),
    (user_uuid, 'Silver', 6, 750),
    (user_uuid, 'Gold', 16, 1000),
    (user_uuid, 'Platinum', 31, 1500)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Create function to claim referral reward
CREATE OR REPLACE FUNCTION public.claim_referral_reward(user_uuid uuid, reward_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  reward_record RECORD;
  user_referrals INTEGER;
  result JSON;
BEGIN
  -- Get the reward details
  SELECT * INTO reward_record
  FROM public.referral_rewards
  WHERE id = reward_id AND user_id = user_uuid;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Reward not found'
    );
  END IF;

  -- Check if already claimed
  IF reward_record.is_claimed THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Reward already claimed'
    );
  END IF;

  -- Get user's current referral count
  SELECT COALESCE(total_referrals, 0) INTO user_referrals
  FROM public.profiles
  WHERE user_id = user_uuid;

  -- Check if user meets the requirements
  IF user_referrals < reward_record.referrals_required THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not enough referrals to claim this reward'
    );
  END IF;

  -- Claim the reward
  UPDATE public.referral_rewards
  SET is_claimed = true, claimed_at = now()
  WHERE id = reward_id;

  -- Add points to user
  UPDATE public.profiles
  SET points = COALESCE(points, 0) + reward_record.bonus_points
  WHERE user_id = user_uuid;

  -- Log activity
  INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
  VALUES (
    user_uuid,
    'referral_reward_claimed',
    json_build_object('tier_level', reward_record.tier_level, 'reward_id', reward_id),
    reward_record.bonus_points
  );

  result := json_build_object(
    'success', true,
    'message', 'Reward claimed successfully!',
    'points_earned', reward_record.bonus_points,
    'tier_level', reward_record.tier_level
  );

  RETURN result;
END;
$$;

-- Create trigger to initialize rewards when user profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user_referral_rewards()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Initialize referral rewards for new user
  PERFORM public.initialize_referral_rewards(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_referral_rewards
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_referral_rewards();

-- Create trigger for updated_at
CREATE TRIGGER update_referral_rewards_updated_at
BEFORE UPDATE ON public.referral_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();