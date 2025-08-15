import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Eye, ExternalLink } from "lucide-react"

interface Submission {
  id: string
  user_id: string
  quest_id: string
  username: string
  platform: string
  submitted_at: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  notes?: string
  profiles?: {
    username: string
  }
  quests?: {
    title: string
    points_reward: number
  }
}

export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('social_task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) throw error

      // Fetch related data separately
      const submissionsWithRelations = await Promise.all(
        (data || []).map(async (submission) => {
          const [profileResult, questResult] = await Promise.all([
            supabase.from('profiles').select('username').eq('user_id', submission.user_id).single(),
            supabase.from('quests').select('title, points_reward').eq('id', submission.quest_id).single()
          ])

          return {
            ...submission,
            profiles: profileResult.data,
            quests: questResult.data
          }
        })
      )

      setSubmissions(submissionsWithRelations as Submission[])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      const { data, error } = await supabase.rpc('review_social_task', {
        submission_uuid: submissionId,
        status_param: status,
        notes_param: reviewNotes || null
      })

      if (error) throw error

      const result = data as any
      if (result?.success) {
        toast({
          title: "Submission Reviewed",
          description: result.message
        })
        setSelectedSubmission(null)
        setReviewNotes("")
        fetchSubmissions()
      } else {
        toast({
          title: "Review Failed",
          description: result?.message || "Failed to review submission",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getPlatformUrl = (platform: string, username: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return `https://twitter.com/${username.replace('@', '')}`
      case 'discord':
        return '#'
      case 'telegram':
        return `https://t.me/${username.replace('@', '')}`
      default:
        return '#'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Social Task Submissions</h2>
        <div className="flex gap-2">
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            Pending: {submissions.filter(s => s.status === 'pending').length}
          </Badge>
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            Approved: {submissions.filter(s => s.status === 'approved').length}
          </Badge>
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
            Rejected: {submissions.filter(s => s.status === 'rejected').length}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{submission.quests?.title}</h3>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                    <Badge variant="outline">{submission.platform}</Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>User: {submission.profiles?.username}</p>
                    <p>Platform Username: {submission.username}</p>
                    <p>Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
                    <p>Reward: {submission.quests?.points_reward} XP</p>
                    {submission.notes && (
                      <p>Notes: {submission.notes}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {getPlatformUrl(submission.platform, submission.username) !== '#' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(getPlatformUrl(submission.platform, submission.username), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {submission.status === 'pending' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Review Submission</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p><strong>Quest:</strong> {submission.quests?.title}</p>
                            <p><strong>User:</strong> {submission.profiles?.username}</p>
                            <p><strong>Platform:</strong> {submission.platform}</p>
                            <p><strong>Username:</strong> {submission.username}</p>
                            <p><strong>Reward:</strong> {submission.quests?.points_reward} XP</p>
                          </div>

                          <div>
                            <Label htmlFor="notes">Review Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add any notes about this review..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                            />
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => handleReview(submission.id, 'rejected')}
                              className="flex-1"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleReview(submission.id, 'approved')}
                              className="flex-1"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {submissions.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No submissions found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}