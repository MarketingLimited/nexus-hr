import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import ModuleCard from "@/components/dashboard/ModuleCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
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
  const { dashboardStats, moduleStats, loading, error } = useDashboardAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
        <div className="text-lg text-destructive">Error loading dashboard: {error}</div>
      </div>
    );
  }

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
              {dashboardStats && (
                <>
                  <StatsCard
                    title="Total Employees"
                    value={dashboardStats.totalEmployees.value.toString()}
                    change={dashboardStats.totalEmployees.change}
                    changeType={dashboardStats.totalEmployees.changeType}
                    icon={Users}
                    color="employees"
                  />
                  <StatsCard
                    title="Pending Leave Requests"
                    value={dashboardStats.pendingLeaveRequests.value.toString()}
                    change={dashboardStats.pendingLeaveRequests.change}
                    changeType={dashboardStats.pendingLeaveRequests.changeType}
                    icon={Calendar}
                    color="leaves"
                  />
                  <StatsCard
                    title="This Month's Payroll"
                    value={dashboardStats.monthlyPayroll.value}
                    change={dashboardStats.monthlyPayroll.change}
                    changeType={dashboardStats.monthlyPayroll.changeType}
                    icon={DollarSign}
                    color="payroll"
                  />
                  <StatsCard
                    title="Performance Reviews"
                    value={dashboardStats.performanceReviews.value}
                    change={dashboardStats.performanceReviews.change}
                    changeType={dashboardStats.performanceReviews.changeType}
                    icon={TrendingUp}
                    color="performance"
                  />
                </>
              )}
            </div>

            {/* Module cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {moduleStats && (
                <>
                  <ModuleCard
                    title="Employee Management"
                    description="Manage employee profiles and data"
                    icon={Users}
                    color="employees"
                    stats={[
                      { label: "Active Employees", value: moduleStats.employees.active.toString(), trend: "up" },
                      { label: "New This Month", value: moduleStats.employees.newThisMonth.toString(), trend: "up" }
                    ]}
                    actions={[
                      { label: "View All", href: "#employees" },
                      { label: "Add Employee", href: "#employees/new" }
                    ]}
                    notifications={moduleStats.employees.notifications}
                  />

                  <ModuleCard
                    title="Leave Management"
                    description="Handle leave requests and balances"
                    icon={Calendar}
                    color="leaves"
                    stats={[
                      { label: "Pending Requests", value: moduleStats.leave.pendingRequests.toString(), trend: "stable" },
                      { label: "Approved Today", value: moduleStats.leave.approvedToday.toString(), trend: "up" }
                    ]}
                    actions={[
                      { label: "Review Requests", href: "#leaves" },
                      { label: "Leave Calendar", href: "#leaves/calendar" }
                    ]}
                    notifications={moduleStats.leave.notifications}
                  />

                  <ModuleCard
                    title="Payroll System"
                    description="Process payroll and manage salaries"
                    icon={DollarSign}
                    color="payroll"
                    stats={[
                      { label: "Next Payroll", value: `${moduleStats.payroll.nextPayrollDays} days`, trend: "stable" },
                      { label: "Total Amount", value: moduleStats.payroll.totalAmount, trend: "up" }
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
                      { label: "Completed", value: `${moduleStats.performance.completionRate}%`, trend: "up" },
                      { label: "Due This Week", value: moduleStats.performance.dueThisWeek.toString(), trend: "stable" }
                    ]}
                    actions={[
                      { label: "Review Dashboard", href: "#performance" },
                      { label: "Set Goals", href: "#performance/goals" }
                    ]}
                    notifications={moduleStats.performance.notifications}
                  />

                  <ModuleCard
                    title="Onboarding"
                    description="Streamline new employee onboarding"
                    icon={UserPlus}
                    color="onboarding"
                    stats={[
                      { label: "Active Processes", value: moduleStats.onboarding.activeProcesses.toString(), trend: "up" },
                      { label: "Completion Rate", value: `${moduleStats.onboarding.completionRate}%`, trend: "up" }
                    ]}
                    actions={[
                      { label: "View Progress", href: "#onboarding" },
                      { label: "Start Process", href: "#onboarding/new" }
                    ]}
                    notifications={moduleStats.onboarding.notifications}
                  />

                  <ModuleCard
                    title="Attendance Tracking"
                    description="Monitor employee attendance"
                    icon={Clock}
                    color="attendance"
                    stats={[
                      { label: "Present Today", value: moduleStats.attendance.presentToday.toString(), trend: "stable" },
                      { label: "Late Arrivals", value: moduleStats.attendance.lateArrivals.toString(), trend: "down" }
                    ]}
                    actions={[
                      { label: "View Reports", href: "#attendance" },
                      { label: "Clock In/Out", href: "#attendance/clock" }
                    ]}
                  />
                </>
              )}
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
