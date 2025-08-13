import { DashboardSidebar } from "./DashboardSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}