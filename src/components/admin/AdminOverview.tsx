import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { Users, CheckSquare, Clock, Star } from "lucide-react"

interface OverviewStats {
  totalUsers: number
  totalQuests: number
  totalSubmissions: number
  totalPoints: number
}

export function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalQuests: 0,
    totalSubmissions: 0,
    totalPoints: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // Fetch total quests
        const { count: questCount } = await supabase
          .from('quests')
          .select('*', { count: 'exact', head: true })

        // Fetch total submissions
        const { count: submissionCount } = await supabase
          .from('social_task_submissions')
          .select('*', { count: 'exact', head: true })

        // Fetch total points awarded
        const { data: pointsData } = await supabase
          .from('profiles')
          .select('points')

        const totalPoints = pointsData?.reduce((sum, profile) => sum + (profile.points || 0), 0) || 0

        setStats({
          totalUsers: userCount || 0,
          totalQuests: questCount || 0,
          totalSubmissions: submissionCount || 0,
          totalPoints
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quests</p>
                <p className="text-2xl font-bold">{stats.totalQuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submissions</p>
                <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP Awarded</p>
                <p className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Average XP per User</span>
              <span className="font-medium">
                {stats.totalUsers > 0 ? Math.round(stats.totalPoints / stats.totalUsers).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Submissions per Quest</span>
              <span className="font-medium">
                {stats.totalQuests > 0 ? Math.round(stats.totalSubmissions / stats.totalQuests * 100) / 100 : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}