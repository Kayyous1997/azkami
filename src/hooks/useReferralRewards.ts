import { useAuth } from "@/components/auth/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface ClaimRewardResponse {
  success: boolean
  message: string
  points_earned?: number
  tier_level?: string
}

export function useReferralRewards() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: referralRewards = [] } = useQuery({
    queryKey: ['referral_rewards', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('referrals_required', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!user
  })

  const { data: referrals = [] } = useQuery({
    queryKey: ['user_referrals', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, created_at, points, user_id')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user
  })

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase.rpc('claim_referral_reward', {
        user_uuid: user.id,
        reward_id: rewardId
      })

      if (error) throw error
      return data
    },
    onSuccess: (result) => {
      const response = result as unknown as ClaimRewardResponse
      if (response.success) {
        toast({
          title: "Reward Claimed!",
          description: `You earned ${response.points_earned} XP for reaching ${response.tier_level} tier!`,
        })
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['referral_rewards', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['user_activities', user?.id] })
      } else {
        toast({
          title: "Claim Failed",
          description: response.message,
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      })
    }
  })

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return

    // Referral rewards subscription
    const rewardsChannel = supabase
      .channel('referral-rewards-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_rewards',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['referral_rewards', user.id] })
        }
      )
      .subscribe()

    // Profile updates for referrals
    const profilesChannel = supabase
      .channel('referrals-profiles-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `referred_by=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user_referrals', user.id] })
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(rewardsChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [user, queryClient])

  return {
    referralRewards,
    referrals,
    claimReward: claimRewardMutation.mutate,
    isClaimingReward: claimRewardMutation.isPending
  }
}