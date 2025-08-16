import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { CheckCircle, AlertCircle, ArrowLeft, Lock } from "lucide-react"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isValidSession, setIsValidSession] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Check if this is a valid password reset session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setIsValidSession(true)
      } else {
        // If no valid session, redirect to join page
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link has expired or is invalid.",
          variant: "destructive",
        })
        setTimeout(() => navigate("/join"), 2000)
      }
    }

    checkSession()
  }, [navigate, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setIsComplete(true)
        toast({
          title: "Password Updated!",
          description: "Your password has been successfully updated.",
        })
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => navigate("/"), 3000)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Invalid Reset Link</h2>
            <p className="text-muted-foreground">
              This password reset link has expired or is invalid. Redirecting...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <h2 className="text-xl font-semibold text-success">Password Updated!</h2>
            <p className="text-muted-foreground">
              Your password has been successfully updated. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Reset Your Password
          </h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>New Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to login */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/join")}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword