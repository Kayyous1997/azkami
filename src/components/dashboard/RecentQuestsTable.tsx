import { useState, useEffect } from "react"
import { MoreHorizontal, Download, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/auth/AuthContext"


export function RecentQuestsTable() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch recent quest completions from database
  const { data: recentCompletions = [] } = useQuery({
    queryKey: ['recent_quest_completions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_quest_completions')
        .select(`
          *,
          quests!inner(title, quest_type, points_reward),
          profiles!inner(username, user_id)
        `)
        .order('completed_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    }
  })

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('quest-completions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quest_completions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recent_quest_completions'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const getStatusIcon = () => {
    return <CheckCircle className="w-4 h-4 text-success" />
  }

  const getStatusBadge = () => {
    return <Badge className="bg-success/20 text-success border-success/30">Completed</Badge>
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Recent Tasks Completed</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-border/50 hover:bg-accent/10"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['recent_quest_completions'] })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recentCompletions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tasks completed yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground font-medium">Task Title</TableHead>
                <TableHead className="text-muted-foreground font-medium">XP Earned</TableHead>
                <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Completed By</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCompletions.map((completion, index) => (
                <TableRow 
                  key={completion.id} 
                  className="border-border/50 hover:bg-accent/5 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {completion.quests?.quest_type?.slice(0, 2).toUpperCase() || 'QS'}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {completion.quests?.title || 'Unknown Quest'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-primary">
                      {completion.points_earned?.toLocaleString() || 0} XP
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {new Date(completion.completed_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon()}
                      {getStatusBadge()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-primary text-white text-xs">
                          {completion.profiles?.username?.slice(0, 2).toUpperCase() || 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {completion.profiles?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-muted-foreground">Task Completed</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem className="hover:bg-accent/10">View Details</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-accent/10">View Profile</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}