import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceTracker } from '@/components/attendance/AttendanceTracker';
import { BiometricClockIn } from '@/components/attendance/BiometricClockIn';
import { LiveAttendanceBoard } from '@/components/attendance/LiveAttendanceBoard';
import { OfflineAttendanceSync } from '@/components/attendance/OfflineAttendanceSync';
import { ShiftScheduling } from '@/components/attendance/ShiftScheduling';
import { 
  Clock, 
  Fingerprint, 
  Monitor, 
  Database,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('tracker');

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Attendance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed attendance reports, trends, and insights will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Attendance;