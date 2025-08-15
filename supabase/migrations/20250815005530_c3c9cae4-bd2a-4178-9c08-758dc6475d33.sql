-- Remove LinkedIn task
DELETE FROM public.quests WHERE title = 'Follow on LinkedIn';

-- Add admin role to profiles table
ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user';
ALTER TABLE public.profiles ADD CONSTRAINT valid_role CHECK (role IN ('user', 'admin'));

-- Create table for social task submissions
CREATE TABLE public.social_task_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  quest_id uuid NOT NULL,
  username text NOT NULL,
  platform text NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  notes text,
  UNIQUE(user_id, quest_id)
);

-- Enable RLS on social_task_submissions
ALTER TABLE public.social_task_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for social_task_submissions
CREATE POLICY "Users can view their own submissions" 
ON public.social_task_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions" 
ON public.social_task_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions" 
ON public.social_task_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all submissions" 
ON public.social_task_submissions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create admin-only RLS policies for quests
CREATE POLICY "Admins can insert quests" 
ON public.quests 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update quests" 
ON public.quests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete quests" 
ON public.quests 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Function to submit social task
CREATE OR REPLACE FUNCTION public.submit_social_task(
  quest_uuid uuid,
  username_param text,
  platform_param text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_uuid uuid;
  result json;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not authenticated'
    );
  END IF;

  -- Check if submission already exists
  IF EXISTS (
    SELECT 1 FROM public.social_task_submissions 
    WHERE user_id = user_uuid AND quest_id = quest_uuid
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Task already submitted'
    );
  END IF;

  -- Insert submission
  INSERT INTO public.social_task_submissions (user_id, quest_id, username, platform)
  VALUES (user_uuid, quest_uuid, username_param, platform_param);

  result := json_build_object(
    'success', true,
    'message', 'Task submitted successfully. Awaiting review.'
  );

  RETURN result;
END;
$function$;

-- Function to approve/reject social task submissions (admin only)
CREATE OR REPLACE FUNCTION public.review_social_task(
  submission_uuid uuid,
  status_param text,
  notes_param text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  admin_uuid uuid;
  submission_record RECORD;
  result json;
BEGIN
  admin_uuid := auth.uid();
  
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = admin_uuid AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Get submission details
  SELECT * INTO submission_record
  FROM public.social_task_submissions s
  JOIN public.quests q ON s.quest_id = q.id
  WHERE s.id = submission_uuid;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Submission not found'
    );
  END IF;

  -- Update submission status
  UPDATE public.social_task_submissions
  SET status = status_param,
      reviewed_by = admin_uuid,
      reviewed_at = now(),
      notes = notes_param
  WHERE id = submission_uuid;

  -- If approved, award points and complete quest
  IF status_param = 'approved' THEN
    -- Check if quest completion already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.user_quest_completions 
      WHERE user_id = submission_record.user_id AND quest_id = submission_record.quest_id
    ) THEN
      -- Insert quest completion
      INSERT INTO public.user_quest_completions (user_id, quest_id, points_earned)
      VALUES (submission_record.user_id, submission_record.quest_id, submission_record.points_reward);

      -- Update user points
      UPDATE public.profiles 
      SET points = COALESCE(points, 0) + submission_record.points_reward
      WHERE user_id = submission_record.user_id;

      -- Log activity
      INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned)
      VALUES (
        submission_record.user_id,
        'social_task_completed',
        json_build_object(
          'quest_id', submission_record.quest_id, 
          'quest_title', submission_record.title,
          'platform', submission_record.platform,
          'username', submission_record.username
        ),
        submission_record.points_reward
      );
    END IF;
  END IF;

  result := json_build_object(
    'success', true,
    'message', 'Submission reviewed successfully',
    'status', status_param
  );

  RETURN result;
END;
$function$;