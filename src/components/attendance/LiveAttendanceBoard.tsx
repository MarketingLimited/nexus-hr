import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Coffee, 
  Home, 
  MapPin, 
  Search,
  Filter,
  Users,
  AlertTriangle,
  CheckCircle,
  Timer
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  position: string;
  status: 'present' | 'absent' | 'on-break' | 'remote' | 'late';
  checkInTime?: string;
  lastSeen?: string;
  location?: string;
  workHours: {
    expected: number;
    actual: number;
  };
}

interface DepartmentStats {
  name: string;
  present: number;
  absent: number;
  total: number;
  onBreak: number;
  remote: number;
}

export const LiveAttendanceBoard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data
  useEffect(() => {
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'John Smith',
        department: 'Engineering',
        position: 'Senior Developer',
        status: 'present',
        checkInTime: '09:00',
        location: 'Office - Floor 2',
        workHours: { expected: 8, actual: 6.5 }
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        department: 'Marketing',
        position: 'Marketing Manager',
        status: 'on-break',
        checkInTime: '08:45',
        location: 'Office - Floor 1',
        workHours: { expected: 8, actual: 4.2 }
      },
      {
        id: '3',
        name: 'Mike Davis',
        department: 'Sales',
        position: 'Sales Representative',
        status: 'remote',
        checkInTime: '09:15',
        location: 'Remote - Home Office',
        workHours: { expected: 8, actual: 5.8 }
      },
      {
        id: '4',
        name: 'Emily Chen',
        department: 'HR',
        position: 'HR Specialist',
        status: 'late',
        lastSeen: '10:30',
        workHours: { expected: 8, actual: 3.5 }
      },
      {
        id: '5',
        name: 'David Wilson',
        department: 'Engineering',
        position: 'Frontend Developer',
        status: 'absent',
        workHours: { expected: 8, actual: 0 }
      },
    ];

    setEmployees(mockEmployees);

    // Calculate department stats
    const stats = mockEmployees.reduce((acc, emp) => {
      const existing = acc.find(d => d.name === emp.department);
      if (existing) {
        existing.total++;
        if (emp.status === 'present') existing.present++;
        if (emp.status === 'absent') existing.absent++;
        if (emp.status === 'on-break') existing.onBreak++;
        if (emp.status === 'remote') existing.remote++;
      } else {
        acc.push({
          name: emp.department,
          total: 1,
          present: emp.status === 'present' ? 1 : 0,
          absent: emp.status === 'absent' ? 1 : 0,
          onBreak: emp.status === 'on-break' ? 1 : 0,
          remote: emp.status === 'remote' ? 1 : 0,
        });
      }
      return acc;
    }, [] as DepartmentStats[]);

    setDepartmentStats(stats);
  }, []);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status: Employee['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'on-break':
        return <Coffee className="w-4 h-4 text-yellow-500" />;
      case 'remote':
        return <Home className="w-4 h-4 text-blue-500" />;
      case 'late':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'absent':
        return <Timer className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: Employee['status']) => {
    const variants = {
      present: 'default',
      'on-break': 'secondary',
      remote: 'outline',
      late: 'destructive',
      absent: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const overallStats = {
    total: employees.length,
    present: employees.filter(e => e.status === 'present').length,
    absent: employees.filter(e => e.status === 'absent').length,
    onBreak: employees.filter(e => e.status === 'on-break').length,
    remote: employees.filter(e => e.status === 'remote').length,
    late: employees.filter(e => e.status === 'late').length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Clock */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Live Attendance Board</h2>
          <p className="text-muted-foreground">Real-time employee status monitoring</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{overallStats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{overallStats.present}</div>
            <div className="text-sm text-muted-foreground">Present</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{overallStats.remote}</div>
            <div className="text-sm text-muted-foreground">Remote</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{overallStats.onBreak}</div>
            <div className="text-sm text-muted-foreground">On Break</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{overallStats.late}</div>
            <div className="text-sm text-muted-foreground">Late</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{overallStats.absent}</div>
            <div className="text-sm text-muted-foreground">Absent</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{dept.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Present:</span>
                    <span className="text-green-600">{dept.present}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remote:</span>
                    <span className="text-blue-600">{dept.remote}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On Break:</span>
                    <span className="text-yellow-600">{dept.onBreak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absent:</span>
                    <span className="text-red-600">{dept.absent}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total:</span>
                    <span>{dept.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'present' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('present')}
              >
                Present
              </Button>
              <Button
                variant={filterStatus === 'absent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('absent')}
              >
                Absent
              </Button>
              <Button
                variant={filterStatus === 'remote' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('remote')}
              >
                Remote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Status ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.position} • {employee.department}
                      </div>
                      {employee.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {employee.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    {getStatusBadge(employee.status)}
                    {employee.checkInTime && (
                      <div className="text-sm text-muted-foreground">
                        In: {employee.checkInTime}
                      </div>
                    )}
                    {employee.lastSeen && (
                      <div className="text-sm text-muted-foreground">
                        Last: {employee.lastSeen}
                      </div>
                    )}
                    <div className="text-xs">
                      {employee.workHours.actual}h / {employee.workHours.expected}h
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};