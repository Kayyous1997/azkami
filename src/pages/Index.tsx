import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart"
import { ActivityByCountry } from "@/components/dashboard/ActivityByCountry"
import { RecentQuestsTable } from "@/components/dashboard/RecentQuestsTable"

const Index = () => {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>
        <div className="lg:col-span-1">
          <ActivityByCountry />
        </div>
      </div>
      
      <RecentQuestsTable />
    </DashboardLayout>
  );
};

export default Index;
