import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Timer,
  CalendarDays
} from 'lucide-react';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  breakTime: number; // in minutes
  color: string;
  isOvernight: boolean;
}

interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftId: string;
  date: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'no-show' | 'cancelled';
  overTimeHours?: number;
  notes?: string;
}

interface ShiftPattern {
  id: string;
  name: string;
  description: string;
  shifts: string[]; // shift IDs for each day of the week (Sun-Sat)
  employees: string[];
  rotationWeeks: number;
}

export const ShiftScheduling: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'calendar' | 'shifts' | 'patterns' | 'assignments'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart(new Date()));

  // Mock data
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: 'morning',
      name: 'Morning Shift',
      startTime: '06:00',
      endTime: '14:00',
      duration: 8,
      breakTime: 60,
      color: '#3b82f6',
      isOvernight: false
    },
    {
      id: 'afternoon',
      name: 'Afternoon Shift', 
      startTime: '14:00',
      endTime: '22:00',
      duration: 8,
      breakTime: 60,
      color: '#f59e0b',
      isOvernight: false
    },
    {
      id: 'night',
      name: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00',
      duration: 8,
      breakTime: 60,
      color: '#6366f1',
      isOvernight: true
    }
  ]);

  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>([
    {
      id: '1',
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      shiftId: 'morning',
      date: '2024-01-15',
      status: 'scheduled'
    },
    {
      id: '2',
      employeeId: 'emp-002',
      employeeName: 'Sarah Johnson',
      shiftId: 'afternoon',
      date: '2024-01-15',
      status: 'confirmed'
    },
    {
      id: '3',
      employeeId: 'emp-003',
      employeeName: 'Mike Davis',
      shiftId: 'night',
      date: '2024-01-15',
      status: 'completed',
      overTimeHours: 1.5
    }
  ]);

  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([
    {
      id: 'rotating-3',
      name: '3-Shift Rotation',
      description: 'Rotating morning, afternoon, night shifts every week',
      shifts: ['morning', 'morning', 'morning', 'morning', 'morning', '', ''],
      employees: ['emp-001', 'emp-002', 'emp-003'],
      rotationWeeks: 3
    }
  ]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  const getWeekDays = (startDate: Date): Date[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  };

  const getShiftForEmployee = (employeeId: string, date: string): ShiftAssignment | undefined => {
    return shiftAssignments.find(
      assignment => assignment.employeeId === employeeId && assignment.date === date
    );
  };

  const getShiftById = (shiftId: string): Shift | undefined => {
    return shifts.find(shift => shift.id === shiftId);
  };

  const getStatusColor = (status: ShiftAssignment['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const createShiftAssignment = (employeeId: string, shiftId: string, date: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const newAssignment: ShiftAssignment = {
      id: `assignment-${Date.now()}`,
      employeeId,
      employeeName: employee.name,
      shiftId,
      date: date,
      status: 'scheduled'
    };

    setShiftAssignments(prev => [...prev, newAssignment]);
    toast({
      title: "Shift Assigned",
      description: `${employee.name} assigned to ${getShiftById(shiftId)?.name} on ${date}`,
    });
  };

  const updateAssignmentStatus = (assignmentId: string, status: ShiftAssignment['status']) => {
    setShiftAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status }
          : assignment
      )
    );
  };

  // Mock employees data
  const employees = [
    { id: 'emp-001', name: 'John Smith', avatar: '', department: 'Operations' },
    { id: 'emp-002', name: 'Sarah Johnson', avatar: '', department: 'Security' },
    { id: 'emp-003', name: 'Mike Davis', avatar: '', department: 'Maintenance' },
    { id: 'emp-004', name: 'Emily Chen', avatar: '', department: 'Customer Service' },
    { id: 'emp-005', name: 'David Wilson', avatar: '', department: 'Operations' }
  ];

  const weekDays = getWeekDays(selectedWeek);
  const weekAssignments = shiftAssignments.filter(assignment => {
    const assignmentDate = new Date(assignment.date);
    return assignmentDate >= selectedWeek && 
           assignmentDate < new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shift Scheduling</h2>
          <p className="text-muted-foreground">Manage employee shifts and schedules</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'calendar' ? 'default' : 'outline'}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={activeTab === 'shifts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('shifts')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Shifts
          </Button>
          <Button
            variant={activeTab === 'patterns' ? 'default' : 'outline'}
            onClick={() => setActiveTab('patterns')}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Patterns
          </Button>
          <Button
            variant={activeTab === 'assignments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('assignments')}
          >
            <Users className="w-4 h-4 mr-2" />
            Assignments
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Week Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                >
                  ← Previous Week
                </Button>
                <h3 className="font-semibold">
                  Week of {selectedWeek.toLocaleDateString()} - {new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </h3>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                >
                  Next Week →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule Grid */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 font-medium border-r">Employee</div>
                {weekDays.map((day, index) => (
                  <div key={index} className="p-3 text-center font-medium border-r last:border-r-0">
                    <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-sm text-muted-foreground">{day.getDate()}</div>
                  </div>
                ))}
              </div>

              {employees.map((employee) => (
                <div key={employee.id} className="grid grid-cols-8 border-b last:border-b-0">
                  <div className="p-3 border-r flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{employee.name}</div>
                      <div className="text-xs text-muted-foreground">{employee.department}</div>
                    </div>
                  </div>
                  
                  {weekDays.map((day, dayIndex) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const assignment = getShiftForEmployee(employee.id, dateStr);
                    const shift = assignment ? getShiftById(assignment.shiftId) : null;
                    
                    return (
                      <div key={dayIndex} className="p-2 border-r last:border-r-0 min-h-[60px]">
                        {assignment && shift ? (
                          <div 
                            className="p-2 rounded text-xs text-white cursor-pointer"
                            style={{ backgroundColor: shift.color }}
                            onClick={() => updateAssignmentStatus(
                              assignment.id, 
                              assignment.status === 'scheduled' ? 'confirmed' : 
                              assignment.status === 'confirmed' ? 'completed' : 'scheduled'
                            )}
                          >
                            <div className="font-medium">{shift.name}</div>
                            <div>{shift.startTime} - {shift.endTime}</div>
                            <Badge 
                              className={`mt-1 text-xs ${getStatusColor(assignment.status)}`}
                            >
                              {assignment.status}
                            </Badge>
                          </div>
                        ) : (
                          <Select
                            onValueChange={(shiftId) => createShiftAssignment(employee.id, shiftId, dateStr)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent>
                              {shifts.map((shift) => (
                                <SelectItem key={shift.id} value={shift.id}>
                                  {shift.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shifts Management */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Shift Types</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Shift
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <Card key={shift.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: shift.color }}
                      />
                      <CardTitle className="text-lg">{shift.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Time</Label>
                      <div className="font-medium">{shift.startTime}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Time</Label>
                      <div className="font-medium">{shift.endTime}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Duration</Label>
                      <div className="font-medium">{shift.duration}h</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Break</Label>
                      <div className="font-medium">{shift.breakTime}min</div>
                    </div>
                  </div>
                  
                  {shift.isOvernight && (
                    <Badge variant="secondary">
                      Overnight Shift
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shift Patterns */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Shift Patterns</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Pattern
            </Button>
          </div>

          {shiftPatterns.map((pattern) => (
            <Card key={pattern.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pattern.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </div>
                  <Badge variant="outline">
                    {pattern.rotationWeeks} week rotation
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pattern visualization */}
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={day} className="text-center">
                      <div className="text-sm font-medium mb-1">{day}</div>
                      {pattern.shifts[index] ? (
                        <div 
                          className="p-2 rounded text-xs text-white"
                          style={{ backgroundColor: getShiftById(pattern.shifts[index])?.color }}
                        >
                          {getShiftById(pattern.shifts[index])?.name}
                        </div>
                      ) : (
                        <div className="p-2 rounded text-xs bg-gray-100 text-gray-500">
                          Off
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div>
                  <Label className="text-sm">Assigned Employees</Label>
                  <div className="flex gap-2 mt-1">
                    {pattern.employees.map(empId => {
                      const emp = employees.find(e => e.id === empId);
                      return emp ? (
                        <Badge key={empId} variant="outline">
                          {emp.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignments Management */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shift Assignments</h3>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {shiftAssignments.map((assignment) => {
                  const shift = getShiftById(assignment.shiftId);
                  return (
                    <div key={assignment.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: shift?.color }}
                        />
                        <div>
                          <div className="font-medium">{assignment.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {shift?.name} • {assignment.date} • {shift?.startTime} - {shift?.endTime}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {assignment.overTimeHours && (
                          <Badge variant="outline">
                            +{assignment.overTimeHours}h OT
                          </Badge>
                        )}
                        
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                        
                        <Button size="sm" variant="ghost">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};