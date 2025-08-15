import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { useUserData } from "@/hooks/useUserData"
import { Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CheckSquare, Settings, BarChart3, AlertCircle } from "lucide-react"
import { AdminTaskManagement } from "@/components/admin/AdminTaskManagement"
import { AdminUserManagement } from "@/components/admin/AdminUserManagement"
import { AdminSubmissions } from "@/components/admin/AdminSubmissions"
import { AdminOverview } from "@/components/admin/AdminOverview"

const Admin = () => {
  const { user } = useAuth()
  const { profile } = useUserData()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (profile) {
      setIsAdmin(profile.role === 'admin')
    }
  }, [profile])

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (isAdmin === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage tasks, users, and platform settings
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="tasks">
            <AdminTaskManagement />
          </TabsContent>

          <TabsContent value="submissions">
            <AdminSubmissions />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Admin