import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Users, Gift, Star, ArrowRight, CheckCircle } from "lucide-react"

const Join = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, signUp, signIn } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  })
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralInfo, setReferralInfo] = useState<any>(null)

  // Get referral code from URL
  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
      // Fetch referral info
      fetchReferralInfo(ref)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  const fetchReferralInfo = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, points')
        .eq('referral_code', code)
        .single()

      if (error) throw error
      setReferralInfo(data)
    } catch (error) {
      console.error("Invalid referral code:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          })
          return
        }
      } else {
        // Sign up with referral code handling
        const { error } = await signUp(formData.email, formData.password, formData.username, referralCode || undefined)
        
        if (error) {
          toast({
            title: "Registration Failed", 
            description: error.message,
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Registration Successful!",
          description: referralCode 
            ? "Welcome! You've been referred and earned bonus points!"
            : "Check your email to verify your account.",
        })
      }
      
      navigate("/")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Referral Banner */}
        {referralCode && referralInfo && (
          <Card className="shadow-card border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">You've Been Invited!</h3>
                  <p className="text-sm text-muted-foreground">
                    {referralInfo.username} has referred you to join our platform
                  </p>
                </div>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Join community</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary" />
                    <span>Earn 100 XP bonus</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Referral Code: {referralCode}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auth Form */}
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              {isLogin ? "Welcome Back" : "Join the Platform"}
            </CardTitle>
            <p className="text-muted-foreground">
              {isLogin ? "Sign in to your account" : "Create your account and start earning"}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              {/* Benefits for new users */}
              {!isLogin && (
                <Alert className="bg-primary/5 border-primary/20">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong>Join today and get:</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• Welcome bonus points</li>
                      <li>• Daily check-in rewards</li>
                      <li>• Quest completion XP</li>
                      {referralCode && <li>• 100 XP referral bonus</li>}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          By joining, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
}

export default Join