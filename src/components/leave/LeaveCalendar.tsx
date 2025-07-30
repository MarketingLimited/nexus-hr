import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useLeave } from "@/hooks/useDataManager";
import { LeaveRequest } from "@/types";

type LeaveEvent = {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: "approved" | "pending" | "rejected";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-100 text-green-800 border-green-200";
    case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "rejected": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const LeaveCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const { data: leaveData, loading } = useLeave();

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading leave data...</div>;
  }

  if (!leaveData?.leaveRequests) {
    return <div className="text-center py-8 text-muted-foreground">No leave data available</div>;
  }

  // Convert leave requests to leave events
  const leaveEvents: LeaveEvent[] = leaveData.leaveRequests.map((request: LeaveRequest) => ({
    id: request.id,
    employeeName: `Employee ${request.employeeId}`, // In real app, resolve from employees data
    leaveType: request.leaveType,
    startDate: new Date(request.startDate),
    endDate: new Date(request.endDate),
    status: request.status as "approved" | "pending" | "rejected"
  }));

  const filteredEvents = leaveEvents.filter(event => {
    if (filterStatus !== "all" && event.status !== filterStatus) return false;
    if (filterType !== "all" && event.leaveType !== filterType) return false;
    return true;
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDays = eachDayOfInterval({ start: event.startDate, end: event.endDate });
      return eventDays.some(eventDay => isSameDay(eventDay, date));
    });
  };

  const getEventsForSelectedDate = () => {
    return getEventsForDate(selectedDate);
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const dayComponent = ({ date, ...props }: any) => {
    const events = getEventsForDate(date);
    const hasLeaveEvents = events.length > 0;
    
    return (
      <div
        {...props}
        className={cn(
          props.className,
          hasLeaveEvents && "relative",
        )}
      >
        {props.children}
        {hasLeaveEvents && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Leave Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {leaveData?.leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border w-full pointer-events-auto"
              components={{
                Day: dayComponent
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Events for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForSelectedDate().length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No leave events on this date
              </p>
            ) : (
              <div className="space-y-3">
                {getEventsForSelectedDate().map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{event.employeeName}</h4>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {event.leaveType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Approved Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Rejected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full"></div>
              <span className="text-sm">Has Events</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};