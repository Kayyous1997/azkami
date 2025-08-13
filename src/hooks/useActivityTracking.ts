import { useAuth } from "@/components/auth/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

export function useActivityTracking() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const logActivity = async (
    activityType: string,
    activityData?: any,
    points?: number
  ) => {
    if (!user) return

    try {
      const { error } = await supabase.rpc('log_user_activity', {
        user_uuid: user.id,
        activity_type_param: activityType,
        activity_data_param: activityData,
        points_param: points || 0
      })

      if (error) {
        console.error('Error logging activity:', error)
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const handleDailyCheckin = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to claim your daily check-in.",
        variant: "destructive"
      })
      return
    }

    try {
      const { data, error } = await supabase.rpc('handle_daily_checkin', {
        user_uuid: user.id
      })

      if (error) {
        console.error('Check-in error:', error)
        toast({
          title: "Check-in failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive"
        })
        return
      }

      const result = data as { success: boolean; message: string; points_earned: number; streak_count: number }

      if (result.success) {
        toast({
          title: "Check-in successful! 🎉",
          description: `+${result.points_earned} points (${result.streak_count} day streak)`
        })
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['daily_checkins'] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        queryClient.invalidateQueries({ queryKey: ['user_activities'] })
      } else {
        toast({
          title: "Already checked in",
          description: result.message
        })
      }

      return result
    } catch (error) {
      console.error('Error during check-in:', error)
      toast({
        title: "Check-in failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    }
  }

  const completeQuest = async (questId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to complete quests.",
        variant: "destructive"
      })
      return
    }

    try {
      const { data, error } = await supabase.rpc('complete_quest', {
        user_uuid: user.id,
        quest_uuid: questId
      })

      if (error) {
        console.error('Quest completion error:', error)
        toast({
          title: "Quest completion failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive"
        })
        return
      }

      const result = data as { success: boolean; message: string; points_earned: number; quest_title: string }

      if (result.success) {
        toast({
          title: "Quest completed! 🎉",
          description: `+${result.points_earned} XP for completing "${result.quest_title}"`
        })
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['quest_completions'] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        queryClient.invalidateQueries({ queryKey: ['user_activities'] })
      } else {
        toast({
          title: "Quest already completed",
          description: result.message
        })
      }

      return result
    } catch (error) {
      console.error('Error completing quest:', error)
      toast({
        title: "Quest completion failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    }
  }

  return {
    logActivity,
    handleDailyCheckin,
    completeQuest
  }
}