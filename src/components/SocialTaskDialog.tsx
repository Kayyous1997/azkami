import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Users, MessageCircle, Send } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface SocialTaskDialogProps {
  quest: any
  children: React.ReactNode
}

export function SocialTaskDialog({ quest, children }: SocialTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const getPlatformInfo = () => {
    const requirements = quest.requirements as any
    switch (requirements?.action) {
      case "follow_twitter":
        return {
          name: "Twitter",
          icon: <Send className="w-4 h-4" />,
          url: requirements.url,
          placeholder: "@yourhandle",
          instructions: "Follow our Twitter account and enter your Twitter handle"
        }
      case "join_discord":
        return {
          name: "Discord",
          icon: <MessageCircle className="w-4 h-4" />,
          url: requirements.url,
          placeholder: "YourDiscordHandle#1234",
          instructions: "Join our Discord server and enter your Discord username"
        }
      case "share_twitter":
        return {
          name: "Twitter",
          icon: <Send className="w-4 h-4" />,
          url: "https://twitter.com/intent/tweet?text=Check%20out%20this%20amazing%20platform!",
          placeholder: "@yourhandle",
          instructions: "Share about us on Twitter and enter your Twitter handle"
        }
      case "join_telegram":
        return {
          name: "Telegram",
          icon: <Users className="w-4 h-4" />,
          url: requirements.url,
          placeholder: "@yourhandle",
          instructions: "Join our Telegram channel and enter your Telegram username"
        }
      default:
        return {
          name: "Social Platform",
          icon: <ExternalLink className="w-4 h-4" />,
          url: "#",
          placeholder: "Your username",
          instructions: "Complete the social task and enter your username"
        }
    }
  }

  const platformInfo = getPlatformInfo()

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter your username",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.rpc('submit_social_task', {
        quest_uuid: quest.id,
        username_param: username.trim(),
        platform_param: platformInfo.name.toLowerCase()
      })

      if (error) throw error

      const result = data as any
      if (result?.success) {
        toast({
          title: "Task Submitted!",
          description: result.message || "Your submission is being reviewed."
        })
        setOpen(false)
        setUsername("")
      } else {
        toast({
          title: "Submission Failed",
          description: result?.message || "Failed to submit task",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit task",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePlatformRedirect = () => {
    if (platformInfo.url && platformInfo.url !== "#") {
      window.open(platformInfo.url, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {platformInfo.icon}
            {quest.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{platformInfo.instructions}</p>
            
            <Button 
              onClick={handlePlatformRedirect}
              className="w-full mb-4"
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to {platformInfo.name}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Your {platformInfo.name} Username</Label>
            <Input
              id="username"
              placeholder={platformInfo.placeholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !username.trim()}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}