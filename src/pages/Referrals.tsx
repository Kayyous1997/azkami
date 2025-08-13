import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Share2, Copy, Gift, Users, Star, Calendar, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/AuthContext"
import { useUserData } from "@/hooks/useUserData"
import { useReferralRewards } from "@/hooks/useReferralRewards"
import { SocialShare } from "@/components/referrals/SocialShare"

const getTierColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'bronze': return "bg-amber-600/20 text-amber-400 border-amber-600/30"
    case 'silver': return "bg-gray-400/20 text-gray-300 border-gray-400/30"
    case 'gold': return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case 'platinum': return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    default: return "bg-muted/20 text-muted-foreground border-muted/30"
  }
}

const Referrals = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const { profile } = useUserData()
  const { referralRewards, referrals, claimReward, isClaimingReward } = useReferralRewards()

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please sign in to view your referrals.</p>
        </div>
      </DashboardLayout>
    )
  }

  const referralCode = profile?.referral_code || 'LOADING...'
  const referralLink = `${window.location.origin}/join?ref=${referralCode}`
  
  const totalReferrals = profile?.total_referrals || 0
  const activeReferrals = referrals.length
  const totalEarned = referrals.reduce((sum, ref) => sum + (ref.points || 0), 0) * 0.1 // 10% commission example
  const thisMonth = referrals.filter(ref => 
    new Date(ref.created_at).getMonth() === new Date().getMonth()
  ).length

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Referrals
          </h1>
          <p className="text-muted-foreground mt-2">
            Invite friends and earn rewards together
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold">{activeReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">XP Earned</p>
                  <p className="text-2xl font-bold">{Math.round(totalEarned).toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Tools */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Share & Earn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Referral Code</label>
              <div className="flex gap-2">
                <Input value={referralCode} readOnly className="font-mono" />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => copyToClipboard(referralCode, "Referral code")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Referral Link</label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="font-mono text-sm" />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => copyToClipboard(referralLink, "Referral link")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="bg-gradient-primary hover:opacity-90">
                <Share2 className="w-4 h-4 mr-2" />
                Share on Social
              </Button>
              <Button variant="outline">
                <Gift className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Share Integration */}
        <SocialShare 
          referralCode={referralCode} 
          referralLink={referralLink}
          referrerName={profile?.username}
        />

        {/* Referral Rewards */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Referral Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {referralRewards.map((reward) => {
                const canClaim = totalReferrals >= reward.referrals_required && !reward.is_claimed
                const isCurrentTier = totalReferrals >= reward.referrals_required && 
                  (referralRewards.find(r => r.referrals_required > reward.referrals_required && totalReferrals >= r.referrals_required) === undefined)
                
                return (
                  <div key={reward.id} className={`p-4 rounded-lg border ${getTierColor(reward.tier_level)} ${isCurrentTier && !reward.is_claimed ? 'ring-2 ring-primary/50' : ''} relative`}>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-1">{reward.tier_level}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{reward.referrals_required}+ referrals</p>
                      <p className="font-medium mb-3">{reward.bonus_points} XP</p>
                      
                      {reward.is_claimed ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          <Check className="w-3 h-3 mr-1" />
                          Claimed
                        </Badge>
                      ) : canClaim ? (
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-primary hover:opacity-90"
                          onClick={() => claimReward(reward.id)}
                          disabled={isClaimingReward}
                        >
                          {isClaimingReward ? "Claiming..." : "Claim Reward"}
                        </Button>
                      ) : (
                        <Badge variant="outline">
                          {reward.referrals_required - totalReferrals} more needed
                        </Badge>
                      )}
                      
                      {isCurrentTier && !reward.is_claimed && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">
                            Available
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="all">All Referrals</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No referrals yet. Share your code to start earning!</p>
                  ) : (
                    referrals.map((referral, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{referral.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{referral.username || 'Anonymous'}</h4>
                            <p className="text-sm text-muted-foreground">Member since {new Date(referral.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Joined</p>
                            <p>{new Date(referral.created_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="default">Active</Badge>
                          <div className="text-right">
                            <p className="font-medium text-primary">{referral.points || 0} XP</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Active Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No active referrals yet.</p>
                  ) : (
                    referrals.map((referral, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{referral.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{referral.username || 'Anonymous'}</h4>
                            <p className="text-sm text-muted-foreground">Member since {new Date(referral.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Joined</p>
                            <p>{new Date(referral.created_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="default">Active</Badge>
                          <div className="text-right">
                            <p className="font-medium text-primary">{referral.points || 0} XP</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Pending Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground py-8">No pending referrals.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Referrals;