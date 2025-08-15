import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Trophy,
  Map,
  UserPlus,
  Crown,
  Settings,
  Moon,
  Sun,
  Zap,
  User,
  Shield
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { useAuth } from "@/components/auth/AuthContext"
import { useUserData } from "@/hooks/useUserData"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Members", url: "/members", icon: Users, comingSoon: true },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Rewards", url: "/rewards", icon: Trophy, comingSoon: true },
  { title: "Quests", url: "/quests", icon: Map, comingSoon: true },
  { title: "Referral", url: "/referral", icon: UserPlus },
  { title: "Leaderboard", url: "/leaderboard", icon: Crown, comingsoon: true },
  { title: "Settings", url: "/settings", icon: Settings },
]

const adminNavigationItems = [
  { title: "Admin", url: "/admin", icon: Shield },
]

export function DashboardSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user, signOut } = useAuth()
  const { profile } = useUserData()
  
  const collapsed = state === "collapsed"
  const isActive = (path: string) => location.pathname === path

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300`} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 p-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                AZKAMI
              </span>
              <span className="text-xs text-muted-foreground">Join the realm. Shape the mythos.
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
        
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.comingSoon ? (
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-not-allowed opacity-60 text-sidebar-foreground`}>
                        <item.icon className="w-5 h-5" />
                        {!collapsed && (
                          <>
                            <span className="font-medium">{item.title}</span>
                            <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                          </>
                        )}
                      </div>
                    ) : (
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive(item.url)
                            ? "bg-gradient-primary text-white shadow-primary"
                            : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive(item.url) ? "drop-shadow-sm" : ""}`} />
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Admin Section - Only show for admin users */}
              {profile?.role === 'admin' && adminNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.url)
                          ? "bg-gradient-primary text-white shadow-primary"
                          : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive(item.url) ? "drop-shadow-sm" : ""}`} />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* Dark/Light Mode Toggle */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Theme</span>
              </div>
            )}
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-primary"
            />
            {!collapsed && <Moon className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {/* User Profile / Login Section */}
        {!collapsed && (
          <div className="p-4">
            {user ? (
              <Card className="bg-gradient-glow border-primary/20 shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {profile?.username || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.points || 0} points
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full"
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-glow border-primary/20 shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Join the Realm</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Sign in to access exclusive features and rewards
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                    onClick={() => setShowAuthDialog(true)}
                  >
                    Sign In / Sign Up
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </SidebarFooter>
      
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </Sidebar>
  )
}
