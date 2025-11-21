import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AttendanceTracker from '@/components/attendance/AttendanceTracker';
import { BiometricClockIn } from '@/components/attendance/BiometricClockIn';
import { LiveAttendanceBoard } from '@/components/attendance/LiveAttendanceBoard';
import { OfflineAttendanceSync } from '@/components/attendance/OfflineAttendanceSync';
import { ShiftScheduling } from '@/components/attendance/ShiftScheduling';
import { useAttendanceStats, useAttendanceRecords } from '@/hooks/useAttendance';
import type { AttendanceRecord } from '@/types';
import {
  Clock,
  Fingerprint,
  Monitor,
  Database,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('tracker');

  // Fetch attendance data
  const { data: statsData, isLoading: statsLoading } = useAttendanceStats();
  const { data: recordsData, isLoading: recordsLoading } = useAttendanceRecords();

  // Process data for charts
  const attendanceRecords: AttendanceRecord[] = recordsData?.data || [];
  const stats = statsData?.data || {};

  // Generate trend data for last 7 days
  const trendData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayRecords = attendanceRecords.filter((r: AttendanceRecord) =>
        r.date?.startsWith(date) || r.clockIn?.startsWith(date)
      );
      const present = dayRecords.filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
      const late = dayRecords.filter((r: AttendanceRecord) => r.status === 'LATE').length;
      const absent = dayRecords.filter((r: AttendanceRecord) => r.status === 'ABSENT').length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Present: present,
        Late: late,
        Absent: absent
      };
    });
  }, [attendanceRecords]);

  // Status distribution
  const statusData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {};
    attendanceRecords.forEach((record: AttendanceRecord) => {
      const status = record.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [attendanceRecords]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground mt-2">
            Real-time attendance tracking with biometric integration and offline capabilities
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Tracker
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            Biometric
          </TabsTrigger>
          <TabsTrigger value="live-board" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Live Board
          </TabsTrigger>
          <TabsTrigger value="offline-sync" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Offline Sync
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-6">
          <AttendanceTracker />
        </TabsContent>

        <TabsContent value="biometric" className="space-y-6">
          <BiometricClockIn />
        </TabsContent>

        <TabsContent value="live-board" className="space-y-6">
          <LiveAttendanceBoard />
        </TabsContent>

        <TabsContent value="offline-sync" className="space-y-6">
          <OfflineAttendanceSync />
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <ShiftScheduling />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {statsLoading || recordsLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Present Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.presentToday || attendanceRecords.filter((r: AttendanceRecord) => r.status === 'PRESENT').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.attendanceRate || '95'}% attendance rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Timer className="h-4 w-4 text-yellow-500" />
                      Late Arrivals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.lateToday || attendanceRecords.filter((r: AttendanceRecord) => r.status === 'LATE').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.latePercentage || '3'}% late rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Absent Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.absentToday || attendanceRecords.filter((r: AttendanceRecord) => r.status === 'ABSENT').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.absentPercentage || '2'}% absent rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Avg. Work Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.averageWorkHours || '8.2'}h
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per employee today
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    7-Day Attendance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Present" fill="#10b981" />
                      <Bar dataKey="Late" fill="#f59e0b" />
                      <Bar dataKey="Absent" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">High Attendance Rate</p>
                          <p className="text-sm text-muted-foreground">
                            Overall attendance is {stats.attendanceRate || '95'}%, above the target threshold.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Timer className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Late Arrivals Trend</p>
                          <p className="text-sm text-muted-foreground">
                            {stats.latePercentage || '3'}% of employees arrived late this week.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Average Work Hours</p>
                          <p className="text-sm text-muted-foreground">
                            Employees are working an average of {stats.averageWorkHours || '8.2'} hours per day.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Total Records</p>
                          <p className="text-sm text-muted-foreground">
                            {attendanceRecords.length} attendance records tracked.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Attendance;