import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';

interface LeavePolicy {
  id: string;
  name: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'study';
  allowance: number; // days per year
  carryForward: number; // max days to carry forward
  carryForwardExpiry: number; // months after which carried forward days expire
  accrualRate: number; // days earned per month
  minimumNotice: number; // days of notice required
  maxConsecutive: number; // max consecutive days
  requiresApproval: boolean;
  allowHalfDays: boolean;
  blockoutPeriods: string[]; // periods when leave is restricted
  eligibilityPeriod: number; // months before eligible
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  halfDay?: 'morning' | 'afternoon';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver?: string;
  approvedDate?: string;
  rejectionReason?: string;
  coverageArrangements?: string;
  submittedDate: string;
  isUrgent?: boolean;
  attachments?: string[];
}

interface LeaveBalance {
  employeeId: string;
  policyId: string;
  policyName: string;
  current: number;
  used: number;
  pending: number;
  carriedForward: number;
  accrued: number;
  projected: number; // projected balance at year end
  expiringDays: number;
  expiryDate?: string;
}

interface CoverageRule {
  id: string;
  departmentId: string;
  minimumStaff: number;
  criticalRoles: string[];
  blackoutPeriods: { start: string; end: string; reason: string }[];
  autoAssignCoverage: boolean;
}

interface AbsencePattern {
  employeeId: string;
  pattern: 'frequent-fridays' | 'frequent-mondays' | 'last-minute' | 'long-periods';
  frequency: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

export const AdvancedLeaveManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newRequest, setNewRequest] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    isUrgent: false
  });

  // Mock data
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([
    {
      id: 'annual',
      name: 'Annual Leave',
      type: 'annual',
      allowance: 25,
      carryForward: 5,
      carryForwardExpiry: 3,
      accrualRate: 2.08,
      minimumNotice: 14,
      maxConsecutive: 15,
      requiresApproval: true,
      allowHalfDays: true,
      blockoutPeriods: ['2024-12-15:2024-01-05'],
      eligibilityPeriod: 3
    },
    {
      id: 'sick',
      name: 'Sick Leave',
      type: 'sick',
      allowance: 10,
      carryForward: 5,
      carryForwardExpiry: 12,
      accrualRate: 0.83,
      minimumNotice: 0,
      maxConsecutive: 5,
      requiresApproval: false,
      allowHalfDays: true,
      blockoutPeriods: [],
      eligibilityPeriod: 0
    }
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'req-001',
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      type: 'annual',
      startDate: '2024-02-15',
      endDate: '2024-02-19',
      days: 5,
      reason: 'Family vacation',
      status: 'pending',
      submittedDate: '2024-01-20',
      coverageArrangements: 'Sarah will cover my projects'
    },
    {
      id: 'req-002',
      employeeId: 'emp-002',
      employeeName: 'Sarah Johnson',
      type: 'sick',
      startDate: '2024-01-22',
      endDate: '2024-01-22',
      days: 1,
      reason: 'Flu symptoms',
      status: 'approved',
      submittedDate: '2024-01-22',
      approver: 'Manager',
      approvedDate: '2024-01-22',
      isUrgent: true
    }
  ]);

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    {
      employeeId: 'current-user',
      policyId: 'annual',
      policyName: 'Annual Leave',
      current: 18.5,
      used: 6.5,
      pending: 5,
      carriedForward: 3,
      accrued: 22,
      projected: 13.5,
      expiringDays: 2,
      expiryDate: '2024-03-31'
    },
    {
      employeeId: 'current-user',
      policyId: 'sick',
      policyName: 'Sick Leave',
      current: 8,
      used: 2,
      pending: 0,
      carriedForward: 0,
      accrued: 10,
      projected: 8,
      expiringDays: 0
    }
  ]);

  const [absencePatterns, setAbsencePatterns] = useState<AbsencePattern[]>([
    {
      employeeId: 'emp-003',
      pattern: 'frequent-fridays',
      frequency: 6,
      riskLevel: 'medium',
      recommendation: 'Schedule informal discussion about work-life balance'
    },
    {
      employeeId: 'emp-004',
      pattern: 'last-minute',
      frequency: 4,
      riskLevel: 'high',
      recommendation: 'Review leave planning and provide advance notice training'
    }
  ]);

  const getStatusColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatternRiskColor = (riskLevel: AbsencePattern['riskLevel']) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const submitLeaveRequest = () => {
    if (!newRequest.type || !newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const request: LeaveRequest = {
      id: `req-${Date.now()}`,
      employeeId: 'current-user',
      employeeName: 'Current User',
      type: newRequest.type,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      days: calculateDays(newRequest.startDate, newRequest.endDate),
      reason: newRequest.reason,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      isUrgent: newRequest.isUrgent
    };

    setLeaveRequests(prev => [request, ...prev]);
    setNewRequest({ type: '', startDate: '', endDate: '', reason: '', isUrgent: false });
    
    toast({
      title: "Leave Request Submitted",
      description: "Your leave request has been submitted for approval.",
    });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const approveRequest = (requestId: string) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const, approver: 'Manager', approvedDate: new Date().toISOString().split('T')[0] }
          : req
      )
    );
    
    toast({
      title: "Request Approved",
      description: "The leave request has been approved.",
    });
  };

  const rejectRequest = (requestId: string, reason: string) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const, rejectionReason: reason }
          : req
      )
    );
    
    toast({
      title: "Request Rejected",
      description: "The leave request has been rejected.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Leave Management</h2>
          <p className="text-muted-foreground">Comprehensive leave tracking with intelligent analytics</p>
        </div>
        <Button onClick={() => setActiveTab('new-request')}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="new-request">New Request</TabsTrigger>
        </TabsList>

        {/* Leave Requests */}
        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {leaveRequests.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {leaveRequests.filter(r => r.status === 'rejected').length}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {leaveRequests.reduce((sum, r) => r.status === 'approved' ? sum + r.days : sum, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Days Approved</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{request.employeeName}</span>
                          {request.isUrgent && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.type.toUpperCase()} • {request.days} day{request.days > 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.startDate} to {request.endDate}
                        </div>
                        <div className="text-sm">{request.reason}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {request.coverageArrangements && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Coverage:</strong> {request.coverageArrangements}
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => approveRequest(request.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => rejectRequest(request.id, 'Insufficient coverage')}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {request.rejectionReason && (
                      <div className="text-sm text-red-600">
                        <strong>Rejection Reason:</strong> {request.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Balances */}
        <TabsContent value="balances" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {leaveBalances.map((balance) => (
              <Card key={balance.policyId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{balance.policyName}</span>
                    <Badge variant="outline">{balance.current} days left</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Available</span>
                      <span>{balance.current} / {balance.accrued}</span>
                    </div>
                    <Progress value={(balance.current / balance.accrued) * 100} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Used This Year</Label>
                      <div className="font-medium">{balance.used} days</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Pending Approval</Label>
                      <div className="font-medium">{balance.pending} days</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Carried Forward</Label>
                      <div className="font-medium">{balance.carriedForward} days</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Projected Year End</Label>
                      <div className="font-medium">{balance.projected} days</div>
                    </div>
                  </div>

                  {balance.expiringDays > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {balance.expiringDays} days expiring on {balance.expiryDate}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leave Policies */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Leave Policies</span>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Policy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leavePolicies.map((policy) => (
                  <div key={policy.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{policy.name}</h4>
                        <p className="text-sm text-muted-foreground">{policy.type.toUpperCase()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Annual Allowance</Label>
                        <div className="font-medium">{policy.allowance} days</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Accrual Rate</Label>
                        <div className="font-medium">{policy.accrualRate} days/month</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Carry Forward</Label>
                        <div className="font-medium">{policy.carryForward} days</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Min Notice</Label>
                        <div className="font-medium">{policy.minimumNotice} days</div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {policy.requiresApproval && (
                        <Badge variant="outline">Requires Approval</Badge>
                      )}
                      {policy.allowHalfDays && (
                        <Badge variant="outline">Half Days Allowed</Badge>
                      )}
                      {policy.blockoutPeriods.length > 0 && (
                        <Badge variant="outline">Has Blackout Periods</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Absence Pattern Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {absencePatterns.map((pattern, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">Employee ID: {pattern.employeeId}</div>
                        <div className="text-sm text-muted-foreground">
                          Pattern: {pattern.pattern.replace('-', ' ')} ({pattern.frequency} occurrences)
                        </div>
                      </div>
                      <Badge className={getPatternRiskColor(pattern.riskLevel)}>
                        {pattern.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <strong>Recommendation:</strong> {pattern.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage Planning */}
        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Coverage Planning Coming Soon</h3>
                <p className="text-muted-foreground">
                  Automatic coverage assignment and team capacity planning features will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Request Form */}
        <TabsContent value="new-request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Leave Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={newRequest.type} onValueChange={(value) => setNewRequest(prev => ({...prev, type: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leavePolicies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Urgent Request</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newRequest.isUrgent}
                      onChange={(e) => setNewRequest(prev => ({...prev, isUrgent: e.target.checked}))}
                    />
                    <Label className="text-sm">This is an urgent request</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest(prev => ({...prev, startDate: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest(prev => ({...prev, endDate: e.target.value}))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide reason for your leave request..."
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest(prev => ({...prev, reason: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage">Coverage Arrangements (Optional)</Label>
                <Textarea
                  id="coverage"
                  placeholder="Describe how your work will be covered during your absence..."
                />
              </div>

              <Button onClick={submitLeaveRequest} className="w-full">
                Submit Leave Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};