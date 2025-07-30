import { useState } from "react";
import { Clock, MapPin, Play, Pause, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AttendanceTracker = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayAttendance = [
    { name: "Sarah Johnson", checkIn: "09:00 AM", checkOut: null, status: "Present", location: "Office" },
    { name: "Michael Chen", checkIn: "08:45 AM", checkOut: null, status: "Present", location: "Remote" },
    { name: "Emily Rodriguez", checkIn: "09:15 AM", checkOut: "12:00 PM", status: "Break", location: "Office" },
    { name: "David Kim", checkIn: null, checkOut: null, status: "Absent", location: null },
    { name: "Lisa Wang", checkIn: "08:30 AM", checkOut: null, status: "Present", location: "Office" }
  ];

  const handleClockAction = () => {
    setIsCheckedIn(!isCheckedIn);
    setCurrentTime(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Clock In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-muted-foreground">
              {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleClockAction}
              className={`w-48 h-16 text-lg ${isCheckedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isCheckedIn ? (
                <>
                  <Pause className="h-6 w-6 mr-2" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 mr-2" />
                  Clock In
                </>
              )}
            </Button>
          </div>

          {isCheckedIn && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                Clocked in at {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-green-600 text-sm">
                Working time: 0h 0m
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Today's Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAttendance.map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {employee.location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span>{employee.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {employee.checkIn && (
                      <span className="text-sm text-green-600">In: {employee.checkIn}</span>
                    )}
                    {employee.checkOut && (
                      <span className="text-sm text-orange-600">Out: {employee.checkOut}</span>
                    )}
                  </div>
                  <Badge variant={
                    employee.status === "Present" ? "default" :
                    employee.status === "Break" ? "secondary" : "outline"
                  }>
                    {employee.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracker;