import { UserPlus, CheckCircle, Clock, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboardingStats, useOnboardingProcesses, useOnboardingTemplate } from "@/hooks/useOnboarding";

const Onboarding = () => {
  // API hooks
  const { data: stats, isLoading: statsLoading } = useOnboardingStats();
  const { data: processes, isLoading: processesLoading } = useOnboardingProcesses({ limit: 4 });
  const { data: template, isLoading: templateLoading } = useOnboardingTemplate();
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Onboarding Management</h1>
          <p className="text-muted-foreground">Streamline new employee onboarding</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Start Onboarding
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Processes</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.activeProcesses || 0}</div>
            )}
            <p className="text-xs text-green-600">+{stats?.weeklyGrowth || 0} this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
            )}
            <p className="text-xs text-green-600">+{stats?.completionImprovement || 0}% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Duration</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.avgDuration || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Days to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.pendingTasks || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Across all processes</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Onboarding Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processesLoading ? (
                Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : (
                processes?.data?.map((process: any) => (
                  <div key={process.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{process.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{process.role}</p>
                      </div>
                      <Badge variant={process.progress >= 90 ? "default" : process.progress >= 50 ? "secondary" : "outline"}>
                        {process.daysLeft} days left
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{process.progress}%</span>
                      </div>
                      <Progress value={process.progress} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Started: {new Date(process.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )) || []
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Onboarding Checklist Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templateLoading ? (
                Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : (
                template?.tasks?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      item.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    }`}>
                      {item.completed && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.task}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                )) || [
                  { task: "Send welcome email", completed: true, category: "Pre-boarding" },
                  { task: "Prepare workspace", completed: true, category: "Pre-boarding" },
                  { task: "IT equipment setup", completed: true, category: "Day 1" },
                  { task: "Office tour and introductions", completed: false, category: "Day 1" },
                  { task: "HR documentation", completed: false, category: "Day 1" },
                  { task: "System access setup", completed: false, category: "Week 1" },
                  { task: "Department orientation", completed: false, category: "Week 1" },
                  { task: "Role-specific training", completed: false, category: "Week 2" },
                  { task: "30-day check-in", completed: false, category: "Month 1" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      item.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    }`}>
                      {item.completed && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.task}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <Button variant="outline" className="w-full mt-4" disabled={templateLoading}>
              Customize Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;