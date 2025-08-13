import { CalendarDays, Filter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useActivityTracking } from "@/hooks/useActivityTracking"
import { useUserData } from "@/hooks/useUserData"

export function DashboardHeader() {
  const { handleDailyCheckin } = useActivityTracking()
  const { dailyCheckins } = useUserData()

  // Check if user has already checked in today
  const hasCheckedInToday = dailyCheckins?.some(checkin => {
    const checkinDate = new Date(checkin.checkin_date).toDateString()
    const today = new Date().toDateString()
    return checkinDate === today
  })

  return (
    <div className="space-y-6">
      {/* Header with title and trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-3xl font-bold text-foreground"> Dashboard 
            </h1>
            <p className="text-muted-foreground">Summoned by the Kami, forged in spirit — the brotherhood rises.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={hasCheckedInToday ? "outline" : "default"} 
            size="sm" 
            className={hasCheckedInToday 
              ? "border-border/50 hover:bg-accent/10 text-muted-foreground" 
              : "bg-primary hover:bg-primary/90"
            }
            onClick={handleDailyCheckin}
            disabled={hasCheckedInToday}
          >
            {hasCheckedInToday ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Claimed
              </>
            ) : (
              <>
                <CalendarDays className="w-4 h-4 mr-2" />
                Daily Check-in
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs and controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <Tabs defaultValue="overview" className="w-auto">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Rewards History
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="border-border/50 hover:bg-accent/10">
            <CalendarDays className="w-4 h-4 mr-2" />
            28 Aug - 15 Dec, 2025
          </Button>
          <Button variant="outline" size="sm" className="border-border/50 hover:bg-accent/10">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  )
}
