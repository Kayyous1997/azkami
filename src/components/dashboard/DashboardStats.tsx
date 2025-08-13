import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Trophy, Users, Zap, Coins, Flame } from "lucide-react"
import { useUserData } from "@/hooks/useUserData"

interface StatCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ReactNode
}

function StatCard({ title, value, change, isPositive, icon }: StatCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary/20 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const { profile, dailyCheckins, activities, questCompletions } = useUserData()

  const currentStreak = dailyCheckins?.[0]?.streak_count || 0
  const totalPoints = profile?.points || 0
  const totalReferrals = profile?.total_referrals || 0
  const completedQuests = questCompletions?.length || 0

  const stats = [
    {
      title: "Total Points",
      value: totalPoints.toLocaleString(),
      change: "+15 today",
      isPositive: true,
      icon: <Coins className="w-5 h-5 text-primary" />
    },
    {
      title: "Current Streak",
      value: `${currentStreak} days`,
      change: currentStreak > 0 ? "+1 today" : "Start streak",
      isPositive: currentStreak > 0,
      icon: <Flame className="w-5 h-5 text-primary" />
    },
    {
      title: "Total Referrals",
      value: totalReferrals.toString(),
      change: totalReferrals > 0 ? `+${Math.min(totalReferrals, 3)} this month` : "Invite friends",
      isPositive: totalReferrals > 0,
      icon: <Users className="w-5 h-5 text-primary" />
    },
    {
      title: "Quests Completed",
      value: completedQuests.toString(),
      change: `+${Math.min(completedQuests, 5)} this week`,
      isPositive: completedQuests > 0,
      icon: <Trophy className="w-5 h-5 text-primary" />
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={stat.title} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  )
}