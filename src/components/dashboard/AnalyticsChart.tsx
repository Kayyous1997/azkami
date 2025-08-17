import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { format, subDays, eachDayOfInterval } from "date-fns"

export function AnalyticsChart() {
  const { data: chartData, refetch } = useQuery({
    queryKey: ['analytics-chart'],
    queryFn: async () => {
      const endDate = new Date()
      const startDate = subDays(endDate, 7) // Last 7 days
      
      const { data: activities, error } = await supabase
        .from('user_activities')
        .select('created_at, points_earned, activity_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })
      
      if (error) throw error

      const { data: dailyCheckins, error: checkinsError } = await supabase
        .from('daily_checkins')
        .select('checkin_date, points_earned')
        .gte('checkin_date', format(startDate, 'yyyy-MM-dd'))
        .lte('checkin_date', format(endDate, 'yyyy-MM-dd'))
        .order('checkin_date', { ascending: true })
      
      if (checkinsError) throw checkinsError

      // Generate all days in the range
      const allDays = eachDayOfInterval({ start: startDate, end: endDate })
      
      const chartData = allDays.map(day => {
        const dayString = format(day, 'yyyy-MM-dd')
        const displayDay = format(day, 'MMM dd')
        
        // Get activities for this day
        const dayActivities = activities?.filter(activity => 
          format(new Date(activity.created_at), 'yyyy-MM-dd') === dayString
        ) || []
        
        // Get checkins for this day
        const dayCheckins = dailyCheckins?.filter(checkin => 
          checkin.checkin_date === dayString
        ) || []
        
        const totalPoints = dayActivities.reduce((sum, activity) => sum + (activity.points_earned || 0), 0)
        const checkinPoints = dayCheckins.reduce((sum, checkin) => sum + (checkin.points_earned || 0), 0)
        const userCount = new Set([
          ...dayActivities.map(() => Math.floor(Math.random() * 50) + 1), // Simulated unique users
          ...dayCheckins.map(() => Math.floor(Math.random() * 30) + 1)
        ]).size
        
        return {
          name: displayDay,
          points: totalPoints + checkinPoints,
          users: Math.max(dayActivities.length + dayCheckins.length, userCount),
          activities: dayActivities.length + dayCheckins.length
        }
      })
      
      return chartData
    }
  })

  const { data: totalStats } = useQuery({
    queryKey: ['total-analytics-stats'],
    queryFn: async () => {
      const { data: totalActivities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('points_earned')
      
      if (activitiesError) throw activitiesError

      const { data: totalCheckins, error: checkinsError } = await supabase
        .from('daily_checkins')
        .select('points_earned')
      
      if (checkinsError) throw checkinsError

      const { data: userCount, error: userError } = await supabase.rpc('get_total_user_count')
      
      if (userError) throw userError

      const totalPoints = [
        ...(totalActivities || []),
        ...(totalCheckins || [])
      ].reduce((sum, item) => sum + (item.points_earned || 0), 0)

      return {
        totalPoints,
        totalUsers: userCount || 0,
        totalActivities: (totalActivities?.length || 0) + (totalCheckins?.length || 0)
      }
    }
  })

  // Real-time subscription
  useEffect(() => {
    const activitiesChannel = supabase
      .channel('analytics-activities')
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

    const checkinsChannel = supabase
      .channel('analytics-checkins')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_checkins'
        },
        () => refetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(activitiesChannel)
      supabase.removeChannel(checkinsChannel)
    }
  }, [refetch])

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          User Analytics (Last 7 Days)
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-1"></div>
              <span className="text-muted-foreground">Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-2"></div>
              <span className="text-muted-foreground">Activities</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData || []}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number, name: string) => [
                  name === 'points' ? `${value.toLocaleString()} pts` : `${value} activities`,
                  name === 'points' ? 'Points Earned' : 'Activities'
                ]}
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorPoints)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="activities"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorActivities)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gradient-glow rounded-lg">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-xl font-bold text-chart-1">{totalStats?.totalPoints?.toLocaleString() || 0}</p>
          </div>
          <div className="text-center p-3 bg-gradient-glow rounded-lg">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-xl font-bold text-chart-2">{totalStats?.totalUsers || 0}</p>
          </div>
          <div className="text-center p-3 bg-gradient-glow rounded-lg">
            <p className="text-sm text-muted-foreground">Activities</p>
            <p className="text-xl font-bold text-chart-3">{totalStats?.totalActivities || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}