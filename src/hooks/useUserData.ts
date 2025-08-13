import { useAuth } from "@/components/auth/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

export function useUserData() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user
  })

  const { data: dailyCheckins } = useQuery({
    queryKey: ['daily_checkins', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })
        .limit(30)

      if (error) throw error
      return data
    },
    enabled: !!user
  })

  const { data: activities } = useQuery({
    queryKey: ['user_activities', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
    enabled: !!user
  })

  const { data: quests } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const { data: questCompletions } = useQuery({
    queryKey: ['quest_completions', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('user_quest_completions')
        .select('*, quests(*)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user
  })

  // Set up real-time subscriptions for all relevant tables
  useEffect(() => {
    if (!user) return

    // Profile updates subscription
    const profileChannel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
        }
      )
      .subscribe()

    // Daily checkins subscription
    const checkinsChannel = supabase
      .channel('daily-checkins-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_checkins',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['daily_checkins', user.id] })
        }
      )
      .subscribe()

    // User activities subscription
    const activitiesChannel = supabase
      .channel('user-activities-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user_activities', user.id] })
        }
      )
      .subscribe()

    // Quests subscription (for all users - to see new quests)
    const questsChannel = supabase
      .channel('quests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quests'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['quests'] })
        }
      )
      .subscribe()

    // Quest completions subscription
    const questCompletionsChannel = supabase
      .channel('quest-completions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quest_completions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['quest_completions', user.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profileChannel)
      supabase.removeChannel(checkinsChannel)
      supabase.removeChannel(activitiesChannel)
      supabase.removeChannel(questsChannel)
      supabase.removeChannel(questCompletionsChannel)
    }
  }, [user, queryClient])

  return {
    profile,
    dailyCheckins,
    activities,
    quests,
    questCompletions,
    refetchProfile
  }
}