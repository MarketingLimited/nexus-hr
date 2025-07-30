import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import ModuleCard from "@/components/dashboard/ModuleCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Target, 
  UserPlus, 
  Clock, 
  BarChart3,
  TrendingUp,
  Building2
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          
          {/* Dashboard content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Welcome section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Good morning, John!</h1>
              <p className="text-muted-foreground mt-2">
                Here's what's happening at your organization today.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Employees"
                value="247"
                change="+12%"
                changeType="positive"
                icon={Users}
                color="employees"
              />
              <StatsCard
                title="Pending Leave Requests"
                value="18"
                change="+3"
                changeType="neutral"
                icon={Calendar}
                color="leaves"
              />
              <StatsCard
                title="This Month's Payroll"
                value="$284K"
                change="+2.1%"
                changeType="positive"
                icon={DollarSign}
                color="payroll"
              />
              <StatsCard
                title="Performance Reviews"
                value="89%"
                change="+5.2%"
                changeType="positive"
                icon={TrendingUp}
                color="performance"
              />
            </div>

            {/* Module cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <ModuleCard
                title="Employee Management"
                description="Manage employee profiles and data"
                icon={Users}
                color="employees"
                stats={[
                  { label: "Active Employees", value: "247", trend: "up" },
                  { label: "New This Month", value: "12", trend: "up" }
                ]}
                actions={[
                  { label: "View All", href: "#employees" },
                  { label: "Add Employee", href: "#employees/new" }
                ]}
                notifications={3}
              />

              <ModuleCard
                title="Leave Management"
                description="Handle leave requests and balances"
                icon={Calendar}
                color="leaves"
                stats={[
                  { label: "Pending Requests", value: "18", trend: "stable" },
                  { label: "Approved Today", value: "5", trend: "up" }
                ]}
                actions={[
                  { label: "Review Requests", href: "#leaves" },
                  { label: "Leave Calendar", href: "#leaves/calendar" }
                ]}
                notifications={18}
              />

              <ModuleCard
                title="Payroll System"
                description="Process payroll and manage salaries"
                icon={DollarSign}
                color="payroll"
                stats={[
                  { label: "Next Payroll", value: "5 days", trend: "stable" },
                  { label: "Total Amount", value: "$284K", trend: "up" }
                ]}
                actions={[
                  { label: "Run Payroll", href: "#payroll" },
                  { label: "View Reports", href: "#payroll/reports" }
                ]}
              />

              <ModuleCard
                title="Performance Reviews"
                description="Track and manage employee performance"
                icon={Target}
                color="performance"
                stats={[
                  { label: "Completed", value: "89%", trend: "up" },
                  { label: "Due This Week", value: "12", trend: "stable" }
                ]}
                actions={[
                  { label: "Review Dashboard", href: "#performance" },
                  { label: "Set Goals", href: "#performance/goals" }
                ]}
                notifications={5}
              />

              <ModuleCard
                title="Onboarding"
                description="Streamline new employee onboarding"
                icon={UserPlus}
                color="onboarding"
                stats={[
                  { label: "Active Processes", value: "8", trend: "up" },
                  { label: "Completion Rate", value: "92%", trend: "up" }
                ]}
                actions={[
                  { label: "View Progress", href: "#onboarding" },
                  { label: "Start Process", href: "#onboarding/new" }
                ]}
                notifications={2}
              />

              <ModuleCard
                title="Attendance Tracking"
                description="Monitor employee attendance"
                icon={Clock}
                color="attendance"
                stats={[
                  { label: "Present Today", value: "231", trend: "stable" },
                  { label: "Late Arrivals", value: "3", trend: "down" }
                ]}
                actions={[
                  { label: "View Reports", href: "#attendance" },
                  { label: "Clock In/Out", href: "#attendance/clock" }
                ]}
              />
            </div>

            {/* Bottom section with quick actions and recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActions />
              <RecentActivity />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
