import { useAuth } from "@/components/auth/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

export function useQuestProgress() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Query for user's current referral count
  const { data: referralCount = 0 } = useQuery({
    queryKey: ['referral_count', user?.id],
    queryFn: async () => {
      if (!user) return 0
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_referrals')
        .eq('user_id', user.id)
        .single()

      return profile?.total_referrals || 0
    },
    enabled: !!user
  })

  // Query for user's current daily check-in streak
  const { data: currentStreak = 0 } = useQuery({
    queryKey: ['current_streak', user?.id],
    queryFn: async () => {
      if (!user) return 0
      
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('streak_count')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })
        .limit(1)

      return checkins?.[0]?.streak_count || 0
    },
    enabled: !!user
  })

  // Query for checking if user checked in today
  const { data: hasCheckedInToday = false } = useQuery({
    queryKey: ['checked_in_today', user?.id],
    queryFn: async () => {
      if (!user) return false
      
      const today = new Date().toISOString().split('T')[0]
      const { data: checkin } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .single()

      return !!checkin
    },
    enabled: !!user
  })

  // Calculate progress for different quest types
  const calculateQuestProgress = (quest: any) => {
    if (!quest.requirements) return 0

    const requirements = quest.requirements as any

    switch (quest.quest_type) {
      case 'referral':
        if (requirements.referrals_required) {
          const progress = Math.min((referralCount / requirements.referrals_required) * 100, 100)
          return Math.round(progress)
        }
        if (requirements.count) {
          const progress = Math.min((referralCount / requirements.count) * 100, 100)
          return Math.round(progress)
        }
        return 0

      case 'daily':
        if (requirements.streak_required) {
          const progress = Math.min((currentStreak / requirements.streak_required) * 100, 100)
          return Math.round(progress)
        }
        // For simple daily login
        if (requirements.action === 'login') {
          return hasCheckedInToday ? 100 : 0
        }
        return 0

      case 'onetime':
        // These are typically completed manually
        return 0

      case 'verification':
      case 'engagement':
      case 'profile':
        // These need manual completion
        return 0

      default:
        return 0
    }
  }

  const canCompleteQuest = (quest: any) => {
    if (!quest.requirements) return true

    const requirements = quest.requirements as any

    switch (quest.quest_type) {
      case 'referral':
        if (requirements.referrals_required) {
          return referralCount >= requirements.referrals_required
        }
        if (requirements.count) {
          return referralCount >= requirements.count
        }
        return false

      case 'daily':
        if (requirements.streak_required) {
          return currentStreak >= requirements.streak_required
        }
        if (requirements.action === 'login') {
          return hasCheckedInToday
        }
        return false

      default:
        return true
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['referral_count'] })
          queryClient.invalidateQueries({ queryKey: ['profile'] })
        }
      )
      .subscribe()

    const checkinsChannel = supabase
      .channel('daily-checkins-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_checkins',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['current_streak'] })
          queryClient.invalidateQueries({ queryKey: ['checked_in_today'] })
          queryClient.invalidateQueries({ queryKey: ['daily_checkins'] })
        }
      )
      .subscribe()

    const questCompletionsChannel = supabase
      .channel('quest-completions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_quest_completions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['quest_completions'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(checkinsChannel)
      supabase.removeChannel(questCompletionsChannel)
    }
  }, [user, queryClient])

  return {
    referralCount,
    currentStreak,
    hasCheckedInToday,
    calculateQuestProgress,
    canCompleteQuest
  }
}