import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Users, 
  TrendingUp,
  Search,
  Filter,
  Calendar
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthContext"

const Leaderboard = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Fetch leaderboard data
  const { data: leaderboardData = [] } = useQuery({
    queryKey: ['leaderboard', timeFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('user_id, username, points, total_referrals, created_at')
        .order('points', { ascending: false })
        .limit(100)

      // Apply time filtering if needed
      if (timeFilter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        query = query.gte('created_at', weekAgo.toISOString())
      } else if (timeFilter === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        query = query.gte('created_at', monthAgo.toISOString())
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })

  // Fetch user activities for quest completions
  const { data: questLeaderboard = [] } = useQuery({
    queryKey: ['quest_leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_quest_completions')
        .select(`
          user_id,
          points_earned,
          profiles!inner(username)
        `)

      if (error) throw error

      // Group by user and sum points
      const userQuestPoints = data.reduce((acc: any, completion: any) => {
        const userId = completion.user_id
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            username: completion.profiles.username,
            total_quest_points: 0,
            quest_count: 0
          }
        }
        acc[userId].total_quest_points += completion.points_earned
        acc[userId].quest_count += 1
        return acc
      }, {})

      return Object.values(userQuestPoints)
        .sort((a: any, b: any) => b.total_quest_points - a.total_quest_points)
        .slice(0, 50)
    }
  })

  // Fetch referral leaderboard
  const { data: referralLeaderboard = [] } = useQuery({
    queryKey: ['referral_leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, total_referrals')
        .gt('total_referrals', 0)
        .order('total_referrals', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    }
  })

  // Filter data based on search
  const filteredData = useMemo(() => {
    return leaderboardData.filter((player: any) =>
      player.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.user_id === user?.id
    )
  }, [leaderboardData, searchTerm, user])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30"
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/30"
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/30"
      default:
        return "bg-card hover:bg-accent/50"
    }
  }

  const LeaderboardTable = ({ data, scoreKey, scoreLabel, icon }: any) => (
    <div className="space-y-3">
      {data.slice(0, 10).map((player: any, index: number) => {
        const rank = index + 1
        const isCurrentUser = player.user_id === user?.id
        
        return (
          <div
            key={player.user_id}
            className={`
              flex items-center justify-between p-4 rounded-lg border transition-colors
              ${getRankColor(rank)}
              ${isCurrentUser ? 'ring-2 ring-primary/50' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 flex justify-center">
                {getRankIcon(rank)}
              </div>
              
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {player.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">
                    {player.username || 'Anonymous'}
                  </h4>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(player.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-lg font-bold text-primary">
                    {player[scoreKey]?.toLocaleString() || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{scoreLabel}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            See how you rank against other members
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Players</p>
                  <p className="text-2xl font-bold">{leaderboardData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Score</p>
                  <p className="text-2xl font-bold">
                    {leaderboardData[0]?.points?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold">
                    {user ? (
                      leaderboardData.findIndex((p: any) => p.user_id === user.id) + 1 || 'N/A'
                    ) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="overall" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="overall" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Overall XP
            </TabsTrigger>
            <TabsTrigger value="quests" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Quest Masters
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Top Referrers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Overall XP Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  data={filteredData}
                  scoreKey="points"
                  scoreLabel="Total XP"
                  icon={<Star className="w-4 h-4 text-primary" />}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quests">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quest Completion Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  data={questLeaderboard}
                  scoreKey="total_quest_points"
                  scoreLabel="Quest XP"
                  icon={<Trophy className="w-4 h-4 text-primary" />}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Referral Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  data={referralLeaderboard}
                  scoreKey="total_referrals"
                  scoreLabel="Referrals"
                  icon={<Users className="w-4 h-4 text-primary" />}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Leaderboard