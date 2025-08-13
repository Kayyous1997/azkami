import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckSquare, Clock, Star, Zap, Calendar, Users } from "lucide-react"
import { useAuth } from "@/components/auth/AuthContext"
import { useUserData } from "@/hooks/useUserData"
import { useActivityTracking } from "@/hooks/useActivityTracking"
import { useQuestProgress } from "@/hooks/useQuestProgress"

const activeTasks = [
  { id: 1, title: "Complete Social Media Verification", description: "Verify your Twitter and Discord accounts", xp: 500, progress: 50, deadline: "2 days", category: "Verification" },
  { id: 2, title: "Refer 5 New Members", description: "Invite friends to join AZKAMI community", xp: 1000, progress: 60, deadline: "1 week", category: "Referral" },
  { id: 3, title: "Complete Weekly Check-in", description: "Visit the dashboard daily for 7 days", xp: 300, progress: 71, deadline: "5 days", category: "Engagement" },
  { id: 4, title: "Participate in Community Discussion", description: "Post and engage in Discord channels", xp: 250, progress: 0, deadline: "3 days", category: "Community" },
]

const completedTasks = [
  { id: 5, title: "Welcome Quest Completed", description: "Successfully completed onboarding process", xp: 200, completedDate: "2024-01-15" },
  { id: 6, title: "Profile Setup", description: "Added profile picture and bio", xp: 150, completedDate: "2024-01-14" },
  { id: 7, title: "First Referral", description: "Successfully referred your first member", xp: 500, completedDate: "2024-01-12" },
]

const upcomingTasks = [
  { id: 8, title: "Monthly Challenge", description: "Complete all daily tasks for a month", xp: 2000, startDate: "2024-02-01", category: "Challenge" },
  { id: 9, title: "Content Creator Program", description: "Create educational content about Web3", xp: 1500, startDate: "2024-02-15", category: "Content" },
]

const getCategoryColor = (category: string) => {
  switch(category) {
    case "Verification": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    case "Referral": return "bg-green-500/10 text-green-400 border-green-500/20"
    case "Engagement": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
    case "Community": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
    case "Challenge": return "bg-red-500/10 text-red-400 border-red-500/20"
    case "Content": return "bg-pink-500/10 text-pink-400 border-pink-500/20"
    default: return "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }
}

const Tasks = () => {
  const { user } = useAuth()
  const { quests, questCompletions, profile } = useUserData()
  const { completeQuest } = useActivityTracking()
  const { calculateQuestProgress, canCompleteQuest, referralCount, currentStreak } = useQuestProgress()
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please sign in to view your tasks.</p>
        </div>
      </DashboardLayout>
    )
  }

  // Filter out already completed quests from active quests
  const completedQuestIds = new Set(questCompletions?.map(completion => completion.quest_id) || [])
  const activeQuests = quests?.filter(quest => 
    quest.is_active && !completedQuestIds.has(quest.id)
  ) || []
  const totalPoints = profile?.points || 0
  
  // Helper function to check if quest is completed
  const isQuestCompleted = (questId: string) => {
    return questCompletions?.some(completion => completion.quest_id === questId) || false
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Tasks
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete tasks to earn XP and rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{questCompletions?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{activeQuests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="active">Active Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeQuests.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No active quests available at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              activeQuests.map((quest) => (
                <Card key={quest.id} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{quest.title}</h3>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{quest.quest_type}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{quest.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{calculateQuestProgress(quest)}%</span>
                          </div>
                          <Progress value={calculateQuestProgress(quest)} className="h-2" />
                          
                          {/* Show additional progress info */}
                          {quest.quest_type === 'referral' && quest.requirements && (
                            <p className="text-xs text-muted-foreground">
                              {referralCount} / {(quest.requirements as any)?.referrals_required || (quest.requirements as any)?.count || 1} referrals
                            </p>
                          )}
                          {quest.quest_type === 'daily' && quest.requirements && (quest.requirements as any)?.streak_required && (
                            <p className="text-xs text-muted-foreground">
                              {currentStreak} / {(quest.requirements as any).streak_required} day streak
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="flex items-center gap-1 text-primary mb-2">
                          <Zap className="w-4 h-4" />
                          <span className="font-medium">{quest.points_reward} XP</span>
                        </div>
                        <Button 
                          size="sm" 
                          className={isQuestCompleted(quest.id) 
                            ? "bg-green-500/20 text-green-400 border-green-500/20 hover:bg-green-500/20" 
                            : "bg-gradient-primary hover:opacity-90"
                          }
                          onClick={() => completeQuest(quest.id)}
                          disabled={!canCompleteQuest(quest) || isQuestCompleted(quest.id)}
                        >
                          {isQuestCompleted(quest.id) 
                            ? <>
                                <CheckSquare className="w-4 h-4 mr-1" />
                                Claimed
                              </>
                            : canCompleteQuest(quest) 
                              ? 'Claim Reward' 
                              : 'Complete Requirements'
                          }
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {(questCompletions?.length || 0) === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No completed quests yet.</p>
                </CardContent>
              </Card>
            ) : (
              (questCompletions || []).map((completion) => (
                <Card key={completion.id} className="shadow-card opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <CheckSquare className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{completion.quests?.title || 'Quest'}</h3>
                          <p className="text-sm text-muted-foreground">{completion.quests?.description || 'Completed quest'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-400 mb-1">
                          <Zap className="w-4 h-4" />
                          <span className="font-medium">+{completion.points_earned} XP</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Completed {new Date(completion.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No upcoming quests at the moment.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;