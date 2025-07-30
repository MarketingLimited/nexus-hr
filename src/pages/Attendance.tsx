import { Clock, Play, Pause, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Attendance = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-muted-foreground">Monitor employee attendance and working hours</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Play className="h-4 w-4" />
            Clock In
          </Button>
          <Button variant="outline" className="gap-2">
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
            <div className="text-2xl font-bold">231</div>
            <p className="text-xs text-green-600">93.5% attendance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Work Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2</div>
            <p className="text-xs text-muted-foreground">Hours per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overtime This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Hours</p>
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
              {[
                { name: "Sarah Johnson", clockIn: "09:00 AM", clockOut: "05:30 PM", status: "present", hours: "8.5" },
                { name: "Mike Chen", clockIn: "08:45 AM", clockOut: "-", status: "active", hours: "7.2" },
                { name: "Emma Davis", clockIn: "09:15 AM", clockOut: "05:15 PM", status: "late", hours: "8.0" },
                { name: "John Smith", clockIn: "-", clockOut: "-", status: "absent", hours: "0" },
              ].map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{record.name}</p>
                    <p className="text-sm text-muted-foreground">
                      In: {record.clockIn} | Out: {record.clockOut}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{record.hours}h</span>
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
              ))}
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
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">This Week</span>
                  <span className="text-sm text-green-600">94.2%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">This Month</span>
                  <span className="text-sm text-green-600">92.8%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92.8%' }}></div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Last Month</span>
                  <span className="text-sm text-orange-600">89.5%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '89.5%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Perfect Days</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold">2.3</p>
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