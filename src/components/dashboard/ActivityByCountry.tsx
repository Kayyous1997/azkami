import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { Activity, Users, TrendingUp, Zap } from "lucide-react"

export function ActivityByCountry() {
  const { data: activities, refetch } = useQuery({
    queryKey: ['global-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activities')
        .select('activity_type, created_at, points_earned')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      return data || []
    }
  })

  const { data: totalUsers } = useQuery({
    queryKey: ['total-users'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return count || 0
    }
  })

  // Real-time subscription for activities
  useEffect(() => {
    const channel = supabase
      .channel('global-activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activities'
        },
        () => refetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  // Calculate activity metrics
  const activityStats = activities ? {
    dailyCheckins: activities.filter(a => a.activity_type === 'daily_checkin').length,
    questsCompleted: activities.filter(a => a.activity_type === 'quest_completed').length,
    referrals: activities.filter(a => a.activity_type === 'referral_completed').length,
    socialTasks: activities.filter(a => a.activity_type === 'social_task_completed').length,
    totalPoints: activities.reduce((sum, a) => sum + (a.points_earned || 0), 0),
    recentActivities: activities.length
  } : null

  const activityTypes = [
    { 
      type: 'Daily Check-ins', 
      count: activityStats?.dailyCheckins || 0, 
      icon: Zap, 
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/20'
    },
    { 
      type: 'Quests Completed', 
      count: activityStats?.questsCompleted || 0, 
      icon: TrendingUp, 
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/20'
    },
    { 
      type: 'Referrals', 
      count: activityStats?.referrals || 0, 
      icon: Users, 
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/20'
    },
    { 
      type: 'Social Tasks', 
      count: activityStats?.socialTasks || 0, 
      icon: Activity, 
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/20'
    }
  ]

  const maxCount = Math.max(...activityTypes.map(a => a.count), 1)

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Global User Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityTypes.map((activity, index) => {
            const Icon = activity.icon
            const percentage = (activity.count / maxCount) * 100
            
            return (
              <div key={activity.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {activity.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 w-32">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-primary transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${percentage}%`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8 text-right">
                    {activity.count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-glow rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Users</span>
            <span className="font-bold text-foreground">{totalUsers || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Total Points Earned</span>
            <span className="font-bold text-success">{activityStats?.totalPoints?.toLocaleString() || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}