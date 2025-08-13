import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, Twitter, Facebook, Send, Copy, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SocialShareProps {
  referralCode: string
  referralLink: string
  referrerName?: string
}

export function SocialShare({ referralCode, referralLink, referrerName }: SocialShareProps) {
  const { toast } = useToast()

  const shareText = referrerName 
    ? `Join me on this amazing platform and earn rewards! Use code ${referralCode}` 
    : `Check out this platform and earn rewards! Use code ${referralCode}`

  const shareData = {
    title: "Join the Platform",
    text: shareText,
    url: referralLink
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast({
          title: "Shared!",
          description: "Thanks for sharing with your friends!",
        })
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(referralLink)
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      })
    }
  }

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`
    window.open(facebookUrl, '_blank', 'noopener,noreferrer')
  }

  const shareOnTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`
    window.open(telegramUrl, '_blank', 'noopener,noreferrer')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Share Your Referral Link
        </CardTitle>
        <CardDescription>
          Spread the word and earn rewards when your friends join!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Share Message Preview */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm font-medium mb-2">Share Message:</p>
          <p className="text-sm text-muted-foreground italic">"{shareText}"</p>
          <p className="text-xs text-muted-foreground mt-2">Link: {referralLink}</p>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnTwitter}
              className="flex items-center gap-2"
            >
              <Twitter className="w-4 h-4 text-blue-500" />
              Twitter
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={shareOnFacebook}
              className="flex items-center gap-2"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={shareOnTelegram}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-blue-400" />
              Telegram
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>

          {/* Native Share Button (if available) */}
          <Button
            onClick={handleNativeShare}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share with Friends
          </Button>

          {/* Direct Message Options */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Or send directly:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralLink)}`
                  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
                }}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
                WhatsApp
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const emailUrl = `mailto:?subject=Join me on this platform!&body=${encodeURIComponent(shareText + '\n\n' + referralLink)}`
                  window.open(emailUrl, '_self')
                }}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        </div>

        {/* Share Tips */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2 text-primary">💡 Sharing Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Share in groups where friends are active</li>
            <li>• Add a personal message explaining the benefits</li>
            <li>• Follow up to help friends complete registration</li>
            <li>• Share success stories and rewards earned</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}