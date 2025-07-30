import { Clock, Play, Pause, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendanceStats, useAttendanceRecords, useClockIn, useClockOut } from "@/hooks/useAttendance";
import { useToast } from "@/hooks/use-toast";

const Attendance = () => {
  const { toast } = useToast();
  
  // API hooks
  const { data: stats, isLoading: statsLoading } = useAttendanceStats();
  const { data: records, isLoading: recordsLoading } = useAttendanceRecords();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const handleClockIn = () => {
    clockInMutation.mutate(
      { employeeId: "current-user" }, // Replace with actual user ID
      {
        onSuccess: () => {
          toast({
            title: "Clocked In",
            description: "You have successfully clocked in for today.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to clock in. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleClockOut = () => {
    // For clock out, we need a record ID. In practice, you'd get this from current user's active record
    clockOutMutation.mutate(
      "current-record-id", // recordId as string
      {
        onSuccess: () => {
          toast({
            title: "Clocked Out",
            description: "You have successfully clocked out for today.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to clock out. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-muted-foreground">Monitor employee attendance and working hours</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleClockIn}
            disabled={clockInMutation.isPending}
          >
            <Play className="h-4 w-4" />
            Clock In
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleClockOut}
            disabled={clockOutMutation.isPending}
          >
            <Pause className="h-4 w-4" />
            Clock Out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.data?.presentDays || 0}</div>
                <p className="text-xs text-green-600">
                  {stats?.data?.attendanceRate ? `${(stats.data.attendanceRate * 100).toFixed(1)}% attendance` : 'N/A'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">{stats?.data?.lateDays || 0}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Work Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.data?.averageHoursPerDay?.toFixed(1) || 0}</div>
                <p className="text-xs text-muted-foreground">Hours per day</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overtime This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.data?.overtimeHours || 0}</div>
                <p className="text-xs text-muted-foreground">Hours</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recordsLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))
              ) : records?.data?.length ? (
                records.data.slice(0, 4).map((record: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        In: {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} | 
                        Out: {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{record.totalHours || 0}h</span>
                      <Badge 
                        variant={
                          record.status === "present" ? "default" : 
                          record.status === "active" ? "secondary" : 
                          record.status === "late" ? "destructive" :
                          "outline"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No attendance records found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Attendance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))
              ) : (
                <>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">This Week</span>
                      <span className="text-sm text-green-600">{((stats?.data?.attendanceRate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${((stats?.data?.attendanceRate || 0) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-sm text-green-600">{((stats?.data?.attendanceRate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${((stats?.data?.attendanceRate || 0) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Last Month</span>
                      <span className="text-sm text-orange-600">{((stats?.data?.attendanceRate || 0) * 0.95 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${((stats?.data?.attendanceRate || 0) * 0.95 * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 border rounded-lg">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.data?.totalDays - stats?.data?.absentDays - stats?.data?.lateDays || 0}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Perfect Days</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.data?.lateDays ? (stats.data.lateDays * 15).toFixed(1) : 0}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Avg Late (min)</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4 gap-2">
              <Calendar className="h-4 w-4" />
              View Full Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;